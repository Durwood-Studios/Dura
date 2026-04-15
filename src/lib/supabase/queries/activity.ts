import { createClient } from "@/lib/supabase/client";

interface ActivityItem {
  id: string;
  eventType: string;
  title: string;
  detail: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

/**
 * Fetch recent activity for the current user.
 * Returns items ordered by most recent first.
 */
export async function fetchActivityFeed(
  userId: string,
  limit: number = 10
): Promise<ActivityItem[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("activity")
      .select("id, event_type, title, detail, metadata, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("[fetchActivityFeed] Query error:", error.message);
      return [];
    }

    return (data ?? []).map((row) => ({
      id: row.id as string,
      eventType: row.event_type as string,
      title: row.title as string,
      detail: row.detail as string | null,
      metadata: (row.metadata as Record<string, unknown>) ?? {},
      createdAt: row.created_at as string,
    }));
  } catch (err) {
    console.error("[fetchActivityFeed] Failed:", err);
    return [];
  }
}

/**
 * Manually add an activity item for client-triggered events.
 * Silently fails if the user is offline or not authenticated.
 */
export async function addActivityItem(
  userId: string,
  eventType: string,
  title: string,
  detail?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    const supabase = createClient();
    const { error } = await supabase.from("activity").insert({
      user_id: userId,
      event_type: eventType,
      title,
      detail: detail ?? null,
      metadata: metadata ?? {},
    });

    if (error) {
      console.error("[addActivityItem] Insert error:", error.message);
    }
  } catch (err) {
    console.error("[addActivityItem] Failed:", err);
  }
}
