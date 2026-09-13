import { lessonRouteId } from "@/lib/lesson-identity";
import {
  MINUTES_PER_CARD,
  PRESSURE_BUCKETS,
  REMEDIATION_STREAK,
  STALE_REVIEW_DAMPENING,
  STALE_REVIEW_DAYS,
  TARGET_BLOCK_MINUTES,
} from "./policy";
import type {
  DailyPlan,
  PhaseProgress,
  PlanBlock,
  PrescriptionInputs,
  SessionSignal,
  SignalQuality,
} from "./types";

/**
 * buildPlan — pure function. Given local FSRS summary + phase progress +
 * (optional) session signal + preferences, return a deterministic plan.
 *
 * Determinism check (the test asserts this): buildPlan(x) === buildPlan(x),
 * no clock, no random, no I/O. Same inputs → identical plan, every time.
 *
 * Honest about uncertainty: when the inputs are sparse the signalQuality
 * downgrades and the summary says so. The algorithm never pretends to know
 * what it doesn't.
 */
export function buildPlan(inputs: PrescriptionInputs): DailyPlan {
  const isColdStart = isFreshLearner(inputs);
  if (isColdStart) {
    return coldStartPlan(inputs);
  }

  const remediation = detectRemediation(inputs.session);
  if (remediation) {
    return remediationPlan(inputs, remediation);
  }

  const fsrsShare = pressureShare(inputs.fsrs.dueNow);
  const dampening = inputs.fsrs.oldestOverdueDays >= STALE_REVIEW_DAYS ? STALE_REVIEW_DAMPENING : 1;
  const fsrsMinutes = Math.round(inputs.preferences.targetMinutes * fsrsShare * dampening);
  const advanceMinutes = inputs.preferences.targetMinutes - fsrsMinutes;

  const blocks: PlanBlock[] = [];

  if (fsrsMinutes > 0) {
    blocks.push(fsrsBlock(inputs.fsrs.dueNow, fsrsMinutes));
  }

  const advanceBlocks = splitAdvance(advanceMinutes, inputs.phase);
  blocks.push(...advanceBlocks);

  const signalQuality = computeSignalQuality(inputs);
  return {
    totalMinutes: blocks.reduce((sum, b) => sum + b.minutes, 0),
    blocks,
    signalQuality,
    summary: summarize(blocks, signalQuality, inputs),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Signal-quality detection
// ─────────────────────────────────────────────────────────────────────────────

function isFreshLearner(inputs: PrescriptionInputs): boolean {
  const noFsrs = inputs.fsrs.dueNow === 0 && inputs.fsrs.newCount === 0;
  const atPhaseZero =
    inputs.phase.currentPhase === 0 &&
    inputs.phase.lessonsCompletedInModule === 0 &&
    lessonRouteId(inputs.phase.currentLessonId) === "01";
  return noFsrs && atPhaseZero;
}

function computeSignalQuality(inputs: PrescriptionInputs): SignalQuality {
  const hasFsrs = inputs.fsrs.dueNow > 0 || inputs.fsrs.newCount > 0;
  const hasSession = (inputs.session?.recentRatings.length ?? 0) >= 2;
  if (hasFsrs && hasSession) return "calibrated";
  if (hasFsrs || hasSession) return "warming";
  return "fresh";
}

// ─────────────────────────────────────────────────────────────────────────────
// Pressure → share-of-time table lookup
// ─────────────────────────────────────────────────────────────────────────────

export function pressureShare(dueNow: number): number {
  if (dueNow === 0) return 0;
  for (const bucket of PRESSURE_BUCKETS) {
    if (dueNow >= bucket.duePastThreshold) return bucket.fsrsShare;
  }
  return 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// Block builders
// ─────────────────────────────────────────────────────────────────────────────

function fsrsBlock(dueNow: number, minutes: number): PlanBlock {
  const targetCards = Math.max(1, Math.floor(minutes / MINUTES_PER_CARD));
  const cards = Math.min(targetCards, dueNow);
  return {
    kind: "fsrs-review",
    minutes,
    title: "Spaced-repetition review",
    target: `${cards} card${cards === 1 ? "" : "s"}`,
    href: "/review",
    rationale:
      dueNow >= 50
        ? `${dueNow} cards overdue — paying down the review debt comes first.`
        : dueNow >= 20
          ? `${dueNow} cards due — keeping the deck healthy.`
          : `${dueNow} cards due — quick warm-up before advancing.`,
  };
}

function lessonBlock(phase: PhaseProgress, minutes: number, suffix?: string): PlanBlock {
  const progressFraction =
    phase.lessonsInModule > 0
      ? Math.round((phase.lessonsCompletedInModule / phase.lessonsInModule) * 100)
      : 0;
  const target = "Your current lesson";
  return {
    kind: "lesson",
    minutes,
    title: suffix ? "Take it at your own pace" : "Continue learning",
    target,
    href: `/paths/${phase.currentPhase}/${phase.currentModuleId}/${lessonRouteId(phase.currentLessonId)}`,
    rationale:
      progressFraction > 0
        ? `${phase.lessonsCompletedInModule} of ${phase.lessonsInModule} lessons complete in this module.`
        : "Read the explanation, try the practice, then check what you learned.",
  };
}

function masteryGateBlock(phase: PhaseProgress, minutes: number): PlanBlock {
  const remaining = Math.max(0, phase.masteryGate.correctNeeded - phase.masteryGate.correctSoFar);
  return {
    kind: "mastery-gate",
    minutes,
    title: "Mastery-gate practice",
    target: `${remaining} more correct to unlock`,
    href: `/paths/${phase.currentPhase}/${phase.currentModuleId}`,
    rationale: `${phase.masteryGate.correctSoFar}/${phase.masteryGate.correctNeeded} correct in this session. Practice closes the gate.`,
  };
}

function remediationBlock(phase: PhaseProgress, minutes: number, topic: string): PlanBlock {
  return {
    kind: "remediation",
    minutes,
    title: "Focused remediation",
    target: topic,
    href: `/paths/${phase.currentPhase}/${phase.currentModuleId}/${lessonRouteId(phase.currentLessonId)}`,
    rationale: `Three consecutive "again" ratings on this topic — re-deriving from scratch beats grinding more cards.`,
  };
}

function freshStartBlock(minutes: number): PlanBlock {
  return {
    kind: "fresh-start",
    minutes,
    title: "Start with the foundations",
    target: "How Computers Think",
    href: "/paths/0/0-1/01",
    rationale: "Discover how computers represent information, then try it for yourself.",
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Advance-time splitter
// ─────────────────────────────────────────────────────────────────────────────

function splitAdvance(minutes: number, phase: PhaseProgress): PlanBlock[] {
  if (minutes < 1) return [];
  if (!phase.masteryGate.available || minutes <= TARGET_BLOCK_MINUTES + 2) {
    return [lessonBlock(phase, minutes)];
  }
  const blocks: PlanBlock[] = [];
  const lessonMinutes = Math.min(TARGET_BLOCK_MINUTES, minutes);
  blocks.push(lessonBlock(phase, lessonMinutes));
  const remaining = minutes - lessonMinutes;
  if (remaining < 1) return blocks;

  // If a mastery gate is available, the second slice goes to gate practice —
  // unlocking the next module is the most valuable thing the learner can do
  // with the time.
  if (phase.masteryGate.available) {
    blocks.push(masteryGateBlock(phase, remaining));
    return blocks;
  }

  return blocks;
}

// ─────────────────────────────────────────────────────────────────────────────
// Adaptation helpers
// ─────────────────────────────────────────────────────────────────────────────

function detectRemediation(session: SessionSignal | undefined): string | null {
  if (!session) return null;
  const againRun = consecutiveTail(session.recentRatings, "again");
  if (againRun >= REMEDIATION_STREAK) {
    return session.recentTopicTag ?? "current topic";
  }
  return null;
}

function consecutiveTail<T>(arr: T[], target: T): number {
  let n = 0;
  for (let i = arr.length - 1; i >= 0 && arr[i] === target; i--) {
    n++;
  }
  return n;
}

// ─────────────────────────────────────────────────────────────────────────────
// Special-case plans
// ─────────────────────────────────────────────────────────────────────────────

function coldStartPlan(inputs: PrescriptionInputs): DailyPlan {
  const minutes = inputs.preferences.targetMinutes;
  const blocks: PlanBlock[] = [freshStartBlock(minutes)];
  return {
    totalMinutes: minutes,
    blocks,
    signalQuality: "fresh",
    summary: "Begin with one lesson. Take your time with the examples and practice.",
  };
}

function remediationPlan(inputs: PrescriptionInputs, topic: string): DailyPlan {
  const minutes = inputs.preferences.targetMinutes;
  const remMinutes = Math.round(minutes * 0.6);
  const reviewMinutes = minutes - remMinutes;
  const blocks: PlanBlock[] = [remediationBlock(inputs.phase, remMinutes, topic)];
  if (reviewMinutes >= 5 && inputs.fsrs.dueNow > 0) {
    blocks.push(fsrsBlock(inputs.fsrs.dueNow, reviewMinutes));
  } else if (reviewMinutes >= 5) {
    blocks.push(lessonBlock(inputs.phase, reviewMinutes, "lighter pace"));
  }
  return {
    totalMinutes: blocks.reduce((sum, b) => sum + b.minutes, 0),
    blocks,
    signalQuality: computeSignalQuality(inputs),
    summary: `Three rough attempts in a row — the session is telling us to slow down on "${topic}" rather than push forward.`,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Summary line
// ─────────────────────────────────────────────────────────────────────────────

function summarize(
  blocks: PlanBlock[],
  signalQuality: SignalQuality,
  inputs: PrescriptionInputs
): string {
  const minutes = blocks.reduce((sum, b) => sum + b.minutes, 0);
  const honesty =
    signalQuality === "fresh"
      ? "A little time to build your skills"
      : signalQuality === "warming"
        ? "Build on what you have learned"
        : "Calibrated to your recent work";
  const debt =
    inputs.fsrs.dueNow >= 50
      ? "; review debt is heavy, the plan pays it down first"
      : inputs.fsrs.dueNow > 0
        ? `; ${inputs.fsrs.dueNow} cards due`
        : "";
  return `${honesty} — ${minutes} min planned${debt}.`;
}
