import { describe, it, expect, vi } from "vitest";
vi.mock("@/lib/career-coverage", () => ({ getRoleLessonIds: () => ["6/6-1/01", "6/6-1/02"] }));
import { goalProgress } from "@/lib/goals/progress";
import { dailyStudyMinutes, localDayKey } from "@/lib/study-time";
import type { LessonProgress } from "@/types/curriculum";
import type { Goal } from "@/types/goal";
const now = new Date(2026, 8, 12, 15).getTime();
const record: LessonProgress = {
  lessonId: "0/0-1/01",
  phaseId: "0",
  moduleId: "0-1",
  startedAt: now - 86400000,
  completedAt: now,
  scrollPercent: 100,
  timeSpentMs: 3600000,
  quizPassed: true,
  quizScore: 1,
  xpEarned: 0,
  synced: 0,
  dailyTimeMs: { [localDayKey(now)]: 600000 },
};
const goal: Goal = {
  id: "goal",
  type: "career",
  unit: "lessons",
  target: 2,
  current: 0,
  startedAt: now,
  deadline: null,
  achievedAt: null,
  label: "Study mapped lessons",
  roleId: "ai",
};
describe("goal evidence", () => {
  it("does not count Phase0 completion toward an unrelated career goal", () =>
    expect(goalProgress(goal, [record], now)).toBe(0));
  it("counts only mapped lessons", () =>
    expect(
      goalProgress(goal, [record, { ...record, lessonId: "6/6-1/01", phaseId: "6" }], now)
    ).toBe(1));
  it("does not turn an old generic CTO goal into a false completion", () =>
    expect(
      goalProgress({ ...goal, roleId: undefined, label: "Reach CTO", target: 1 }, [record], now)
    ).toBe(0));
  it("attributes only observed local-day time, not lifetime duration", () =>
    expect(dailyStudyMinutes([record], now)).toBe(10));
  it("does not invent historical day allocation", () =>
    expect(dailyStudyMinutes([{ ...record, dailyTimeMs: undefined }], now)).toBe(0));
  it("uses explicit phase even when the display label has no phase number", () =>
    expect(
      goalProgress(
        { ...goal, type: "phase", phaseId: "0", label: "Finish Computing" },
        [record],
        now
      )
    ).toBeGreaterThan(0));
});
