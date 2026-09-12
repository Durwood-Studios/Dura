import { lessonIdentity } from "@/lib/lesson-identity";
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

let startRequest = 0;

export const useProgressStore = create<ProgressState>((set, get) => ({
  current: null,
  scrollPercent: 0,
  timeSpentMs: 0,
  quizPassed: false,
  quizScore: null,
  startedAt: null,

  start: async (lessonId: string, phaseId: string, moduleId: string): Promise<void> => {
    const request = ++startRequest;
    set({
      current: null,
      scrollPercent: 0,
      timeSpentMs: 0,
      quizPassed: false,
      quizScore: null,
      startedAt: null,
    });
    lessonId = lessonIdentity(phaseId, moduleId, lessonId);
    const existing = await getLessonProgress(lessonId);
    if (request !== startRequest) return;
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
    if (!Number.isFinite(deltaMs) || deltaMs < 0) return;
    set({ timeSpentMs: get().timeSpentMs + deltaMs });
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
