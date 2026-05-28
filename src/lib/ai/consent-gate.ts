/**
 * AI features consent gate. Independent of the analytics consent gate
 * (src/lib/analytics/consent-gate.ts) — the data-flow categories are
 * different. Analytics consent governs telemetry events DURA collects;
 * AI consent governs learner-authored content leaving the device to a
 * third-party (Anthropic). EU AI Act Art. 13/14 treats these as separate
 * concerns and so do we.
 *
 * Default posture: AI features are OFF until the learner makes an
 * explicit positive choice. Revoking consent ALSO clears the stored
 * Anthropic API key — privacy-by-revocation, so a "revoke" is
 * unambiguous to the learner and not undone by stale credentials
 * sitting in localStorage.
 *
 * Storage: localStorage. SSR-safe.
 */
import { clearAnthropicKey } from "./key-storage";

const CONSENT_KEY = "dura:ai:consent";

/** Custom event broadcast on every consent state change for in-tab subscribers. */
export const AI_CONSENT_CHANGED_EVENT = "dura:ai-consent-changed";

export interface AIConsentState {
  aiConsented: boolean;
  consentedAt: string | null;
  /** Did the learner explicitly acknowledge the BYOK cost model
   *  (~1-3 cents per question, billed to them by Anthropic)? Tracked
   *  separately because future hosted-tier surfaces would not need it. */
  byokAcknowledged: boolean;
}

const DEFAULT_STATE: AIConsentState = {
  aiConsented: false,
  consentedAt: null,
  byokAcknowledged: false,
};

function isAIConsentState(value: unknown): value is AIConsentState {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  if (typeof v.aiConsented !== "boolean") return false;
  if (v.consentedAt !== null && typeof v.consentedAt !== "string") return false;
  if (typeof v.byokAcknowledged !== "boolean") return false;
  return true;
}

function dispatchConsentChanged(): void {
  if (typeof window === "undefined") return;
  try {
    window.dispatchEvent(new Event(AI_CONSENT_CHANGED_EVENT));
  } catch {
    // ignore — defensive against environments without dispatchEvent
  }
}

function readStorage(): AIConsentState {
  if (typeof localStorage === "undefined") return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed: unknown = JSON.parse(raw);
    if (!isAIConsentState(parsed)) return DEFAULT_STATE;
    return parsed;
  } catch {
    return DEFAULT_STATE;
  }
}

export function getAIConsentState(): AIConsentState {
  return readStorage();
}

export function isAIConsented(): boolean {
  return readStorage().aiConsented;
}

export function grantAIConsent(options: { byokAcknowledged: boolean }): void {
  if (typeof localStorage === "undefined") return;
  const state: AIConsentState = {
    aiConsented: true,
    consentedAt: new Date().toISOString(),
    byokAcknowledged: options.byokAcknowledged,
  };
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(state));
    dispatchConsentChanged();
  } catch (error) {
    console.error("[ai-consent] grant failed", error);
  }
}

/**
 * Revoke AI consent AND remove the stored API key in one atomic call.
 * The key cleanup is intentional: a learner who revokes consent expects
 * that DURA forgets about their key, full stop.
 */
export function revokeAIConsent(): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.removeItem(CONSENT_KEY);
    clearAnthropicKey();
    dispatchConsentChanged();
  } catch (error) {
    console.error("[ai-consent] revoke failed", error);
  }
}

/**
 * Subscribe to in-tab consent changes. Returns an unsubscribe function.
 * Cross-tab changes still propagate via the native `storage` event;
 * callers that care about cross-tab can add that listener separately.
 */
export function subscribeAIConsentChanges(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(AI_CONSENT_CHANGED_EVENT, callback);
  return () => window.removeEventListener(AI_CONSENT_CHANGED_EVENT, callback);
}
