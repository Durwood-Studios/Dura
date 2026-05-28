"use client";

import { useEffect, useState, useCallback, useRef } from "react";

/**
 * Surfaces the browser-style update flow for the Serwist service worker.
 *
 * Lifecycle the hook drives:
 *   1. Subscribe to navigator.serviceWorker on mount.
 *   2. When the active registration emits `updatefound`, watch the
 *      installing worker for `statechange`. When it hits `installed`
 *      AND there is an existing controller, a real update is waiting.
 *   3. Expose `updateAvailable: true` so the TopBar button can render.
 *   4. On `applyUpdate()`, postMessage SKIP_WAITING to the waiting SW.
 *      Listen for `controllerchange` and then reload — that's when the
 *      new bundles are guaranteed to be served.
 *
 * The hook deliberately does NOT auto-trigger updates. Reloads in the
 * middle of a lesson cost the learner momentum (and on a long-form
 * reader, scroll position). Industry-standard pattern: ask, don't push.
 *
 * Returns a stable object so consumers can destructure without
 * unnecessary re-render cascades.
 *
 * Stays in sync with the SKIP_WAITING handler in src/app/sw.ts.
 */
export interface ServiceWorkerUpdateState {
  /** A new SW has finished installing and is waiting to activate. */
  updateAvailable: boolean;
  /** True while applyUpdate() is mid-flight (after click, before reload). */
  applying: boolean;
  /** Trigger the swap. Resolves after the new SW takes control;
   *  callers do not need to reload — this function does it. */
  applyUpdate: () => Promise<void>;
}

const NOOP: ServiceWorkerUpdateState = {
  updateAvailable: false,
  applying: false,
  applyUpdate: async () => {},
};

export function useServiceWorkerUpdate(): ServiceWorkerUpdateState {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [applying, setApplying] = useState(false);
  const waitingRef = useRef<ServiceWorker | null>(null);

  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    let cancelled = false;

    const handleWaiting = (sw: ServiceWorker | null): void => {
      if (!sw || cancelled) return;
      waitingRef.current = sw;
      setUpdateAvailable(true);
    };

    const trackInstalling = (sw: ServiceWorker | null): void => {
      if (!sw) return;
      sw.addEventListener("statechange", () => {
        // `installed` while a controller exists means the new SW is
        // waiting to take over from the active one. First-install (no
        // prior controller) is not an "update" from the user's POV.
        if (sw.state === "installed" && navigator.serviceWorker.controller) {
          handleWaiting(sw);
        }
      });
    };

    void navigator.serviceWorker
      .getRegistration()
      .then((reg) => {
        if (!reg || cancelled) return;

        // Catch the case where a new SW finished installing before
        // this hook mounted (e.g. user returns to a tab after a deploy).
        if (reg.waiting && navigator.serviceWorker.controller) {
          handleWaiting(reg.waiting);
        }

        reg.addEventListener("updatefound", () => {
          trackInstalling(reg.installing);
        });

        // Polling layer — most browsers check on navigation, but a
        // long-lived tab won't refresh on its own. Once an hour is
        // generous enough to be invisible without being silent.
        const intervalId = window.setInterval(
          () => {
            void reg.update();
          },
          60 * 60 * 1000
        );

        return () => {
          window.clearInterval(intervalId);
        };
      })
      .catch((err) => {
        console.error("[sw-update] getRegistration failed:", err);
      });

    return (): void => {
      cancelled = true;
    };
  }, []);

  const applyUpdate = useCallback(async (): Promise<void> => {
    const waiting = waitingRef.current;
    if (!waiting || applying) return;
    setApplying(true);

    // Resolve once the new SW takes control. controllerchange fires on
    // the page when the activated worker becomes the controller of all
    // its clients — the cue that the bundle swap is real.
    await new Promise<void>((resolve) => {
      const onControllerChange = (): void => {
        navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
        resolve();
      };
      navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);
      waiting.postMessage({ type: "SKIP_WAITING" });
    });

    // Reload after controllerchange so the new HTML + JS pair lands
    // together. A reload before this point can race the SW activation
    // and serve stale content.
    window.location.reload();
  }, [applying]);

  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
    return NOOP;
  }

  return { updateAvailable, applying, applyUpdate };
}
