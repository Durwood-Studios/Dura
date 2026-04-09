export type XPEventSource =
  | "lesson"
  | "quiz"
  | "flashcard"
  | "sandbox"
  | "mastery-gate"
  | "verification"
  | "phase-complete"
  | "module-complete";

export interface XPEvent {
  id: string;
  source: XPEventSource;
  amount: number;
  sourceId: string;
  awardedAt: number;
}
