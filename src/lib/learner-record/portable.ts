import { getOwnerGeneration, assertOwnerGeneration } from "@/lib/storage/owner";
import {
  hydrateJudgmentAttempt,
  sealJudgmentAttempt,
  mergeJudgmentAttempt,
} from "@/lib/db/judgment";
import { getDB, type DuraDB } from "@/lib/db";
import {
  getAllEncryptedFlashcards,
  getAllEncryptedReviewLogs,
  getAllEncryptedLessonProgress,
  getAllEncryptedModuleProgress,
} from "@/lib/idb/encrypted-store";
import { PORTABLE_RECORD_SCHEMA, type PortableRecord } from "@/lib/learner-record/portable-schema";

/** Read plaintext learning records; portable data never depends on a source device's key. */
export async function buildPortableRecord(
  source?: DuraDB,
  sourceKey?: CryptoKey
): Promise<PortableRecord> {
  const connection = source ?? (await getDB());
  const generation = getOwnerGeneration();
  const names = Array.from(connection.objectStoreNames);
  const transaction = connection.transaction(names, "readonly");
  const snapshot = new Map(
    await Promise.all(
      names.map(
        async (name): Promise<[string, unknown[]]> => [
          name,
          await transaction.objectStore(name).getAll(),
        ]
      )
    )
  );
  await transaction.done;
  // Hydration happens after the consistent readonly transaction; Web Crypto cannot
  // safely be awaited while an IndexedDB transaction is still expected to remain active.
  const db = new Proxy(connection, {
    get(target, property): unknown {
      if (property === "getAll")
        return async (name: string): Promise<unknown[]> => snapshot.get(name) ?? [];
      const value: unknown = Reflect.get(target, property);
      return typeof value === "function" ? value.bind(target) : value;
    },
  });
  const read = async (
    store: "flashcards" | "reviewLogs" | "progress" | "moduleProgress"
  ): Promise<unknown[]> => {
    const { decryptRecord } = await import("@/lib/idb/encryption");
    return Promise.all(
      (await db.getAll(store)).map(async (row): Promise<unknown> => {
        if (!row._e) return row;
        if (!sourceKey) throw new Error("Source key unavailable");
        const plain = await decryptRecord(row._e, sourceKey);
        const rest = { ...row };
        delete rest._e;
        return { ...rest, ...(plain as object) };
      })
    );
  };
  const [
    flashcards,
    reviewLogs,
    progress,
    moduleProgress,
    phaseProgress,
    goals,
    preferences,
    sandboxSaves,
    assessmentResults,
    certificates,
    xpEvents,
    tutorialProgress,
    dojoSessions,
    analytics,
    tombstones,
  ] = await Promise.all([
    sourceKey ? read("flashcards") : getAllEncryptedFlashcards(db),
    sourceKey ? read("reviewLogs") : getAllEncryptedReviewLogs(db),
    sourceKey ? read("progress") : getAllEncryptedLessonProgress(db),
    sourceKey ? read("moduleProgress") : getAllEncryptedModuleProgress(db),
    db.getAll("phaseProgress"),
    db.getAll("goals"),
    db.getAll("preferences"),
    db.getAll("sandbox-saves"),
    db.getAll("assessment-results"),
    db.getAll("certificates"),
    db.getAll("xp-events"),
    db.getAll("tutorial-progress"),
    db.getAll("dojo-sessions"),
    db.getAll("analytics"),
    db.getAll("tombstones"),
  ]);
  const record = PORTABLE_RECORD_SCHEMA.parse({
    judgmentAttempts: await Promise.all(
      (await db.getAll("judgmentAttempts")).map((row) => hydrateJudgmentAttempt(row, sourceKey))
    ),
    version: 2,
    generatedAt: new Date().toISOString(),
    flashcards,
    reviewLogs,
    progress,
    moduleProgress,
    phaseProgress,
    goals,
    preferences,
    sandboxSaves,
    assessmentResults,
    certificates,
    xpEvents,
    tutorialProgress,
    dojoSessions,
    analytics,
    tombstones,
  });
  assertOwnerGeneration(generation);
  return record;
}

/** Restore a validated portable inventory atomically, preserving newer local work. */
export async function applyPortableRecord(input: unknown): Promise<PortableRecord> {
  const incoming = PORTABLE_RECORD_SCHEMA.parse(input);
  const db = await getDB();
  const baseline = new Map(
    await Promise.all(
      Array.from(db.objectStoreNames).map(
        async (name): Promise<[string, unknown[]]> => [name, await db.getAll(name)]
      )
    )
  );
  const local = await buildPortableRecord();
  const { mergeProgress, mergeGoal, mergeFlashcard, mergeSandboxSave, mergeTutorialProgress } =
    await import("@/lib/supabase/sync");
  const { sealPortableRows } = await import("@/lib/idb/encrypted-store");
  const { triggerShadowWrite } = await import("@/lib/storage/shadow-write");
  const merge = <T>(a: T[], b: T[], key: (row: T) => string, resolve: (a: T, b: T) => T): T[] => {
    const rows = new Map(a.map((row): [string, T] => [key(row), row]));
    for (const row of b) {
      const id = key(row);
      const old = rows.get(id);
      rows.set(id, old ? resolve(old, row) : row);
    }
    return [...rows.values()];
  };
  const byId = (row: { id: string }): string => row.id;
  const keep = <T>(a: T): T => a;
  const merged: PortableRecord = {
    ...incoming,
    judgmentAttempts: merge(
      local.judgmentAttempts,
      incoming.judgmentAttempts,
      byId,
      mergeJudgmentAttempt
    ),
    tombstones: merge(
      local.tombstones,
      incoming.tombstones.map((row) => ({ ...row, synced: 0 as const })),
      byId,
      (a, b) => ({ ...a, deletedAt: Math.max(a.deletedAt, b.deletedAt), synced: 0 })
    ),
    progress: merge(
      local.progress,
      incoming.progress.map((row) => ({ ...row, synced: 0 as const })),
      (r): string => r.lessonId,
      (a, b) => ({ ...mergeProgress(a, b), synced: 0 })
    ),
    moduleProgress: merge(
      local.moduleProgress,
      incoming.moduleProgress,
      (r): string => r.moduleId,
      (a, b) => ({
        ...a,
        completedLessons: Math.max(a.completedLessons, b.completedLessons),
        totalLessons: Math.max(a.totalLessons, b.totalLessons),
        masteryGatePassed: a.masteryGatePassed || b.masteryGatePassed,
        unlockedAt: Math.max(a.unlockedAt, b.unlockedAt),
      })
    ),
    phaseProgress: merge(
      local.phaseProgress,
      incoming.phaseProgress,
      (r): string => r.phaseId,
      (a, b) => ({
        ...a,
        unlocked: a.unlocked || b.unlocked,
        unlockedAt: a.unlockedAt ?? b.unlockedAt,
        completedAt: a.completedAt ?? b.completedAt,
        verificationScore: Math.max(a.verificationScore ?? 0, b.verificationScore ?? 0),
      })
    ),
    flashcards: merge(local.flashcards, incoming.flashcards, byId, mergeFlashcard),
    reviewLogs: merge(local.reviewLogs, incoming.reviewLogs, byId, keep),
    goals: merge(local.goals, incoming.goals, byId, mergeGoal),
    preferences: merge(local.preferences, incoming.preferences, byId, (a, b) =>
      "updatedAt" in a && "updatedAt" in b && b.updatedAt > a.updatedAt ? b : a
    ),
    sandboxSaves: merge(local.sandboxSaves, incoming.sandboxSaves, byId, mergeSandboxSave),
    assessmentResults: merge(local.assessmentResults, incoming.assessmentResults, byId, keep),
    certificates: merge(local.certificates, incoming.certificates, byId, keep),
    xpEvents: merge(local.xpEvents, incoming.xpEvents, byId, keep),
    tutorialProgress: merge(
      local.tutorialProgress,
      incoming.tutorialProgress,
      byId,
      mergeTutorialProgress
    ),
    dojoSessions: merge(local.dojoSessions, incoming.dojoSessions, byId, keep),
    // Imported analytics remain exported history; they must not become new telemetry.
    analytics: merge(
      local.analytics,
      incoming.analytics.map((r) => ({ ...r, synced: 1 as const })),
      byId,
      keep
    ),
  };

  const fields = {
    judgmentAttempts: "judgmentAttempts",
    progress: "progress",
    moduleProgress: "moduleProgress",
    phaseProgress: "phaseProgress",
    flashcards: "flashcards",
    reviewLogs: "reviewLogs",
    goals: "goals",
    preferences: "preferences",
    sandboxSaves: "sandbox-saves",
    assessmentResults: "assessment-results",
    certificates: "certificates",
    xpEvents: "xp-events",
    tutorialProgress: "tutorial-progress",
    dojoSessions: "dojo-sessions",
    analytics: "analytics",
    tombstones: "tombstones",
  } as const;
  const names = Object.values(fields);
  const before = names.map((name) => baseline.get(name));
  for (const marker of merged.tombstones) {
    if (marker.table === "flashcards")
      merged.flashcards = merged.flashcards.filter((row) => row.id !== marker.recordId);
    if (marker.table === "goals")
      merged.goals = merged.goals.filter((row) => row.id !== marker.recordId);
    if (marker.table === "sandbox_saves")
      merged.sandboxSaves = merged.sandboxSaves.filter((row) => row.id !== marker.recordId);
  }
  const sealed = await sealPortableRows(merged);
  const rows = {
    ...merged,
    ...sealed,
    judgmentAttempts: await Promise.all(merged.judgmentAttempts.map(sealJudgmentAttempt)),
  };
  const tx = db.transaction(names, "readwrite");
  try {
    // Encryption must finish before opening the IDB transaction. If another writer
    // changed a store meanwhile, abort and let the learner retry against fresh state.
    for (let i = 0; i < names.length; i++) {
      const current = await tx.objectStore(names[i]).getAll();
      if (JSON.stringify(current, binaryJSON) !== JSON.stringify(before[i], binaryJSON))
        throw new Error("Learning data changed during restore. Retry the import.");
    }
    for (const marker of merged.tombstones) {
      const store = marker.table === "sandbox_saves" ? "sandbox-saves" : marker.table;
      await tx.objectStore(store).delete(marker.recordId);
    }
    for (const field of Object.keys(fields) as (keyof typeof fields)[]) {
      for (const row of rows[field]) await tx.objectStore(fields[field]).put(row as never);
    }
    await tx.done;
  } catch (error) {
    try {
      tx.abort();
    } catch {
      /* The transaction can already have aborted. */
    }
    await tx.done.catch((): void => {});
    throw error;
  }
  triggerShadowWrite();
  return merged;
}
function binaryJSON(_key: string, value: unknown): unknown {
  return value instanceof ArrayBuffer ? Array.from(new Uint8Array(value)) : value;
}
