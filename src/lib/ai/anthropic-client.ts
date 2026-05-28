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

/**
 * Non-streaming chat call. Returns the assistant's full reply text.
 * The Messages API returns `content: [{type: "text", text: "…"}]`;
 * we concatenate every text block in order.
 */
export async function chat(params: ChatParams): Promise<string> {
  const key = getAnthropicKey();
  if (!key) throw new AIKeyMissingError();

  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: buildHeaders(key),
    body: buildBody(params, false),
    signal: params.signal,
  });

  if (!response.ok) throwForStatus(response.status);

  const data = (await response.json()) as {
    content?: { type: string; text?: string }[];
  };
  if (!data.content) return "";
  return data.content
    .filter((b) => b.type === "text" && typeof b.text === "string")
    .map((b) => b.text!)
    .join("");
}

/**
 * Streaming chat call. Yields each text delta as it arrives.
 *
 * The Messages SSE stream emits a sequence of named events. The ones
 * that carry text are `content_block_delta` with `delta.type ===
 * "text_delta"`. All other events (ping, message_start, content_block_
 * start/stop, message_delta, message_stop, error) are accepted but not
 * yielded. An `error` event is rethrown as `AIServerError` since by
 * definition something went wrong server-side after streaming began.
 */
export async function* chatStream(params: ChatParams): AsyncGenerator<string, void, unknown> {
  const key = getAnthropicKey();
  if (!key) throw new AIKeyMissingError();

  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: buildHeaders(key),
    body: buildBody(params, true),
    signal: params.signal,
  });

  if (!response.ok) throwForStatus(response.status);
  if (!response.body) throw new AIServerError(response.status);

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      // SSE messages are separated by blank lines. Process every complete
      // event in the buffer, leaving any partial trailing event for the
      // next chunk.
      let sep: number;
      while ((sep = buffer.indexOf("\n\n")) !== -1) {
        const rawEvent = buffer.slice(0, sep);
        buffer = buffer.slice(sep + 2);
        const dataLines: string[] = [];
        for (const line of rawEvent.split("\n")) {
          if (line.startsWith("data:")) dataLines.push(line.slice(5).trim());
        }
        if (dataLines.length === 0) continue;
        const payload = dataLines.join("\n");
        if (payload === "[DONE]") return;

        let parsed: unknown;
        try {
          parsed = JSON.parse(payload);
        } catch {
          continue;
        }
        const event = parsed as {
          type?: string;
          delta?: { type?: string; text?: string };
          error?: { message?: string };
        };
        if (event.type === "content_block_delta" && event.delta?.type === "text_delta") {
          if (typeof event.delta.text === "string") yield event.delta.text;
        } else if (event.type === "error") {
          throw new AIServerError(500);
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
