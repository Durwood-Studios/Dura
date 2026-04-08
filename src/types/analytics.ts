export type AnalyticsEventName =
  | "lesson_started"
  | "lesson_completed"
  | "quiz_attempted"
  | "quiz_passed"
  | "flashcard_rated"
  | "flashcard_session_completed"
  | "dictionary_searched"
  | "dictionary_term_viewed"
  | "sandbox_executed"
  | "streak_extended"
  | "phase_unlocked"
  | "verification_started"
  | "verification_passed"
  | "goal_set"
  | "goal_achieved"
  | "study_mode_changed"
  | "theme_changed"
  | "share_clicked";

export interface AnalyticsEvent {
  id: string;
  name: AnalyticsEventName;
  timestamp: number;
  properties: Record<string, string | number | boolean | null>;
  synced: 0 | 1;
}
