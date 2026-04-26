import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  declineAnalyticsConsent,
  getConsentState,
  grantAnalyticsConsent,
  hasMadeConsentChoice,
  isAnalyticsEnabled,
  revokeAnalyticsConsent,
} from "@/lib/analytics/consent-gate";

describe("PPLAS-R4 / GDPR Art. 7 — analytics consent gate", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("default posture is no-consent", () => {
    expect(isAnalyticsEnabled()).toBe(false);
    expect(hasMadeConsentChoice()).toBe(false);
    expect(getConsentState()).toEqual({
      analyticsConsented: false,
      consentedAt: null,
    });
  });

  it("grants consent and records timestamp", () => {
    grantAnalyticsConsent();
    expect(isAnalyticsEnabled()).toBe(true);
    expect(hasMadeConsentChoice()).toBe(true);
    const state = getConsentState();
    expect(state.analyticsConsented).toBe(true);
    expect(state.consentedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("decline records the choice without enabling analytics", () => {
    declineAnalyticsConsent();
    expect(isAnalyticsEnabled()).toBe(false);
    expect(hasMadeConsentChoice()).toBe(true);
    const state = getConsentState();
    expect(state.analyticsConsented).toBe(false);
    expect(state.consentedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("revoke returns to default unmade state", () => {
    grantAnalyticsConsent();
    expect(hasMadeConsentChoice()).toBe(true);
    revokeAnalyticsConsent();
    expect(hasMadeConsentChoice()).toBe(false);
    expect(isAnalyticsEnabled()).toBe(false);
  });

  it("treats malformed storage as no-consent", () => {
    localStorage.setItem("dura:analytics:consent", "not-json");
    expect(isAnalyticsEnabled()).toBe(false);
    expect(getConsentState()).toEqual({
      analyticsConsented: false,
      consentedAt: null,
    });
  });

  it("treats schema-violating storage as no-consent", () => {
    localStorage.setItem("dura:analytics:consent", JSON.stringify({ analyticsConsented: "yes" }));
    expect(isAnalyticsEnabled()).toBe(false);
  });

  it("survives a localStorage that throws on read", () => {
    const getItem = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("storage disabled");
    });
    expect(isAnalyticsEnabled()).toBe(false);
    expect(getConsentState()).toEqual({
      analyticsConsented: false,
      consentedAt: null,
    });
    getItem.mockRestore();
  });
});
