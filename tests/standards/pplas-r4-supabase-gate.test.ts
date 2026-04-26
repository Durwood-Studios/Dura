import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { batchSyncAnalytics } from "@/lib/supabase/queries/analytics";
import { grantAnalyticsConsent } from "@/lib/analytics/consent-gate";
import type { AnalyticsEvent } from "@/types/analytics";

const upsertMock = vi.fn(async () => ({ error: null }));
const fromMock = vi.fn(() => ({ upsert: upsertMock }));

vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(() => ({ from: fromMock })),
}));

const sampleEvent: AnalyticsEvent = {
  id: "evt-1",
  name: "lesson_started",
  timestamp: 1700000000000,
  properties: { lessonId: "x" },
  synced: 0,
};

describe("PPLAS-R4 — batchSyncAnalytics consent gate", () => {
  beforeEach(() => {
    localStorage.clear();
    upsertMock.mockClear();
    fromMock.mockClear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("does not call Supabase when consent is not granted", async () => {
    await batchSyncAnalytics("user-1", [sampleEvent]);
    expect(fromMock).not.toHaveBeenCalled();
    expect(upsertMock).not.toHaveBeenCalled();
  });

  it("calls Supabase after consent is granted", async () => {
    grantAnalyticsConsent();
    await batchSyncAnalytics("user-1", [sampleEvent]);
    expect(fromMock).toHaveBeenCalledWith("analytics_events");
    expect(upsertMock).toHaveBeenCalledOnce();
  });
});
