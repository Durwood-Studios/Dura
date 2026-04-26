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
 * RFC 4122 namespace UUID for DURA. Used as the prefix bytes when deriving
 * v5 UUIDs from non-UUID stored ids (lesson slugs etc.). This is a stable
 * project-level constant — changing it would break the deterministic
 * derivation for every existing learner export.
 */
const DURA_NAMESPACE_UUID = "1c4ad6e0-3a1f-5e7d-9b8a-4c2d6e8f0a1b";

/**
 * Synchronous identity hash for use INSIDE DURA (sync merge, LWW-tiebreak
 * comparisons). Returns a UUID-shaped string that's deterministic per
 * input, but is NOT a real RFC 4122 v5 — it's an FNV-derived pseudo-UUID.
 * For the canonical wire format (export, xAPI), use {@link toCanonicalIdAsync}
 * which computes real SHA-1-based UUIDv5 via Web Crypto.
 *
 * UUID-shaped stored ids pass through unchanged (the common case for cards
 * minted client-side via crypto.randomUUID).
 */
export function toCanonicalId(storedId: string): string {
  if (UUID_RE.test(storedId)) return storedId.toLowerCase();
  let h1 = 0x811c9dc5;
  let h2 = 0xc9dc5811;
  for (let i = 0; i < storedId.length; i++) {
    h1 = Math.imul(h1 ^ storedId.charCodeAt(i), 0x01000193) >>> 0;
    h2 = Math.imul(h2 ^ storedId.charCodeAt(storedId.length - 1 - i), 0x01000193) >>> 0;
  }
  const hex = (h1.toString(16).padStart(8, "0") + h2.toString(16).padStart(8, "0")).repeat(2);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-8${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

/**
 * Real RFC 4122 §4.3 UUIDv5 derivation. SHA-1 of namespace bytes + name,
 * with the version (0x50) and variant (0x80) bits set per spec. Used by
 * the learner export pipeline so the emitted IDs validate against any
 * conforming xAPI / LFLRS consumer.
 *
 * UUID-shaped stored ids pass through unchanged (no derivation needed).
 */
export async function toCanonicalIdAsync(storedId: string): Promise<string> {
  if (UUID_RE.test(storedId)) return storedId.toLowerCase();
  if (typeof crypto === "undefined" || !crypto.subtle) {
    // No Web Crypto in this scope — fall back to the sync hash. Callers
    // who need true RFC 4122 v5 must run in a browser or a Node 20+ test
    // runner where crypto.subtle is available.
    return toCanonicalId(storedId);
  }

  const namespaceBytes = uuidStringToBytes(DURA_NAMESPACE_UUID);
  const nameBytes = new TextEncoder().encode(storedId);
  const input = new Uint8Array(namespaceBytes.length + nameBytes.length);
  input.set(namespaceBytes, 0);
  input.set(nameBytes, namespaceBytes.length);

  const hashBuffer = await crypto.subtle.digest("SHA-1", input);
  const hash = new Uint8Array(hashBuffer).slice(0, 16);
  // Set version (high nibble of byte 6) to 0x5 = v5
  hash[6] = (hash[6] & 0x0f) | 0x50;
  // Set variant (high two bits of byte 8) to 10 = RFC 4122
  hash[8] = (hash[8] & 0x3f) | 0x80;

  return bytesToUuidString(hash);
}

function uuidStringToBytes(uuid: string): Uint8Array {
  const hex = uuid.replace(/-/g, "");
  const out = new Uint8Array(16);
  for (let i = 0; i < 16; i++) {
    out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

function bytesToUuidString(bytes: Uint8Array): string {
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
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
