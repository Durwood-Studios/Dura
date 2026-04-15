import { createClient } from "@/lib/supabase/client";
import type { Goal } from "@/types/goal";

/**
 * Sync goals to Supabase.
 *
 * Strategy: upsert by (user_id, id). The client's current progress
 * value wins — goals are tracked locally and synced for backup/cross-device.
 * achievedAt is preserved: once achieved, it stays achieved.
 */
export async function syncGoals(userId: string, goals: Goal[]): Promise<void> {
  try {
    const supabase = createClient();
    const rows = goals.map((goal) => ({
      id: goal.id,
      user_id: userId,
      type: goal.type,
      unit: goal.unit,
      target: goal.target,
      current: goal.current,
      started_at: new Date(goal.startedAt).toISOString(),
      deadline: goal.deadline ? new Date(goal.deadline).toISOString() : null,
      achieved_at: goal.achievedAt ? new Date(goal.achievedAt).toISOString() : null,
      label: goal.label,
    }));

    const { error } = await supabase.from("goals").upsert(rows, { onConflict: "id,user_id" });

    if (error) {
      console.error("[syncGoals] Upsert error:", error.message);
      throw error;
    }
  } catch (err) {
    console.error("[syncGoals] Failed to sync:", err);
    throw err;
  }
}

/**
 * Fetch all goals for a user from Supabase.
 */
export async function fetchGoals(userId: string): Promise<Goal[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from("goals").select("*").eq("user_id", userId);

    if (error) {
      console.error("[fetchGoals] Query error:", error.message);
      throw error;
    }

    return (data ?? []).map((row) => ({
      id: row.id as string,
      type: row.type as Goal["type"],
      unit: row.unit as Goal["unit"],
      target: Number(row.target),
      current: Number(row.current),
      startedAt: new Date(row.started_at as string).getTime(),
      deadline: row.deadline ? new Date(row.deadline as string).getTime() : null,
      achievedAt: row.achieved_at ? new Date(row.achieved_at as string).getTime() : null,
      label: row.label as string,
    }));
  } catch (err) {
    console.error("[fetchGoals] Failed to fetch:", err);
    throw err;
  }
}
