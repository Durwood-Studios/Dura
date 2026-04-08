export type QuestionType = "multiple-choice" | "multiple-select" | "true-false" | "code-output";
export type QuestionDifficulty = "easy" | "medium" | "hard";
export type AssessmentType = "mastery-gate" | "phase-verification" | "skill-assessment";

export interface AssessmentQuestion {
  id: string;
  phaseId: string;
  moduleId: string;
  type: QuestionType;
  question: string;
  options: string[];
  /** Index for single-answer types, array of indexes for multi-select. */
  correct: number | number[];
  explanation: string;
  difficulty: QuestionDifficulty;
  tags: string[];
  standards?: {
    cs2023?: string[];
    swebok?: string[];
    bloom?: string;
  };
}

export interface QuestionResult {
  questionId: string;
  selectedAnswer: number | number[] | null;
  correct: boolean;
  timeSpentMs: number;
}

export interface AssessmentResult {
  id: string;
  type: AssessmentType;
  targetId: string;
  score: number;
  totalQuestions: number;
  correctCount: number;
  passed: boolean;
  startedAt: number;
  completedAt: number;
  timeSpentMs: number;
  questionResults: QuestionResult[];
}

export interface Certificate {
  id: string;
  phaseId: string;
  userId: string | null;
  displayName: string;
  phaseTitle: string;
  score: number;
  totalQuestions: number;
  completedAt: number;
  verificationHash: string;
  standards: string[];
}
