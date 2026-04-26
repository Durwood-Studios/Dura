import { getDB } from "@/lib/db";
import { generateId } from "@/lib/utils";
import { isAnalyticsEnabled } from "@/lib/analytics/consent-gate";
import type { AnalyticsEvent, AnalyticsEventName } from "@/types/analytics";

/**
 * Privacy-first analytics.
 *
 * - No PII, no cookies, no third parties.
 * - Consent-gated: collection is a no-op until the user grants consent
 *   via the analytics consent banner (PPLAS-R4 / GDPR Art. 7).
 * - Events are queued to IndexedDB, batch-synced every 5 seconds.
 * - Graceful failure: if anything throws, the app keeps working.
 */

const FLUSH_INTERVAL_MS = 5000;
const BATCH_SIZE = 50;

type EventProperties = AnalyticsEvent["properties"];

let flushTimer: ReturnType<typeof setInterval> | null = null;

export async function track(
  name: AnalyticsEventName,
  properties: EventProperties = {}
): Promise<void> {
  if (!isAnalyticsEnabled()) return;
  try {
    const event: AnalyticsEvent = {
      id: generateId("evt"),
      name,
      timestamp: Date.now(),
      properties,
      synced: 0,
    };
    const db = await getDB();
    await db.put("analytics", event);
  } catch (error) {
    console.error("[analytics] track failed", error);
  }
}

/**
 * Purge all queued analytics events. Called when the user revokes
 * consent or declines after previously granting — events that were
 * collected under prior consent must not be retained.
 */
export async function purgeAnalyticsQueue(): Promise<void> {
  try {
    const db = await getDB();
    await db.clear("analytics");
  } catch (error) {
    console.error("[analytics] purge failed", error);
  }
}

export async function getQueueSize(): Promise<number> {
  try {
    const db = await getDB();
    const range = IDBKeyRange.only(0);
    return await db.countFromIndex("analytics", "by-synced", range);
  } catch (error) {
    console.error("[analytics] getQueueSize failed", error);
    return 0;
  }
}

async function getUnsyncedBatch(limit: number): Promise<AnalyticsEvent[]> {
  try {
    const db = await getDB();
    const range = IDBKeyRange.only(0);
    const all = await db.getAllFromIndex("analytics", "by-synced", range, limit);
    return all;
  } catch (error) {
    console.error("[analytics] getUnsyncedBatch failed", error);
    return [];
  }
}

async function markSynced(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  try {
    const db = await getDB();
    const tx = db.transaction("analytics", "readwrite");
    for (const id of ids) {
      const event = await tx.store.get(id);
      if (event) await tx.store.put({ ...event, synced: 1 });
    }
    await tx.done;
  } catch (error) {
    console.error("[analytics] markSynced failed", error);
  }
}

/**
 * Flush queued events. The default sink is a no-op (no remote endpoint
 * yet) — pass a sink to ship batches to a backend later.
 */
export async function flush(
  sink: (events: AnalyticsEvent[]) => Promise<void> = async () => {}
): Promise<void> {
  if (!isAnalyticsEnabled()) return;
  if (typeof navigator !== "undefined" && navigator.onLine === false) return;
  try {
    const batch = await getUnsyncedBatch(BATCH_SIZE);
    if (batch.length === 0) return;
    await sink(batch);
    await markSynced(batch.map((e) => e.id));
  } catch (error) {
    console.error("[analytics] flush failed", error);
  }
}

export function startAnalyticsLoop(sink?: (events: AnalyticsEvent[]) => Promise<void>): () => void {
  if (typeof window === "undefined") return () => {};
  if (flushTimer) return () => stopAnalyticsLoop();

  const tick = () => void flush(sink);
  flushTimer = setInterval(tick, FLUSH_INTERVAL_MS);

  // Best-effort flush on tab close
  const onPageHide = () => void flush(sink);
  window.addEventListener("pagehide", onPageHide);
  window.addEventListener("online", tick);

  return () => {
    stopAnalyticsLoop();
    window.removeEventListener("pagehide", onPageHide);
    window.removeEventListener("online", tick);
  };
}

export function stopAnalyticsLoop(): void {
  if (flushTimer) {
    clearInterval(flushTimer);
    flushTimer = null;
  }
}
