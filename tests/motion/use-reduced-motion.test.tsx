/**
 * DLS-2.0 §Reduced Motion Contract — useMotionPreference behavior.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { readMotionPreference, useMotionPreference } from "@/hooks/use-reduced-motion";
import { SPRINGS } from "@/lib/motion/springs";

interface MQLStub {
  matches: boolean;
  media: string;
  onchange: ((this: MediaQueryList, ev: MediaQueryListEvent) => void) | null;
  addEventListener: ReturnType<typeof vi.fn>;
  removeEventListener: ReturnType<typeof vi.fn>;
  addListener: ReturnType<typeof vi.fn>;
  removeListener: ReturnType<typeof vi.fn>;
  dispatchEvent: ReturnType<typeof vi.fn>;
}

function installMatchMedia(reduced: boolean): MQLStub {
  const stub: MQLStub = {
    matches: reduced,
    media: "(prefers-reduced-motion: reduce)",
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  };
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: vi.fn(() => stub),
  });
  return stub;
}

describe("useMotionPreference", () => {
  let originalMatchMedia: typeof window.matchMedia | undefined;

  beforeEach(() => {
    originalMatchMedia = window.matchMedia;
  });

  afterEach(() => {
    if (originalMatchMedia) {
      Object.defineProperty(window, "matchMedia", {
        configurable: true,
        writable: true,
        value: originalMatchMedia,
      });
    }
    vi.restoreAllMocks();
  });

  it("returns full-motion when user has no reduced-motion preference", () => {
    installMatchMedia(false);
    const { result } = renderHook(() => useMotionPreference());
    expect(result.current.shouldAnimate).toBe(true);
    expect(result.current.spring).toBe(SPRINGS.fluid);
    expect(result.current.duration).toBeUndefined();
  });

  it("returns reduced-motion when user prefers reduced motion", () => {
    installMatchMedia(true);
    const { result } = renderHook(() => useMotionPreference());
    expect(result.current.shouldAnimate).toBe(false);
    expect(result.current.spring).toEqual({ duration: 0 });
    expect(result.current.duration).toBe(0);
  });

  it("subscribes to matchMedia change events and unsubscribes on unmount", () => {
    const stub = installMatchMedia(false);
    const { unmount } = renderHook(() => useMotionPreference());
    expect(stub.addEventListener).toHaveBeenCalledWith("change", expect.any(Function));
    unmount();
    expect(stub.removeEventListener).toHaveBeenCalledWith("change", expect.any(Function));
  });

  it("falls back to addListener for Safari < 14 when addEventListener is absent", () => {
    const stub: MQLStub = {
      matches: false,
      media: "(prefers-reduced-motion: reduce)",
      onchange: null,
      // simulate Safari < 14 — addEventListener is undefined
      addEventListener: undefined as unknown as ReturnType<typeof vi.fn>,
      removeEventListener: undefined as unknown as ReturnType<typeof vi.fn>,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    };
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      writable: true,
      value: vi.fn(() => stub),
    });
    const { unmount } = renderHook(() => useMotionPreference());
    expect(stub.addListener).toHaveBeenCalled();
    unmount();
    expect(stub.removeListener).toHaveBeenCalled();
  });

  it("readMotionPreference (sync) reads current preference without subscribing", () => {
    installMatchMedia(true);
    const pref = readMotionPreference();
    expect(pref.shouldAnimate).toBe(false);
    expect(pref.duration).toBe(0);
  });

  it("readMotionPreference returns full-motion when matchMedia is unavailable (SSR-like)", () => {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      writable: true,
      value: undefined,
    });
    const pref = readMotionPreference();
    expect(pref.shouldAnimate).toBe(true);
  });
});
