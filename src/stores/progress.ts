import { create } from "zustand";
import { putLessonProgress, getLessonProgress } from "@/lib/db/progress";
import type { LessonProgress } from "@/types/curriculum";

interface ProgressState {
  current: LessonProgress | null;
  scrollPercent: number;
  timeSpentMs: number;
  quizPassed: boolean;
  startedAt: number | null;

  start: (lessonId: string, phaseId: string, moduleId: string) => Promise<void>;
  setScroll: (percent: number) => void;
  tick: (deltaMs: number) => void;
  passQuiz: () => void;
  complete: (xp: number) => Promise<void>;
  reset: () => void;
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  current: null,
  scrollPercent: 0,
  timeSpentMs: 0,
  quizPassed: false,
  startedAt: null,

  start: async (lessonId, phaseId, moduleId) => {
    const existing = await getLessonProgress(lessonId);
    const next: LessonProgress = existing ?? {
      lessonId,
      phaseId,
      moduleId,
      startedAt: Date.now(),
      completedAt: null,
      scrollPercent: 0,
      timeSpentMs: 0,
      quizPassed: false,
      xpEarned: 0,
      synced: 0,
    };
    set({
      current: next,
      scrollPercent: next.scrollPercent,
      timeSpentMs: next.timeSpentMs,
      quizPassed: next.quizPassed,
      startedAt: Date.now(),
    });
    if (!existing) await putLessonProgress(next);
  },

  setScroll: (percent) => {
    const max = Math.max(get().scrollPercent, percent);
    set({ scrollPercent: max });
  },

  tick: (deltaMs) => {
    set({ timeSpentMs: get().timeSpentMs + deltaMs });
  },

  passQuiz: () => set({ quizPassed: true }),

  complete: async (xp) => {
    const current = get().current;
    if (!current) return;
    const completed: LessonProgress = {
      ...current,
      scrollPercent: get().scrollPercent,
      timeSpentMs: get().timeSpentMs,
      quizPassed: get().quizPassed,
      completedAt: Date.now(),
      xpEarned: xp,
      synced: 0,
    };
    set({ current: completed });
    await putLessonProgress(completed);
  },

  reset: () =>
    set({
      current: null,
      scrollPercent: 0,
      timeSpentMs: 0,
      quizPassed: false,
      startedAt: null,
    }),
}));
