/**
 * Local learner identity (LFLRS-1.0 §learner_id).
 *
 * The learner_id is a local anonymous UUID — never an email, real name, or
 * Supabase auth UID. It exists so xAPI statements, learner exports, and
 * future LRS sync have a stable subject identifier without identifying the
 * person. If the user clears local data, a new learner_id is minted on the
 * next call. There is no remote source of truth for this id; it is local
 * by design.
 *
 * Persistence: localStorage. We deliberately do NOT put this in IndexedDB
 * because it must be readable synchronously by callers (e.g. the export
 * pipeline assembles statements one-shot) and because cross-tab consistency
 * is fine — localStorage events propagate.
 */

const STORAGE_KEY = "dura:learner-id";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Read the local learner UUID, generating + persisting one on first call.
 * Browser-only — throws if called from a server context.
 */
export function getLocalLearnerId(): string {
  if (typeof window === "undefined") {
    throw new Error("getLocalLearnerId() is browser-only");
  }
  const existing = window.localStorage.getItem(STORAGE_KEY);
  if (existing && UUID_RE.test(existing)) return existing.toLowerCase();

  const fresh = window.crypto.randomUUID();
  window.localStorage.setItem(STORAGE_KEY, fresh);
  return fresh;
}

/**
 * Test/utility helper — clears the local learner id so a fresh one is
 * minted on the next read. NOT exposed in the settings UI; the user-facing
 * "clear all data" path handles this via clearAllData().
 */
export function resetLocalLearnerId(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
