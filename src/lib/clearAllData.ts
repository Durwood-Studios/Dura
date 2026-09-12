import {
  beginLocalReset,
  finishLocalReset,
  RESET_GENERATION_KEY,
} from "@/lib/storage/reset-coordination";
import { pauseFeedbackDelivery } from "@/lib/feedback/delivery";
import { DB_VERSION, getDB, prepareDatabaseReset, eraseDatabaseForReset } from "@/lib/db";
import { resetDeviceSecret } from "@/lib/idb/encryption-key";
import { clearActiveKey } from "@/lib/idb/active-key";
import { deleteOPFSSnapshot } from "@/lib/storage/opfs";
import { suspendShadowWritesForReset } from "@/lib/storage/shadow-write";
import { clearLocalSession, isSupabaseConfigured } from "@/lib/supabase/client";
import { suspendSyncForReset } from "@/lib/supabase/sync";

function clearDuraStorage(storage: Storage): void {
  const keys = Array.from(
    { length: storage.length },
    (_value: unknown, index: number): string | null => storage.key(index)
  );
  for (const key of keys) {
    if (key !== RESET_GENERATION_KEY && (key?.startsWith("dura-") || key?.startsWith("dura:")))
      storage.removeItem(key);
  }
}

/**
 * Erase this device's learner data and sign out locally. Cloud records are retained.
 * Await completion before reloading so in-memory stores are discarded. Failures
 * are surfaced to the caller; never report a successful reset after a partial erase.
 */
export async function clearAllData(): Promise<void> {
  let generation: string | null = null;
  try {
    await prepareDatabaseReset();
    generation = beginLocalReset();
    await pauseFeedbackDelivery();
    await suspendSyncForReset();
    await suspendShadowWritesForReset();
    if (isSupabaseConfigured()) {
      await clearLocalSession();
    }

    // Remove recoverable backups before the authoritative record and its key.
    await deleteOPFSSnapshot();
    await eraseDatabaseForReset();
    resetDeviceSecret();
    clearActiveKey();
    clearDuraStorage(localStorage);
    clearDuraStorage(sessionStorage);

    if ("serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(
        registrations.map(
          (registration: ServiceWorkerRegistration): Promise<boolean> => registration.unregister()
        )
      );
    }
    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((key: string): Promise<boolean> => caches.delete(key)));
    }
  } catch (error) {
    console.error("[clearAllData] Local reset failed:", error);
    throw new Error(
      "Some local data could not be cleared. Close other DURA tabs and retry. If it still fails, reload this page and try again.",
      { cause: error }
    );
  } finally {
    if (generation) finishLocalReset(generation);
  }
}

/**
 * Raw IDB JSON dump of every store. Returns a single JSON string.
 *
 * NOTE: This is the LEGACY export path. The user-facing GDPR Art. 20
 * portability export is now in `src/lib/learner-record/export.ts`
 * (LFLRS-1.0 ZIP with JSON + xAPI + Markdown summary). This function
 * survives because the AdminDashboard component uses it for raw
 * debugging dumps that include EVERY store (preferences, dictionary
 * cache, etc.) without any LFLRS projection. Don't call it from
 * user-facing flows — use `downloadLearnerRecord()` instead.
 */
export async function exportAllData(): Promise<string> {
  const db = await getDB();
  const dump: Record<string, unknown> = {
    exportedAt: new Date().toISOString(),
    version: DB_VERSION,
  };

  for (const store of Array.from(db.objectStoreNames)) {
    try {
      dump[store] = await db.getAll(store);
    } catch (error) {
      console.error(`[exportAllData] Failed for ${store}:`, error);
      dump[store] = [];
    }
  }

  // Include assessment data from localStorage (legacy)
  try {
    const assessment = localStorage.getItem("dura-skill-assessment");
    if (assessment) dump["skill-assessment-legacy"] = JSON.parse(assessment);
  } catch {
    // ignore
  }

  return JSON.stringify(dump, null, 2);
}
