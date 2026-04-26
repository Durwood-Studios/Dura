import { saveToOPFS, opfsAvailable } from "@/lib/storage/opfs";
import { buildLearnerSnapshot } from "@/lib/storage/snapshot";

/**
 * Shadow-write scheduler.
 *
 * Per-IDB-write triggers go through the debounced `triggerShadowWrite`
 * so a burst of mutations (e.g., a flashcard session rating 50 cards
 * in succession) coalesces into a single OPFS write. The flusher hooks
 * (pagehide / visibilitychange) force an immediate flush so we don't
 * lose the last burst when the tab closes.
 *
 * Fire and forget. OPFS errors are logged inside saveToOPFS; this
 * module never throws into its caller's path.
 */

const DEBOUNCE_MS = 1500;
const PERIODIC_INTERVAL_MS = 30_000;

let pendingTimer: ReturnType<typeof setTimeout> | null = null;
let inFlight: Promise<void> | null = null;
let periodicTimer: ReturnType<typeof setInterval> | null = null;
let flushersRegistered = false;

async function performShadowWrite(): Promise<void> {
  if (!opfsAvailable()) return;
  try {
    const snapshot = await buildLearnerSnapshot();
    await saveToOPFS(snapshot);
  } catch (error) {
    console.warn("[shadow-write] snapshot build failed", error);
  }
}

/**
 * Schedule a debounced shadow write. Safe to call from any IDB write
 * path; many calls in quick succession produce one OPFS write.
 */
export function triggerShadowWrite(): void {
  if (!opfsAvailable()) return;
  if (pendingTimer) clearTimeout(pendingTimer);
  pendingTimer = setTimeout(() => {
    pendingTimer = null;
    inFlight = performShadowWrite().finally(() => {
      inFlight = null;
    });
  }, DEBOUNCE_MS);
}

/**
 * Force an immediate shadow write. Awaits any in-flight write so
 * pagehide handlers see the final state on disk before the tab dies.
 */
export async function flushShadowWrite(): Promise<void> {
  if (!opfsAvailable()) return;
  if (pendingTimer) {
    clearTimeout(pendingTimer);
    pendingTimer = null;
  }
  if (inFlight) {
    await inFlight;
  }
  inFlight = performShadowWrite();
  await inFlight;
  inFlight = null;
}

/**
 * Register lifecycle flushers + the periodic safety net. Call once
 * from the storage bootstrap. Idempotent.
 */
export function registerShadowWriteFlushers(): () => void {
  if (typeof window === "undefined") return () => {};
  if (flushersRegistered) return () => {};
  flushersRegistered = true;

  const onHide = (): void => {
    void flushShadowWrite();
  };
  const onVisibility = (): void => {
    if (document.visibilityState === "hidden") void flushShadowWrite();
  };

  window.addEventListener("pagehide", onHide);
  document.addEventListener("visibilitychange", onVisibility);

  periodicTimer = setInterval(() => {
    triggerShadowWrite();
  }, PERIODIC_INTERVAL_MS);

  return () => {
    window.removeEventListener("pagehide", onHide);
    document.removeEventListener("visibilitychange", onVisibility);
    if (periodicTimer) {
      clearInterval(periodicTimer);
      periodicTimer = null;
    }
    flushersRegistered = false;
  };
}

/** Test-only: reset all module-level state. */
export function _resetShadowWriteForTests(): void {
  if (pendingTimer) {
    clearTimeout(pendingTimer);
    pendingTimer = null;
  }
  if (periodicTimer) {
    clearInterval(periodicTimer);
    periodicTimer = null;
  }
  inFlight = null;
  flushersRegistered = false;
}
