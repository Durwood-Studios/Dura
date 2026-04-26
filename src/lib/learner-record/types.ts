/**
 * LFLRS-1.0 Learner Record — Zod schemas + projection layer.
 *
 * Two shapes coexist:
 *   1. Stored*  — matches what's actually in IndexedDB today (camelCase,
 *      epoch ms numbers, string-enum ratings, lowercase FSRS states).
 *      Validated at IDB read boundaries.
 *   2. Canonical* — matches /standards/lflrs/schema.json (UUIDs, ISO datetime
 *      strings, integer 1-4 ratings, snake_case, TitleCase FSRS states).
 *      Used for sync, learner export, and xAPI projection.
 *
 * CRDT semantics live in the sync merge code (src/lib/supabase/sync.ts), not
 * as per-record `_crdt` tags. The schema's intent is captured in JSON Schema
 * descriptions on each type definition.
 */

import { z } from "zod";

// ─── Shared enums ────────────────────────────────────────────────────────────

export const StoredFSRSStateSchema = z.enum(["new", "learning", "review", "relearning"]);
export type StoredFSRSState = z.infer<typeof StoredFSRSStateSchema>;

export const CanonicalFSRSStateSchema = z.enum(["New", "Learning", "Review", "Relearning"]);
export type CanonicalFSRSState = z.infer<typeof CanonicalFSRSStateSchema>;

export const StoredReviewRatingSchema = z.enum(["again", "hard", "good", "easy"]);
export type StoredReviewRating = z.infer<typeof StoredReviewRatingSchema>;

export const CanonicalRatingSchema = z.number().int().min(1).max(4);
export type CanonicalRating = z.infer<typeof CanonicalRatingSchema>;

const RATING_TO_INT: Record<StoredReviewRating, CanonicalRating> = {
  again: 1,
  hard: 2,
  good: 3,
  easy: 4,
};

const INT_TO_RATING: Record<CanonicalRating, StoredReviewRating> = {
  1: "again",
  2: "hard",
  3: "good",
  4: "easy",
};

const STATE_TO_CANONICAL: Record<StoredFSRSState, CanonicalFSRSState> = {
  new: "New",
  learning: "Learning",
  review: "Review",
  relearning: "Relearning",
};

const STATE_TO_STORED: Record<CanonicalFSRSState, StoredFSRSState> = {
  New: "new",
  Learning: "learning",
  Review: "review",
  Relearning: "relearning",
};

// ─── Stored shapes (what's in IndexedDB today) ───────────────────────────────

export const StoredFlashCardSchema = z.object({
  id: z.string().min(1),
  front: z.string(),
  back: z.string(),
  lessonId: z.string().nullable(),
  termSlug: z.string().nullable(),
  createdAt: z.number().int().nonnegative(),
  due: z.number(),
  stability: z.number().min(0),
  difficulty: z.number().min(1).max(10),
  elapsedDays: z.number(),
  scheduledDays: z.number(),
  reps: z.number().int().min(0),
  lapses: z.number().int().min(0),
  state: StoredFSRSStateSchema,
  lastReview: z.number().nullable(),
});
export type StoredFlashCard = z.infer<typeof StoredFlashCardSchema>;

export const StoredReviewLogSchema = z.object({
  id: z.string().min(1),
  cardId: z.string().min(1),
  rating: StoredReviewRatingSchema,
  reviewedAt: z.number().int().nonnegative(),
  elapsedDays: z.number(),
  scheduledDays: z.number(),
  state: StoredFSRSStateSchema,
});
export type StoredReviewLog = z.infer<typeof StoredReviewLogSchema>;

// ─── Canonical shapes (LFLRS-1.0 wire format) ────────────────────────────────

export const CanonicalCardSchema = z.object({
  id: z.string().uuid(),
  stability: z.number().min(0),
  difficulty: z.number().min(1).max(10),
  due: z.string().datetime(),
  reps: z.number().int().min(0),
  lapses: z.number().int().min(0),
  state: CanonicalFSRSStateSchema,
  last_modified: z.string().datetime(),
});
export type CanonicalCard = z.infer<typeof CanonicalCardSchema>;

export const CanonicalReviewLogEntrySchema = z.object({
  id: z.string().uuid(),
  card_id: z.string().uuid(),
  rating: CanonicalRatingSchema,
  elapsed_days: z.number(),
  scheduled_days: z.number(),
  review: z.string().datetime(),
  state: CanonicalFSRSStateSchema,
});
export type CanonicalReviewLogEntry = z.infer<typeof CanonicalReviewLogEntrySchema>;

export const CanonicalMasteryRecordSchema = z.object({
  module_id: z.string().min(1),
  mastery_score: z.number().min(0).max(1),
  unlocked_at: z.string().datetime().nullable(),
  last_modified: z.string().datetime(),
});
export type CanonicalMasteryRecord = z.infer<typeof CanonicalMasteryRecordSchema>;

export const CanonicalLearnerRecordSchema = z.object({
  schema_version: z.literal("lflrs-1.0"),
  learner_id: z.string().uuid(),
  exported_at: z.string().datetime(),
  cards: z.array(CanonicalCardSchema),
  review_log: z.array(CanonicalReviewLogEntrySchema),
  mastery_records: z.array(CanonicalMasteryRecordSchema),
});
export type CanonicalLearnerRecord = z.infer<typeof CanonicalLearnerRecordSchema>;

// ─── Projection: stored ⇄ canonical ──────────────────────────────────────────

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * DURA's stored card.id is `string` (no UUID guarantee). The canonical wire
 * format requires UUIDs. When a stored id is already a UUID we pass it
 * through; otherwise we deterministically derive a v5-style namespaced UUID.
 * Keeps round-trips stable: the same input produces the same output, and
 * existing UUID-shaped ids (the common case) are preserved bit-for-bit.
 */
export function toCanonicalId(storedId: string): string {
  if (UUID_RE.test(storedId)) return storedId.toLowerCase();
  // Deterministic synthetic UUID — SHA-1 of namespace + id, formatted as v5.
  // Browser-only crypto.subtle is async; for a sync projection we use a
  // simple hash-based fallback that's stable per input. Real UUIDv5 lands
  // in P2-D when the export pipeline materializes the bytes async.
  let h1 = 0x811c9dc5;
  let h2 = 0xc9dc5811;
  for (let i = 0; i < storedId.length; i++) {
    h1 = Math.imul(h1 ^ storedId.charCodeAt(i), 0x01000193) >>> 0;
    h2 = Math.imul(h2 ^ storedId.charCodeAt(storedId.length - 1 - i), 0x01000193) >>> 0;
  }
  const hex = (h1.toString(16).padStart(8, "0") + h2.toString(16).padStart(8, "0")).repeat(2);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-8${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

const epochToISO = (ms: number): string => new Date(ms).toISOString();
const isoToEpoch = (iso: string): number => new Date(iso).getTime();

export function toCanonicalCard(card: StoredFlashCard, lastModifiedMs: number): CanonicalCard {
  return CanonicalCardSchema.parse({
    id: toCanonicalId(card.id),
    stability: card.stability,
    difficulty: card.difficulty,
    due: epochToISO(card.due),
    reps: card.reps,
    lapses: card.lapses,
    state: STATE_TO_CANONICAL[card.state],
    last_modified: epochToISO(lastModifiedMs),
  });
}

export function toCanonicalReviewLog(entry: StoredReviewLog): CanonicalReviewLogEntry {
  return CanonicalReviewLogEntrySchema.parse({
    id: toCanonicalId(entry.id),
    card_id: toCanonicalId(entry.cardId),
    rating: RATING_TO_INT[entry.rating],
    elapsed_days: entry.elapsedDays,
    scheduled_days: entry.scheduledDays,
    review: epochToISO(entry.reviewedAt),
    state: STATE_TO_CANONICAL[entry.state],
  });
}

/**
 * Inverse projection. Used when ingesting a remote canonical record into
 * local storage (e.g. restore-from-export, accept-server-state). Stored cards
 * carry fields the canonical shape doesn't (front/back/lessonId/termSlug/
 * createdAt/elapsedDays/scheduledDays/lastReview); callers must supply those
 * via `storedExtras` — we never invent content.
 */
export function fromCanonicalCard(
  card: CanonicalCard,
  storedExtras: Pick<
    StoredFlashCard,
    | "front"
    | "back"
    | "lessonId"
    | "termSlug"
    | "createdAt"
    | "elapsedDays"
    | "scheduledDays"
    | "lastReview"
  >
): StoredFlashCard {
  return StoredFlashCardSchema.parse({
    id: card.id,
    front: storedExtras.front,
    back: storedExtras.back,
    lessonId: storedExtras.lessonId,
    termSlug: storedExtras.termSlug,
    createdAt: storedExtras.createdAt,
    due: isoToEpoch(card.due),
    stability: card.stability,
    difficulty: card.difficulty,
    elapsedDays: storedExtras.elapsedDays,
    scheduledDays: storedExtras.scheduledDays,
    reps: card.reps,
    lapses: card.lapses,
    state: STATE_TO_STORED[card.state],
    lastReview: storedExtras.lastReview,
  });
}

export function fromCanonicalReviewLog(entry: CanonicalReviewLogEntry): StoredReviewLog {
  return StoredReviewLogSchema.parse({
    id: entry.id,
    cardId: entry.card_id,
    rating: INT_TO_RATING[entry.rating],
    reviewedAt: isoToEpoch(entry.review),
    elapsedDays: entry.elapsed_days,
    scheduledDays: entry.scheduled_days,
    state: STATE_TO_STORED[entry.state],
  });
}
