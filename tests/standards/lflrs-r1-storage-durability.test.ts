import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

import { useStorageDurability } from "@/hooks/useStorageDurability";

describe("LFLRS-R1 — useStorageDurability hook", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("calls navigator.storage.persist() on mount", async () => {
    const persist = vi.fn().mockResolvedValue(true);
    vi.stubGlobal("navigator", {
      ...navigator,
      storage: { ...navigator.storage, persist },
    });

    renderHook(() => useStorageDurability());
    await waitFor(() => expect(persist).toHaveBeenCalledOnce());
    vi.unstubAllGlobals();
  });

  it("returns 'persistent' when persist resolves true", async () => {
    vi.stubGlobal("navigator", {
      ...navigator,
      storage: {
        ...navigator.storage,
        persist: vi.fn().mockResolvedValue(true),
      },
    });

    const { result } = renderHook(() => useStorageDurability());
    await waitFor(() => expect(result.current).toBe("persistent"));
    vi.unstubAllGlobals();
  });

  it("returns 'best-effort' when persist resolves false", async () => {
    vi.stubGlobal("navigator", {
      ...navigator,
      storage: {
        ...navigator.storage,
        persist: vi.fn().mockResolvedValue(false),
      },
    });

    const { result } = renderHook(() => useStorageDurability());
    await waitFor(() => expect(result.current).toBe("best-effort"));
    vi.unstubAllGlobals();
  });

  it("returns 'best-effort' when persist rejects", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal("navigator", {
      ...navigator,
      storage: {
        ...navigator.storage,
        persist: vi.fn().mockRejectedValue(new Error("blocked")),
      },
    });

    const { result } = renderHook(() => useStorageDurability());
    await waitFor(() => expect(result.current).toBe("best-effort"));
    expect(consoleError).toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it("returns 'unsupported' when navigator.storage.persist is missing", async () => {
    vi.stubGlobal("navigator", {
      ...navigator,
      storage: undefined,
    });

    const { result } = renderHook(() => useStorageDurability());
    await waitFor(() => expect(result.current).toBe("unsupported"));
    vi.unstubAllGlobals();
  });
});
