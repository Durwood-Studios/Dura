/**
 * Dojo session store.
 *
 * Manages the 6 flow states:
 *   READY → QUESTION → EVALUATING → SCORED → CONTINUING → COMPLETE
 *
 * Tier state (T1/T3) is probed once per session mount and cached here.
 */

import { create } from "zustand";
import {
  probeOllama,
  gradeViaOllama,
  gradeViaFallback,
  type InferenceTier,
  type GradeResult,
} from "@/lib/dojo/inference";
import { track } from "@/lib/analytics";
import { putDojoSession } from "@/lib/db/dojo";
import { generateId } from "@/lib/utils";
import type { DojoSession } from "@/types/dojo";

export type DojoFlowState =
  | "READY"
  | "QUESTION"
  | "EVALUATING"
  | "SCORED"
  | "CONTINUING"
  | "COMPLETE";

export interface DojoQuestion {
  id: string;
  text: string;
  /** For T3 fallback scoring */
  correctAnswer?: string;
  phase: string;
}

export interface DojoSessionResult {
  questionId: string;
  answer: string;
  grade: GradeResult;
  timeMs: number;
}

interface DojoState {
  tier: InferenceTier | null;
  tierProbed: boolean;
  flowState: DojoFlowState;
  questions: DojoQuestion[];
  currentIndex: number;
  answer: string;
  streamedText: string;
  pendingScore: number | null;
  currentGrade: GradeResult | null;
  results: DojoSessionResult[];
  questionStartedAt: number | null;
  sessionStartedAt: number | null;

  probeTier: () => Promise<void>;
  startSession: (phaseFilter?: string) => void;
  beginQuestion: () => void;
  setAnswer: (text: string) => void;
  submitAnswer: () => Promise<void>;
  nextQuestion: () => void;
  reset: () => void;
}

const SESSION_LENGTH = 5;

/** Dynamic import keeps the 504-question bank out of the Dojo initial bundle. */
async function pickQuestions(phaseFilter?: string): Promise<DojoQuestion[]> {
  const { ALL_QUESTIONS } = await import("@/content/questions");
  const pool = phaseFilter ? ALL_QUESTIONS.filter((q) => q.phaseId === phaseFilter) : ALL_QUESTIONS;

  const openEnded = pool.filter(
    (q) => q.type === "multiple-choice" || q.type === "multiple-select"
  );
  const shuffled = [...openEnded].sort(() => Math.random() - 0.5).slice(0, SESSION_LENGTH);

  return shuffled.map((q) => ({
    id: q.id,
    text: q.question,
    correctAnswer: Array.isArray(q.correct)
      ? q.correct.map((i: number) => q.options[i]).join("; ")
      : (q.options[q.correct as number] ?? ""),
    phase: q.phaseId,
  }));
}

export const useDojoStore = create<DojoState>((set, get) => ({
  tier: null,
  tierProbed: false,
  flowState: "READY",
  questions: [],
  currentIndex: 0,
  answer: "",
  streamedText: "",
  pendingScore: null,
  currentGrade: null,
  results: [],
  questionStartedAt: null,
  sessionStartedAt: null,

  probeTier: async () => {
    if (get().tierProbed) return;
    const available = await probeOllama();
    set({ tier: available ? "T1" : "T3", tierProbed: true });
  },

  startSession: (phaseFilter?: string) => {
    void pickQuestions(phaseFilter).then((questions) => {
      set({
        flowState: "READY",
        questions,
        currentIndex: 0,
        answer: "",
        streamedText: "",
        pendingScore: null,
        currentGrade: null,
        results: [],
        sessionStartedAt: Date.now(),
      });
    });
    void track("dojo_session_started", {
      tier: get().tier ?? "unknown",
      phaseFilter: phaseFilter ?? "mixed",
    });
  },

  beginQuestion: () => {
    set({
      flowState: "QUESTION",
      answer: "",
      streamedText: "",
      pendingScore: null,
      currentGrade: null,
      questionStartedAt: Date.now(),
    });
  },

  setAnswer: (text: string) => set({ answer: text }),

  submitAnswer: async () => {
    const { tier, questions, currentIndex, answer, results, questionStartedAt } = get();
    const question = questions[currentIndex];
    if (!question || !answer.trim()) return;

    set({ flowState: "EVALUATING", streamedText: "", pendingScore: null });

    const timeMs = questionStartedAt ? Date.now() - questionStartedAt : 0;

    if (tier === "T1") {
      await gradeViaOllama(question.text, answer, {
        onToken: (token) => set((s) => ({ streamedText: s.streamedText + token })),
        onScore: (score) => set({ pendingScore: score }),
        onGap: () => {},
        onDone: (grade) => {
          set({
            flowState: "SCORED",
            currentGrade: grade,
            results: [...results, { questionId: question.id, answer, grade, timeMs }],
          });
        },
        onError: () => {
          const grade = gradeViaFallback(question.text, answer, question.correctAnswer);
          set({
            tier: "T3",
            flowState: "SCORED",
            currentGrade: grade,
            results: [...results, { questionId: question.id, answer, grade, timeMs }],
          });
        },
      });
    } else {
      const grade = gradeViaFallback(question.text, answer, question.correctAnswer);
      await new Promise<void>((r) => setTimeout(r, 600));
      set({
        flowState: "SCORED",
        currentGrade: grade,
        results: [...results, { questionId: question.id, answer, grade, timeMs }],
      });
    }
  },

  nextQuestion: () => {
    const { currentIndex, questions, results, tier, sessionStartedAt } = get();
    if (currentIndex + 1 >= questions.length) {
      const avgScore =
        results.length > 0
          ? Math.round((results.reduce((sum, r) => sum + r.grade.score, 0) / results.length) * 10) /
            10
          : 0;
      const session: DojoSession = {
        id: generateId("dojo"),
        startedAt: sessionStartedAt ?? Date.now(),
        completedAt: Date.now(),
        tier: tier ?? "T3",
        phaseFilter: questions[0]?.phase,
        results: results.map((r) => ({
          questionId: r.questionId,
          questionText: questions.find((q) => q.id === r.questionId)?.text ?? "",
          answer: r.answer,
          score: r.grade.score,
          gap: r.grade.gap,
          feedback: r.grade.feedback,
          timeMs: r.timeMs,
        })),
        avgScore,
      };
      void putDojoSession(session);
      set({ flowState: "COMPLETE" });
      void track("dojo_session_complete", { questions: questions.length });
    } else {
      set({ currentIndex: currentIndex + 1, flowState: "CONTINUING" });
    }
  },

  reset: () =>
    set({
      flowState: "READY",
      questions: [],
      currentIndex: 0,
      answer: "",
      streamedText: "",
      pendingScore: null,
      currentGrade: null,
      results: [],
      questionStartedAt: null,
      sessionStartedAt: null,
    }),
}));
