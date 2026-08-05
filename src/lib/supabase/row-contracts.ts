import type { AnalyticsEvent } from "@/types/analytics";
import type { Certificate } from "@/types/assessment";
import type { FlashCard, ReviewLog } from "@/types/flashcard";
import type { Goal } from "@/types/goal";
import type { XPEvent } from "@/types/xp";

/**
 * Insert-row contracts for the sync layer's Supabase writes.
 *
 * Several tables store dates as bigint epoch-ms (the `-- epoch ms`
 * columns in supabase/migrations). The Supabase client is untyped, so
 * nothing stops an ISO string from reaching one of those columns — the
 * insert then fails at runtime with "invalid input syntax for type
 * bigint" and sync silently drops the user's data. These interfaces pin
 * every epoch-ms column to `number`, turning that mistake into a
 * compile error. tests/learner-record/row-contracts.test.ts asserts
 * EPOCH_MS_COLUMNS against the migration DDL so this manifest cannot
 * drift from the schema.
 */

/** analytics_events (created as `analytics`, renamed by reconciliation). */
export interface AnalyticsEventRow {
  id: AnalyticsEvent["id"];
  user_id: string;
  name: AnalyticsEvent["name"];
  timestamp: number;
  properties: AnalyticsEvent["properties"];
}

export interface XPEventRow {
  id: XPEvent["id"];
  user_id: string;
  source: XPEvent["source"];
  amount: XPEvent["amount"];
  source_id: XPEvent["sourceId"];
  awarded_at: number;
}

export interface FlashcardRow {
  id: FlashCard["id"];
  user_id: string;
  front: FlashCard["front"];
  back: FlashCard["back"];
  lesson_id: FlashCard["lessonId"];
  term_slug: FlashCard["termSlug"];
  created_at: number;
  due: number;
  stability: FlashCard["stability"];
  difficulty: FlashCard["difficulty"];
  elapsed_days: FlashCard["elapsedDays"];
  scheduled_days: FlashCard["scheduledDays"];
  reps: FlashCard["reps"];
  lapses: FlashCard["lapses"];
  state: FlashCard["state"];
  last_review: number | null;
}

export interface ReviewLogRow {
  id: ReviewLog["id"];
  user_id: string;
  card_id: ReviewLog["cardId"];
  rating: ReviewLog["rating"];
  reviewed_at: number;
  elapsed_days: ReviewLog["elapsedDays"];
  scheduled_days: ReviewLog["scheduledDays"];
  state: ReviewLog["state"];
}

export interface GoalRow {
  id: Goal["id"];
  user_id: string;
  type: Goal["type"];
  unit: Goal["unit"];
  target: Goal["target"];
  current: Goal["current"];
  started_at: number;
  deadline: number | null;
  achieved_at: number | null;
  label: Goal["label"];
}

export interface CertificateRow {
  id: Certificate["id"];
  user_id: string;
  phase_id: Certificate["phaseId"];
  display_name: Certificate["displayName"];
  phase_title: Certificate["phaseTitle"];
  score: Certificate["score"];
  total_questions: Certificate["totalQuestions"];
  completed_at: number;
  verification_hash: Certificate["verificationHash"];
  standards: Certificate["standards"];
}

/**
 * Every bigint epoch-ms column in supabase/migrations, keyed by the
 * table name as created in the migration. Live names differ for two
 * tables (014-reconciliation renames `analytics` → `analytics_events`
 * and `activity_feed` → `activity`); the manifest keeps the migration
 * name because the contract test parses the DDL.
 */
export const EPOCH_MS_COLUMNS: Record<string, readonly string[]> = {
  lesson_progress: ["started_at", "completed_at"],
  module_progress: ["unlocked_at"],
  phase_progress: ["unlocked_at", "completed_at"],
  flashcards: ["created_at", "due", "last_review"],
  review_logs: ["reviewed_at"],
  goals: ["started_at", "deadline", "achieved_at"],
  skill_assessments: ["completed_at"],
  assessment_results: ["started_at", "completed_at"],
  certificates: ["completed_at"],
  analytics: ["timestamp"],
  xp_events: ["awarded_at"],
  sandbox_saves: ["created_at", "updated_at"],
  track_progress: ["completed_at"],
};
