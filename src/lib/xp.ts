/**
 * Dual point system: Activity Points (AP) + Mastery Points (MP).
 *
 * AP = effort and consistency (lessons, reviews, sandbox, quizzes)
 * MP = verified competence (mastery gates, phase verifications, module completions)
 *
 * AP level = floor(sqrt(totalAP / 100))
 * MP is a direct sum — no level curve. Higher MP = more proven skills.
 *
 * Both are shown on the dashboard. Only MP goes on certificates/portfolios.
 */

/** Activity Point awards (effort). */
export const AP_AWARDS = {
  lesson: 50,
  quiz: 10,
  flashcard: 5,
  sandbox: 25,
} as const;

/** Mastery Point awards (proof). */
export const MP_AWARDS = {
  moduleComplete: 100,
  verification: 250,
  phaseComplete: 500,
} as const;

/** Combined for backward compatibility. */
export const XP_AWARDS = {
  ...AP_AWARDS,
  ...MP_AWARDS,
} as const;

export type XPSource = keyof typeof XP_AWARDS;

export function awardFor(source: XPSource): number {
  return XP_AWARDS[source];
}

export function levelFromXP(totalXp: number): number {
  if (totalXp <= 0) return 0;
  return Math.floor(Math.sqrt(totalXp / 100));
}

export function xpForLevel(level: number): number {
  return level * level * 100;
}

export function xpToNextLevel(totalXp: number): number {
  const next = levelFromXP(totalXp) + 1;
  return Math.max(0, xpForLevel(next) - totalXp);
}

export function levelProgress(totalXp: number): {
  level: number;
  current: number;
  needed: number;
  percent: number;
} {
  const level = levelFromXP(totalXp);
  const floor = xpForLevel(level);
  const ceil = xpForLevel(level + 1);
  const current = totalXp - floor;
  const needed = ceil - floor;
  return {
    level,
    current,
    needed,
    percent: needed === 0 ? 0 : Math.min(100, Math.round((current / needed) * 100)),
  };
}
