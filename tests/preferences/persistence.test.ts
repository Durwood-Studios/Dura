import { beforeEach, expect, it, vi } from "vitest";
const persist = vi.hoisted(() => vi.fn());
vi.mock("@/lib/db/preferences", () => ({ getPreferences: vi.fn(), patchPreferences: persist }));
import { usePreferencesStore } from "@/stores/preferences";
import { DEFAULT_PREFERENCES } from "@/types/preferences";
beforeEach(() => {
  usePreferencesStore.setState({ prefs: DEFAULT_PREFERENCES, error: null, _pendingUpdate: false });
  persist.mockReset();
});
it("does not show persisted settings after storage rejects the write", async () => {
  persist.mockRejectedValue(new Error("Storage full"));
  expect(await usePreferencesStore.getState().update({ fontSize: "xl" })).toBe(false);
  expect(usePreferencesStore.getState().prefs.fontSize).toBe(DEFAULT_PREFERENCES.fontSize);
  expect(usePreferencesStore.getState().error).toContain("could not be saved");
});
it("serializes rapid preference changes and retains both persisted values", async () => {
  let release: (() => void) | undefined;
  persist
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          release = () => resolve({ ...DEFAULT_PREFERENCES, fontSize: "xl" });
        })
    )
    .mockResolvedValueOnce({ ...DEFAULT_PREFERENCES, fontSize: "xl", highContrast: true });
  const first = usePreferencesStore.getState().update({ fontSize: "xl" });
  const second = usePreferencesStore.getState().update({ highContrast: true });
  await Promise.resolve();
  expect(persist).toHaveBeenCalledTimes(1);
  release?.();
  expect(await first).toBe(true);
  expect(await second).toBe(true);
  expect(usePreferencesStore.getState().prefs).toMatchObject({
    fontSize: "xl",
    highContrast: true,
  });
});
