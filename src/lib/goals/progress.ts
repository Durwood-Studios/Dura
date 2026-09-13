import { dailyStudyMinutes } from "@/lib/study-time";
import { PHASES } from "@/content/phases";
import { getRoleLessonIds } from "@/lib/career-coverage";
import type { Goal } from "@/types/goal";
import type { LessonProgress } from "@/types/curriculum";

/** Compute goal progress from its explicit scope, never unrelated certificate counts. */
export function goalProgress(goal: Goal, records: LessonProgress[], now: number): number {
  const completed = records.filter((record) => record.completedAt !== null);
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  if (goal.type === "daily")
    return goal.unit === "minutes"
      ? dailyStudyMinutes(records, now)
      : completed.filter(
          (record) =>
            (record.completedAt ?? 0) >= start.getTime() && (record.completedAt ?? 0) <= now
        ).length;
  if (goal.type === "weekly") {
    start.setDate(start.getDate() - start.getDay());
    return completed.filter(
      (record) => (record.completedAt ?? 0) >= start.getTime() && (record.completedAt ?? 0) <= now
    ).length;
  }
  if (goal.type === "phase") {
    const phase = goalPhase(goal);
    return phase ? completed.filter((record) => record.phaseId === phase.id).length : 0;
  }

  if (goal.type === "career") {
    if (!goal.roleId) return 0; // Old generic seniority labels do not identify a defensible curriculum scope.
    const lessons = new Set(getRoleLessonIds(goal.roleId));
    return completed.filter((record) => lessons.has(record.lessonId)).length;
  }
  return goal.current;
}

function goalPhase(goal: Goal): (typeof PHASES)[number] | undefined {
  const id = goal.phaseId ?? /Phase (\d+)/.exec(goal.label)?.[1];
  return id
    ? PHASES.find((phase) => phase.id === id)
    : PHASES.find(
        (phase) =>
          goal.label === `Finish ${phase.title}` ||
          goal.label.startsWith(`Finish ${phase.title} by `)
      );
}

/** The denominator follows the same current curriculum scope as the numerator. */
export function goalTarget(goal: Goal): number {
  if (goal.type === "phase") return goalPhase(goal)?.lessonCount ?? goal.target;
  if (goal.type === "career" && goal.roleId) return getRoleLessonIds(goal.roleId).length;
  return goal.target;
}
