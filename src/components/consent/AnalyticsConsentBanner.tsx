"use client";

import { useEffect, useState } from "react";
import {
  declineAnalyticsConsent,
  grantAnalyticsConsent,
  hasMadeConsentChoice,
} from "@/lib/analytics/consent-gate";
import { purgeAnalyticsQueue } from "@/lib/analytics";

interface AnalyticsConsentBannerProps {
  onAccept?: () => void;
  onDecline?: () => void;
}

/**
 * Analytics consent banner (PPLAS-R4 / GDPR Art. 7).
 *
 * Visible until the user makes a choice. Choice is persisted in
 * localStorage by the consent-gate module. Until a positive choice
 * is recorded, no analytics events are collected, stored, or sent.
 *
 * Mount near the root of the app shell so it appears on first launch
 * and remains until acted on.
 */
export function AnalyticsConsentBanner({
  onAccept,
  onDecline,
}: AnalyticsConsentBannerProps): React.ReactElement | null {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(!hasMadeConsentChoice());
  }, []);

  if (!visible) return null;

  const handleAccept = (): void => {
    grantAnalyticsConsent();
    setVisible(false);
    onAccept?.();
  };

  const handleDecline = (): void => {
    declineAnalyticsConsent();
    void purgeAnalyticsQueue();
    setVisible(false);
    onDecline?.();
  };

  return (
    <div
      role="dialog"
      aria-labelledby="analytics-consent-title"
      aria-describedby="analytics-consent-body"
      className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-2xl rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 shadow-xl backdrop-blur-xl sm:inset-x-auto sm:right-6 sm:bottom-6 sm:left-auto"
    >
      <h2
        id="analytics-consent-title"
        className="text-base font-semibold text-[var(--text-primary)]"
      >
        Help improve DURA?
      </h2>
      <p
        id="analytics-consent-body"
        className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]"
      >
        DURA can record anonymous usage events — which lessons get opened, which quizzes get
        completed, which dictionary terms get searched — to help us improve the platform. Events are
        stored on your device and synced to Supabase under your account ID. No third parties. No
        advertising. You can change your mind anytime in Settings.
      </p>
      <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={handleDecline}
          className="min-h-[44px] rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-surface-hover)] focus-visible:ring-2 focus-visible:ring-[var(--accent-emerald)] focus-visible:outline-none"
        >
          No thanks
        </button>
        <button
          type="button"
          onClick={handleAccept}
          className="min-h-[44px] rounded-lg bg-[var(--accent-emerald)] px-4 py-2 text-sm font-medium text-[var(--bg-primary)] transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[var(--accent-emerald)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)] focus-visible:outline-none"
        >
          Yes, opt in
        </button>
      </div>
    </div>
  );
}
