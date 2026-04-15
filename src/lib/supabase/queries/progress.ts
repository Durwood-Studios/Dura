import { createClient } from "@/lib/supabase/client";
import type { LessonProgress, ModuleProgress } from "@/types/curriculum";

/**
 * Sync lesson progress to Supabase via the sync_progress RPC.
 *
 * Strategy: batch upsert using the server-side sync_progress function.
 * The DB function handles conflict resolution:
 *   - Keeps the greater scroll_percent, time_spent_ms, quiz_score, xp_earned
 *   - Preserves remote completedAt if local is null
 *   - ORs quiz_passed (once passed, always passed)
 */
export async function syncLessonProgress(
  userId: string,
  progress: LessonProgress[]
): Promise<void> {
  try {
    const supabase = createClient();
    const { error } = await supabase.rpc("sync_progress", {
      p_user_id: userId,
      p_data: JSON.stringify(progress),
    });

    if (error) {
      console.error("[syncLessonProgress] RPC error:", error.message);
      throw error;
    }
  } catch (err) {
    console.error("[syncLessonProgress] Failed to sync:", err);
    throw err;
  }
}

/**
 * Fetch all lesson progress for a user.
 *
 * Conflict resolution on merge: if remote has completedAt and local
 * doesn't, the remote value wins. The caller (sync engine) is
 * responsible for merging fetched data with the local IndexedDB store.
 */
export async function fetchLessonProgress(userId: string): Promise<LessonProgress[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("lesson_progress")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      console.error("[fetchLessonProgress] Query error:", error.message);
      throw error;
    }

    return (data ?? []).map((row) => ({
      lessonId: row.lesson_id as string,
      phaseId: row.phase_id as string,
      moduleId: row.module_id as string,
      startedAt: new Date(row.started_at as string).getTime(),
      completedAt: row.completed_at ? new Date(row.completed_at as string).getTime() : null,
      scrollPercent: Number(row.scroll_percent),
      timeSpentMs: Number(row.time_spent_ms),
      quizPassed: row.quiz_passed as boolean,
      quizScore: row.quiz_score !== null ? Number(row.quiz_score) : null,
      xpEarned: Number(row.xp_earned),
      synced: 1 as const,
    }));
  } catch (err) {
    console.error("[fetchLessonProgress] Failed to fetch:", err);
    throw err;
  }
}

/**
 * Fetch module-level progress aggregated from lesson_progress rows.
 */
export async function fetchModuleProgress(userId: string): Promise<ModuleProgress[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("module_progress")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      console.error("[fetchModuleProgress] Query error:", error.message);
      throw error;
    }

    return (data ?? []).map((row) => ({
      moduleId: row.module_id as string,
      phaseId: row.phase_id as string,
      completedLessons: Number(row.completed_lessons),
      totalLessons: Number(row.total_lessons),
      masteryGatePassed: row.mastery_gate_passed as boolean,
      unlockedAt: new Date(row.unlocked_at as string).getTime(),
    }));
  } catch (err) {
    console.error("[fetchModuleProgress] Failed to fetch:", err);
    throw err;
  }
}
