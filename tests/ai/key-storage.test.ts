import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  clearAnthropicKey,
  getAnthropicKey,
  hasAnthropicKey,
  setAnthropicKey,
} from "@/lib/ai/key-storage";

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
});

describe("Anthropic key storage", () => {
  it("starts empty", () => {
    expect(getAnthropicKey()).toBeNull();
    expect(hasAnthropicKey()).toBe(false);
  });

  it("rejects empty input", () => {
    const result = setAnthropicKey("");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/empty/i);
  });

  it("rejects malformed keys", () => {
    const cases = ["not-a-key", "sk-ant-", "sk-ant-short", "pk-ant-abcdefgh", "sk-ant abcdefgh"];
    for (const candidate of cases) {
      const result = setAnthropicKey(candidate);
      expect(result.ok, `expected reject for ${candidate}`).toBe(false);
    }
  });

  it("accepts a well-formed key + trims whitespace", () => {
    const result = setAnthropicKey("  sk-ant-AbCdEf123456_XYZ-  ");
    expect(result.ok).toBe(true);
    expect(getAnthropicKey()).toBe("sk-ant-AbCdEf123456_XYZ-");
    expect(hasAnthropicKey()).toBe(true);
  });

  it("clear removes the key", () => {
    setAnthropicKey("sk-ant-AbCdEf123456");
    expect(hasAnthropicKey()).toBe(true);
    clearAnthropicKey();
    expect(getAnthropicKey()).toBeNull();
    expect(hasAnthropicKey()).toBe(false);
  });
});
