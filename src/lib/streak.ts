import { daysBetween } from "@/lib/utils";

/**
 * Streak tracking.
 *
 * Activity on consecutive local days extends the streak. Missing a day
 * breaks it unless a freeze is available (1/week).
 */

export interface StreakState {
  current: number;
  longest: number;
  lastActivityAt: number | null;
  freezesAvailable: number;
  freezesEarnedAt: number | null;
}

export const INITIAL_STREAK: StreakState = {
  current: 0,
  longest: 0,
  lastActivityAt: null,
  freezesAvailable: 1,
  freezesEarnedAt: null,
};

const FREEZE_REGEN_DAYS = 7;

function regenerateFreezes(state: StreakState, now: number): StreakState {
  if (!state.freezesEarnedAt) {
    return { ...state, freezesEarnedAt: now };
  }
  const daysSince = daysBetween(state.freezesEarnedAt, now);
  if (daysSince >= FREEZE_REGEN_DAYS && state.freezesAvailable < 1) {
    return { ...state, freezesAvailable: 1, freezesEarnedAt: now };
  }
  return state;
}

/** Record activity for "now" and return the updated streak state. */
export function recordActivity(state: StreakState, now: number = Date.now()): StreakState {
  const regenerated = regenerateFreezes(state, now);

  if (!regenerated.lastActivityAt) {
    return {
      ...regenerated,
      current: 1,
      longest: Math.max(1, regenerated.longest),
      lastActivityAt: now,
      freezesEarnedAt: regenerated.freezesEarnedAt ?? now,
    };
  }

  const gap = daysBetween(regenerated.lastActivityAt, now);

  if (gap === 0) {
    return { ...regenerated, lastActivityAt: now };
  }

  if (gap === 1) {
    const next = regenerated.current + 1;
    return {
      ...regenerated,
      current: next,
      longest: Math.max(next, regenerated.longest),
      lastActivityAt: now,
    };
  }

  // gap > 1: try to use a freeze for a single missed day
  if (gap === 2 && regenerated.freezesAvailable > 0) {
    const next = regenerated.current + 1;
    return {
      ...regenerated,
      current: next,
      longest: Math.max(next, regenerated.longest),
      lastActivityAt: now,
      freezesAvailable: regenerated.freezesAvailable - 1,
    };
  }

  // streak broken
  return {
    ...regenerated,
    current: 1,
    longest: Math.max(1, regenerated.longest),
    lastActivityAt: now,
  };
}

/** True if the streak would still be intact at "now". */
export function isStreakAlive(state: StreakState, now: number = Date.now()): boolean {
  if (!state.lastActivityAt) return false;
  return daysBetween(state.lastActivityAt, now) <= 1;
}
