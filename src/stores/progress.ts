import { create } from "zustand";
import { putLessonProgress, getLessonProgress } from "@/lib/db/progress";
import { track } from "@/lib/analytics";
import type { LessonProgress } from "@/types/curriculum";

interface ProgressState {
  current: LessonProgress | null;
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
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  current: null,
  scrollPercent: 0,
  timeSpentMs: 0,
  quizPassed: false,
  quizScore: null,
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
      quizScore: null,
      xpEarned: 0,
      synced: 0,
    };
    set({
      current: next,
      scrollPercent: next.scrollPercent,
      timeSpentMs: next.timeSpentMs,
      quizPassed: next.quizPassed,
      quizScore: next.quizScore ?? null,
      startedAt: Date.now(),
    });
    if (!existing) await putLessonProgress(next);
    void track("lesson_started", { lessonId, phaseId, moduleId });
  },

  setScroll: (percent) => {
    const max = Math.max(get().scrollPercent, percent);
    set({ scrollPercent: max });
  },

  tick: (deltaMs) => {
    set({ timeSpentMs: get().timeSpentMs + deltaMs });
  },

  passQuiz: () => set({ quizPassed: true }),

  setQuizScore: async (score) => {
    set({ quizScore: score });
    const current = get().current;
    if (!current) return;
    const updated: LessonProgress = {
      ...current,
      quizScore: score,
      quizPassed: current.quizPassed || score >= 0.8,
      synced: 0,
    };
    set({ current: updated });
    await putLessonProgress(updated);
  },

  complete: async (xp) => {
    const current = get().current;
    if (!current) return;
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
    set({ current: completed });
    await putLessonProgress(completed);
  },

  reset: () =>
    set({
      current: null,
      scrollPercent: 0,
      timeSpentMs: 0,
      quizPassed: false,
      quizScore: null,
      startedAt: null,
    }),
}));
