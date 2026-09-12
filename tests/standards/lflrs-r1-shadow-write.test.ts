import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  _resetShadowWriteForTests,
  flushShadowWrite,
  registerShadowWriteFlushers,
  triggerShadowWrite,
  suspendShadowWritesForReset,
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
  it("reset cancels pending writes and blocks lifecycle flushes until reload", async () => {
    const { saveToOPFS } = await import("@/lib/storage/opfs");
    triggerShadowWrite();
    await suspendShadowWritesForReset();
    triggerShadowWrite();
    await flushShadowWrite();
    await vi.advanceTimersByTimeAsync(30000);
    expect(saveToOPFS).not.toHaveBeenCalled();
  });

  it("reset waits for an in-flight backup before deletion can proceed", async () => {
    const { saveToOPFS } = await import("@/lib/storage/opfs");
    let finish: () => void = (): void => {};
    vi.mocked(saveToOPFS).mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        })
    );
    const writing = flushShadowWrite();
    await Promise.resolve();
    let hasDrained = false;
    const draining = suspendShadowWritesForReset().then((): void => {
      hasDrained = true;
    });
    await Promise.resolve();
    expect(hasDrained).toBe(false);
    finish();
    await Promise.all([writing, draining]);
    expect(hasDrained).toBe(true);
  });
});
