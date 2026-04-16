import { createClient } from "@/lib/supabase/client";
import { guardedQuery, guardedCall } from "@/lib/supabase/guard";
import type { LessonDifficulty } from "@/types/difficulty";

/**
 * Fetch calibrated difficulty for a lesson. Falls back to null if
 * Supabase is unavailable or no data exists for this lesson.
 */
export async function getLessonDifficulty(lessonId: string): Promise<LessonDifficulty | null> {
  return guardedQuery<LessonDifficulty | null>(
    "database",
    async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("lesson_difficulty")
        .select("*")
        .eq("lesson_id", lessonId)
        .maybeSingle();

      if (error) return { data: null, error };
      if (!data) return { data: null, error: null };

      return {
        data: {
          lessonId: data.lesson_id as string,
          authorRating: Number(data.author_rating),
          actualMedianTimeMs: Number(data.actual_median_time_ms),
          quizFirstPassRate: Number(data.quiz_first_pass_rate),
          retakeRate: Number(data.retake_rate),
          sampleSize: Number(data.sample_size),
          calibratedDifficulty: Number(data.calibrated_difficulty),
          lastUpdated: new Date(data.last_updated as string).getTime(),
        },
        error: null,
      };
    },
    null
  );
}

/**
 * Fetch difficulty data for all lessons in a module.
 * Returns an empty array when Supabase is unavailable.
 */
export async function getModuleDifficulty(moduleId: string): Promise<LessonDifficulty[]> {
  return guardedQuery<LessonDifficulty[]>(
    "database",
    async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("lesson_difficulty")
        .select("*, lesson_progress!inner(module_id)")
        .eq("lesson_progress.module_id", moduleId);

      if (error) return { data: null, error };

      const mapped = (data ?? []).map(
        (row): LessonDifficulty => ({
          lessonId: row.lesson_id as string,
          authorRating: Number(row.author_rating),
          actualMedianTimeMs: Number(row.actual_median_time_ms),
          quizFirstPassRate: Number(row.quiz_first_pass_rate),
          retakeRate: Number(row.retake_rate),
          sampleSize: Number(row.sample_size),
          calibratedDifficulty: Number(row.calibrated_difficulty),
          lastUpdated: new Date(row.last_updated as string).getTime(),
        })
      );

      return { data: mapped, error: null };
    },
    []
  );
}

/**
 * Trigger difficulty recalculation for a lesson via the server-side
 * recalculate_difficulty RPC. Requires sufficient sample size (>=5).
 */
export async function recalculateDifficulty(lessonId: string): Promise<void> {
  await guardedCall<void>(
    "database",
    async () => {
      const supabase = createClient();
      const { error } = await supabase.rpc("recalculate_difficulty", {
        p_lesson_id: lessonId,
      });

      if (error) {
        console.error("[recalculateDifficulty] RPC error:", error.message);
        throw error;
      }
    },
    undefined
  );
}
