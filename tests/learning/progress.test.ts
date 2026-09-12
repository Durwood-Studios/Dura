import { beforeEach, describe, expect, it, vi } from "vitest";
import { useProgressStore } from "@/stores/progress";
import type { LessonProgress } from "@/types/curriculum";
const { records, read, write } = vi.hoisted(() => ({
  records: new Map<string, LessonProgress>(),
  read: vi.fn(),
  write: vi.fn(),
}));
vi.mock("@/lib/db/progress", () => ({
  getLessonProgress: read,
  putLessonProgress: write,
}));
vi.mock("@/lib/analytics", () => ({ track: vi.fn() }));

describe("lesson identity", (): void => {
  beforeEach((): void => {
    records.clear();
    read
      .mockReset()
      .mockImplementation(
        async (id: string): Promise<LessonProgress | undefined> => records.get(id)
      );
    write.mockReset().mockImplementation(async (record: LessonProgress): Promise<void> => {
      records.set(record.lessonId, record);
    });
    useProgressStore.getState().reset();
  });
  it("keeps same-number lessons separate across modules and phases", async (): Promise<void> => {
    await useProgressStore.getState().start("01", "0", "0-1");
    await useProgressStore.getState().complete(10);
    await useProgressStore.getState().start("01", "1", "1-1");
    expect(useProgressStore.getState().current).toMatchObject({
      lessonId: "1/1-1/01",
      phaseId: "1",
      completedAt: null,
    });
    await useProgressStore.getState().start("01", "1", "1-2");
    expect(useProgressStore.getState().current?.completedAt).toBeNull();
    await useProgressStore.getState().start("01", "0", "0-1");
    expect(useProgressStore.getState().current?.completedAt).not.toBeNull();
    expect(records.size).toBe(3);
  });
  it("does not restore a lesson after reset cancels its pending load", async (): Promise<void> => {
    let resolveRead: (record: undefined) => void = (): void => {};
    read.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveRead = resolve;
        })
    );
    const loading = useProgressStore.getState().start("01", "0", "0-1");
    useProgressStore.getState().reset();
    resolveRead(undefined);
    await loading;
    expect(useProgressStore.getState().current).toBeNull();
    expect(write).not.toHaveBeenCalled();
  });

  it("persists a passing quiz consistently through completion and a retry", async (): Promise<void> => {
    await useProgressStore.getState().start("01", "0", "0-1");
    await useProgressStore.getState().setQuizScore(0.9);
    expect(useProgressStore.getState().quizPassed).toBe(true);
    await useProgressStore.getState().setQuizScore(0.5);
    await useProgressStore.getState().complete(10);
    expect(records.get("0/0-1/01")?.quizPassed).toBe(true);
  });

  it("keeps completion available for retry if durable storage fails", async (): Promise<void> => {
    await useProgressStore.getState().start("01", "0", "0-1");
    write.mockRejectedValueOnce(new Error("quota exceeded"));
    await expect(useProgressStore.getState().complete(10)).rejects.toThrow("quota exceeded");
    expect(useProgressStore.getState().current?.completedAt).toBeNull();
    await useProgressStore.getState().complete(10);
    expect(useProgressStore.getState().current?.completedAt).not.toBeNull();
  });

  it("does not replace a newly opened lesson when an earlier completion finishes", async (): Promise<void> => {
    await useProgressStore.getState().start("01", "0", "0-1");
    let finish: () => void = (): void => {};
    write.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        })
    );
    const completing = useProgressStore.getState().complete(10);
    await useProgressStore.getState().start("02", "0", "0-1");
    finish();
    await completing;
    expect(useProgressStore.getState().current?.lessonId).toBe("0/0-1/02");
    expect(useProgressStore.getState().current?.completedAt).toBeNull();
  });

  it("rejects non-finite timing and scores instead of poisoning completion gates", async (): Promise<void> => {
    await useProgressStore.getState().start("01", "0", "0-1");
    useProgressStore.getState().tick(Number.NaN);
    useProgressStore.getState().tick(-10);
    useProgressStore.getState().setScroll(Number.NaN);
    await useProgressStore.getState().setQuizScore(Number.POSITIVE_INFINITY);
    expect(useProgressStore.getState().timeSpentMs).toBe(0);
    expect(useProgressStore.getState().scrollPercent).toBe(0);
    expect(useProgressStore.getState().quizScore).toBeNull();
  });
});
