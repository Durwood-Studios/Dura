import type { AssessmentQuestion } from "@/types/assessment";
import { PHASE_0_QUESTIONS } from "@/content/questions/phase-0";
import { PHASE_1_QUESTIONS } from "@/content/questions/phase-1";
import { PHASE_2_QUESTIONS } from "@/content/questions/phase-2";
import { PHASE_3_QUESTIONS } from "@/content/questions/phase-3";
import { PHASE_4_QUESTIONS } from "@/content/questions/phase-4";
import { PHASE_5_QUESTIONS } from "@/content/questions/phase-5";
import { PHASE_6_QUESTIONS } from "@/content/questions/phase-6";
import { PHASE_7_QUESTIONS } from "@/content/questions/phase-7";
import { PHASE_8_QUESTIONS } from "@/content/questions/phase-8";
import { PHASE_9_QUESTIONS } from "@/content/questions/phase-9";
import { PHASE_10_QUESTIONS } from "@/content/questions/phase-10";
import { PHASE_11_QUESTIONS } from "@/content/questions/phase-11";
import { PHASE_12_QUESTIONS } from "@/content/questions/phase-12";
import { PHASE_13_QUESTIONS } from "@/content/questions/phase-13";
import { PHASE_14_QUESTIONS } from "@/content/questions/phase-14";

/**
 * Every authored question across every phase. Isomorphic — safe to
 * import from client components. New phase banks register here by
 * adding an import and spreading into ALL_QUESTIONS.
 */
export const ALL_QUESTIONS: AssessmentQuestion[] = [
  ...PHASE_0_QUESTIONS,
  ...PHASE_1_QUESTIONS,
  ...PHASE_2_QUESTIONS,
  ...PHASE_3_QUESTIONS,
  ...PHASE_4_QUESTIONS,
  ...PHASE_5_QUESTIONS,
  ...PHASE_6_QUESTIONS,
  ...PHASE_7_QUESTIONS,
  ...PHASE_8_QUESTIONS,
  ...PHASE_9_QUESTIONS,
  ...PHASE_10_QUESTIONS,
  ...PHASE_11_QUESTIONS,
  ...PHASE_12_QUESTIONS,
  ...PHASE_13_QUESTIONS,
  ...PHASE_14_QUESTIONS,
];

/**
 * Total number of assessment questions across all phases.
 * Import this (not ALL_QUESTIONS) when you only need a count — it avoids
 * bundling the full question bank into client components.
 */
export const QUESTION_COUNT: number =
  PHASE_0_QUESTIONS.length +
  PHASE_1_QUESTIONS.length +
  PHASE_2_QUESTIONS.length +
  PHASE_3_QUESTIONS.length +
  PHASE_4_QUESTIONS.length +
  PHASE_5_QUESTIONS.length +
  PHASE_6_QUESTIONS.length +
  PHASE_7_QUESTIONS.length +
  PHASE_8_QUESTIONS.length +
  PHASE_9_QUESTIONS.length +
  PHASE_10_QUESTIONS.length +
  PHASE_11_QUESTIONS.length +
  PHASE_12_QUESTIONS.length +
  PHASE_13_QUESTIONS.length +
  PHASE_14_QUESTIONS.length;

export function getAllQuestions(): AssessmentQuestion[] {
  return ALL_QUESTIONS;
}

export function getQuestionsByPhase(phaseId: string): AssessmentQuestion[] {
  return ALL_QUESTIONS.filter((q) => q.phaseId === phaseId);
}

export function getQuestionsByModule(moduleId: string): AssessmentQuestion[] {
  return ALL_QUESTIONS.filter((q) => q.moduleId === moduleId);
}
