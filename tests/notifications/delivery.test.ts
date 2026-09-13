import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ show: vi.fn(), due: vi.fn() }));
vi.mock("@/lib/db", () => ({ getDB: vi.fn() }));
vi.mock("@/lib/idb/encrypted-store", () => ({ getAllEncryptedLessonProgress: vi.fn() }));
vi.mock("@/lib/db/flashcards", () => ({ getDueCards: mocks.due }));
vi.mock("@/lib/db/preferences", () => ({
  getPreferences: async () => ({ showStreak: false, dailyGoalMinutes: 0 }),
}));
import { checkAndNotify, disableNotifications } from "@/lib/notifications";
beforeEach(() => {
  localStorage.clear();
  localStorage.setItem("dura-notifications-enabled", "true");
  vi.stubGlobal("Notification", { permission: "granted" });
  Object.defineProperty(navigator, "serviceWorker", {
    configurable: true,
    value: { getRegistration: async () => ({ showNotification: mocks.show }) },
  });
  mocks.show.mockReset();
  mocks.due.mockResolvedValue(Array.from({ length: 5 }, () => ({})));
});
describe("reminder delivery", () => {
  it("uses the service worker notification API for mobile compatibility", async () => {
    mocks.show.mockResolvedValue(undefined);
    await checkAndNotify();
    expect(mocks.show).toHaveBeenCalledWith(
      "Flashcards ready for review",
      expect.objectContaining({ tag: "review-reminder" })
    );
    expect(localStorage.getItem("dura-last-review-reminder")).not.toBeNull();
  });
  it("does not consume the reminder cooldown after failed delivery", async () => {
    mocks.show.mockRejectedValue(new Error("Permission changed"));
    await checkAndNotify();
    expect(localStorage.getItem("dura-last-review-reminder")).toBeNull();
    mocks.show.mockResolvedValue(undefined);
    await checkAndNotify();
    expect(mocks.show).toHaveBeenCalledTimes(2);
  });
  it("reports failed opt-out storage instead of claiming reminders are disabled", () => {
    const write = vi.spyOn(Storage.prototype, "setItem").mockImplementationOnce(() => {
      throw new Error("Blocked storage");
    });
    expect(() => disableNotifications()).toThrow("could not be saved");
    expect(localStorage.getItem("dura-notifications-enabled")).toBe("true");
    write.mockRestore();
  });
});
