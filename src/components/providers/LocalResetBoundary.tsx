"use client";

import { useEffect, useState } from "react";
import { readResetGeneration, RESET_GENERATION_KEY } from "@/lib/storage/reset-coordination";

interface LocalResetBoundaryProps {
  children: React.ReactNode;
}

/** Unmount stale learners and background providers after another tab resets this device. */
export function LocalResetBoundary({ children }: LocalResetBoundaryProps): React.ReactElement {
  const [isBlocked, setIsBlocked] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryError, setRecoveryError] = useState<string | null>(null);

  const recoverReset = async (): Promise<void> => {
    if (
      !window.confirm(
        "Restart the local reset? This deletes this device’s learning data, offline backups, saved AI key and preferences, and signs out locally. Cloud records remain."
      )
    )
      return;
    setIsRecovering(true);
    setRecoveryError(null);
    try {
      const { clearAllData } = await import("@/lib/clearAllData");
      await clearAllData();
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- Discard stale in-memory learner/auth state after sign-out or reset.
      window.location.href = "/";
    } catch (error) {
      console.error("[reset] Recovery failed", error);
      setRecoveryError(
        "Reset could not finish. Please retry or clear DURA’s site data in browser settings."
      );
      setIsRecovering(false);
    }
  };

  useEffect((): (() => void) => {
    const initial = readResetGeneration();
    const update = (): void => {
      const current = readResetGeneration();
      const pending = current?.startsWith("pending:") ?? false;
      if (pending || current !== initial) {
        setIsBlocked(true);
        setIsPending(pending);
      }
    };
    const onStorage = (event: StorageEvent): void => {
      if (event.key === RESET_GENERATION_KEY) update();
    };
    update();
    window.addEventListener("storage", onStorage);
    return (): void => window.removeEventListener("storage", onStorage);
  }, []);

  if (!isBlocked) return <>{children}</>;
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center gap-4 px-6 text-[var(--color-text-primary)]">
      <h1 className="text-2xl font-semibold">Local data reset</h1>
      <p role="status" className="text-base text-[var(--color-text-secondary)]">
        {isPending
          ? "Another DURA tab is clearing this device’s data. This tab is paused until it finishes."
          : "This device’s data changed in another DURA tab. Reload to continue with the current data."}
      </p>
      <button
        type="button"
        disabled={isPending}
        onClick={(): void => window.location.reload()}
        className="min-h-12 rounded-lg bg-[var(--color-accent)] px-4 py-3 font-medium text-white disabled:opacity-50"
      >
        {isPending ? "Reset in progress…" : "Reload DURA"}
      </button>
      {isPending && (
        <button
          type="button"
          disabled={isRecovering}
          onClick={(): void => {
            void recoverReset();
          }}
          className="min-h-12 rounded-lg border border-[var(--color-border)] px-4 py-3 text-sm disabled:opacity-50"
        >
          {isRecovering ? "Restarting reset…" : "Original tab closed? Restart reset"}
        </button>
      )}
      {recoveryError && (
        <p role="alert" className="text-sm text-[var(--color-error)]">
          {recoveryError}
        </p>
      )}
    </main>
  );
}
