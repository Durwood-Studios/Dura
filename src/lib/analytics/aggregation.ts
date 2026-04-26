/**
 * PPLAS-R3 — Local aggregation + Laplace differential-privacy noise layer.
 *
 * Why this exists:
 *   Raw analytics events (src/lib/analytics.ts) are useful per-learner but
 *   should never leave the device as raw timestamped streams when used for
 *   cross-learner analytics views — the join-attack surface is too large.
 *   This module computes daily/per-learner aggregates and applies Laplace
 *   noise calibrated to each metric's sensitivity before transmission.
 *
 *   The noise layer is what makes the aggregate signals defensible under
 *   GDPR's data-minimization principle: even if a remote party observed
 *   every single aggregate a learner ever produced, they could not
 *   reconstruct an individual review event with high confidence — the
 *   noise floor protects the smallest unit of information.
 *
 * Catalog: standards/pplas/event-catalog.yaml — every aggregate emitted by
 * this module must have a matching aggregate_signals.id entry; the CI gate
 * (P4) enforces.
 */

/**
 * Sample from a Laplace(0, scale) distribution where scale = sensitivity / ε.
 * The classic inverse-CDF method: U ~ Uniform(-0.5, 0.5);
 * X = -scale · sign(U) · ln(1 - 2|U|).
 *
 * The Laplace mechanism guarantees ε-differential privacy when the
 * sensitivity is the maximum amount any single record can change the
 * aggregate (worst case neighbour).
 */
export function laplaceNoise(sensitivity: number, epsilon: number): number {
  if (epsilon <= 0) {
    throw new Error(`laplaceNoise: epsilon must be > 0, got ${epsilon}`);
  }
  if (sensitivity < 0) {
    throw new Error(`laplaceNoise: sensitivity must be >= 0, got ${sensitivity}`);
  }
  if (sensitivity === 0) return 0;
  const scale = sensitivity / epsilon;
  const u = Math.random() - 0.5;
  if (u === 0) return 0;
  return -scale * Math.sign(u) * Math.log(1 - 2 * Math.abs(u));
}

export interface DPNoiseConfig {
  /** Privacy budget — smaller ε = more noise = stronger privacy. */
  epsilon: number;
  /** Per-field sensitivities. Each field's noise is sampled independently. */
  sensitivity: Record<string, number>;
  /** If true, clamp every output to >= 0. Use for non-negative counts. */
  nonNegative?: boolean;
  /** If true, round every output to the nearest integer. Use for counts. */
  round?: boolean;
}

/**
 * Apply Laplace noise to an aggregate. Each numeric field is perturbed
 * independently using its own sensitivity; non-numeric fields pass through.
 *
 * Sensitivities NOT listed in `config.sensitivity` are treated as 0 (no
 * noise). This is a deliberate design choice — keys without a documented
 * sensitivity bound are conceptually a non-DP scalar (e.g. an aggregation
 * date string) and should not be silently noised.
 */
export function addDPNoise<T extends object>(aggregate: T, config: DPNoiseConfig): T {
  const out: Record<string, unknown> = { ...(aggregate as Record<string, unknown>) };
  for (const [key, value] of Object.entries(out)) {
    if (typeof value !== "number") continue;
    const sensitivity = config.sensitivity[key];
    if (sensitivity === undefined || sensitivity === 0) continue;
    let noisy = value + laplaceNoise(sensitivity, config.epsilon);
    if (config.nonNegative) noisy = Math.max(0, noisy);
    if (config.round) noisy = Math.round(noisy);
    out[key] = noisy;
  }
  return out as T;
}

// ─── Concrete aggregators ───────────────────────────────────────────────────

export interface DailyReviewAggregate {
  date: string; // YYYY-MM-DD
  review_count: number;
  avg_rating: number; // 1..4 mean
}

const RATING_TO_INT: Record<string, number> = {
  again: 1,
  hard: 2,
  good: 3,
  easy: 4,
};

interface ReviewLikeRecord {
  rating: string;
  reviewedAt: number;
}

/**
 * Aggregate review records into a per-date count + mean rating, then apply
 * DP noise. Catalog id: card_review_daily_aggregate (ε = 1.0). The output
 * is what would be safe to transmit; today this aggregate is local-only
 * per the catalog so the noise primarily defends against on-device
 * inspection by other apps that share the IndexedDB.
 */
export function buildDailyReviewAggregate(
  date: string,
  reviewsForDate: ReviewLikeRecord[]
): DailyReviewAggregate {
  if (reviewsForDate.length === 0) {
    return { date, review_count: 0, avg_rating: 0 };
  }
  const sum = reviewsForDate.reduce((acc, r) => acc + (RATING_TO_INT[r.rating] ?? 0), 0);
  const raw: DailyReviewAggregate = {
    date,
    review_count: reviewsForDate.length,
    avg_rating: sum / reviewsForDate.length,
  };
  return addDPNoise(raw, {
    epsilon: 1.0,
    sensitivity: { review_count: 10, avg_rating: 1 },
    nonNegative: true,
    round: false,
  });
}

export interface SessionDurationAggregate {
  date: string;
  total_minutes: number;
}

interface SessionLikeRecord {
  durationMs: number;
  endedAt: number;
}

/**
 * Aggregate session durations into a per-date total in minutes, then apply
 * DP noise. Catalog id: session_duration_aggregate (ε = 1.0).
 */
export function buildSessionDurationAggregate(
  date: string,
  sessionsForDate: SessionLikeRecord[]
): SessionDurationAggregate {
  const totalMs = sessionsForDate.reduce((acc, s) => acc + s.durationMs, 0);
  const raw: SessionDurationAggregate = {
    date,
    total_minutes: totalMs / 60_000,
  };
  return addDPNoise(raw, {
    epsilon: 1.0,
    sensitivity: { total_minutes: 60 },
    nonNegative: true,
    round: false,
  });
}

export interface ContentDifficultySignal {
  lessonId: string;
  lapse_rate: number;
  sample_size: number;
}

interface RatingRecord {
  rating: string;
}

/**
 * Aggregate per-lesson lapse rate (fraction of "again" ratings) + sample
 * size, with DP noise applied. Catalog id: content_difficulty_signal
 * (ε = 1.0). Lessons with fewer than `minSampleSize` reviews are dropped
 * — the noise floor would dominate the signal for tiny samples.
 */
export function buildContentDifficultySignal(
  lessonId: string,
  ratings: RatingRecord[],
  minSampleSize = 10
): ContentDifficultySignal | null {
  if (ratings.length < minSampleSize) return null;
  const lapses = ratings.filter((r) => r.rating === "again").length;
  const raw: ContentDifficultySignal = {
    lessonId,
    lapse_rate: lapses / ratings.length,
    sample_size: ratings.length,
  };
  return addDPNoise(raw, {
    epsilon: 1.0,
    sensitivity: { lapse_rate: 1, sample_size: 5 },
    nonNegative: true,
    round: false,
  });
}
