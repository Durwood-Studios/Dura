export type DreyfusStage = "novice" | "advanced-beginner" | "competent" | "proficient" | "expert";
export type BloomLevel = "remember" | "understand" | "apply" | "analyze" | "evaluate" | "create";

export interface LessonMeta {
  id: string;
  slug: string;
  moduleId: string;
  phaseId: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  difficulty: 1 | 2 | 3 | 4 | 5;
  bloom: BloomLevel;
  dreyfus: DreyfusStage;
  standards: {
    cs2023?: string[];
    swebok?: string[];
    bloom?: string;
    sfia?: string;
    dreyfus?: string;
    csta?: string[];
    apcs?: string[];
  };
  vocabulary: string[];
  order: number;
  /** Specific, measurable outcomes. "After this lesson you can: ..." */
  learningOutcomes?: string[];
  /** Lesson IDs that should be completed before this one. */
  prerequisites?: string[];
  /**
   * How a professional thinks about this concept. Shown on lessons
   * at "evaluate" or "create" bloom level. Bridges the gap between
   * knowing something and applying it in professional context.
   */
  professionalContext?: string;
  /** Whether this lesson contains a threshold concept — an idea that
   * permanently transforms how the learner thinks about the field. */
  thresholdConcept?: boolean;
}

export interface Module {
  id: string;
  phaseId: string;
  slug: string;
  title: string;
  description: string;
  estimatedHours: number;
  lessonCount: number;
  order: number;
}

export interface Phase {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  color: string;
  estimatedHours: number;
  moduleCount: number;
  lessonCount: number;
  order: number;
  modules: Module[];
}

export interface LessonProgress {
  lessonId: string;
  phaseId: string;
  moduleId: string;
  startedAt: number;
  completedAt: number | null;
  scrollPercent: number;
  timeSpentMs: number;
  quizPassed: boolean;
  /** Numeric score 0-1 from the lesson's quiz, null if no quiz attempted yet. */
  quizScore: number | null;
  xpEarned: number;
  synced: 0 | 1;
  /**
   * Encrypted envelope of the behavioral fields (everything except keypath
   * + indexed fields). At-rest encryption per P5-A.3. Wrapper hydrates
   * before returning to callers.
   */
  _e?: ArrayBuffer;
}

export interface ModuleProgress {
  moduleId: string;
  phaseId: string;
  completedLessons: number;
  totalLessons: number;
  masteryGatePassed: boolean;
  unlockedAt: number;
  /**
   * Encrypted envelope of the behavioral fields (everything except keypath
   * + indexed fields). At-rest encryption per P5-A.3. Wrapper hydrates
   * before returning to callers.
   */
  _e?: ArrayBuffer;
}

export interface PhaseProgress {
  phaseId: string;
  unlocked: boolean;
  unlockedAt: number | null;
  completedAt: number | null;
  verificationScore: number | null;
}
