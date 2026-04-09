import type { StandardRef } from "@/lib/curriculum";
import type { LessonMeta } from "@/types/curriculum";
import { toCSV } from "@/lib/exports/csv";

/**
 * Standards-to-lessons map as CSV. One row per (framework, code)
 * pairing with the list of lessons that reference it.
 */
export function standardsCSV(standards: StandardRef[], lessons: LessonMeta[]): string {
  const lessonLookup = new Map(lessons.map((l) => [l.id, l]));
  const rows = standards.map((s) => ({
    framework: s.framework,
    code: s.code,
    lesson_count: s.lessonIds.length,
    lesson_ids: s.lessonIds,
    lesson_titles: s.lessonIds.map((id) => lessonLookup.get(id)?.title ?? id),
  }));
  return toCSV(rows, ["framework", "code", "lesson_count", "lesson_ids", "lesson_titles"]);
}
