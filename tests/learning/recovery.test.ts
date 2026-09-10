import { afterEach, describe, expect, it, vi } from "vitest";
import { memoryLearnerDB } from "../helpers/learner-db";
import { mountOPFSStub } from "../helpers/opfs-stub";
import { migrateLessonIdentities } from "@/lib/db/migrate-lesson-identity";
import { deriveEncryptionKey, encryptRecord, decryptRecord } from "@/lib/idb/encryption";
import { saveToOPFS, loadFromOPFS } from "@/lib/storage/opfs";
import {
  buildLearnerSnapshot,
  restoreSnapshotToIDB,
  type LearnerRecordSnapshot,
} from "@/lib/storage/snapshot";
import { getDB } from "@/lib/db";
vi.mock("@/lib/db", () => ({ getDB: vi.fn() }));
afterEach((): void => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
describe("durable learner recovery", (): void => {
  it("migrates encrypted progress once and preserves historical XP IDs for cloud compatibility", async (): Promise<void> => {
    const { db } = memoryLearnerDB();
    const key = await deriveEncryptionKey("migration-test");
    const cipher = await encryptRecord({ completedAt: 123, quizPassed: true }, key);
    await db.put("progress", {
      lessonId: "01",
      phaseId: "0",
      moduleId: "0-1",
      _e: cipher,
    } as never);
    await db.put("xp-events", {
      id: "xp_lesson_01",
      source: "lesson",
      sourceId: "01",
      amount: 10,
      awardedAt: 123,
    });
    await migrateLessonIdentities(db);
    await migrateLessonIdentities(db);
    const records = await db.getAll("progress");
    expect(records).toHaveLength(1);
    expect(records[0]).toMatchObject({ lessonId: "0/0-1/01", synced: 0, _e: cipher });
    expect(await db.getAll("xp-events")).toMatchObject([{ id: "xp_lesson_01", amount: 10 }]);
  });
  it("round-trips ciphertext through snapshot, OPFS JSON, and restoration", async (): Promise<void> => {
    const { db, stores } = memoryLearnerDB();
    vi.mocked(getDB).mockResolvedValue(db);
    mountOPFSStub();
    const key = await deriveEncryptionKey("recovery-test");
    const payload = { front: "What is a string?", back: "Text", completedAt: 123 };
    const cipher = await encryptRecord(payload, key);
    await db.put("flashcards", { id: "card-1", front: "", back: "", _e: cipher } as never);
    await saveToOPFS(await buildLearnerSnapshot());
    stores.clear();
    const snapshot = await loadFromOPFS<LearnerRecordSnapshot>();
    expect(snapshot).not.toBeNull();
    await restoreSnapshotToIDB(snapshot!);
    const restored = (await db.get("flashcards", "card-1")) as unknown as { _e: ArrayBuffer };
    expect(await decryptRecord(restored._e, key)).toEqual(payload);
  });
  it("rejects an already-corrupted encrypted backup instead of restoring empty data", async (): Promise<void> => {
    const stub = mountOPFSStub();
    stub.files.set("dura-learner-record.json", '{"flashcards":[{"_e":{}}]}');
    vi.spyOn(console, "warn").mockImplementation((): void => {});
    expect(await loadFromOPFS()).toBeNull();
  });
});
