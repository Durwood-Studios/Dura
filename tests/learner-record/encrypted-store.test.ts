/**
 * Tests for the IDB encryption wrapper (P5-A.2). Uses a tiny in-memory
 * fake IDB so we exercise the wrapper's encryption/migration logic
 * without spinning up the real `idb` library or jsdom's IndexedDB
 * implementation (which is slow + flaky in test).
 */

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  getAllEncryptedFlashcards,
  getAllEncryptedLessonProgress,
  getAllEncryptedModuleProgress,
  getAllEncryptedReviewLogs,
  getEncryptedFlashcard,
  getEncryptedLessonProgress,
  getEncryptedModuleProgress,
  putEncryptedFlashcard,
  putEncryptedLessonProgress,
  putEncryptedModuleProgress,
  putEncryptedReviewLog,
} from "@/lib/idb/encrypted-store";
import { clearActiveKey, setActiveKey } from "@/lib/idb/active-key";
import { forgetEncryptionKeys, isEncryptedRecord } from "@/lib/idb/encryption";
import { resolveEncryptionKey, resetDeviceSecret } from "@/lib/idb/encryption-key";
import type { FlashCard, ReviewLog } from "@/types/flashcard";
import type { LessonProgress, ModuleProgress } from "@/types/curriculum";
import type { DuraDB } from "@/lib/db";

// ─── Fake IDB stores keyed per object-store name ───────────────────────────
/* eslint-disable @typescript-eslint/no-unused-vars */
type AnyRecord = { [k: string]: unknown };
type StoreKeyed = { id?: string; lessonId?: string; moduleId?: string } & AnyRecord;

function keyFor(storeName: string, value: StoreKeyed): string {
  if (storeName === "progress") return value.lessonId as string;
  if (storeName === "moduleProgress") return value.moduleId as string;
  return value.id as string;
}

function makeFakeDB(): DuraDB {
  const stores = new Map<string, Map<string, StoreKeyed>>();
  const getStore = (name: string): Map<string, StoreKeyed> => {
    let s = stores.get(name);
    if (!s) {
      s = new Map();
      stores.set(name, s);
    }
    return s;
  };
  const fake = {
    async get(storeName: string, id: string) {
      return getStore(storeName).get(id);
    },
    async put(storeName: string, value: StoreKeyed) {
      getStore(storeName).set(keyFor(storeName, value), value);
    },
    async getAll(storeName: string) {
      return [...getStore(storeName).values()];
    },
    async getAllFromIndex(storeName: string, _idx: string, _key: unknown) {
      return [...getStore(storeName).values()];
    },
    __stores: stores,
  };
  return fake as unknown as DuraDB;
}

function rawStore(db: DuraDB, name: string): Map<string, StoreKeyed> {
  return (db as unknown as { __stores: Map<string, Map<string, StoreKeyed>> }).__stores.get(name)!;
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
    const raw = rawStore(db, "flashcards").get("card-A") as unknown as FlashCard;
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

    const raw = rawStore(db, "flashcards").get("card-A") as unknown as FlashCard;
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
    expect((rawStore(db, "flashcards").get("card-A") as FlashCard | undefined)?._e).toBeUndefined();

    // Key arrives, write happens (e.g. FSRS update)
    const resolution = await resolveEncryptionKey(null);
    setActiveKey(resolution);
    const updated = { ...baseCard, reps: 1, due: 3_000_000 };
    await putEncryptedFlashcard(db, updated);

    const raw = rawStore(db, "flashcards").get("card-A") as unknown as FlashCard;
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

// ─── P5-A.3: behavioral stores ──────────────────────────────────────────────

const sampleReviewLog: ReviewLog = {
  id: "log-1",
  cardId: "card-A",
  rating: "good",
  reviewedAt: 1_500_000,
  elapsedDays: 1,
  scheduledDays: 4,
  state: "review",
};

const sampleProgress: LessonProgress = {
  lessonId: "lesson-1",
  phaseId: "phase-0",
  moduleId: "module-1",
  startedAt: 1_000_000,
  completedAt: 1_500_000,
  scrollPercent: 90,
  timeSpentMs: 540_000,
  quizPassed: true,
  quizScore: 0.9,
  xpEarned: 100,
  synced: 0,
};

const sampleModule: ModuleProgress = {
  moduleId: "module-1",
  phaseId: "phase-0",
  completedLessons: 4,
  totalLessons: 5,
  masteryGatePassed: false,
  unlockedAt: 1_000_000,
};

describe("IDB encryption wrapper — reviewLogs (P5-A.3)", () => {
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

  it("with key: encrypts behavioral fields, leaves id + cardId + reviewedAt plaintext (indexes work)", async () => {
    setActiveKey(await resolveEncryptionKey(null));
    const db = makeFakeDB();
    await putEncryptedReviewLog(db, sampleReviewLog);

    const raw = rawStore(db, "reviewLogs").get("log-1") as unknown as ReviewLog & {
      _e?: ArrayBuffer;
    };
    expect(raw.id).toBe("log-1");
    expect(raw.cardId).toBe("card-A");
    expect(raw.reviewedAt).toBe(1_500_000);
    expect(raw._e).toBeDefined();
    expect(isEncryptedRecord(raw._e!)).toBe(true);
    // Behavioral fields are not present in plaintext at rest
    expect((raw as unknown as Record<string, unknown>).rating).toBeUndefined();
    expect((raw as unknown as Record<string, unknown>).state).toBeUndefined();
  });

  it("hydrates a stored record back to the original ReviewLog shape", async () => {
    setActiveKey(await resolveEncryptionKey(null));
    const db = makeFakeDB();
    await putEncryptedReviewLog(db, sampleReviewLog);
    const all = await getAllEncryptedReviewLogs(db);
    expect(all[0]).toEqual(sampleReviewLog);
  });

  it("legacy plaintext entries pass through (best-effort migration)", async () => {
    const db = makeFakeDB();
    await putEncryptedReviewLog(db, sampleReviewLog); // no key → plaintext
    setActiveKey(await resolveEncryptionKey(null));
    const all = await getAllEncryptedReviewLogs(db);
    expect(all[0]).toEqual(sampleReviewLog);
  });
});

describe("IDB encryption wrapper — lesson progress (P5-A.3)", () => {
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

  it("encrypts behavioral fields; keeps lessonId/phaseId/moduleId/synced plaintext for indexes", async () => {
    setActiveKey(await resolveEncryptionKey(null));
    const db = makeFakeDB();
    await putEncryptedLessonProgress(db, sampleProgress);

    const raw = rawStore(db, "progress").get("lesson-1") as unknown as LessonProgress & {
      _e?: ArrayBuffer;
    };
    expect(raw.lessonId).toBe("lesson-1");
    expect(raw.phaseId).toBe("phase-0");
    expect(raw.moduleId).toBe("module-1");
    expect(raw.synced).toBe(0);
    expect(raw._e).toBeDefined();
    expect((raw as unknown as Record<string, unknown>).timeSpentMs).toBeUndefined();
    expect((raw as unknown as Record<string, unknown>).quizPassed).toBeUndefined();
  });

  it("round-trips a progress record through encrypted write + decrypted read", async () => {
    setActiveKey(await resolveEncryptionKey(null));
    const db = makeFakeDB();
    await putEncryptedLessonProgress(db, sampleProgress);
    const read = await getEncryptedLessonProgress(db, "lesson-1");
    expect(read).toEqual(sampleProgress);
  });

  it("getAll hydrates a mixed encrypted + plaintext store", async () => {
    const db = makeFakeDB();
    // legacy plaintext
    await putEncryptedLessonProgress(db, { ...sampleProgress, lessonId: "l-old" });
    // encrypted
    setActiveKey(await resolveEncryptionKey(null));
    await putEncryptedLessonProgress(db, { ...sampleProgress, lessonId: "l-new", xpEarned: 200 });
    const all = await getAllEncryptedLessonProgress(db);
    const byId = new Map(all.map((p) => [p.lessonId, p]));
    expect(byId.get("l-old")?.xpEarned).toBe(100);
    expect(byId.get("l-new")?.xpEarned).toBe(200);
  });
});

describe("IDB encryption wrapper — module progress (P5-A.3)", () => {
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

  it("encrypts mastery fields; keeps moduleId + phaseId plaintext for the by-phase index", async () => {
    setActiveKey(await resolveEncryptionKey(null));
    const db = makeFakeDB();
    await putEncryptedModuleProgress(db, sampleModule);

    const raw = rawStore(db, "moduleProgress").get("module-1") as unknown as ModuleProgress & {
      _e?: ArrayBuffer;
    };
    expect(raw.moduleId).toBe("module-1");
    expect(raw.phaseId).toBe("phase-0");
    expect(raw._e).toBeDefined();
    expect((raw as unknown as Record<string, unknown>).completedLessons).toBeUndefined();
    expect((raw as unknown as Record<string, unknown>).masteryGatePassed).toBeUndefined();
  });

  it("round-trips through encrypted write + decrypted read", async () => {
    setActiveKey(await resolveEncryptionKey(null));
    const db = makeFakeDB();
    await putEncryptedModuleProgress(db, sampleModule);
    const read = await getEncryptedModuleProgress(db, "module-1");
    expect(read).toEqual(sampleModule);
  });

  it("getAll hydrates a mixed encrypted + plaintext store", async () => {
    const db = makeFakeDB();
    await putEncryptedModuleProgress(db, { ...sampleModule, moduleId: "m-old" });
    setActiveKey(await resolveEncryptionKey(null));
    await putEncryptedModuleProgress(db, {
      ...sampleModule,
      moduleId: "m-new",
      masteryGatePassed: true,
    });
    const all = await getAllEncryptedModuleProgress(db);
    const byId = new Map(all.map((m) => [m.moduleId, m]));
    expect(byId.get("m-old")?.masteryGatePassed).toBe(false);
    expect(byId.get("m-new")?.masteryGatePassed).toBe(true);
  });
});
