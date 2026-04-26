export type ReviewRating = "again" | "hard" | "good" | "easy";

export interface FlashCard {
  id: string;
  front: string;
  back: string;
  lessonId: string | null;
  termSlug: string | null;
  createdAt: number;
  // FSRS-5 state
  due: number;
  stability: number;
  difficulty: number;
  elapsedDays: number;
  scheduledDays: number;
  reps: number;
  lapses: number;
  state: "new" | "learning" | "review" | "relearning";
  lastReview: number | null;
  /**
   * Encrypted envelope of {front, back} produced by the IDB encryption
   * wrapper (src/lib/idb/encrypted-store.ts). Present only on records
   * stored when an active encryption key was available. When present,
   * the plaintext `front` and `back` fields are blanked at rest; the
   * wrapper repopulates them on read. Public callers should never
   * observe a non-empty `_e` because the wrapper hydrates the envelope
   * before returning. Optional + ignored by sync/Supabase code paths
   * (we send plaintext over TLS to Supabase; this field is local-only).
   */
  _e?: ArrayBuffer;
}

export interface ReviewLog {
  id: string;
  cardId: string;
  rating: ReviewRating;
  reviewedAt: number;
  elapsedDays: number;
  scheduledDays: number;
  state: FlashCard["state"];
}
