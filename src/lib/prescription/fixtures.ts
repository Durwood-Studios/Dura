import type { PrescriptionInputs } from "./types";

/**
 * Reference input scenarios. Used by the demo page and the unit tests so the
 * algorithm's range is documented in one place — anyone can read the four
 * shapes here and reason about what the engine will produce.
 */

export const COLD_START: PrescriptionInputs = {
  fsrs: { dueNow: 0, oldestOverdueDays: 0, newCount: 0 },
  phase: {
    currentPhase: 0,
    currentModuleId: "0-1",
    currentLessonId: "01",
    lessonsCompletedInModule: 0,
    lessonsInModule: 5,
    masteryGate: { available: false, correctNeeded: 5, correctSoFar: 0 },
  },
  preferences: { targetMinutes: 30 },
};

export const LIGHT_REVIEW_DAY: PrescriptionInputs = {
  fsrs: { dueNow: 12, oldestOverdueDays: 1, newCount: 4 },
  phase: {
    currentPhase: 2,
    currentModuleId: "2-3",
    currentLessonId: "04",
    lessonsCompletedInModule: 3,
    lessonsInModule: 6,
    masteryGate: { available: false, correctNeeded: 5, correctSoFar: 1 },
  },
  session: { recentRatings: ["good", "good", "easy"] },
  preferences: { targetMinutes: 30 },
};

export const HEAVY_DEBT_RETURN: PrescriptionInputs = {
  fsrs: { dueNow: 73, oldestOverdueDays: 11, newCount: 0 },
  phase: {
    currentPhase: 3,
    currentModuleId: "3-2",
    currentLessonId: "02",
    lessonsCompletedInModule: 1,
    lessonsInModule: 4,
    masteryGate: { available: false, correctNeeded: 5, correctSoFar: 0 },
  },
  preferences: { targetMinutes: 30 },
};

export const REMEDIATION_TRIGGERED: PrescriptionInputs = {
  fsrs: { dueNow: 8, oldestOverdueDays: 0, newCount: 2 },
  phase: {
    currentPhase: 4,
    currentModuleId: "4-2",
    currentLessonId: "02",
    lessonsCompletedInModule: 2,
    lessonsInModule: 5,
    masteryGate: { available: false, correctNeeded: 5, correctSoFar: 2 },
  },
  session: {
    recentRatings: ["again", "again", "again"],
    recentTopicTag: "N+1 queries",
  },
  preferences: { targetMinutes: 30 },
};

export const GATE_AVAILABLE: PrescriptionInputs = {
  fsrs: { dueNow: 6, oldestOverdueDays: 0, newCount: 0 },
  phase: {
    currentPhase: 1,
    currentModuleId: "1-3",
    currentLessonId: "05",
    lessonsCompletedInModule: 5,
    lessonsInModule: 5,
    masteryGate: { available: true, correctNeeded: 5, correctSoFar: 3 },
  },
  session: { recentRatings: ["good", "easy", "good"] },
  preferences: { targetMinutes: 30 },
};

export const ALL_FIXTURES = [
  { id: "cold-start", label: "Cold start (no history)", inputs: COLD_START },
  { id: "light-review", label: "Light review day", inputs: LIGHT_REVIEW_DAY },
  { id: "heavy-debt", label: "Returning after 11 days", inputs: HEAVY_DEBT_RETURN },
  { id: "remediation", label: "Three rough attempts in a row", inputs: REMEDIATION_TRIGGERED },
  { id: "gate-ready", label: "Mastery gate within reach", inputs: GATE_AVAILABLE },
] as const;
