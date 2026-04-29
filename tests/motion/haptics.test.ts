/**
 * DLS-2.0 §Haptic Choreography — value lock + behavior contract.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HAPTICS, __resetHapticDebounce, haptic, type HapticPattern } from "@/lib/haptics";

describe("DLS-2.0 HAPTICS — canonical patterns", () => {
  it("rating haptics — distinct per rating, ON tap timing", () => {
    expect(HAPTICS.ratingAgain).toEqual([8]);
    expect(HAPTICS.ratingHard).toEqual([8, 8, 8]);
    expect(HAPTICS.ratingGood).toEqual([12]);
    expect(HAPTICS.ratingEasy).toEqual([8, 6, 12]);
  });

  it("session events", () => {
    expect(HAPTICS.sessionStart).toEqual([16]);
    expect(HAPTICS.sessionEnd).toEqual([20, 30, 20, 30, 60]);
  });

  it("mastery unlock — short-pause-long achievement pattern", () => {
    expect(HAPTICS.masteryUnlock).toEqual([30, 20, 60]);
  });

  it("card flip — subtle confirmation", () => {
    expect(HAPTICS.cardFlip).toEqual([6]);
  });

  it("blocked — rapid triple stop pattern", () => {
    expect(HAPTICS.blocked).toEqual([8, 8, 8, 8, 8]);
  });

  it("vocabulary covers exactly the documented patterns", () => {
    const expected: HapticPattern[] = [
      "ratingAgain",
      "ratingHard",
      "ratingGood",
      "ratingEasy",
      "sessionStart",
      "sessionEnd",
      "masteryUnlock",
      "cardFlip",
      "blocked",
    ];
    expect(Object.keys(HAPTICS).sort()).toEqual(expected.sort());
  });
});

describe("haptic() behavior", () => {
  let vibrateSpy: ReturnType<typeof vi.fn>;
  let originalVibrate: typeof navigator.vibrate | undefined;

  beforeEach(() => {
    __resetHapticDebounce();
    originalVibrate = navigator.vibrate;
    vibrateSpy = vi.fn().mockReturnValue(true);
    Object.defineProperty(navigator, "vibrate", {
      configurable: true,
      writable: true,
      value: vibrateSpy,
    });
  });

  afterEach(() => {
    if (originalVibrate) {
      Object.defineProperty(navigator, "vibrate", {
        configurable: true,
        writable: true,
        value: originalVibrate,
      });
    } else {
      delete (navigator as { vibrate?: unknown }).vibrate;
    }
    vi.restoreAllMocks();
  });

  it("calls navigator.vibrate with the canonical pattern", () => {
    haptic("ratingGood");
    expect(vibrateSpy).toHaveBeenCalledWith([12]);
  });

  it("debounces — two rapid calls fire only once", () => {
    haptic("ratingAgain");
    haptic("ratingHard");
    expect(vibrateSpy).toHaveBeenCalledTimes(1);
    expect(vibrateSpy).toHaveBeenCalledWith([8]);
  });

  it("debounce window is 500ms — calls beyond it fire again", () => {
    const now = Date.now();
    vi.spyOn(Date, "now").mockReturnValue(now);
    haptic("ratingAgain");
    expect(vibrateSpy).toHaveBeenCalledTimes(1);

    // Advance 499ms — still within debounce
    (Date.now as ReturnType<typeof vi.fn>).mockReturnValue(now + 499);
    haptic("ratingHard");
    expect(vibrateSpy).toHaveBeenCalledTimes(1);

    // Advance to 501ms — out of debounce
    (Date.now as ReturnType<typeof vi.fn>).mockReturnValue(now + 501);
    haptic("ratingHard");
    expect(vibrateSpy).toHaveBeenCalledTimes(2);
  });

  it("no-ops when prefers-reduced-motion: reduce is set", () => {
    // jsdom doesn't ship matchMedia — install a minimal stub on window
    // that reports prefers-reduced-motion as true.
    const matchMediaStub = vi.fn((query: string) => ({
      matches: query === "(prefers-reduced-motion: reduce)",
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      writable: true,
      value: matchMediaStub,
    });
    haptic("masteryUnlock");
    expect(vibrateSpy).not.toHaveBeenCalled();
    expect(matchMediaStub).toHaveBeenCalledWith("(prefers-reduced-motion: reduce)");
  });

  it("no-ops when navigator.vibrate is unavailable", () => {
    delete (navigator as { vibrate?: unknown }).vibrate;
    expect(() => haptic("sessionStart")).not.toThrow();
  });
});
