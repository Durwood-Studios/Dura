import type { ReviewRating } from "@/lib/diagnostic/types";

/**
 * Daily-prescription types — what the engine reads, what it returns.
 *
 * The engine itself is pure: same inputs → same plan, no clock, no I/O.
 * Time-of-day adjustments (if any are ever wanted) become an explicit input,
 * never an implicit Date.now() in the algorithm.
 */

/** Local FSRS summary. The adapter that reads from IndexedDB lives outside the
 *  engine; the engine consumes only the shape below. */
export interface FsrsDueSummary {
  /** Cards whose due date is in the past or today. */
  dueNow: number;
  /** Days the most-overdue card is past its due date. 0 if none overdue. */
  oldestOverdueDays: number;
  /** Cards never reviewed (new). */
  newCount: number;
}

export interface MasteryGate {
  /** True if the learner is at the gate boundary of the current module. */
  available: boolean;
  /** Total correct attempts the module gate requires. */
  correctNeeded: number;
  /** Correct attempts accumulated in the current session. */
  correctSoFar: number;
}

export interface PhaseProgress {
  /** Phase index, 0–9. */
  currentPhase: number;
  /** Module slug, e.g. "0-1". */
  currentModuleId: string;
  /** Lesson id, e.g. "03". */
  currentLessonId: string;
  /** Lessons completed in the current module. */
  lessonsCompletedInModule: number;
  /** Total lessons in the current module. */
  lessonsInModule: number;
  /** Mastery gate status at the end of the current module. */
  masteryGate: MasteryGate;
}

export interface SessionSignal {
  /** Last N FSRS ratings from the diagnostic engine, freshest last. */
  recentRatings: ReviewRating[];
  /** Optional tag of the most recently attempted question. Drives same-topic
   *  remediation routing when present; absent values degrade gracefully. */
  recentTopicTag?: string;
}

export interface Preferences {
  /** Total minutes the learner is committing today. */
  targetMinutes: number;
}

export interface PrescriptionInputs {
  fsrs: FsrsDueSummary;
  phase: PhaseProgress;
  session?: SessionSignal;
  preferences: Preferences;
}

export type BlockKind = "fresh-start" | "fsrs-review" | "lesson" | "mastery-gate" | "remediation";

export interface PlanBlock {
  kind: BlockKind;
  minutes: number;
  /** Short, scannable title — what shows up in the plan list. */
  title: string;
  /** Concrete target, e.g. "10 cards" or "Lesson 0.3.2". */
  target: string;
  /** Where the learner clicks to start this block. */
  href: string;
  /** One-sentence honest reason this block is in the plan. */
  rationale: string;
}

/**
 * Honest declaration of how much signal the algorithm had. Renders next to the
 * plan so the learner can tell when the recommendation is provisional.
 *
 *   fresh       — no FSRS history, no session ratings. Cold-start guess.
 *   warming     — partial signal: either FSRS or session, not both.
 *   calibrated  — both FSRS and recent session data inform the plan.
 */
export type SignalQuality = "fresh" | "warming" | "calibrated";

export interface DailyPlan {
  totalMinutes: number;
  blocks: PlanBlock[];
  signalQuality: SignalQuality;
  /** One-sentence opener the learner reads above the block list. */
  summary: string;
}
