import { migrateLessonIdentities } from "@/lib/db/migrate-lesson-identity";
import { getDB, type DuraDB } from "@/lib/db";
import type { LessonProgress, ModuleProgress, PhaseProgress } from "@/types/curriculum";
import type { FlashCard, ReviewLog } from "@/types/flashcard";
import type { Goal } from "@/types/goal";
import type { Preferences } from "@/types/preferences";
import type { AssessmentResult, Certificate } from "@/types/assessment";
import type { XPEvent } from "@/types/xp";
import type { TutorialProgress } from "@/types/tutorial";
import type { DojoSession } from "@/types/dojo";
import type { SandboxSave } from "@/types/sandbox";

/**
 * Full learner record snapshot — everything the user owns. Excludes
 * the local analytics queue (consent-gated, not durable user data)
 * and dictionary cache (regenerable from network/content).
 */
export interface LearnerRecordSnapshot {
  schemaVersion: 1;
  createdAt: string;
  progress: LessonProgress[];
  moduleProgress: ModuleProgress[];
  phaseProgress: PhaseProgress[];
  flashcards: FlashCard[];
  reviewLogs: ReviewLog[];
  goals: Goal[];
  preferences: Preferences[];
  sandboxSaves: SandboxSave[];
  assessmentResults: AssessmentResult[];
  certificates: Certificate[];
  xpEvents: XPEvent[];
  tutorialProgress: TutorialProgress[];
  dojoSessions?: DojoSession[];
  judgmentAttempts?: import("@/lib/db/judgment").StoredJudgmentAttempt[];
  tombstones?: import("@/lib/db").DuraDBSchema["tombstones"]["value"][];
}

export async function buildLearnerSnapshot(): Promise<LearnerRecordSnapshot> {
  const db = await getDB();
  const tx = db.transaction(
    [
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
      "tombstones",
      "judgmentAttempts",
    ],
    "readonly"
  );
  const [
    progress,
    moduleProgress,
    phaseProgress,
    flashcards,
    reviewLogs,
    goals,
    preferences,
    sandboxSaves,
    assessmentResults,
    certificates,
    xpEvents,
    tutorialProgress,
    dojoSessions,
    tombstones,
    judgmentAttempts,
  ] = await Promise.all([
    tx.objectStore("progress").getAll(),
    tx.objectStore("moduleProgress").getAll(),
    tx.objectStore("phaseProgress").getAll(),
    tx.objectStore("flashcards").getAll(),
    tx.objectStore("reviewLogs").getAll(),
    tx.objectStore("goals").getAll(),
    tx.objectStore("preferences").getAll(),
    tx.objectStore("sandbox-saves").getAll(),
    tx.objectStore("assessment-results").getAll(),
    tx.objectStore("certificates").getAll(),
    tx.objectStore("xp-events").getAll(),
    tx.objectStore("tutorial-progress").getAll(),
    tx.objectStore("dojo-sessions").getAll(),
    tx.objectStore("tombstones").getAll(),
    tx.objectStore("judgmentAttempts").getAll(),
  ]);
  await tx.done;

  return {
    schemaVersion: 1,
    createdAt: new Date().toISOString(),
    progress,
    moduleProgress,
    phaseProgress,
    flashcards,
    reviewLogs,
    goals,
    preferences,
    sandboxSaves,
    assessmentResults,
    certificates,
    xpEvents,
    tutorialProgress,
    dojoSessions,
    tombstones,
    judgmentAttempts,
  };
}

/**
 * True iff IDB has zero learner-owned records across all stores.
 * Analytics queue is intentionally excluded — consent-gated,
 * non-durable, not part of the learner record.
 */
export async function isLearnerStoreEmpty(db?: DuraDB): Promise<boolean> {
  const handle = db ?? (await getDB());
  const counts = await Promise.all([
    handle.count("progress"),
    handle.count("moduleProgress"),
    handle.count("phaseProgress"),
    handle.count("flashcards"),
    handle.count("reviewLogs"),
    handle.count("goals"),
    handle.count("sandbox-saves"),
    handle.count("assessment-results"),
    handle.count("certificates"),
    handle.count("xp-events"),
    handle.count("tutorial-progress"),
    handle.count("dojo-sessions"),
    handle.count("judgmentAttempts"),
  ]);
  return counts.every((c) => c === 0);
}

export async function restoreSnapshotToIDB(snapshot: LearnerRecordSnapshot): Promise<void> {
  const db = await getDB();

  const rows = {
    progress: snapshot.progress,
    moduleProgress: snapshot.moduleProgress,
    phaseProgress: snapshot.phaseProgress,
    flashcards: snapshot.flashcards,
    reviewLogs: snapshot.reviewLogs,
    goals: snapshot.goals,
    preferences: snapshot.preferences,
    "sandbox-saves": snapshot.sandboxSaves,
    "assessment-results": snapshot.assessmentResults,
    certificates: snapshot.certificates,
    "xp-events": snapshot.xpEvents,
    "tutorial-progress": snapshot.tutorialProgress,
    "dojo-sessions": snapshot.dojoSessions ?? [],
    tombstones: snapshot.tombstones ?? [],
    judgmentAttempts: snapshot.judgmentAttempts ?? [],
  };
  // One transaction ensures an interrupted recovery remains empty and retryable.
  const names = Object.keys(rows) as (keyof typeof rows)[];
  const transaction = db.transaction(names, "readwrite");
  try {
    for (const name of names) {
      // A learner can write while OPFS is loading. Recovery must never overwrite
      // that new work after an earlier, separate emptiness check succeeded.
      if (
        name !== "preferences" &&
        name !== "tombstones" &&
        (await transaction.objectStore(name).count())
      )
        throw new Error("Learning data changed while loading the backup. Recovery was cancelled.");
    }
    for (const name of names) {
      for (const row of rows[name]) await transaction.objectStore(name).put(row as never);
    }
    await transaction.done;
  } catch (error) {
    try {
      transaction.abort();
    } catch {
      /* A rejected transaction may already be aborted. */
    }
    await transaction.done.catch((): void => {});
    throw error;
  }
  await migrateLessonIdentities(db);
}
