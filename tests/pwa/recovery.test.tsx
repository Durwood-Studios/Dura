import { cleanup, render, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ChunkRecovery } from "@/components/pwa/ChunkRecovery";
import { useServiceWorkerUpdate } from "@/hooks/useServiceWorkerUpdate";

afterEach((): void => {
  cleanup();
  sessionStorage.clear();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("PWA recovery", (): void => {
  it("preserves cached offline content when an uncached chunk fails offline", (): void => {
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(false);
    render(<ChunkRecovery />);
    window.dispatchEvent(
      new ErrorEvent("error", { message: "ChunkLoadError: Loading chunk 42 failed" })
    );
    expect(sessionStorage.getItem("dura:chunk-recovery-attempted")).toBeNull();
  });

  it("removes update listeners and polling when the hook unmounts", async (): Promise<void> => {
    const registration = new EventTarget();
    const remove = vi.spyOn(registration, "removeEventListener");
    const update = vi.fn().mockResolvedValue(undefined);
    Object.assign(registration, { waiting: null, installing: null, update });
    vi.stubGlobal("navigator", {
      serviceWorker: { getRegistration: vi.fn().mockResolvedValue(registration), controller: null },
    });
    const clearInterval = vi.spyOn(window, "clearInterval");
    const add = vi.spyOn(registration, "addEventListener");
    const hook = renderHook(() => useServiceWorkerUpdate());
    await waitFor(() => expect(add).toHaveBeenCalledWith("updatefound", expect.any(Function)));
    hook.unmount();
    expect(remove).toHaveBeenCalledWith("updatefound", expect.any(Function));
    expect(clearInterval).toHaveBeenCalled();
  });
});
