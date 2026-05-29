/**
 * Daily-prescription policy — every weight, threshold, and bucket boundary the
 * engine uses, in one inspectable place.
 *
 * The point of putting these here (rather than scattered as magic numbers in
 * engine.ts) is auditability: a reader can see the entire personalization
 * policy in 30 lines, edit any value, and re-derive every plan.
 */

/** How review time and advance time split, as a function of FSRS due-pressure.
 *
 *   dueNow >= 50  → 70 % review, 30 % advance   (heavy debt — pay it down first)
 *   dueNow >= 20  → 50 % / 50 %                 (moderate debt — balance)
 *   dueNow >= 1   → 30 % review, 70 % advance   (light debt — keep moving)
 *   dueNow == 0   → 0 % / 100 % advance          (no debt — advance freely)
 *
 *  No model, no learned weights — the policy is the table.
 */
export const PRESSURE_BUCKETS: ReadonlyArray<{
  duePastThreshold: number;
  fsrsShare: number;
}> = [
  { duePastThreshold: 50, fsrsShare: 0.7 },
  { duePastThreshold: 20, fsrsShare: 0.5 },
  { duePastThreshold: 1, fsrsShare: 0.3 },
];

/** Per-block minute targets. Blocks below MIN merge into the next block; blocks
 *  above MAX split. */
export const MIN_BLOCK_MINUTES = 5;
export const TARGET_BLOCK_MINUTES = 10;
export const MAX_BLOCK_MINUTES = 15;

/** Default time budget when caller doesn't specify. */
export const DEFAULT_TARGET_MINUTES = 30;

/** Conservative card-throughput estimate: ~1 minute per FSRS card. Reflects
 *  averaged across grading, reading the worked solution, and the next-card
 *  transition. Adjustable here if benchmarking shows a different number. */
export const MINUTES_PER_CARD = 1;

/** Adaptive thresholds based on consecutive-rating streaks in the current
 *  session. These trigger plan adjustments without storing anything about the
 *  learner — the signal lives only in the SessionSignal value passed in. */
export const REMEDIATION_STREAK = 3; // three "again" in a row → remediation block
export const ADVANCE_STREAK = 3; // three "easy" in a row → skip ahead

/** Pull this fraction of review time forward when the oldest overdue card is
 *  more than a week old. A learner who's been away gets a gentle on-ramp
 *  rather than a wall of red. */
export const STALE_REVIEW_DAMPENING = 0.8;
export const STALE_REVIEW_DAYS = 7;
