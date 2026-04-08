/**
 * XP and leveling.
 *
 * level = floor(sqrt(totalXp / 100))
 * Award constants per planning doc:
 *   lesson:           50
 *   quiz pass:        10
 *   flashcard rated:   5
 *   sandbox challenge: 25
 */

export const XP_AWARDS = {
  lesson: 50,
  quiz: 10,
  flashcard: 5,
  sandbox: 25,
  phaseComplete: 500,
  moduleComplete: 100,
  verification: 250,
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
