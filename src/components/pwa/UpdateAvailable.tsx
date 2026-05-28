"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { useServiceWorkerUpdate } from "@/hooks/useServiceWorkerUpdate";
import { cn } from "@/lib/utils";

/**
 * The TopBar ribbon button + activation overlay for service-worker updates.
 *
 * UX shape (matches what learners already expect from browsers and games):
 *   - When a new SW is waiting, a small pill appears in the TopBar:
 *     "Update available — restart". One click, no hidden menus.
 *   - Click opens a fullscreen overlay with a progress bar so the
 *     learner sees the swap happening (instead of an opaque flash of
 *     blank screen).
 *   - After the controller swaps, the page reloads on its own.
 *
 * Tone: gentle. "Restart" not "REINSTALL NOW". Dismissible at any time
 * — the pill will be back next session.
 *
 * Mount once at the (app) layout level so the button piggybacks on the
 * TopBar's existing space.
 */
export function UpdateAvailable(): React.ReactElement | null {
  const { updateAvailable, applying, applyUpdate } = useServiceWorkerUpdate();
  const [dismissed, setDismissed] = useState(false);

  if (!updateAvailable || dismissed) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => void applyUpdate()}
        disabled={applying}
        aria-label="A new version of DURA is available. Click to restart and update."
        className={cn(
          "flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 transition hover:border-emerald-500/60 hover:bg-emerald-500/15 disabled:cursor-progress disabled:opacity-70 dark:text-emerald-300",
          "shrink-0"
        )}
      >
        <Download className="h-3 w-3" aria-hidden />
        Update
      </button>
      {applying && <UpdateOverlay />}
    </>
  );
}

/**
 * Fullscreen overlay shown while the new worker activates + the page
 * reloads. Indeterminate bar — SW activation duration isn't observable
 * to the page, so honest visual feedback is "something is happening,"
 * not a fake percentage.
 *
 * Rendered into the document via fixed positioning so it sits above the
 * app shell during the reload window.
 */
function UpdateOverlay(): React.ReactElement {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="update-overlay-title"
      aria-describedby="update-overlay-desc"
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-[var(--color-bg-primary)]/90 backdrop-blur-sm"
    >
      <div className="w-full max-w-sm px-8 text-center">
        <div
          className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10"
          aria-hidden
        >
          <Download className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2
          id="update-overlay-title"
          className="text-lg font-semibold text-[var(--color-text-primary)]"
        >
          Updating DURA
        </h2>
        <p id="update-overlay-desc" className="mt-1.5 text-sm text-[var(--color-text-secondary)]">
          Swapping in the new version. This usually takes a second or two.
        </p>
        <div
          role="progressbar"
          aria-label="Update progress"
          aria-busy="true"
          className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-bg-subtle)]"
        >
          <div className="dura-update-progress h-full w-1/3 rounded-full bg-emerald-500" />
        </div>
      </div>
    </div>
  );
}
