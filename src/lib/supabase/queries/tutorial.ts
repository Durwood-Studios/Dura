import { createClient } from "@/lib/supabase/client";
import type { TutorialProgress } from "@/types/tutorial";

/**
 * Sync tutorial progress to Supabase. Upsert by (user_id, id); last-write-wins
 * on pull by `lastActiveAt` (the record's fields advance together as the
 * learner progresses — see mergeTutorialProgress in sync.ts). Mirrors IDB
 * "tutorial-progress" + public.tutorial_progress (014). Epoch-ms = raw bigints.
 */
export async function syncTutorialProgress(
  userId: string,
  items: TutorialProgress[]
): Promise<void> {
  try {
    const supabase = createClient();
    const rows = items.map((t) => ({
      id: t.id,
      user_id: userId,
      slug: t.slug,
      type: t.type,
      current_step: t.currentStep,
      total_steps: t.totalSteps,
      checkpoints: t.checkpoints,
      started_at: t.startedAt,
      completed_at: t.completedAt,
      last_active_at: t.lastActiveAt,
    }));
    const { error } = await supabase
      .from("tutorial_progress")
      .upsert(rows, { onConflict: "id,user_id" });
    if (error) {
      console.error("[syncTutorialProgress] Upsert error:", error.message);
      throw error;
    }
  } catch (err) {
    console.error("[syncTutorialProgress] Failed to sync:", err);
    throw err;
  }
}

/** Fetch all tutorial progress for a user from Supabase. */
export async function fetchTutorialProgress(userId: string): Promise<TutorialProgress[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("tutorial_progress")
      .select("*")
      .eq("user_id", userId);
    if (error) {
      console.error("[fetchTutorialProgress] Query error:", error.message);
      throw error;
    }
    return (data ?? []).map((row) => ({
      id: row.id as string,
      slug: row.slug as string,
      type: row.type as TutorialProgress["type"],
      currentStep: Number(row.current_step),
      totalSteps: Number(row.total_steps),
      checkpoints: (row.checkpoints ?? []) as TutorialProgress["checkpoints"],
      startedAt: Number(row.started_at),
      completedAt: row.completed_at === null ? null : Number(row.completed_at),
      lastActiveAt: Number(row.last_active_at),
    }));
  } catch (err) {
    console.error("[fetchTutorialProgress] Failed to fetch:", err);
    throw err;
  }
}
