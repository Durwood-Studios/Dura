/**
 * Anthropic Messages API client — browser-direct, BYOK, fetch-based.
 *
 * No SDK. The design doc (xDocs/active/ai-surfaces-design-2026-05.md
 * §2) makes the case: `@anthropic-ai/sdk` is on CLAUDE.md's "NOT
 * Approved" list, and the Messages API is a single POST whose
 * streaming variant the browser handles natively via `ReadableStream`
 * + `TextDecoder`. ~30 lines of SSE parsing is cheaper than a runtime
 * dependency that we'd need a written rationale to ship.
 *
 * BYOK invariant: the key is read from `key-storage.ts` immediately
 * before the request and is never echoed in errors, logs, or analytics.
 * If the key is absent we throw `AIKeyMissingError` — callers surface
 * "set up your key in Settings" rather than calling the API.
 *
 * Model IDs verified against api.anthropic.com docs on 2026-05-28.
 * Re-verify if the IDs ever stop resolving — model strings drift.
 */
import { getAnthropicKey } from "./key-storage";

const ENDPOINT = "https://api.anthropic.com/v1/messages";
const API_VERSION = "2023-06-01";
const DEFAULT_MODEL = "claude-sonnet-4-5";
const DEFAULT_MAX_TOKENS = 1024;

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatParams {
  messages: ChatMessage[];
  system?: string;
  model?: string;
  maxTokens?: number;
  signal?: AbortSignal;
}

export class AIKeyMissingError extends Error {
  constructor() {
    super("No Anthropic API key on this device. Set one up in Settings → AI Features.");
    this.name = "AIKeyMissingError";
  }
}

export class AIInvalidKeyError extends Error {
  constructor() {
    super("Anthropic rejected the saved key. Re-enter it in Settings.");
    this.name = "AIInvalidKeyError";
  }
}

export class AIRateLimitError extends Error {
  constructor() {
    super("You're sending requests faster than your plan allows. Wait a minute and try again.");
    this.name = "AIRateLimitError";
  }
}

export class AIOverloadedError extends Error {
  constructor() {
    super("Anthropic is temporarily overloaded. Try again in a moment.");
    this.name = "AIOverloadedError";
  }
}

export class AIServerError extends Error {
  constructor(status: number) {
    super(`Anthropic returned ${status}. This is on their end — try again shortly.`);
    this.name = "AIServerError";
  }
}

function buildHeaders(key: string): Headers {
  const headers = new Headers({
    "content-type": "application/json",
    "x-api-key": key,
    "anthropic-version": API_VERSION,
    // Anthropic accepts browser-origin requests today. The header below
    // is the documented opt-in for the SDK's "browser allowed" mode —
    // included defensively for forward compatibility. Removing it would
    // not break correctness today; keeping it makes the intent explicit.
    "anthropic-dangerous-direct-browser-access": "true",
  });
  return headers;
}

function buildBody(params: ChatParams, stream: boolean): string {
  const body: Record<string, unknown> = {
    model: params.model ?? DEFAULT_MODEL,
    max_tokens: params.maxTokens ?? DEFAULT_MAX_TOKENS,
    messages: params.messages,
  };
  if (params.system) body.system = params.system;
  if (stream) body.stream = true;
  return JSON.stringify(body);
}

function throwForStatus(status: number): never {
  if (status === 401 || status === 403) throw new AIInvalidKeyError();
  if (status === 429) throw new AIRateLimitError();
  if (status === 529) throw new AIOverloadedError();
  throw new AIServerError(status);
}

/** A bounded request owns its abort listener and timer through response consumption. */
function requestLifetime(signal?: AbortSignal): { signal: AbortSignal; dispose: () => void } {
  const controller = new AbortController();
  const abort = (): void => controller.abort(signal?.reason);
  if (signal?.aborted) abort();
  else signal?.addEventListener("abort", abort, { once: true });
  const timer = setTimeout(
    () => controller.abort(new Error("AI request timed out. Please retry.")),
    60_000
  );
  return {
    signal: controller.signal,
    dispose: (): void => {
      clearTimeout(timer);
      signal?.removeEventListener("abort", abort);
    },
  };
}

/** Request a complete response with a bounded lifetime. */
export async function chat(params: ChatParams): Promise<string> {
  const key = getAnthropicKey();
  if (!key) throw new AIKeyMissingError();
  const lifetime = requestLifetime(params.signal);
  try {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: buildHeaders(key),
      body: buildBody(params, false),
      signal: lifetime.signal,
    });
    if (!response.ok) throwForStatus(response.status);
    const data = (await response.json()) as { content?: { type: string; text?: string }[] };
    return (data.content ?? [])
      .filter((block) => block.type === "text" && typeof block.text === "string")
      .map((block) => block.text)
      .join("");
  } finally {
    lifetime.dispose();
  }
}

/** Yield SSE text, requiring the provider's completion marker before declaring success. */
export async function* chatStream(params: ChatParams): AsyncGenerator<string, void, unknown> {
  const key = getAnthropicKey();
  if (!key) throw new AIKeyMissingError();
  const lifetime = requestLifetime(params.signal);
  let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
  try {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: buildHeaders(key),
      body: buildBody(params, true),
      signal: lifetime.signal,
    });
    if (!response.ok) throwForStatus(response.status);
    if (!response.body) throw new Error("AI response was empty. Please retry.");
    reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    while (true) {
      const { done, value } = await reader.read();
      buffer += done ? decoder.decode() : decoder.decode(value, { stream: true });
      let boundary: RegExpExecArray | null;
      while ((boundary = /\r?\n\r?\n/.exec(buffer)) !== null) {
        const raw = buffer.slice(0, boundary.index);
        buffer = buffer.slice(boundary.index + boundary[0].length);
        const payload = raw
          .split(/\r?\n/)
          .filter((line: string): boolean => line.startsWith("data:"))
          .map((line: string): string => line.slice(5).trimStart())
          .join("\n");
        if (!payload) continue;
        let event: { type?: string; delta?: { type?: string; text?: string } };
        try {
          event = JSON.parse(payload);
        } catch {
          throw new Error("AI response was malformed. Please retry.");
        }
        if (!event || typeof event !== "object")
          throw new Error("AI response was malformed. Please retry.");
        if (event.type === "message_stop") return;
        if (event.type === "error") throw new AIServerError(500);
        if (
          event.type === "content_block_delta" &&
          event.delta?.type === "text_delta" &&
          typeof event.delta.text === "string"
        ) {
          yield event.delta.text;
        }
      }
      if (done) throw new Error("AI response was interrupted before completion. Please retry.");
    }
  } finally {
    if (reader) {
      try {
        await reader.cancel();
      } catch (error: unknown) {
        console.error("[ai] Stream cleanup failed", error);
      }
      reader.releaseLock();
    }
    lifetime.dispose();
  }
}
