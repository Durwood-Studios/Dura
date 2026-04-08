import type { FlashCard, ReviewRating } from "@/types/flashcard";

/**
 * FSRS-5 spaced repetition algorithm.
 * Reference: https://github.com/open-spaced-repetition/fsrs4anki/wiki/The-Algorithm
 *
 * No external deps. If math fails for any reason we schedule the card for
 * tomorrow — never lose a card to a NaN.
 */

export const FSRS_DEFAULT_WEIGHTS: readonly number[] = [
  0.40255, 1.18385, 3.173, 15.69105, 7.1949, 0.5345, 1.4604, 0.0046, 1.54575, 0.1192, 1.01925,
  1.9395, 0.11, 0.29605, 2.2698, 0.2315, 2.9898, 0.51655, 0.6621,
];

export const REQUEST_RETENTION = 0.9;
export const MAXIMUM_INTERVAL_DAYS = 36500;
export const DECAY = -0.5;
const FACTOR = Math.pow(0.9, 1 / DECAY) - 1;

const RATING_VALUE: Record<ReviewRating, 1 | 2 | 3 | 4> = {
  again: 1,
  hard: 2,
  good: 3,
  easy: 4,
};

const MS_PER_DAY = 86_400_000;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function initStability(rating: ReviewRating, w: readonly number[]): number {
  return Math.max(0.1, w[RATING_VALUE[rating] - 1]);
}

function initDifficulty(rating: ReviewRating, w: readonly number[]): number {
  return clamp(w[4] - Math.exp(w[5] * (RATING_VALUE[rating] - 1)) + 1, 1, 10);
}

function nextDifficulty(d: number, rating: ReviewRating, w: readonly number[]): number {
  const next = d - w[6] * (RATING_VALUE[rating] - 3);
  // mean reversion to the "good" baseline
  const meanReversion = w[7] * (initDifficulty("good", w) - next) + next;
  return clamp(meanReversion, 1, 10);
}

function nextRecallStability(
  d: number,
  s: number,
  retrievability: number,
  rating: ReviewRating,
  w: readonly number[]
): number {
  const hardPenalty = rating === "hard" ? w[15] : 1;
  const easyBonus = rating === "easy" ? w[16] : 1;
  return (
    s *
    (1 +
      Math.exp(w[8]) *
        (11 - d) *
        Math.pow(s, -w[9]) *
        (Math.exp((1 - retrievability) * w[10]) - 1) *
        hardPenalty *
        easyBonus)
  );
}

function nextForgetStability(
  d: number,
  s: number,
  retrievability: number,
  w: readonly number[]
): number {
  return (
    w[11] *
    Math.pow(d, -w[12]) *
    (Math.pow(s + 1, w[13]) - 1) *
    Math.exp((1 - retrievability) * w[14])
  );
}

function retrievability(elapsedDays: number, stability: number): number {
  if (stability <= 0) return 0;
  return Math.pow(1 + (FACTOR * elapsedDays) / stability, DECAY);
}

function intervalDays(stability: number, requestRetention: number = REQUEST_RETENTION): number {
  if (stability <= 0) return 1;
  const days = (stability / FACTOR) * (Math.pow(requestRetention, 1 / DECAY) - 1);
  return clamp(Math.round(days), 1, MAXIMUM_INTERVAL_DAYS);
}

export interface SchedulingResult {
  card: FlashCard;
  intervalDays: number;
}

/**
 * Apply a review rating to a card and return the updated card + scheduled interval.
 * Pure function — does not touch persistence.
 */
export function schedule(
  card: FlashCard,
  rating: ReviewRating,
  now: number = Date.now(),
  w: readonly number[] = FSRS_DEFAULT_WEIGHTS
): SchedulingResult {
  try {
    const isNew = card.state === "new" || card.reps === 0;
    let stability: number;
    let difficulty: number;
    let elapsedDays: number;

    if (isNew) {
      stability = initStability(rating, w);
      difficulty = initDifficulty(rating, w);
      elapsedDays = 0;
    } else {
      elapsedDays = card.lastReview ? Math.max(0, (now - card.lastReview) / MS_PER_DAY) : 0;
      const r = retrievability(elapsedDays, card.stability);
      difficulty = nextDifficulty(card.difficulty, rating, w);
      stability =
        rating === "again"
          ? nextForgetStability(card.difficulty, card.stability, r, w)
          : nextRecallStability(card.difficulty, card.stability, r, rating, w);
    }

    if (!Number.isFinite(stability) || stability <= 0) throw new Error("invalid stability");
    if (!Number.isFinite(difficulty)) throw new Error("invalid difficulty");

    const days = intervalDays(stability);
    const due = now + days * MS_PER_DAY;
    const nextState: FlashCard["state"] =
      rating === "again" ? "relearning" : isNew ? "learning" : "review";

    return {
      card: {
        ...card,
        stability,
        difficulty,
        elapsedDays,
        scheduledDays: days,
        reps: card.reps + 1,
        lapses: rating === "again" ? card.lapses + 1 : card.lapses,
        state: nextState,
        due,
        lastReview: now,
      },
      intervalDays: days,
    };
  } catch (error) {
    console.error("[fsrs] scheduling failed, falling back to tomorrow", error);
    const fallback = now + MS_PER_DAY;
    return {
      card: {
        ...card,
        reps: card.reps + 1,
        lapses: rating === "again" ? card.lapses + 1 : card.lapses,
        state: "relearning",
        due: fallback,
        scheduledDays: 1,
        lastReview: now,
      },
      intervalDays: 1,
    };
  }
}

/** Build a fresh card with FSRS state initialized to "new". */
export function createCard(params: {
  id: string;
  front: string;
  back: string;
  lessonId?: string | null;
  termSlug?: string | null;
}): FlashCard {
  const now = Date.now();
  return {
    id: params.id,
    front: params.front,
    back: params.back,
    lessonId: params.lessonId ?? null,
    termSlug: params.termSlug ?? null,
    createdAt: now,
    due: now,
    stability: 0,
    difficulty: 0,
    elapsedDays: 0,
    scheduledDays: 0,
    reps: 0,
    lapses: 0,
    state: "new",
    lastReview: null,
  };
}
