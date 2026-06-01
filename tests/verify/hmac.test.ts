import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { isSigningConfigured, signHash, verifyHash } from "@/lib/verify/hmac";

const TEST_SECRET = "a".repeat(48); // ≥ 32 chars
const SAMPLE_HASH = "deadbeef".repeat(8); // 64 hex chars

const ORIGINAL_SECRET = process.env.VERIFICATION_HMAC_SECRET;

beforeEach(() => {
  process.env.VERIFICATION_HMAC_SECRET = TEST_SECRET;
});

afterEach(() => {
  if (ORIGINAL_SECRET === undefined) {
    delete process.env.VERIFICATION_HMAC_SECRET;
  } else {
    process.env.VERIFICATION_HMAC_SECRET = ORIGINAL_SECRET;
  }
});

describe("isSigningConfigured", () => {
  it("returns true when a sufficiently long secret is set", () => {
    expect(isSigningConfigured()).toBe(true);
  });

  it("returns false when the secret is missing", () => {
    delete process.env.VERIFICATION_HMAC_SECRET;
    expect(isSigningConfigured()).toBe(false);
  });

  it("returns false when the secret is too short", () => {
    process.env.VERIFICATION_HMAC_SECRET = "short";
    expect(isSigningConfigured()).toBe(false);
  });
});

describe("signHash", () => {
  it("returns a 64-char hex signature when configured", () => {
    const sig = signHash(SAMPLE_HASH);
    expect(sig).not.toBeNull();
    expect(sig).toMatch(/^[a-f0-9]{64}$/);
  });

  it("is deterministic for the same input", () => {
    expect(signHash(SAMPLE_HASH)).toBe(signHash(SAMPLE_HASH));
  });

  it("produces different output for different inputs", () => {
    const a = signHash(SAMPLE_HASH);
    const b = signHash("c".repeat(64));
    expect(a).not.toBe(b);
  });

  it("returns null for malformed hash", () => {
    expect(signHash("not-a-hash")).toBeNull();
    expect(signHash("")).toBeNull();
    expect(signHash("zzz")).toBeNull();
  });

  it("returns null when the secret is missing", () => {
    delete process.env.VERIFICATION_HMAC_SECRET;
    expect(signHash(SAMPLE_HASH)).toBeNull();
  });
});

describe("verifyHash", () => {
  it("accepts a signature produced by signHash", () => {
    const sig = signHash(SAMPLE_HASH);
    expect(sig).not.toBeNull();
    expect(verifyHash(SAMPLE_HASH, sig!)).toBe(true);
  });

  it("rejects a signature when the hash is altered", () => {
    const sig = signHash(SAMPLE_HASH)!;
    const otherHash = "f".repeat(64);
    expect(verifyHash(otherHash, sig)).toBe(false);
  });

  it("rejects a signature when the signature is altered", () => {
    const sig = signHash(SAMPLE_HASH)!;
    const tampered = sig.slice(0, -1) + (sig.endsWith("0") ? "1" : "0");
    expect(verifyHash(SAMPLE_HASH, tampered)).toBe(false);
  });

  it("rejects malformed signatures", () => {
    expect(verifyHash(SAMPLE_HASH, "not-hex")).toBe(false);
    expect(verifyHash(SAMPLE_HASH, "")).toBe(false);
    expect(verifyHash(SAMPLE_HASH, "ab")).toBe(false);
  });

  it("rejects malformed hashes", () => {
    const sig = signHash(SAMPLE_HASH)!;
    expect(verifyHash("not-hex", sig)).toBe(false);
    expect(verifyHash("", sig)).toBe(false);
  });

  it("returns false when the secret is rotated mid-stream", () => {
    const sig = signHash(SAMPLE_HASH)!;
    process.env.VERIFICATION_HMAC_SECRET = "b".repeat(48);
    expect(verifyHash(SAMPLE_HASH, sig)).toBe(false);
  });

  it("returns false when the secret is missing", () => {
    const sig = signHash(SAMPLE_HASH)!;
    delete process.env.VERIFICATION_HMAC_SECRET;
    expect(verifyHash(SAMPLE_HASH, sig)).toBe(false);
  });
});
