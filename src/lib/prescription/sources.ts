/**
 * Live source adapters — the impure side of the daily prescription.
 *
 * The engine in engine.ts is pure: it takes inputs and returns a plan. This
 * file produces those inputs from the real local stores (IndexedDB-backed
 * FSRS queue + LessonProgress records + the static curriculum content).
 *
 * Nothing here is sent to a server. Every read stays on-device.
 */

import { PHASES } from "@/content/phases";
import { getAllCards, getDueCards } from "@/lib/db/flashcards";
import type { LessonProgress, Module } from "@/types/curriculum";
import { DEFAULT_TARGET_MINUTES } from "./policy";
import type { FsrsDueSummary, PhaseProgress, PrescriptionInputs } from "./types";

const MS_PER_DAY = 86_400_000;

// ─────────────────────────────────────────────────────────────────────────────
// FSRS summary
// ─────────────────────────────────────────────────────────────────────────────

export async function summarizeFsrsDue(now: number = Date.now()): Promise<FsrsDueSummary> {
  const [due, all] = await Promise.all([getDueCards(now), getAllCards()]);

  const dueNow = due.length;
  const oldestOverdueDays =
    due.length === 0
      ? 0
      : Math.floor(
          due.reduce((max, card) => {
            const overdueMs = Math.max(0, now - card.due);
            return overdueMs > max ? overdueMs : max;
          }, 0) / MS_PER_DAY
        );
  const newCount = all.filter((c) => c.state === "new").length;

  return { dueNow, oldestOverdueDays, newCount };
}

// ─────────────────────────────────────────────────────────────────────────────
// Phase progress
// ─────────────────────────────────────────────────────────────────────────────

/** Cold-start position when the learner has no progress records. */
function coldStartPosition(): PhaseProgress {
  const firstPhase = PHASES[0];
  const firstModule = firstPhase.modules[0];
  return {
    currentPhase: phaseIdToNumber(firstPhase.id),
    currentModuleId: firstModule.id,
    currentLessonId: "01",
    lessonsCompletedInModule: 0,
    lessonsInModule: firstModule.lessonCount,
    masteryGate: { available: false, correctNeeded: 5, correctSoFar: 0 },
  };
}

function phaseIdToNumber(phaseId: string): number {
  const parsed = Number.parseInt(phaseId, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function findModule(moduleId: string): Module | undefined {
  for (const phase of PHASES) {
    const m = phase.modules.find((mod) => mod.id === moduleId);
    if (m) return m;
  }
  return undefined;
}

export function derivePhaseProgress(progressRecords: LessonProgress[]): PhaseProgress {
  if (progressRecords.length === 0) {
    return coldStartPosition();
  }

  // Most recently started record is the learner's current focus. If they
  // most recently completed a lesson, the engine treats that as "where they
  // are" — the next session continues from the same module, and the engine's
  // mastery-gate priority kicks in if the module is finished.
  const sorted = [...progressRecords].sort((a, b) => (b.startedAt ?? 0) - (a.startedAt ?? 0));
  const focus = sorted[0];

  const completedInModule = progressRecords.filter(
    (p) => p.moduleId === focus.moduleId && p.completedAt !== null
  ).length;

  const focusModule = findModule(focus.moduleId);
  const lessonsInModule = focusModule?.lessonCount ?? Math.max(completedInModule, 1);

  const gateReachable = completedInModule >= lessonsInModule;

  return {
    currentPhase: phaseIdToNumber(focus.phaseId),
    currentModuleId: focus.moduleId,
    currentLessonId: focus.lessonId,
    lessonsCompletedInModule: completedInModule,
    lessonsInModule,
    masteryGate: {
      available: gateReachable,
      correctNeeded: 5,
      correctSoFar: 0,
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Compose
// ─────────────────────────────────────────────────────────────────────────────

export interface LiveInputOptions {
  /** Override the default 30-minute target. */
  targetMinutes?: number;
  /** Inject in-session ratings (the engine uses the freshest three). */
  recentRatings?: PrescriptionInputs["session"];
}

/** Build PrescriptionInputs from live local state. Pure-function engine
 *  consumes whatever this returns. */
export async function buildLiveInputs(options: LiveInputOptions = {}): Promise<PrescriptionInputs> {
  const { getAllEncryptedLessonProgress } = await import("@/lib/idb/encrypted-store");
  const { getDB } = await import("@/lib/db");

  const db = await getDB();
  const [fsrs, allProgress] = await Promise.all([
    summarizeFsrsDue(),
    getAllEncryptedLessonProgress(db),
  ]);

  const phase = derivePhaseProgress(allProgress);

  return {
    fsrs,
    phase,
    session: options.recentRatings,
    preferences: { targetMinutes: options.targetMinutes ?? DEFAULT_TARGET_MINUTES },
  };
}
