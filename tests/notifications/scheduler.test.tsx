import { render, act } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import { NotificationScheduler } from "@/components/pwa/NotificationScheduler";
const state = vi.hoisted(() => ({ enabled: false, stop: vi.fn(), start: vi.fn() }));
vi.mock("@/lib/notifications", () => ({
  NOTIFICATION_PREFERENCE_EVENT: "dura:notification-preference",
  isEnabled: (): boolean => state.enabled,
  hasPermission: (): boolean => true,
  startNotificationScheduler: (): (() => void) => {
    state.start();
    return state.stop;
  },
}));
beforeEach((): void => {
  state.enabled = false;
  vi.clearAllMocks();
});
it("starts on first opt-in and stops on withdrawal without a reload", (): void => {
  const view = render(<NotificationScheduler />);
  expect(state.start).not.toHaveBeenCalled();
  act((): void => {
    state.enabled = true;
    window.dispatchEvent(new Event("dura:notification-preference"));
  });
  expect(state.start).toHaveBeenCalledTimes(1);
  act((): void => {
    state.enabled = false;
    window.dispatchEvent(new Event("storage"));
  });
  expect(state.stop).toHaveBeenCalledTimes(1);
  view.unmount();
});
