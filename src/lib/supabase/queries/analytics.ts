import { createClient } from "@/lib/supabase/client";
import type { AnalyticsEvent } from "@/types/analytics";
import type { XPEvent } from "@/types/xp";

/**
 * Batch sync analytics events to Supabase.
 *
 * Strategy: insert-only with conflict skip on id. Analytics events are
 * append-only — once recorded, they never change. Duplicates are
 * silently ignored via ON CONFLICT DO NOTHING.
 */
export async function batchSyncAnalytics(userId: string, events: AnalyticsEvent[]): Promise<void> {
  try {
    const supabase = createClient();
    const rows = events.map((event) => ({
      id: event.id,
      user_id: userId,
      name: event.name,
      timestamp: new Date(event.timestamp).toISOString(),
      properties: event.properties,
    }));

    const { error } = await supabase
      .from("analytics_events")
      .upsert(rows, { onConflict: "id", ignoreDuplicates: true });

    if (error) {
      console.error("[batchSyncAnalytics] Upsert error:", error.message);
      throw error;
    }
  } catch (err) {
    console.error("[batchSyncAnalytics] Failed to sync:", err);
    throw err;
  }
}

/**
 * Sync XP events to Supabase.
 *
 * Strategy: insert-only with conflict skip on id. XP events are
 * immutable once awarded. The user_stats view aggregates totals.
 */
export async function syncXPEvents(userId: string, events: XPEvent[]): Promise<void> {
  try {
    const supabase = createClient();
    const rows = events.map((event) => ({
      id: event.id,
      user_id: userId,
      source: event.source,
      amount: event.amount,
      source_id: event.sourceId,
      awarded_at: new Date(event.awardedAt).toISOString(),
    }));

    const { error } = await supabase
      .from("xp_events")
      .upsert(rows, { onConflict: "id", ignoreDuplicates: true });

    if (error) {
      console.error("[syncXPEvents] Upsert error:", error.message);
      throw error;
    }
  } catch (err) {
    console.error("[syncXPEvents] Failed to sync:", err);
    throw err;
  }
}
