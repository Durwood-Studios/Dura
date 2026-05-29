/**
 * Diagnostic question types — the schema for honest, algorithm-driven feedback.
 *
 * Design constraints:
 *   - No learner data is collected; every output is a pure function of the
 *     question definition + the current answer.
 *   - Every wrong-answer choice carries a NAMED misconception so feedback
 *     can diagnose (not just score).
 *   - Confidence is optional; when present it powers calibration feedback.
 *   - The schema is a discriminated union (`kind`) so future question types
 *     can ship without breaking existing ones.
 */

export type QuestionId = string;

/** Author-declared difficulty. The algorithm uses this constant rather than
 *  learning hardness from learner data. */
export type Difficulty = "intro" | "core" | "stretch";

export type ConfidenceLevel = 1 | 2 | 3 | 4 | 5;

export type MisconceptionId = string;

/** Where a learner should go to fix the diagnosed misconception. */
export type RemediationPointer =
  | { kind: "lesson"; path: string; label: string }
  | { kind: "drill"; id: string; label: string }
  | { kind: "reading"; href: string; label: string };

export interface Misconception {
  id: MisconceptionId;
  name: string;
  description: string;
  remediation: RemediationPointer;
}

export type MisconceptionCatalog = Readonly<Record<MisconceptionId, Misconception>>;

export interface WorkedSolution {
  steps: string[];
}

export interface Distractor {
  text: string;
  misconception: MisconceptionId;
}

export interface MCQQuestion {
  kind: "mcq";
  id: QuestionId;
  difficulty: Difficulty;
  prompt: string;
  correct: { text: string; explanation?: string };
  distractors: Distractor[];
  workedSolution: WorkedSolution;
  /** Opt-in: when true the UI elicits a 1-5 confidence rating before reveal. */
  confidenceCheck?: boolean;
  tags?: string[];
}

export type Question = MCQQuestion;

export interface MCQSubmission {
  kind: "mcq";
  /** Index into the rendered choice list (correct interleaved with distractors). */
  choiceIndex: number;
  confidence?: ConfidenceLevel;
}

export type AnswerSubmission = MCQSubmission;

export type CalibrationFlag = "calibrated" | "overconfident" | "underconfident";

export interface CalibrationReading {
  confidence: ConfidenceLevel;
  flag: CalibrationFlag;
  note: string;
}

export interface Diagnosis {
  misconception: Misconception;
  explanation: string;
}

/** FSRS-compatible rating; mirrors the type at @/types/flashcard so the bridge
 *  produces values the local scheduler can consume directly. */
export type ReviewRating = "again" | "hard" | "good" | "easy";

export interface EvaluationResult {
  correct: boolean;
  selectedText: string;
  correctText: string;
  worked: WorkedSolution;
  diagnosis?: Diagnosis;
  calibration?: CalibrationReading;
  rating: ReviewRating;
}
