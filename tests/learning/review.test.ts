import { beforeEach, describe, expect, it, vi } from "vitest";
import { createCard } from "@/lib/fsrs";
import { useReviewStore } from "@/stores/review";

const mocks = vi.hoisted(() => ({ apply: vi.fn(), due: vi.fn(), all: vi.fn(), award: vi.fn() }));
vi.mock("@/lib/db/flashcards", () => ({ getDueCards: mocks.due, getAllCards: mocks.all }));
vi.mock("@/lib/db/flashcards-review", () => ({ applyReview: mocks.apply }));
vi.mock("@/lib/xp-manager", () => ({ awardXPWithToast: mocks.award }));
vi.mock("@/lib/streak-manager", () => ({ extendStreak: vi.fn() }));
vi.mock("@/lib/analytics", () => ({ track: vi.fn() }));

describe("durable review session", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    useReviewStore.getState().reset();
    mocks.due.mockResolvedValue([createCard({ id: "a", front: "A", back: "B" })]);
    mocks.award.mockResolvedValue(0);
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("keeps failed reviews available and awards nothing until retry succeeds", async () => {
    await useReviewStore.getState().loadQueue();
    useReviewStore.getState().flip();
    mocks.apply.mockRejectedValueOnce(new Error("quota"));
    await useReviewStore.getState().rate("good");
    expect(useReviewStore.getState().index).toBe(0);
    expect(useReviewStore.getState().error).toContain("could not be saved");
    expect(mocks.award).not.toHaveBeenCalled();
    await useReviewStore.getState().rate("good");
    expect(useReviewStore.getState().sessionComplete).toBe(true);
    expect(useReviewStore.getState().earnedXP).toBe(0);
  });

  it("ignores duplicate ratings while the first write is pending", async () => {
    await useReviewStore.getState().loadQueue();
    useReviewStore.getState().flip();
    let finish: () => void = (): void => {};
    mocks.apply.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        })
    );
    const first = useReviewStore.getState().rate("good");
    await useReviewStore.getState().rate("easy");
    expect(mocks.apply).toHaveBeenCalledOnce();
    finish();
    await first;
    expect(useReviewStore.getState().sessionStats.correct).toBe(1);
  });

  it("does not let a late review overwrite a reset session", async () => {
    await useReviewStore.getState().loadQueue();
    useReviewStore.getState().flip();
    let finish: () => void = (): void => {};
    mocks.apply.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        })
    );
    const pending = useReviewStore.getState().rate("good");
    useReviewStore.getState().reset();
    finish();
    await pending;
    expect(useReviewStore.getState().queue).toEqual([]);
    expect(useReviewStore.getState().sessionComplete).toBe(false);
    expect(mocks.award).not.toHaveBeenCalled();
  });
});
