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
import { ALL_QUESTIONS } from "@/content/questions";
import { track } from "@/lib/analytics";

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
  // Session config
  tier: InferenceTier | null;
  tierProbed: boolean;

  // Flow
  flowState: DojoFlowState;
  questions: DojoQuestion[];
  currentIndex: number;
  answer: string;

  // Streaming AI state (EVALUATING)
  streamedText: string;
  pendingScore: number | null;

  // Results (SCORED)
  currentGrade: GradeResult | null;
  results: DojoSessionResult[];
  questionStartedAt: number | null;

  // Session summary (COMPLETE)
  sessionStartedAt: number | null;

  // Actions
  probeTier: () => Promise<void>;
  startSession: (phaseFilter?: string) => void;
  beginQuestion: () => void;
  setAnswer: (text: string) => void;
  submitAnswer: () => Promise<void>;
  nextQuestion: () => void;
  reset: () => void;
}

const SESSION_LENGTH = 5;

function pickQuestions(phaseFilter?: string): DojoQuestion[] {
  const pool = phaseFilter ? ALL_QUESTIONS.filter((q) => q.phaseId === phaseFilter) : ALL_QUESTIONS;

  // Convert AssessmentQuestion → DojoQuestion (open-ended framing)
  const openEnded = pool.filter(
    (q) => q.type === "multiple-choice" || q.type === "multiple-select"
  );
  const shuffled = [...openEnded].sort(() => Math.random() - 0.5).slice(0, SESSION_LENGTH);

  return shuffled.map((q) => ({
    id: q.id,
    text: q.question,
    correctAnswer: Array.isArray(q.correct)
      ? q.correct.map((i) => q.options[i]).join("; ")
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
    const questions = pickQuestions(phaseFilter);
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
          // T1 failed mid-stream — fall back to T3
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
      // T3 — instant, no streaming
      const grade = gradeViaFallback(question.text, answer, question.correctAnswer);
      // Brief pause so the EVALUATING state is perceptible
      await new Promise<void>((r) => setTimeout(r, 600));
      set({
        flowState: "SCORED",
        currentGrade: grade,
        results: [...results, { questionId: question.id, answer, grade, timeMs }],
      });
    }
  },

  nextQuestion: () => {
    const { currentIndex, questions } = get();
    if (currentIndex + 1 >= questions.length) {
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
