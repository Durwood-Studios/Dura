import { addDailyStudyTime } from "@/lib/daily-study-time";
import { ACTIVITY_EVIDENCE_SCHEMA, type ActivityEvidence } from "@/lib/activity-evidence";
import {
  getOwnerGeneration,
  assertOwnerGeneration,
  waitForOwnerInitialization,
} from "@/lib/storage/owner";
import { lessonIdentity } from "@/lib/lesson-identity";
import { create } from "zustand";
import { putLessonProgress, getLessonProgress } from "@/lib/db/progress";
import { track } from "@/lib/analytics";
import type { LessonProgress } from "@/types/curriculum";

interface ProgressState {
  current: LessonProgress | null;
  currentOwnerGeneration: number;
  scrollPercent: number;
  timeSpentMs: number;
  quizPassed: boolean;
  quizScore: number | null;
  startedAt: number | null;

  start: (lessonId: string, phaseId: string, moduleId: string) => Promise<void>;
  setScroll: (percent: number) => void;
  tick: (deltaMs: number) => void;
  passQuiz: () => void;
  setQuizScore: (score: number) => Promise<void>;
  complete: (xp: number) => Promise<void>;
  reset: () => void;
  recordActivity: (
    lessonId: string,
    activityId: string,
    evidence: ActivityEvidence
  ) => Promise<void>;
}

let startRequest = 0;

export const useProgressStore = create<ProgressState>((set, get) => ({
  current: null,
  currentOwnerGeneration: getOwnerGeneration(),
  scrollPercent: 0,
  timeSpentMs: 0,
  quizPassed: false,
  quizScore: null,
  startedAt: null,

  start: async (lessonId: string, phaseId: string, moduleId: string): Promise<void> => {
    const request = ++startRequest;
    await waitForOwnerInitialization();
    const ownerGeneration = getOwnerGeneration();
    if (request !== startRequest) return;
    set({
      current: null,
      currentOwnerGeneration: ownerGeneration,
      scrollPercent: 0,
      timeSpentMs: 0,
      quizPassed: false,
      quizScore: null,
      startedAt: null,
    });
    lessonId = lessonIdentity(phaseId, moduleId, lessonId);
    const existing = await getLessonProgress(lessonId);
    if (request !== startRequest) return;
    assertOwnerGeneration(ownerGeneration);
    const next: LessonProgress = existing ?? {
      lessonId,
      phaseId,
      moduleId,
      startedAt: Date.now(),
      completedAt: null,
      scrollPercent: 0,
      timeSpentMs: 0,
      quizPassed: false,
      quizScore: null,
      xpEarned: 0,
      synced: 0,
    };
    if (!existing) await putLessonProgress(next);
    if (request !== startRequest) return;
    assertOwnerGeneration(ownerGeneration);
    set({
      current: next,
      scrollPercent: next.scrollPercent,
      timeSpentMs: next.timeSpentMs,
      quizPassed: next.quizPassed,
      quizScore: next.quizScore ?? null,
      startedAt: Date.now(),
    });
    void track("lesson_started", { lessonId, phaseId, moduleId });
  },

  setScroll: (percent: number): void => {
    if (!Number.isFinite(percent)) return;
    const max = Math.max(get().scrollPercent, Math.min(100, Math.max(0, percent)));
    set({ scrollPercent: max });
  },

  tick: (deltaMs: number): void => {
    if (!Number.isFinite(deltaMs) || deltaMs < 0 || deltaMs > 60000) return;
    const state = get();
    const timeSpentMs = state.timeSpentMs + deltaMs;
    const current = state.current
      ? {
          ...state.current,
          timeSpentMs,
          dailyTimeMs: addDailyStudyTime(state.current.dailyTimeMs ?? {}, deltaMs),
          synced: 0 as const,
        }
      : null;
    set({ timeSpentMs, current });
    if (current)
      void putLessonProgress(current).catch((error: unknown): void =>
        console.error("[progress] Study time save failed", error)
      );
  },

  recordActivity: async (
    lessonId: string,
    activityId: string,
    evidence: ActivityEvidence
  ): Promise<void> => {
    const current = get().current;
    if (!current || current.lessonId !== lessonId)
      throw new Error("The lesson is still loading. Your response has not been saved yet.");
    const ownerGeneration = get().currentOwnerGeneration;
    assertOwnerGeneration(ownerGeneration);
    const parsed = ACTIVITY_EVIDENCE_SCHEMA.parse(evidence);
    const updated: LessonProgress = {
      ...current,
      activityEvidence: { ...current.activityEvidence, [activityId]: parsed },
      synced: 0,
    };
    set({ current: updated });
    try {
      await putLessonProgress(updated);
    } catch (error: unknown) {
      const latest = get().current;
      if (
        getOwnerGeneration() === ownerGeneration &&
        get().currentOwnerGeneration === ownerGeneration &&
        latest?.lessonId === lessonId &&
        latest.activityEvidence?.[activityId]?.updatedAt === parsed.updatedAt
      ) {
        const restored = { ...latest.activityEvidence };
        const previous = current.activityEvidence?.[activityId];
        if (previous) restored[activityId] = previous;
        else delete restored[activityId];
        set({ current: { ...latest, activityEvidence: restored } });
      }
      throw error;
    }
  },

  passQuiz: () => set({ quizPassed: true }),

  setQuizScore: async (score: number): Promise<void> => {
    if (!Number.isFinite(score) || score < 0 || score > 1) return;
    const current = get().current;
    if (!current) return;
    const updated: LessonProgress = {
      ...current,
      quizScore: score,
      quizPassed: get().quizPassed || current.quizPassed || score >= 0.8,
      synced: 0,
    };
    set({ current: updated, quizScore: score, quizPassed: updated.quizPassed });
    await putLessonProgress(updated);
  },

  complete: async (xp: number): Promise<void> => {
    const request = startRequest;
    const current = get().current;
    if (!current || current.completedAt !== null) return;
    const completed: LessonProgress = {
      ...current,
      scrollPercent: get().scrollPercent,
      timeSpentMs: get().timeSpentMs,
      quizPassed: get().quizPassed,
      quizScore: get().quizScore,
      completedAt: Date.now(),
      xpEarned: xp,
      synced: 0,
    };
    await putLessonProgress(completed);
    if (request === startRequest && get().current?.lessonId === current.lessonId)
      set({ current: completed });
  },

  reset: (): void => {
    startRequest++;
    set({
      current: null,
      scrollPercent: 0,
      timeSpentMs: 0,
      quizPassed: false,
      quizScore: null,
      startedAt: null,
    });
  },
}));
