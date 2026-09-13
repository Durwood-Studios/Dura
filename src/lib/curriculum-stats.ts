import { PHASES } from "@/content/phases";

/** Headline counts derive from the registry; tests reconcile it against the actual content tree. */
export const TOTAL_PHASES = PHASES.length;
export const TOTAL_MODULES = PHASES.reduce((sum, phase) => sum + phase.modules.length, 0);
export const TOTAL_LESSONS = PHASES.reduce((sum, phase) => sum + phase.lessonCount, 0);
