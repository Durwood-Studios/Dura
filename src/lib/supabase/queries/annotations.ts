import { createClient } from "@/lib/supabase/client";
import { guardedQuery, guardedCall } from "@/lib/supabase/guard";

interface Annotation {
  id: string;
  userId: string;
  lessonId: string;
  annotationType: "tip" | "gotcha" | "alternative" | "explanation";
  content: string;
  upvotes: number;
  downvotes: number;
  status: string;
  createdAt: string;
}

interface LearningInsight {
  lessonId: string;
  completions: number;
  avgTimeMs: number;
  quizPassRate: number;
}

/** Fetch approved annotations for a lesson. Returns empty array on failure. */
export async function getAnnotations(lessonId: string): Promise<Annotation[]> {
  return guardedQuery<Annotation[]>(
    "database",
    async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("annotations")
        .select("*")
        .eq("lesson_id", lessonId)
        .in("status", ["approved", "promoted"])
        .order("upvotes", { ascending: false });

      if (error) return { data: null, error };

      const mapped = (data ?? []).map(
        (row): Annotation => ({
          id: row.id as string,
          userId: row.user_id as string,
          lessonId: row.lesson_id as string,
          annotationType: row.annotation_type as Annotation["annotationType"],
          content: row.content as string,
          upvotes: Number(row.upvotes),
          downvotes: Number(row.downvotes),
          status: row.status as string,
          createdAt: row.created_at as string,
        })
      );

      return { data: mapped, error: null };
    },
    []
  );
}

/** Submit a new annotation. Silently fails if Supabase is unavailable. */
export async function submitAnnotation(
  userId: string,
  lessonId: string,
  type: Annotation["annotationType"],
  content: string
): Promise<void> {
  await guardedCall<void>(
    "database",
    async () => {
      const supabase = createClient();
      const { error } = await supabase.from("annotations").insert({
        user_id: userId,
        lesson_id: lessonId,
        annotation_type: type,
        content,
      });

      if (error) {
        console.error("[submitAnnotation] Insert error:", error.message);
        throw error;
      }
    },
    undefined
  );
}

/** Vote on an annotation. Upserts to prevent double-voting. */
export async function voteAnnotation(
  annotationId: string,
  userId: string,
  vote: 1 | -1
): Promise<void> {
  await guardedCall<void>(
    "database",
    async () => {
      const supabase = createClient();
      const { error } = await supabase.from("annotation_votes").upsert(
        {
          annotation_id: annotationId,
          user_id: userId,
          vote,
        },
        { onConflict: "annotation_id,user_id" }
      );

      if (error) {
        console.error("[voteAnnotation] Upsert error:", error.message);
        throw error;
      }
    },
    undefined
  );
}

/** Fetch learning insights (anonymized, aggregated research data). */
export async function getLearningInsights(): Promise<LearningInsight[]> {
  return guardedQuery<LearningInsight[]>(
    "database",
    async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("learning_insights")
        .select("lesson_id, completions, avg_time_ms, quiz_pass_rate");

      if (error) return { data: null, error };

      const mapped = (data ?? []).map(
        (row): LearningInsight => ({
          lessonId: row.lesson_id as string,
          completions: Number(row.completions),
          avgTimeMs: Number(row.avg_time_ms),
          quizPassRate: Number(row.quiz_pass_rate),
        })
      );

      return { data: mapped, error: null };
    },
    []
  );
}
