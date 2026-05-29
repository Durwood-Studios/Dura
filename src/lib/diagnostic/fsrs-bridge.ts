import type { ConfidenceLevel, ReviewRating } from "./types";

/**
 * Map an evaluation outcome → an FSRS rating the local scheduler consumes.
 *
 * The entire policy is below in seven lines. No model, no weights, no
 * learned parameters — the rating is a deterministic function of correctness
 * and (optional) confidence.
 *
 *   wrong                                   → again
 *   right, no confidence elicited           → good (default)
 *   right, confidence ≥ 4 (sure)            → easy
 *   right, confidence ≤ 2 (guessing)        → hard
 *   right, confidence = 3 (in between)      → good
 *
 * When confidence is elicited it sharpens the signal: a lucky guess gets
 * scheduled sooner (hard) than a confident hit (easy), without ever needing
 * to know who answered.
 */
export function ratingFor(input: { correct: boolean; confidence?: ConfidenceLevel }): ReviewRating {
  if (!input.correct) return "again";
  if (input.confidence === undefined) return "good";
  if (input.confidence >= 4) return "easy";
  if (input.confidence <= 2) return "hard";
  return "good";
}
