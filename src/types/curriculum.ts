export interface LessonProgress {
  lessonId: string;
  phaseId: string;
  moduleId: string;
  startedAt: number;
  completedAt: number | null;
  scrollPercent: number;
  timeSpentMs: number;
  quizPassed: boolean;
  xpEarned: number;
  synced: 0 | 1;
}

export interface ModuleProgress {
  moduleId: string;
  phaseId: string;
  completedLessons: number;
  totalLessons: number;
  masteryGatePassed: boolean;
  unlockedAt: number;
}

export interface PhaseProgress {
  phaseId: string;
  unlocked: boolean;
  unlockedAt: number | null;
  completedAt: number | null;
  verificationScore: number | null;
}
