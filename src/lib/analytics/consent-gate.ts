/**
 * Analytics consent gate (PPLAS-R4 / GDPR Art. 7).
 *
 * Default posture: analytics are OFF until the user makes an explicit
 * positive choice. No event is collected, stored, or transmitted before
 * consent. Withdrawing consent returns to the default state and any
 * queued unsynced events are purged by the caller.
 *
 * Storage: localStorage. The consent decision itself is not behavioral
 * data — it's a user preference. We do not track that the user decided.
 */
const CONSENT_KEY = "dura:analytics:consent";

export interface ConsentState {
  analyticsConsented: boolean;
  consentedAt: string | null;
}

const DEFAULT_STATE: ConsentState = {
  analyticsConsented: false,
  consentedAt: null,
};

function isConsentState(value: unknown): value is ConsentState {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  if (typeof v.analyticsConsented !== "boolean") return false;
  if (v.consentedAt !== null && typeof v.consentedAt !== "string") return false;
  return true;
}

function readStorage(): ConsentState {
  if (typeof localStorage === "undefined") return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed: unknown = JSON.parse(raw);
    if (!isConsentState(parsed)) return DEFAULT_STATE;
    return parsed;
  } catch {
    return DEFAULT_STATE;
  }
}

export function getConsentState(): ConsentState {
  return readStorage();
}

export function isAnalyticsEnabled(): boolean {
  return readStorage().analyticsConsented;
}

export function hasMadeConsentChoice(): boolean {
  if (typeof localStorage === "undefined") return false;
  try {
    return localStorage.getItem(CONSENT_KEY) !== null;
  } catch {
    return false;
  }
}

export function grantAnalyticsConsent(): void {
  if (typeof localStorage === "undefined") return;
  const state: ConsentState = {
    analyticsConsented: true,
    consentedAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("[consent-gate] grant failed", error);
  }
}

export function declineAnalyticsConsent(): void {
  if (typeof localStorage === "undefined") return;
  const state: ConsentState = {
    analyticsConsented: false,
    consentedAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("[consent-gate] decline failed", error);
  }
}

export function revokeAnalyticsConsent(): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.removeItem(CONSENT_KEY);
  } catch (error) {
    console.error("[consent-gate] revoke failed", error);
  }
}
