import { fetchOwnedRows } from "@/lib/supabase/queries/record-sync";
import { syncMutableRecords } from "@/lib/supabase/queries/record-sync";
import type { GoalRow } from "@/lib/supabase/row-contracts";
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
    // GoalRow pins started_at/deadline/achieved_at to epoch-ms numbers —
    // the columns are bigint; ISO strings fail the insert.
    const rows: GoalRow[] = goals.map((goal) => ({
      id: goal.id,
      user_id: userId,
      type: goal.type,
      unit: goal.unit,
      target: goal.target,
      current: goal.current,
      started_at: goal.startedAt,
      deadline: goal.deadline,
      achieved_at: goal.achievedAt,
      label: goal.label,
      phase_id: goal.phaseId ?? null,
      role_id: goal.roleId ?? null,
    }));

    await syncMutableRecords("goals", rows);
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
    const data = await fetchOwnedRows("goals", userId);

    return (data ?? []).map((row) => ({
      id: row.id as string,
      type: row.type as Goal["type"],
      unit: row.unit as Goal["unit"],
      target: Number(row.target),
      current: Number(row.current),
      startedAt: Number(row.started_at),
      deadline: row.deadline === null ? null : Number(row.deadline),
      achievedAt: row.achieved_at === null ? null : Number(row.achieved_at),
      label: row.label as string,
      phaseId: (row.phase_id as string | null) ?? undefined,
      roleId: (row.role_id as string | null) ?? undefined,
    }));
  } catch (err) {
    console.error("[fetchGoals] Failed to fetch:", err);
    throw err;
  }
}
