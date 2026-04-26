import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  _resetShadowWriteForTests,
  flushShadowWrite,
  registerShadowWriteFlushers,
  triggerShadowWrite,
} from "@/lib/storage/shadow-write";

vi.mock("@/lib/storage/opfs", () => ({
  opfsAvailable: vi.fn(() => true),
  saveToOPFS: vi.fn(async () => {}),
}));

vi.mock("@/lib/storage/snapshot", () => ({
  buildLearnerSnapshot: vi.fn(async () => ({
    schemaVersion: 1 as const,
    createdAt: "2026-04-25T00:00:00.000Z",
    progress: [],
    moduleProgress: [],
    phaseProgress: [],
    flashcards: [],
    reviewLogs: [],
    goals: [],
    preferences: [],
    sandboxSaves: [],
    assessmentResults: [],
    certificates: [],
    xpEvents: [],
    tutorialProgress: [],
  })),
}));

describe("LFLRS-R1 — shadow-write debounce + flush", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    _resetShadowWriteForTests();
  });

  afterEach(() => {
    vi.useRealTimers();
    _resetShadowWriteForTests();
  });

  it("debounces a burst of trigger calls into one OPFS write", async () => {
    const { saveToOPFS } = await import("@/lib/storage/opfs");

    triggerShadowWrite();
    triggerShadowWrite();
    triggerShadowWrite();
    triggerShadowWrite();

    expect(saveToOPFS).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1500);
    await vi.runAllTimersAsync();

    expect(saveToOPFS).toHaveBeenCalledOnce();
  });

  it("flushShadowWrite forces an immediate write even when no trigger is pending", async () => {
    const { saveToOPFS } = await import("@/lib/storage/opfs");

    vi.useRealTimers();
    await flushShadowWrite();
    expect(saveToOPFS).toHaveBeenCalledOnce();
  });

  it("triggerShadowWrite is fire-and-forget — synchronous, returns void", () => {
    const result = triggerShadowWrite();
    expect(result).toBeUndefined();
  });

  it("registerShadowWriteFlushers is idempotent", () => {
    const teardown1 = registerShadowWriteFlushers();
    const teardown2 = registerShadowWriteFlushers();
    teardown1();
    teardown2();
  });
});
