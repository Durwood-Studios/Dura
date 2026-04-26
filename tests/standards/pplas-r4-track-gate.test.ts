import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { track } from "@/lib/analytics";
import { grantAnalyticsConsent } from "@/lib/analytics/consent-gate";

const putMock = vi.fn();
const clearMock = vi.fn();

vi.mock("@/lib/db", () => ({
  getDB: vi.fn(async () => ({
    put: putMock,
    clear: clearMock,
  })),
}));

describe("PPLAS-R4 — track() consent gate", () => {
  beforeEach(() => {
    localStorage.clear();
    putMock.mockReset();
    clearMock.mockReset();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("does not write to IDB when consent is not granted", async () => {
    await track("lesson_started", { lessonId: "x" });
    expect(putMock).not.toHaveBeenCalled();
  });

  it("does not even open the DB when consent is not granted", async () => {
    const dbModule = await import("@/lib/db");
    const getDBSpy = vi.mocked(dbModule.getDB);
    getDBSpy.mockClear();
    await track("lesson_started");
    expect(getDBSpy).not.toHaveBeenCalled();
  });

  it("writes to IDB after consent is granted", async () => {
    grantAnalyticsConsent();
    await track("lesson_started", { lessonId: "x" });
    expect(putMock).toHaveBeenCalledOnce();
    expect(putMock).toHaveBeenCalledWith(
      "analytics",
      expect.objectContaining({
        name: "lesson_started",
        properties: { lessonId: "x" },
        synced: 0,
      })
    );
  });
});
