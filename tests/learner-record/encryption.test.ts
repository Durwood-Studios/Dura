import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  ENCRYPTED_MAGIC,
  decryptRecord,
  deriveEncryptionKey,
  encryptRecord,
  forgetEncryptionKeys,
  isEncryptedRecord,
} from "@/lib/idb/encryption";
import { clearKeyCache, resetDeviceSecret, resolveEncryptionKey } from "@/lib/idb/encryption-key";

describe("encryption primitives", () => {
  afterEach(() => {
    forgetEncryptionKeys();
  });

  it("encryptRecord output starts with the DURA magic + a 12-byte IV", async () => {
    const key = await deriveEncryptionKey("test-seed-1");
    const buf = await encryptRecord({ hello: "world" }, key);
    const view = new Uint8Array(buf);
    for (let i = 0; i < ENCRYPTED_MAGIC.length; i++) {
      expect(view[i]).toBe(ENCRYPTED_MAGIC[i]);
    }
    expect(view.byteLength).toBeGreaterThan(ENCRYPTED_MAGIC.length + 12);
  });

  it("encryptRecord → decryptRecord round-trips arbitrary JSON-serializable data", async () => {
    const key = await deriveEncryptionKey("test-seed-2");
    const sample = {
      str: "hello",
      num: 42,
      arr: [1, 2, 3],
      nested: { ok: true, when: "2026-04-25T00:00:00.000Z" },
      nullable: null,
    };
    const encrypted = await encryptRecord(sample, key);
    const decrypted = await decryptRecord(encrypted, key);
    expect(decrypted).toEqual(sample);
  });

  it("emits a different ciphertext for the same plaintext on each call (fresh IV)", async () => {
    const key = await deriveEncryptionKey("test-seed-3");
    const a = new Uint8Array(await encryptRecord({ x: 1 }, key));
    const b = new Uint8Array(await encryptRecord({ x: 1 }, key));
    expect(a).not.toEqual(b);
  });

  it("throws when decrypting with the wrong key (AES-GCM auth tag fails)", async () => {
    const keyA = await deriveEncryptionKey("seed-A");
    const keyB = await deriveEncryptionKey("seed-B");
    const encrypted = await encryptRecord({ secret: 1 }, keyA);
    await expect(decryptRecord(encrypted, keyB)).rejects.toThrow();
  });

  it("throws when decrypting a tampered buffer", async () => {
    const key = await deriveEncryptionKey("seed-tamper");
    const buf = await encryptRecord({ x: 1 }, key);
    const view = new Uint8Array(buf);
    // flip a bit in the ciphertext (past the 4-byte magic + 12-byte IV)
    view[ENCRYPTED_MAGIC.length + 12] ^= 0x01;
    await expect(decryptRecord(view.buffer, key)).rejects.toThrow();
  });

  it("isEncryptedRecord detects the magic prefix, rejects plaintext-looking bytes", async () => {
    const key = await deriveEncryptionKey("seed-detect");
    const enc = await encryptRecord({ a: 1 }, key);
    expect(isEncryptedRecord(enc)).toBe(true);

    const plaintext = new TextEncoder().encode('{"legacy":true}');
    expect(isEncryptedRecord(plaintext)).toBe(false);
  });

  it("decryptRecord rejects a non-encrypted buffer up front (no expensive subtle call)", async () => {
    const key = await deriveEncryptionKey("seed-reject");
    const plaintext = new TextEncoder().encode('{"legacy":true}').buffer;
    await expect(decryptRecord(plaintext, key)).rejects.toThrow(/not an encrypted record/i);
  });

  it("deriveEncryptionKey caches by seed (same seed → same key handle)", async () => {
    const k1 = await deriveEncryptionKey("seed-cache");
    const k2 = await deriveEncryptionKey("seed-cache");
    expect(k1).toBe(k2);
  });

  it("forgetEncryptionKeys() drops the cache so the next call re-derives", async () => {
    const k1 = await deriveEncryptionKey("seed-evict");
    forgetEncryptionKeys();
    const k2 = await deriveEncryptionKey("seed-evict");
    expect(k1).not.toBe(k2); // different key handle objects, even if functionally equivalent
  });

  it("rejects empty / non-string seeds", () => {
    expect(() => deriveEncryptionKey("")).toThrow();
  });
});

describe("encryption-key resolver (dual-tier)", () => {
  beforeEach(() => {
    resetDeviceSecret();
  });
  afterEach(() => {
    resetDeviceSecret();
    clearKeyCache();
  });

  it("returns auth tier when an authUserId is provided", async () => {
    const result = await resolveEncryptionKey("supabase-uid-123");
    expect(result.tier).toBe("auth");
    expect(result.seed).toBe("auth:supabase-uid-123");
    expect(result.key).not.toBeNull();
  });

  it("returns device tier when authUserId is null, minting a device secret on first call", async () => {
    expect(window.localStorage.getItem("dura:idb:device-secret")).toBeNull();
    const result = await resolveEncryptionKey(null);
    expect(result.tier).toBe("device");
    expect(result.seed?.startsWith("device:")).toBe(true);
    expect(result.key).not.toBeNull();
    const stored = window.localStorage.getItem("dura:idb:device-secret");
    expect(stored?.length).toBeGreaterThanOrEqual(32);
  });

  it("reuses the same device secret across calls (stable for repeat anonymous sessions)", async () => {
    const a = await resolveEncryptionKey(null);
    const b = await resolveEncryptionKey(null);
    expect(a.seed).toBe(b.seed);
  });

  it("auth and device tiers derive distinct keys (cross-tier records are not interchangeable)", async () => {
    const auth = await resolveEncryptionKey("uid-1");
    const device = await resolveEncryptionKey(null);
    const sample = { value: 7 };
    const encWithAuth = await encryptRecord(sample, auth.key!);
    await expect(decryptRecord(encWithAuth, device.key!)).rejects.toThrow();
  });

  it("resetDeviceSecret() invalidates encrypted records keyed under the prior secret", async () => {
    const before = await resolveEncryptionKey(null);
    const enc = await encryptRecord({ x: 1 }, before.key!);
    resetDeviceSecret();
    const after = await resolveEncryptionKey(null);
    expect(after.seed).not.toBe(before.seed);
    await expect(decryptRecord(enc, after.key!)).rejects.toThrow();
  });

  it("returns 'unavailable' tier when run outside a browser (defensive)", async () => {
    const realWindow = globalThis.window;
    // Simulate SSR by removing window
    // (jsdom puts a real window on the global; we delete and restore)
    // @ts-expect-error — deliberately removing for this test
    delete globalThis.window;
    try {
      const result = await resolveEncryptionKey("uid-x");
      expect(result.tier).toBe("unavailable");
      expect(result.key).toBeNull();
    } finally {
      globalThis.window = realWindow;
    }
  });
});
