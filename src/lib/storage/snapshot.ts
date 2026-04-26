import { getDB, type DuraDB } from "@/lib/db";
import type { LessonProgress, ModuleProgress, PhaseProgress } from "@/types/curriculum";
import type { FlashCard, ReviewLog } from "@/types/flashcard";
import type { Goal } from "@/types/goal";
import type { Preferences } from "@/types/preferences";
import type { AssessmentResult, Certificate } from "@/types/assessment";
import type { XPEvent } from "@/types/xp";
import type { TutorialProgress } from "@/types/tutorial";
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
}

export async function buildLearnerSnapshot(): Promise<LearnerRecordSnapshot> {
  const db = await getDB();
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
  ] = await Promise.all([
    db.getAll("progress"),
    db.getAll("moduleProgress"),
    db.getAll("phaseProgress"),
    db.getAll("flashcards"),
    db.getAll("reviewLogs"),
    db.getAll("goals"),
    db.getAll("preferences"),
    db.getAll("sandbox-saves"),
    db.getAll("assessment-results"),
    db.getAll("certificates"),
    db.getAll("xp-events"),
    db.getAll("tutorial-progress"),
  ]);

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
  ]);
  return counts.every((c) => c === 0);
}

export async function restoreSnapshotToIDB(snapshot: LearnerRecordSnapshot): Promise<void> {
  const db = await getDB();

  await Promise.all([
    bulkPut(db, "progress", snapshot.progress),
    bulkPut(db, "moduleProgress", snapshot.moduleProgress),
    bulkPut(db, "phaseProgress", snapshot.phaseProgress),
    bulkPut(db, "flashcards", snapshot.flashcards),
    bulkPut(db, "reviewLogs", snapshot.reviewLogs),
    bulkPut(db, "goals", snapshot.goals),
    bulkPut(db, "preferences", snapshot.preferences),
    bulkPut(db, "sandbox-saves", snapshot.sandboxSaves),
    bulkPut(db, "assessment-results", snapshot.assessmentResults),
    bulkPut(db, "certificates", snapshot.certificates),
    bulkPut(db, "xp-events", snapshot.xpEvents),
    bulkPut(db, "tutorial-progress", snapshot.tutorialProgress),
  ]);
}

async function bulkPut<S extends keyof LearnerStoreMap>(
  db: DuraDB,
  store: S,
  rows: LearnerStoreMap[S][]
): Promise<void> {
  if (rows.length === 0) return;
  const tx = db.transaction(store, "readwrite");
  for (const row of rows) {
    await tx.store.put(row as never);
  }
  await tx.done;
}

type LearnerStoreMap = {
  progress: LessonProgress;
  moduleProgress: ModuleProgress;
  phaseProgress: PhaseProgress;
  flashcards: FlashCard;
  reviewLogs: ReviewLog;
  goals: Goal;
  preferences: Preferences;
  "sandbox-saves": SandboxSave;
  "assessment-results": AssessmentResult;
  certificates: Certificate;
  "xp-events": XPEvent;
  "tutorial-progress": TutorialProgress;
};
