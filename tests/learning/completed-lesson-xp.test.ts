import { beforeEach, expect, it, vi } from "vitest";
import { awardSavedLessonXP } from "@/lib/xp-manager";

const mocks = vi.hoisted(() => ({ read: vi.fn(), award: vi.fn(), total: vi.fn(), toast: vi.fn() }));
vi.mock("@/lib/db/progress", () => ({ getLessonProgress: mocks.read }));
vi.mock("@/lib/db/xp", () => ({ awardXP: mocks.award, getTotalXP: mocks.total }));
vi.mock("@/stores/toasts", () => ({ useToastsStore: { getState: () => ({ push: mocks.toast }) } }));

beforeEach(() => {
  vi.resetAllMocks();
  mocks.total.mockResolvedValue(0);
});

it("never awards for absent or unfinished durable progress", async () => {
  mocks.read
    .mockResolvedValueOnce(undefined)
    .mockResolvedValueOnce({ completedAt: null, xpEarned: 10 });
  expect(await awardSavedLessonXP("missing")).toBe(0);
  expect(await awardSavedLessonXP("unfinished")).toBe(0);
  expect(mocks.award).not.toHaveBeenCalled();
});

it("retries a missing award on reopening, then reports zero for an already-awarded lesson", async () => {
  mocks.read.mockResolvedValue({ lessonId: "0/0-1/01", completedAt: 123, xpEarned: 10 });
  mocks.award
    .mockResolvedValueOnce(null)
    .mockResolvedValueOnce({ amount: 10 })
    .mockResolvedValueOnce(null);
  expect(await awardSavedLessonXP("0/0-1/01")).toBe(0);
  expect(mocks.toast).not.toHaveBeenCalled();
  expect(await awardSavedLessonXP("0/0-1/01")).toBe(10);
  expect(await awardSavedLessonXP("0/0-1/01")).toBe(0);
  expect(mocks.award).toHaveBeenCalledWith("lesson", 10, "0/0-1/01");
  expect(mocks.toast).toHaveBeenCalledOnce();
});

it("coalesces concurrent reconciliation without duplicate award attempts", async () => {
  mocks.read.mockResolvedValue({ lessonId: "lesson", completedAt: 123, xpEarned: 10 });
  mocks.award.mockResolvedValue({ amount: 10 });
  expect(await Promise.all([awardSavedLessonXP("lesson"), awardSavedLessonXP("lesson")])).toEqual([
    10, 10,
  ]);
  expect(mocks.award).toHaveBeenCalledOnce();
});
