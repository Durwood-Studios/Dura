import { createClient } from "@/lib/supabase/client";
import type { AssessmentResult } from "@/types/assessment";

/**
 * Sync assessment results to Supabase. Upsert by (user_id, id). Results are
 * immutable completed records — on pull they merge as a G-Set (add missing ids
 * only; see sync.ts). Mirrors IDB "assessment-results" + public.assessment_results
 * (004). Epoch-ms columns are raw bigints; question_results is jsonb.
 */
export async function syncAssessmentResults(
  userId: string,
  results: AssessmentResult[]
): Promise<void> {
  try {
    const supabase = createClient();
    const rows = results.map((r) => ({
      id: r.id,
      user_id: userId,
      type: r.type,
      target_id: r.targetId,
      score: r.score,
      total_questions: r.totalQuestions,
      correct_count: r.correctCount,
      passed: r.passed,
      started_at: r.startedAt,
      completed_at: r.completedAt,
      time_spent_ms: r.timeSpentMs,
      question_results: r.questionResults,
    }));
    const { error } = await supabase
      .from("assessment_results")
      .upsert(rows, { onConflict: "id,user_id" });
    if (error) {
      console.error("[syncAssessmentResults] Upsert error:", error.message);
      throw error;
    }
  } catch (err) {
    console.error("[syncAssessmentResults] Failed to sync:", err);
    throw err;
  }
}

/** Fetch all assessment results for a user from Supabase. */
export async function fetchAssessmentResults(userId: string): Promise<AssessmentResult[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("assessment_results")
      .select("*")
      .eq("user_id", userId);
    if (error) {
      console.error("[fetchAssessmentResults] Query error:", error.message);
      throw error;
    }
    return (data ?? []).map((row) => ({
      id: row.id as string,
      type: row.type as AssessmentResult["type"],
      targetId: row.target_id as string,
      score: Number(row.score),
      totalQuestions: Number(row.total_questions),
      correctCount: Number(row.correct_count),
      passed: Boolean(row.passed),
      startedAt: Number(row.started_at),
      completedAt: Number(row.completed_at),
      timeSpentMs: Number(row.time_spent_ms),
      questionResults: (row.question_results ?? []) as AssessmentResult["questionResults"],
    }));
  } catch (err) {
    console.error("[fetchAssessmentResults] Failed to fetch:", err);
    throw err;
  }
}
