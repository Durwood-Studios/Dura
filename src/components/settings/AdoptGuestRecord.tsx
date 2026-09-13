"use client";

import { useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { adoptGuestRecord } from "@/lib/learner-record/adopt-guest";

/** Explicitly copy guest learning into the current account without moving its source. */
export function AdoptGuestRecord(): React.ReactElement | null {
  const { user } = useAuth();
  const [isCopying, setIsCopying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function copy(): Promise<void> {
    setIsCopying(true);
    setError(null);
    try {
      await adoptGuestRecord();
      window.location.reload();
    } catch (failure) {
      console.error("[settings] Guest import failed", failure);
      setError(
        "Guest records could not be copied. The guest source is still preserved; reload and retry."
      );
      setIsCopying(false);
    }
  }
  if (!user) return null;
  return (
    <div className="space-y-2">
      <p className="text-sm">
        Copy this device’s guest learning records into your signed-in account. The guest copy is
        retained. Account sync may then upload the copied records.
      </p>
      <button
        type="button"
        disabled={isCopying}
        onClick={() => void copy()}
        className="min-h-12 rounded-lg border border-[var(--color-border)] px-4 text-sm"
      >
        {isCopying ? "Copying…" : "Copy guest learning into my account"}
      </button>
      {error && (
        <p role="alert" className="text-sm text-[var(--color-error)]">
          {error}
        </p>
      )}
    </div>
  );
}
