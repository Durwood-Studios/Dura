import type { LessonProgress } from "@/types/curriculum";

/** Local calendar key shared by goals and reminders; historical cumulative time is not assigned to today. */
export function localDayKey(now: number): string {
  const date = new Date(now);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

/** Sum only observed time attributed to this local day. */
export function dailyStudyMinutes(records: LessonProgress[], now: number): number {
  const key = localDayKey(now);
  return Math.floor(
    records.reduce((total, record) => {
      const time = record.dailyTimeMs?.[key];
      return total + (typeof time === "number" && Number.isFinite(time) && time > 0 ? time : 0);
    }, 0) / 60_000
  );
}
