/**
 * Tests for the IDB encryption wrapper (P5-A.2). Uses a tiny in-memory
 * fake IDB so we exercise the wrapper's encryption/migration logic
 * without spinning up the real `idb` library or jsdom's IndexedDB
 * implementation (which is slow + flaky in test).
 */

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  getAllEncryptedFlashcards,
  getEncryptedFlashcard,
  putEncryptedFlashcard,
} from "@/lib/idb/encrypted-store";
import { clearActiveKey, setActiveKey } from "@/lib/idb/active-key";
import { forgetEncryptionKeys, isEncryptedRecord } from "@/lib/idb/encryption";
import { resolveEncryptionKey, resetDeviceSecret } from "@/lib/idb/encryption-key";
import type { FlashCard } from "@/types/flashcard";
import type { DuraDB } from "@/lib/db";

// ─── Fake IDB store keyed by id ─────────────────────────────────────────────
/* eslint-disable @typescript-eslint/no-unused-vars */
function makeFakeDB(): DuraDB {
  const store = new Map<string, FlashCard>();
  const fake = {
    async get(_storeName: string, id: string) {
      return store.get(id);
    },
    async put(_storeName: string, value: FlashCard) {
      store.set(value.id, value);
    },
    async getAll(_storeName: string) {
      return [...store.values()];
    },
    async getAllFromIndex(_storeName: string, _idx: string, _key: unknown) {
      return [...store.values()];
    },
    // Internal handle for assertions
    __raw: store,
  };
  return fake as unknown as DuraDB;
}
/* eslint-enable @typescript-eslint/no-unused-vars */

const baseCard: FlashCard = {
  id: "card-A",
  front: "What is FSRS?",
  back: "Free Spaced Repetition Scheduler",
  lessonId: "lesson-1",
  termSlug: null,
  createdAt: 1_000_000,
  due: 2_000_000,
  stability: 5,
  difficulty: 3,
  elapsedDays: 0,
  scheduledDays: 1,
  reps: 0,
  lapses: 0,
  state: "new",
  lastReview: null,
};

describe("IDB encryption wrapper — flashcards", () => {
  beforeEach(() => {
    resetDeviceSecret();
    forgetEncryptionKeys();
    clearActiveKey();
  });
  afterEach(() => {
    resetDeviceSecret();
    forgetEncryptionKeys();
    clearActiveKey();
  });

  it("with NO active key set: writes pass through plaintext (graceful fallback)", async () => {
    const db = makeFakeDB();
    await putEncryptedFlashcard(db, baseCard);

    // Internal: stored record is the unmodified plaintext
    // (cast through unknown to access the test handle)
    const raw = (db as unknown as { __raw: Map<string, FlashCard> }).__raw.get("card-A")!;
    expect(raw.front).toBe(baseCard.front);
    expect(raw.back).toBe(baseCard.back);
    expect(raw._e).toBeUndefined();

    const read = await getEncryptedFlashcard(db, "card-A");
    expect(read?.front).toBe(baseCard.front);
    expect(read?.back).toBe(baseCard.back);
  });

  it("with an active key: writes encrypt front/back into _e and blank the plaintext fields", async () => {
    const resolution = await resolveEncryptionKey(null);
    setActiveKey(resolution);

    const db = makeFakeDB();
    await putEncryptedFlashcard(db, baseCard);

    const raw = (db as unknown as { __raw: Map<string, FlashCard> }).__raw.get("card-A")!;
    expect(raw.front).toBe("");
    expect(raw.back).toBe("");
    expect(raw._e).toBeDefined();
    expect(isEncryptedRecord(raw._e!)).toBe(true);

    // FSRS-managed fields are unchanged at rest (indexes still work)
    expect(raw.id).toBe(baseCard.id);
    expect(raw.due).toBe(baseCard.due);
    expect(raw.state).toBe(baseCard.state);
    expect(raw.lessonId).toBe(baseCard.lessonId);
  });

  it("round-trips a card through encrypted write + decrypted read", async () => {
    const resolution = await resolveEncryptionKey(null);
    setActiveKey(resolution);

    const db = makeFakeDB();
    await putEncryptedFlashcard(db, baseCard);

    const read = await getEncryptedFlashcard(db, "card-A");
    expect(read).toBeDefined();
    expect(read?.front).toBe(baseCard.front);
    expect(read?.back).toBe(baseCard.back);
    // No _e leaks to the public read-side view
    expect(read?._e).toBeUndefined();
  });

  it("best-effort migration: legacy plaintext records are returned as-is on read", async () => {
    // Seed the store with a legacy plaintext record (no _e field) BEFORE
    // any encryption key is set
    const db = makeFakeDB();
    await putEncryptedFlashcard(db, baseCard);

    // Now activate a key — but the existing record is still plaintext
    const resolution = await resolveEncryptionKey(null);
    setActiveKey(resolution);

    const read = await getEncryptedFlashcard(db, "card-A");
    expect(read?.front).toBe(baseCard.front);
    expect(read?.back).toBe(baseCard.back);
  });

  it("best-effort migration: a legacy plaintext record gets encrypted on the next write", async () => {
    // Seed with plaintext (no key yet)
    const db = makeFakeDB();
    await putEncryptedFlashcard(db, baseCard);
    expect(
      (db as unknown as { __raw: Map<string, FlashCard> }).__raw.get("card-A")?._e
    ).toBeUndefined();

    // Key arrives, write happens (e.g. FSRS update)
    const resolution = await resolveEncryptionKey(null);
    setActiveKey(resolution);
    const updated = { ...baseCard, reps: 1, due: 3_000_000 };
    await putEncryptedFlashcard(db, updated);

    const raw = (db as unknown as { __raw: Map<string, FlashCard> }).__raw.get("card-A")!;
    expect(raw._e).toBeDefined();
    expect(raw.front).toBe("");
  });

  it("getAllEncryptedFlashcards hydrates every record (mixed encrypted + plaintext supported)", async () => {
    const db = makeFakeDB();

    // Card 1: plaintext seed (no key)
    await putEncryptedFlashcard(db, { ...baseCard, id: "card-1" });

    // Card 2: encrypted (with key)
    const resolution = await resolveEncryptionKey(null);
    setActiveKey(resolution);
    await putEncryptedFlashcard(db, { ...baseCard, id: "card-2", front: "Q2", back: "A2" });

    const all = await getAllEncryptedFlashcards(db);
    const byId = new Map(all.map((c) => [c.id, c]));
    expect(byId.get("card-1")?.front).toBe(baseCard.front);
    expect(byId.get("card-2")?.front).toBe("Q2");
    expect(byId.get("card-2")?.back).toBe("A2");
  });

  it("encrypted record + WRONG key (different tier or rotated secret) throws on read", async () => {
    const deviceRes = await resolveEncryptionKey(null);
    setActiveKey(deviceRes);
    const db = makeFakeDB();
    await putEncryptedFlashcard(db, baseCard);

    // Switch to auth tier (different key, can't decrypt the device-tier record)
    const authRes = await resolveEncryptionKey("supabase-uid-X");
    setActiveKey(authRes);

    await expect(getEncryptedFlashcard(db, "card-A")).rejects.toThrow();
  });

  it("encrypted record + NO active key throws a clear error (fail-closed read)", async () => {
    const resolution = await resolveEncryptionKey(null);
    setActiveKey(resolution);
    const db = makeFakeDB();
    await putEncryptedFlashcard(db, baseCard);

    clearActiveKey();
    await expect(getEncryptedFlashcard(db, "card-A")).rejects.toThrow(/active encryption key/i);
  });

  it("undefined input passes through (e.g. db.get for nonexistent id)", async () => {
    const db = makeFakeDB();
    const read = await getEncryptedFlashcard(db, "does-not-exist");
    expect(read).toBeUndefined();
  });
});
