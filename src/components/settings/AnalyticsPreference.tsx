"use client";

import { isOwnerInitialized } from "@/lib/storage/owner";
import { useState, useSyncExternalStore } from "react";
import {
  CONSENT_CHANGED_EVENT,
  isAnalyticsEnabled,
  grantAnalyticsConsent,
  declineAnalyticsConsent,
} from "@/lib/analytics/consent-gate";
import { purgeAnalyticsQueue } from "@/lib/analytics";

function subscribe(notify: () => void): () => void {
  window.addEventListener(CONSENT_CHANGED_EVENT, notify);
  window.addEventListener("storage", notify);
  return () => {
    window.removeEventListener(CONSENT_CHANGED_EVENT, notify);
    window.removeEventListener("storage", notify);
  };
}
/** Manage optional account-scoped analytics consent and discard the local queue on withdrawal. */
export function AnalyticsPreference(): React.ReactElement {
  const ready = useSyncExternalStore(subscribe, isOwnerInitialized, () => false);
  const enabled = useSyncExternalStore(subscribe, isAnalyticsEnabled, () => false);
  const [error, setError] = useState<string | null>(null);
  async function change(): Promise<void> {
    try {
      setError(null);
      if (enabled) {
        declineAnalyticsConsent();
        if (isAnalyticsEnabled()) throw new Error("Your choice could not be saved.");
        await purgeAnalyticsQueue();
      } else {
        grantAnalyticsConsent();
        if (!isAnalyticsEnabled())
          throw new Error(
            "Your choice could not be saved. Wait for account storage to load and retry."
          );
      }
    } catch (failure) {
      console.error("[settings] Analytics preference failed", failure);
      setError(failure instanceof Error ? failure.message : "Your preference could not be saved.");
    }
  }
  return (
    <div className="space-y-2">
      <p className="text-sm">
        Optional usage analytics are scoped to this learner on this device. With account sync,
        events are linked to your account ID in Supabase. Turning this off stops new events and
        clears queued local analytics; previously delivered records remain until account deletion.
      </p>
      <button
        type="button"
        role="switch"
        disabled={!ready}
        aria-label="Usage analytics"
        aria-checked={enabled}
        onClick={() => void change()}
        className="min-h-12 rounded-lg border border-[var(--color-border)] px-4 text-sm"
      >
        Usage analytics: {enabled ? "On" : "Off"}
      </button>
      {error && (
        <p role="alert" className="text-sm text-[var(--color-error)]">
          {error}
        </p>
      )}
    </div>
  );
}
