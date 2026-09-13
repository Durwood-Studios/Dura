import { expect, it, vi } from "vitest";
import { webcrypto } from "node:crypto";
const h = vi.hoisted(() => {
  const rows = new Map<string, Map<string, object>>();
  const bucket = (s: string): Map<string, object> => {
    if (!rows.has(s)) rows.set(s, new Map());
    return rows.get(s)!;
  };
  const names = [
    "progress",
    "moduleProgress",
    "phaseProgress",
    "flashcards",
    "reviewLogs",
    "goals",
    "preferences",
    "sandbox-saves",
    "assessment-results",
    "certificates",
    "xp-events",
    "tutorial-progress",
    "dojo-sessions",
    "analytics",
    "tombstones",
    "judgmentAttempts",
  ];
  const store = (s: string) => ({
    get: async (id: string) => bucket(s).get(id),
    getAll: async () => [...bucket(s).values()],
    put: async (r: Record<string, unknown>) =>
      bucket(s).set(String(r.id ?? r.lessonId ?? r.moduleId ?? r.phaseId), r),
  });
  const db = {
    objectStoreNames: names,
    getAll: async (s: string) => [...bucket(s).values()],
    put: async (s: string, r: Record<string, unknown>) => store(s).put(r),
    getAllFromIndex: async (s: string) =>
      [...bucket(s).values()].filter((r) => (r as { synced: number }).synced === 0),
    transaction: (s: string) => ({
      store: store(s),
      objectStore: store,
      abort: () => {},
      done: Promise.resolve(),
    }),
  };
  return { db, rows, bucket, rpc: vi.fn(async () => ({ error: null })) };
});
vi.mock("@/lib/db", () => ({ getDB: async () => h.db }));
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: { getUser: async () => ({ data: { user: { id: "owner" } } }) },
    rpc: h.rpc,
  }),
}));
vi.mock("@/lib/analytics/consent-gate", () => ({ isAnalyticsEnabled: () => true }));

it("exports real encrypted review records as portable plaintext", async () => {
  vi.stubGlobal("crypto", webcrypto);
  h.rows.clear();
  const { deriveEncryptionKey } = await import("@/lib/idb/encryption");
  const { setActiveKey } = await import("@/lib/idb/active-key");
  setActiveKey({ tier: "device", seed: "test", key: await deriveEncryptionKey("test") });
  const { putEncryptedReviewLog } = await import("@/lib/idb/encrypted-store");
  await putEncryptedReviewLog(h.db as never, {
    id: "r",
    cardId: "c",
    rating: "good",
    reviewedAt: 1000,
    elapsedDays: 1,
    scheduledDays: 1,
    state: "review",
  });
  const { exportLearnerRecord } = await import("@/lib/learner-record/export");
  const bundle = await exportLearnerRecord();
  expect(bundle.stats.reviewLog).toBe(1);
});
it("keeps canonical format minimal while portable format preserves content", async () => {
  const { toCanonicalCard, CanonicalCardSchema } = await import("@/lib/learner-record/types");
  const card = toCanonicalCard(
    {
      id: "c",
      front: "Variable",
      back: "named value",
      termSlug: "variable",
      lessonId: null,
      createdAt: 1000,
      lastReview: null,
      due: 2000,
      stability: 0,
      difficulty: 5,
      reps: 0,
      lapses: 0,
      state: "new",
      elapsedDays: 0,
      scheduledDays: 0,
    },
    1000
  );
  expect(card).not.toHaveProperty("termSlug");
  expect(CanonicalCardSchema.parse({ ...card, termSlug: "variable" })).not.toHaveProperty(
    "termSlug"
  );
});
it("does not overwrite completion made while an upload is pending", async () => {
  h.rows.clear();
  const { setActiveKey } = await import("@/lib/idb/active-key");
  setActiveKey(null);
  const old = {
    lessonId: "1/1-1/01",
    phaseId: "1",
    moduleId: "1-1",
    startedAt: 1,
    completedAt: null,
    scrollPercent: 40,
    timeSpentMs: 100,
    quizPassed: false,
    quizScore: null,
    xpEarned: 0,
    synced: 0,
  };
  h.bucket("progress").set(old.lessonId, old);
  let release: () => void = () => {};
  h.rpc.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        release = () => resolve({ error: null });
      })
  );
  const { selectStorageOwner } = await import("@/lib/storage/owner");
  selectStorageOwner("owner");
  const { pushChanges } = await import("@/lib/supabase/sync");
  const pending = pushChanges();
  await vi.waitFor(() => expect(h.rpc).toHaveBeenCalled());
  h.bucket("progress").set(old.lessonId, {
    ...old,
    completedAt: 20,
    scrollPercent: 100,
    xpEarned: 50,
  });
  release();
  await pending;
  expect(h.bucket("progress").get(old.lessonId)).toMatchObject({
    completedAt: 20,
    scrollPercent: 100,
    xpEarned: 50,
    synced: 0,
  });
});
it("does not acknowledge analytics without a delivery sink", async () => {
  vi.stubGlobal("IDBKeyRange", { only: (v: unknown) => v });
  h.rows.clear();
  h.bucket("analytics").set("a", {
    id: "a",
    name: "lesson_start",
    timestamp: 1,
    properties: {},
    synced: 0,
  });
  const { flush } = await import("@/lib/analytics");
  await flush();
  expect(h.bucket("analytics").get("a")).toMatchObject({ synced: 0 });
});

it("round-trips encrypted dictionary and custom cards under a different device key", async () => {
  h.rows.clear();
  vi.stubGlobal("crypto", webcrypto);
  const { deriveEncryptionKey } = await import("@/lib/idb/encryption");
  const { setActiveKey } = await import("@/lib/idb/active-key");
  const { putEncryptedFlashcard, getAllEncryptedFlashcards } =
    await import("@/lib/idb/encrypted-store");
  setActiveKey({ tier: "device", seed: "source", key: await deriveEncryptionKey("source") });
  const base = {
    front: "Question",
    back: "Answer",
    lessonId: null,
    createdAt: 1000,
    lastReview: null,
    due: 2000,
    stability: 0,
    difficulty: 0,
    reps: 0,
    lapses: 0,
    state: "new" as const,
    elapsedDays: 0,
    scheduledDays: 0,
  };
  await putEncryptedFlashcard(h.db as never, {
    ...base,
    id: "dictionary-card",
    termSlug: "variable",
  });
  await putEncryptedFlashcard(h.db as never, {
    ...base,
    id: "custom-card",
    termSlug: null,
    front: "My own question",
  });
  const { exportLearnerRecord } = await import("@/lib/learner-record/export");
  const { parseLearnerRecordZip, applyLearnerRecord } = await import("@/lib/learner-record/import");
  const exported = await exportLearnerRecord();
  const parsed = await parseLearnerRecordZip(exported.blob);
  h.rows.clear();
  setActiveKey({
    tier: "device",
    seed: "destination",
    key: await deriveEncryptionKey("destination"),
  });
  const restored = await applyLearnerRecord(parsed);
  expect(restored.cardsRestored).toBe(2);
  const cards = await getAllEncryptedFlashcards(h.db as never);
  expect(cards.map((c) => c.front)).toContain("My own question");
  expect(cards.find((c) => c.id === "dictionary-card")?.termSlug).toBe("variable");
  await applyLearnerRecord(parsed);
  expect((await getAllEncryptedFlashcards(h.db as never)).length).toBe(2);
});

it("refuses cloud upload when authentication belongs to a different local owner", async () => {
  const { selectStorageOwner } = await import("@/lib/storage/owner");
  selectStorageOwner("someone-else");
  const { pushChanges } = await import("@/lib/supabase/sync");
  await expect(pushChanges()).rejects.toThrow("sync account changed");
});
