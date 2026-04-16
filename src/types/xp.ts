export type XPEventSource =
  | "lesson"
  | "quiz"
  | "flashcard"
  | "sandbox"
  | "mastery-gate"
  | "verification"
  | "phase-complete"
  | "module-complete";

/**
 * Point type distinguishes effort from proof.
 * - "ap" (Activity Points): Earned by showing up — lessons, reviews, sandbox.
 *   Measures consistency and effort.
 * - "mp" (Mastery Points): Earned ONLY from verified assessments — mastery gates,
 *   phase verifications. Measures proven competence. Shown on certificates and portfolios.
 */
export type PointType = "ap" | "mp";

/** Which sources earn which point type. */
export const POINT_TYPE_MAP: Record<XPEventSource, PointType> = {
  lesson: "ap",
  quiz: "ap",
  flashcard: "ap",
  sandbox: "ap",
  "mastery-gate": "mp",
  verification: "mp",
  "phase-complete": "mp",
  "module-complete": "mp",
};

export interface XPEvent {
  id: string;
  source: XPEventSource;
  amount: number;
  sourceId: string;
  awardedAt: number;
  /** Computed from source. "ap" for activity, "mp" for mastery. */
  pointType?: PointType;
}
