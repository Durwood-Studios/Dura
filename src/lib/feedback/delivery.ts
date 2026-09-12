import { z } from "zod";
import { getDB } from "@/lib/db";
import type { FeedbackEntry } from "@/types/feedback";

const FEEDBACK_SCHEMA = z.object({
  id: z.uuid(),
  message: z.string().trim().min(1).max(2000),
  category: z.enum(["bug", "feature", "content", "general"]),
  pageUrl: z.string().startsWith("/").max(2048),
  createdAt: z.number().int().nonnegative().max(8640000000000000),
  synced: z.boolean(),
});
const BATCH_SIZE = 25;
const REQUEST_TIMEOUT_MS = 10_000;
let isPaused = false;
let activeController: AbortController | null = null;
let pendingDelivery: Promise<void> | null = null;

/** Persist feedback before attempting delivery; a successful save is not a delivery receipt. */
export async function saveFeedback(entry: FeedbackEntry): Promise<void> {
  try {
    const validated = FEEDBACK_SCHEMA.parse(entry);
    const db = await getDB();
    await db.put("feedback", { ...validated, synced: false });
    void flushFeedback();
  } catch (error: unknown) {
    console.error("[feedback] Could not save feedback:", error);
    throw new Error("Your feedback could not be saved. Please try again.");
  }
}

async function deliverBatch(): Promise<void> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key || (typeof navigator !== "undefined" && !navigator.onLine)) return;
    const db = await getDB();
    // IndexedDB cannot index booleans; use the creation index to bound queue memory.
    const pending: FeedbackEntry[] = [];
    let cursor = await db.transaction("feedback").store.index("by-created").openCursor();
    while (cursor && pending.length < BATCH_SIZE) {
      if (!cursor.value.synced && FEEDBACK_SCHEMA.safeParse(cursor.value).success) {
        pending.push(cursor.value);
      }
      cursor = await cursor.continue();
    }
    for (const entry of pending) {
      if (isPaused) break;
      if (!FEEDBACK_SCHEMA.safeParse(entry).success) {
        console.error("[feedback] Invalid stored feedback:", entry.id);
        continue;
      }
      // A reset may have cleared the queue since this batch was read.
      if (!(await db.get("feedback", entry.id))) continue;
      if (isPaused) break;
      const controller = new AbortController();
      activeController = controller;
      const timeout = setTimeout((): void => controller.abort(), REQUEST_TIMEOUT_MS);
      try {
        // The insert-only RPC handles UUID replay without exposing private inbox rows through RLS.
        const response = await fetch(`${url}/rest/v1/rpc/submit_feedback`, {
          method: "POST",
          headers: {
            apikey: key,
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
          },
          signal: controller.signal,
          body: JSON.stringify({
            p_id: entry.id,
            p_message: entry.message,
            p_category: entry.category,
            p_page_url: entry.pageUrl,
            p_created_at: new Date(entry.createdAt).toISOString(),
          }),
        });
        if (!response.ok) throw new Error(`Feedback delivery failed (${response.status})`);
        const tx = db.transaction("feedback", "readwrite");
        const current = await tx.store.get(entry.id);
        // Never recreate data removed while the request was in flight.
        if (current) await tx.store.put({ ...current, synced: true });
        await tx.done;
      } catch (error: unknown) {
        console.error("[feedback] Delivery deferred:", error);
        break;
      } finally {
        clearTimeout(timeout);
        activeController = null;
      }
    }
  } catch (error: unknown) {
    console.error("[feedback] Could not read delivery queue:", error);
  }
}

/** Retry a bounded durable queue, coalescing simultaneous reconnect and submit events. */
export function flushFeedback(): Promise<void> {
  if (isPaused) return Promise.resolve();
  if (!pendingDelivery) {
    pendingDelivery = deliverBatch().finally((): void => {
      pendingDelivery = null;
    });
  }
  return pendingDelivery;
}

/** Retry at startup, on reconnect, and periodically; return cleanup for the app lifetime. */
export function startFeedbackDelivery(): () => void {
  const retry = (): void => {
    void flushFeedback();
  };
  retry();
  window.addEventListener("online", retry);
  const interval = window.setInterval(retry, 60_000);
  return (): void => {
    window.removeEventListener("online", retry);
    window.clearInterval(interval);
  };
}

/** Stop and drain network delivery before clearing local data. */
export async function pauseFeedbackDelivery(): Promise<void> {
  isPaused = true;
  activeController?.abort();
  try {
    await pendingDelivery;
  } catch (error: unknown) {
    console.error("[feedback] Could not drain delivery:", error);
  }
}

/** Allow future startup, reconnect, and timer retries after a local reset. */
export function resumeFeedbackDelivery(): void {
  isPaused = false;
}
