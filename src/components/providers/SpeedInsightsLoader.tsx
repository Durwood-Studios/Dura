"use client";

import { useEffect, useState } from "react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { CONSENT_CHANGED_EVENT, isAnalyticsEnabled } from "@/lib/analytics/consent-gate";

/**
 * Vercel Speed Insights, mounted only when the learner has granted
 * analytics consent (PPLAS-R4 / GDPR Art. 7).
 *
 * Speed Insights collects Web Vitals (LCP, FID/INP, CLS, FCP, TTFB) and
 * transmits them to https://vitals.vercel-insights.com. That's
 * third-party telemetry — it must NOT fire before consent and must stop
 * (next page load) when consent is revoked.
 *
 * Subscriptions:
 *   - `storage` event: catches cross-tab consent changes.
 *   - `dura:analytics-consent-changed` event: catches in-tab grants /
 *     declines without a page reload.
 *
 * Limitation: when consent is REVOKED in-session, the SpeedInsights
 * component unmounts and stops sending new beacons, but pageviews already
 * recorded in this session remain on Vercel's side. That's an inherent
 * property of fire-and-forget telemetry; the consent banner copy makes
 * the same disclosure for the rest of the analytics stack.
 */
export function SpeedInsightsLoader(): React.ReactElement | null {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const sync = (): void => setEnabled(isAnalyticsEnabled());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener(CONSENT_CHANGED_EVENT, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(CONSENT_CHANGED_EVENT, sync);
    };
  }, []);

  return enabled ? <SpeedInsights /> : null;
}
