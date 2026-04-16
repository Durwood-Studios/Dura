/**
 * Difficulty calibration schema.
 *
 * Combines author-assigned difficulty with actual user performance data.
 * Ready for when Supabase data starts flowing — no implementation yet.
 */
export interface LessonDifficulty {
  lessonId: string;
  /** Author-assigned rating from frontmatter (1-5). */
  authorRating: number;
  /** Median completion time from user data (0 if no data). */
  actualMedianTimeMs: number;
  /** First-pass quiz pass rate, 0-1 (0 if no data). */
  quizFirstPassRate: number;
  /** Rate at which users retake the lesson, 0-1. */
  retakeRate: number;
  /** Number of completions backing the computed values. */
  sampleSize: number;
  /** Computed 1-5 difficulty blending author rating with actual data. */
  calibratedDifficulty: number;
  /** Unix timestamp of last calibration update. */
  lastUpdated: number;
}
