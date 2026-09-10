import { beforeEach, describe, expect, it, vi } from "vitest";
import { useProgressStore } from "@/stores/progress";
import type { LessonProgress } from "@/types/curriculum";
const { records } = vi.hoisted(() => ({ records: new Map<string, LessonProgress>() }));
vi.mock("@/lib/db/progress", () => ({
  getLessonProgress: async (id: string): Promise<LessonProgress | undefined> => records.get(id),
  putLessonProgress: async (record: LessonProgress): Promise<void> => {
    records.set(record.lessonId, record);
  },
}));
vi.mock("@/lib/analytics", () => ({ track: vi.fn() }));

describe("lesson identity", (): void => {
  beforeEach((): void => {
    records.clear();
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
});
