import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  AIInvalidKeyError,
  AIKeyMissingError,
  AIOverloadedError,
  AIRateLimitError,
  AIServerError,
  chat,
  chatStream,
} from "@/lib/ai/anthropic-client";
import { clearAnthropicKey, setAnthropicKey } from "@/lib/ai/key-storage";

const VALID_KEY = "sk-ant-test_KEY_value_abcdef";

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

afterEach(() => {
  localStorage.clear();
});

function mockJSON(status: number, body: unknown): void {
  globalThis.fetch = vi.fn(() =>
    Promise.resolve(
      new Response(JSON.stringify(body), {
        status,
        headers: { "content-type": "application/json" },
      })
    )
  ) as unknown as typeof fetch;
}

describe("chat()", () => {
  it("throws AIKeyMissingError when no key is on file", async () => {
    clearAnthropicKey();
    await expect(chat({ messages: [{ role: "user", content: "hi" }] })).rejects.toBeInstanceOf(
      AIKeyMissingError
    );
  });

  it("concatenates text blocks on success", async () => {
    setAnthropicKey(VALID_KEY);
    mockJSON(200, {
      content: [
        { type: "text", text: "Hello, " },
        { type: "text", text: "world!" },
      ],
    });
    const reply = await chat({ messages: [{ role: "user", content: "hi" }] });
    expect(reply).toBe("Hello, world!");
  });

  it("ignores non-text blocks", async () => {
    setAnthropicKey(VALID_KEY);
    mockJSON(200, {
      content: [
        { type: "tool_use", id: "x" },
        { type: "text", text: "kept" },
      ],
    });
    const reply = await chat({ messages: [{ role: "user", content: "hi" }] });
    expect(reply).toBe("kept");
  });

  it("maps 401 → AIInvalidKeyError", async () => {
    setAnthropicKey(VALID_KEY);
    mockJSON(401, { error: { message: "bad" } });
    await expect(chat({ messages: [{ role: "user", content: "hi" }] })).rejects.toBeInstanceOf(
      AIInvalidKeyError
    );
  });

  it("maps 429 → AIRateLimitError", async () => {
    setAnthropicKey(VALID_KEY);
    mockJSON(429, {});
    await expect(chat({ messages: [{ role: "user", content: "hi" }] })).rejects.toBeInstanceOf(
      AIRateLimitError
    );
  });

  it("maps 529 → AIOverloadedError", async () => {
    setAnthropicKey(VALID_KEY);
    mockJSON(529, {});
    await expect(chat({ messages: [{ role: "user", content: "hi" }] })).rejects.toBeInstanceOf(
      AIOverloadedError
    );
  });

  it("maps 500 → AIServerError", async () => {
    setAnthropicKey(VALID_KEY);
    mockJSON(500, {});
    await expect(chat({ messages: [{ role: "user", content: "hi" }] })).rejects.toBeInstanceOf(
      AIServerError
    );
  });

  it("sends the expected headers (x-api-key, anthropic-version)", async () => {
    setAnthropicKey(VALID_KEY);
    const spy = vi.fn(() =>
      Promise.resolve(new Response(JSON.stringify({ content: [] }), { status: 200 }))
    ) as unknown as typeof fetch;
    globalThis.fetch = spy;
    await chat({ messages: [{ role: "user", content: "hi" }] });

    const call = (spy as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
    const init = call[1] as RequestInit;
    const headers = new Headers(init.headers);
    expect(headers.get("x-api-key")).toBe(VALID_KEY);
    expect(headers.get("anthropic-version")).toBe("2023-06-01");
    expect(headers.get("content-type")).toBe("application/json");
  });
});

describe("chatStream()", () => {
  function streamResponse(events: string[]): Response {
    const body = events.map((e) => e + "\n\n").join("");
    return new Response(body, {
      status: 200,
      headers: { "content-type": "text/event-stream" },
    });
  }

  it("yields text deltas from content_block_delta events", async () => {
    setAnthropicKey(VALID_KEY);
    globalThis.fetch = vi.fn(() =>
      Promise.resolve(
        streamResponse([
          'event: message_start\ndata: {"type":"message_start"}',
          'event: content_block_start\ndata: {"type":"content_block_start","index":0}',
          'event: content_block_delta\ndata: {"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":"Hello, "}}',
          'event: content_block_delta\ndata: {"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":"world!"}}',
          'event: content_block_stop\ndata: {"type":"content_block_stop","index":0}',
          'event: message_stop\ndata: {"type":"message_stop"}',
        ])
      )
    ) as unknown as typeof fetch;

    const chunks: string[] = [];
    for await (const chunk of chatStream({ messages: [{ role: "user", content: "hi" }] })) {
      chunks.push(chunk);
    }
    expect(chunks.join("")).toBe("Hello, world!");
  });

  it("ignores ping + non-text delta types", async () => {
    setAnthropicKey(VALID_KEY);
    globalThis.fetch = vi.fn(() =>
      Promise.resolve(
        streamResponse([
          'event: ping\ndata: {"type":"ping"}',
          'event: content_block_delta\ndata: {"type":"content_block_delta","index":0,"delta":{"type":"input_json_delta","partial_json":"{"}}',
          'event: content_block_delta\ndata: {"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":"ok"}}',
        ])
      )
    ) as unknown as typeof fetch;

    const chunks: string[] = [];
    for await (const chunk of chatStream({ messages: [{ role: "user", content: "hi" }] })) {
      chunks.push(chunk);
    }
    expect(chunks).toEqual(["ok"]);
  });

  it("throws AIInvalidKeyError on 401 before streaming begins", async () => {
    setAnthropicKey(VALID_KEY);
    globalThis.fetch = vi.fn(() =>
      Promise.resolve(new Response("", { status: 401 }))
    ) as unknown as typeof fetch;

    const iter = chatStream({ messages: [{ role: "user", content: "hi" }] });
    await expect(iter.next()).rejects.toBeInstanceOf(AIInvalidKeyError);
  });
});
