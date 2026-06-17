import { createClient } from "@/lib/supabase/client";
import type { DojoSession } from "@/types/dojo";

/**
 * Sync dojo sessions to Supabase. Upsert by (user_id, id). Sessions are
 * immutable completed records — on pull they merge as a G-Set (add missing ids
 * only; see sync.ts). Mirrors IDB "dojo-sessions" + public.dojo_sessions (014).
 * Epoch-ms = raw bigints; results is jsonb; phaseFilter may be undefined.
 */
export async function syncDojoSessions(userId: string, items: DojoSession[]): Promise<void> {
  try {
    const supabase = createClient();
    const rows = items.map((s) => ({
      id: s.id,
      user_id: userId,
      started_at: s.startedAt,
      completed_at: s.completedAt,
      tier: s.tier,
      phase_filter: s.phaseFilter ?? null,
      results: s.results,
      avg_score: s.avgScore,
    }));
    const { error } = await supabase
      .from("dojo_sessions")
      .upsert(rows, { onConflict: "id,user_id" });
    if (error) {
      console.error("[syncDojoSessions] Upsert error:", error.message);
      throw error;
    }
  } catch (err) {
    console.error("[syncDojoSessions] Failed to sync:", err);
    throw err;
  }
}

/** Fetch all dojo sessions for a user from Supabase. */
export async function fetchDojoSessions(userId: string): Promise<DojoSession[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from("dojo_sessions").select("*").eq("user_id", userId);
    if (error) {
      console.error("[fetchDojoSessions] Query error:", error.message);
      throw error;
    }
    return (data ?? []).map((row) => {
      const session: DojoSession = {
        id: row.id as string,
        startedAt: Number(row.started_at),
        completedAt: Number(row.completed_at),
        tier: row.tier as DojoSession["tier"],
        results: (row.results ?? []) as DojoSession["results"],
        avgScore: Number(row.avg_score),
      };
      if (row.phase_filter != null) session.phaseFilter = row.phase_filter as string;
      return session;
    });
  } catch (err) {
    console.error("[fetchDojoSessions] Failed to fetch:", err);
    throw err;
  }
}
