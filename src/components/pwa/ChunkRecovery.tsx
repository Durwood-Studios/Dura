"use client";

import { useEffect } from "react";

/**
 * Self-healing for the stale-shell failure mode: an installed PWA whose
 * service worker cached an old app shell keeps referencing chunk files
 * that later deploys removed from the server. Those loads fail, nothing
 * hydrates, and the window sits blank until someone manually clears the
 * cache.
 *
 * This component watches for chunk/dynamic-import load failures and
 * runs a ONE-SHOT repair: unregister the service worker, drop the HTTP
 * caches, reload. IndexedDB and localStorage (all learner data) are
 * never touched. A sessionStorage guard prevents reload loops — if the
 * repaired load fails again, we stop and let the error boundaries
 * render their recovery UI instead.
 */

const RECOVERY_GUARD_KEY = "dura:chunk-recovery-attempted";

const CHUNK_ERROR_PATTERN =
  /ChunkLoadError|Loading chunk .+ failed|dynamically imported module|Importing a module script failed|error loading dynamically imported/i;

async function repairAndReload(): Promise<void> {
  try {
    if ("serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));
    }
    if ("caches" in window) {
      const keys = await window.caches.keys();
      await Promise.all(keys.map((key) => window.caches.delete(key)));
    }
  } catch (err) {
    console.error("[chunk-recovery] Repair failed, reloading anyway:", err);
  } finally {
    window.location.reload();
  }
}

function attemptRecovery(reason: string): void {
  try {
    if (window.sessionStorage.getItem(RECOVERY_GUARD_KEY)) return;
    window.sessionStorage.setItem(RECOVERY_GUARD_KEY, "1");
  } catch {
    // sessionStorage blocked — recovering without a loop guard is worse
    // than not recovering, so stand down.
    return;
  }
  console.warn("[chunk-recovery] Stale app shell detected, repairing:", reason);
  void repairAndReload();
}

export function ChunkRecovery(): null {
  useEffect(() => {
    const onError = (event: ErrorEvent): void => {
      // Thrown chunk errors carry a message; failed <script src> loads
      // instead surface as resource errors on the script element.
      if (event.message && CHUNK_ERROR_PATTERN.test(event.message)) {
        attemptRecovery(event.message);
        return;
      }
      const target = event.target;
      if (
        target instanceof HTMLScriptElement &&
        target.src.includes("/_next/") &&
        // A resource error event has no message — the src is the signal.
        !event.message
      ) {
        attemptRecovery(`script failed: ${target.src}`);
      }
    };

    const onRejection = (event: PromiseRejectionEvent): void => {
      const reason = event.reason as { message?: string } | undefined;
      const message = typeof reason?.message === "string" ? reason.message : String(event.reason);
      if (CHUNK_ERROR_PATTERN.test(message)) {
        attemptRecovery(message);
      }
    };

    // capture: true is required to see resource (script) load errors —
    // they don't bubble.
    window.addEventListener("error", onError, true);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError, true);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return null;
}
