import type { AssessmentQuestion } from "@/types/assessment";
import { PHASE_0_QUESTIONS } from "@/content/questions/phase-0";

/**
 * Every authored question across every phase. Isomorphic — safe to
 * import from client components. Phase 0 is the only pool today;
 * additional phase banks register here as they're authored.
 */
export const ALL_QUESTIONS: AssessmentQuestion[] = [...PHASE_0_QUESTIONS];

export function getAllQuestions(): AssessmentQuestion[] {
  return ALL_QUESTIONS;
}

export function getQuestionsByPhase(phaseId: string): AssessmentQuestion[] {
  return ALL_QUESTIONS.filter((q) => q.phaseId === phaseId);
}

export function getQuestionsByModule(moduleId: string): AssessmentQuestion[] {
  return ALL_QUESTIONS.filter((q) => q.moduleId === moduleId);
}
