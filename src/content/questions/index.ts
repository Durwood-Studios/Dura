import type { AssessmentQuestion } from "@/types/assessment";
import { PHASE_0_QUESTIONS } from "@/content/questions/phase-0";
import { PHASE_1_QUESTIONS } from "@/content/questions/phase-1";
import { PHASE_2_QUESTIONS } from "@/content/questions/phase-2";
import { PHASE_3_QUESTIONS } from "@/content/questions/phase-3";
import { PHASE_4_QUESTIONS } from "@/content/questions/phase-4";
import { PHASE_5_QUESTIONS } from "@/content/questions/phase-5";
import { PHASE_6_QUESTIONS } from "@/content/questions/phase-6";

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
];

export function getAllQuestions(): AssessmentQuestion[] {
  return ALL_QUESTIONS;
}

export function getQuestionsByPhase(phaseId: string): AssessmentQuestion[] {
  return ALL_QUESTIONS.filter((q) => q.phaseId === phaseId);
}

export function getQuestionsByModule(moduleId: string): AssessmentQuestion[] {
  return ALL_QUESTIONS.filter((q) => q.moduleId === moduleId);
}
