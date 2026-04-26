import { getDB } from "@/lib/db";
import { resetDeviceSecret } from "@/lib/idb/encryption-key";
import { clearActiveKey } from "@/lib/idb/active-key";

/**
 * All IndexedDB object stores in the DURA database.
 * Must stay in sync with the upgrade handler in db.ts.
 */
const ALL_IDB_STORES = [
  "progress",
  "moduleProgress",
  "phaseProgress",
  "flashcards",
  "reviewLogs",
  "goals",
  "preferences",
  "dictionaryCache",
  "analytics",
  "sandbox-saves",
  "assessment-results",
  "certificates",
  "xp-events",
  "tutorial-progress",
] as const;

/** Known localStorage keys set by DURA. */
const LOCAL_STORAGE_KEYS = ["dura-theme", "dura-skill-assessment", "dura-tip-seen"];

/**
 * Completely erases all user data:
 * 1. All IndexedDB object stores
 * 2. All known localStorage keys
 * 3. All sessionStorage
 * 4. Service worker unregistration + cache clearing
 *
 * Call this from Settings → Clear All Data.
 * After calling, redirect to "/" — the app will reinitialize with defaults.
 *
 * TODO(phase-j): When Supabase auth is added, also call the Supabase
 * delete-user-data API endpoint before clearing local state.
 */
export async function clearAllData(): Promise<void> {
  // 1. Clear all IndexedDB stores
  try {
    const db = await getDB();
    for (const store of ALL_IDB_STORES) {
      try {
        await db.clear(store);
      } catch (error) {
        console.error(`[clearAllData] IDB clear failed for ${store}:`, error);
      }
    }
  } catch (error) {
    console.error("[clearAllData] Failed to open IDB:", error);
  }

  // 1b. Reset the device secret + drop the in-memory key cache so any
  // residual encrypted blobs (e.g. in OPFS shadow snapshots) become
  // permanently unrecoverable. Required by the encryption wrapper's
  // P5-A.2 contract — clearing learner data must invalidate cryptographic
  // material too, otherwise an attacker who holds an old IDB snapshot
  // could replay it under the same device secret.
  try {
    resetDeviceSecret();
    clearActiveKey();
  } catch (error) {
    console.error("[clearAllData] Failed to reset encryption key material:", error);
  }

  // 2. Clear known localStorage keys
  for (const key of LOCAL_STORAGE_KEYS) {
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore — private mode
    }
  }

  // 3. Clear all sessionStorage
  try {
    sessionStorage.clear();
  } catch {
    // ignore
  }

  // 4. Unregister service workers + clear all caches
  if ("serviceWorker" in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const reg of registrations) {
        await reg.unregister();
      }
    } catch (error) {
      console.error("[clearAllData] SW unregister failed:", error);
    }
  }
  if ("caches" in window) {
    try {
      const keys = await caches.keys();
      for (const key of keys) {
        await caches.delete(key);
      }
    } catch (error) {
      console.error("[clearAllData] Cache clear failed:", error);
    }
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
    version: 5,
  };

  for (const store of ALL_IDB_STORES) {
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
