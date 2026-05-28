import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  AI_CONSENT_CHANGED_EVENT,
  getAIConsentState,
  grantAIConsent,
  isAIConsented,
  revokeAIConsent,
  subscribeAIConsentChanges,
} from "@/lib/ai/consent-gate";
import { hasAnthropicKey, setAnthropicKey } from "@/lib/ai/key-storage";

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
});

describe("AI consent gate", () => {
  it("defaults to no consent", () => {
    const state = getAIConsentState();
    expect(state.aiConsented).toBe(false);
    expect(state.consentedAt).toBeNull();
    expect(state.byokAcknowledged).toBe(false);
    expect(isAIConsented()).toBe(false);
  });

  it("grant + read round-trip", () => {
    grantAIConsent({ byokAcknowledged: true });
    const state = getAIConsentState();
    expect(state.aiConsented).toBe(true);
    expect(state.byokAcknowledged).toBe(true);
    expect(typeof state.consentedAt).toBe("string");
    expect(isAIConsented()).toBe(true);
  });

  it("revoke clears consent AND the stored API key", () => {
    grantAIConsent({ byokAcknowledged: true });
    setAnthropicKey("sk-ant-fake_test_KEY_1234");
    expect(hasAnthropicKey()).toBe(true);

    revokeAIConsent();
    expect(isAIConsented()).toBe(false);
    expect(hasAnthropicKey()).toBe(false);
  });

  it("dispatches in-tab change event on grant", () => {
    const handler = vi.fn();
    window.addEventListener(AI_CONSENT_CHANGED_EVENT, handler);
    grantAIConsent({ byokAcknowledged: true });
    expect(handler).toHaveBeenCalledTimes(1);
    window.removeEventListener(AI_CONSENT_CHANGED_EVENT, handler);
  });

  it("dispatches change event on revoke", () => {
    grantAIConsent({ byokAcknowledged: true });
    const handler = vi.fn();
    window.addEventListener(AI_CONSENT_CHANGED_EVENT, handler);
    revokeAIConsent();
    expect(handler).toHaveBeenCalledTimes(1);
    window.removeEventListener(AI_CONSENT_CHANGED_EVENT, handler);
  });

  it("subscribeAIConsentChanges returns an unsubscribe that detaches", () => {
    const handler = vi.fn();
    const unsubscribe = subscribeAIConsentChanges(handler);
    grantAIConsent({ byokAcknowledged: true });
    expect(handler).toHaveBeenCalledTimes(1);

    unsubscribe();
    revokeAIConsent();
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("treats corrupted storage as default state", () => {
    localStorage.setItem("dura:ai:consent", "not json");
    expect(isAIConsented()).toBe(false);

    localStorage.setItem("dura:ai:consent", JSON.stringify({ wrong: "shape" }));
    expect(isAIConsented()).toBe(false);
  });
});
