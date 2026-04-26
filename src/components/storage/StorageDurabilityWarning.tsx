"use client";

import { useEffect, useState } from "react";
import { useStorageDurability } from "@/hooks/useStorageDurability";

const DISMISSED_KEY = "dura:storage:durability-warning-dismissed";

/**
 * Surfaces a durability warning when the browser declines persistent
 * storage (LFLRS-R1). Dismissable; never re-shown after dismissal —
 * the user has acknowledged the risk.
 *
 * Hidden when:
 *   - Persistence was granted (data is durable)
 *   - The browser doesn't support the persistence API at all
 *   - The status check is still pending (avoids flash on first paint)
 *   - The user previously dismissed the warning
 */
export function StorageDurabilityWarning(): React.ReactElement | null {
  const status = useStorageDurability();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    if (typeof localStorage === "undefined") {
      setDismissed(false);
      return;
    }
    try {
      setDismissed(localStorage.getItem(DISMISSED_KEY) === "1");
    } catch {
      setDismissed(false);
    }
  }, []);

  if (status !== "best-effort" || dismissed) return null;

  const handleDismiss = (): void => {
    try {
      localStorage.setItem(DISMISSED_KEY, "1");
    } catch (error) {
      console.error("[storage-durability] dismiss persist failed", error);
    }
    setDismissed(true);
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-4 top-4 z-50 mx-auto max-w-2xl rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 shadow-xl backdrop-blur-xl sm:inset-x-auto sm:top-6 sm:right-6 sm:left-auto"
    >
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">
            Your study data may be cleared
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-[var(--text-secondary)]">
            Your browser hasn&apos;t granted DURA persistent storage. Without it, lesson progress
            and flashcard reviews can be cleared during cleanup. Install DURA to your home screen
            (or bookmark this page) to keep your study history safe.
          </p>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss durability warning"
          className="min-h-[44px] min-w-[44px] shrink-0 rounded-lg border border-[var(--border)] px-3 py-1 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-surface-hover)] focus-visible:ring-2 focus-visible:ring-[var(--accent-emerald)] focus-visible:outline-none"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
