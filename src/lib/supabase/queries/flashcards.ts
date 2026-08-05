import { createClient } from "@/lib/supabase/client";
import type { FlashcardRow, ReviewLogRow } from "@/lib/supabase/row-contracts";
import type { FlashCard, ReviewLog } from "@/types/flashcard";

/**
 * Sync flashcards to Supabase.
 *
 * Strategy: upsert by (user_id, id). The FSRS state fields are always
 * overwritten with the client's values — the client owns the SRS state
 * because scheduling happens locally and must stay deterministic.
 */
export async function syncFlashcards(userId: string, cards: FlashCard[]): Promise<void> {
  try {
    const supabase = createClient();
    // FlashcardRow pins created_at/due/last_review to epoch-ms numbers —
    // the columns are bigint; ISO strings fail the insert.
    const rows: FlashcardRow[] = cards.map((card) => ({
      id: card.id,
      user_id: userId,
      front: card.front,
      back: card.back,
      lesson_id: card.lessonId,
      term_slug: card.termSlug,
      created_at: card.createdAt,
      due: card.due,
      stability: card.stability,
      difficulty: card.difficulty,
      elapsed_days: card.elapsedDays,
      scheduled_days: card.scheduledDays,
      reps: card.reps,
      lapses: card.lapses,
      state: card.state,
      last_review: card.lastReview,
    }));

    const { error } = await supabase.from("flashcards").upsert(rows, { onConflict: "id,user_id" });

    if (error) {
      console.error("[syncFlashcards] Upsert error:", error.message);
      throw error;
    }
  } catch (err) {
    console.error("[syncFlashcards] Failed to sync:", err);
    throw err;
  }
}

/**
 * Fetch all flashcards for a user from Supabase.
 */
export async function fetchFlashcards(userId: string): Promise<FlashCard[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from("flashcards").select("*").eq("user_id", userId);

    if (error) {
      console.error("[fetchFlashcards] Query error:", error.message);
      throw error;
    }

    return (data ?? []).map((row) => ({
      id: row.id as string,
      front: row.front as string,
      back: row.back as string,
      lessonId: row.lesson_id as string | null,
      termSlug: row.term_slug as string | null,
      createdAt: Number(row.created_at),
      due: Number(row.due),
      stability: Number(row.stability),
      difficulty: Number(row.difficulty),
      elapsedDays: Number(row.elapsed_days),
      scheduledDays: Number(row.scheduled_days),
      reps: Number(row.reps),
      lapses: Number(row.lapses),
      state: row.state as FlashCard["state"],
      lastReview: row.last_review === null ? null : Number(row.last_review),
    }));
  } catch (err) {
    console.error("[fetchFlashcards] Failed to fetch:", err);
    throw err;
  }
}

/**
 * Fetch all review logs for a user from Supabase.
 *
 * Used by pullChanges() to replicate review history across devices.
 * The server stores logs as a G-Set (append-only); duplicates are
 * impossible because the table's primary key enforces id uniqueness
 * and syncReviewLogs() does upsert-on-conflict-id (silently dedup).
 */
export async function fetchReviewLogs(userId: string): Promise<ReviewLog[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from("review_logs").select("*").eq("user_id", userId);

    if (error) {
      console.error("[fetchReviewLogs] Query error:", error.message);
      throw error;
    }

    return (data ?? []).map((row) => ({
      id: row.id as string,
      cardId: row.card_id as string,
      rating: row.rating as ReviewLog["rating"],
      reviewedAt: Number(row.reviewed_at),
      elapsedDays: Number(row.elapsed_days),
      scheduledDays: Number(row.scheduled_days),
      state: row.state as ReviewLog["state"],
    }));
  } catch (err) {
    console.error("[fetchReviewLogs] Failed to fetch:", err);
    throw err;
  }
}

/**
 * Sync review logs to Supabase.
 *
 * Strategy: insert-only (review logs are append-only by nature).
 * Uses onConflict to silently skip duplicates by id.
 */
export async function syncReviewLogs(userId: string, logs: ReviewLog[]): Promise<void> {
  try {
    const supabase = createClient();
    // ReviewLogRow pins reviewed_at to an epoch-ms number — the column
    // is bigint; an ISO string fails the insert.
    const rows: ReviewLogRow[] = logs.map((log) => ({
      id: log.id,
      user_id: userId,
      card_id: log.cardId,
      rating: log.rating,
      reviewed_at: log.reviewedAt,
      elapsed_days: log.elapsedDays,
      scheduled_days: log.scheduledDays,
      state: log.state,
    }));

    const { error } = await supabase.from("review_logs").upsert(rows, { onConflict: "id" });

    if (error) {
      console.error("[syncReviewLogs] Upsert error:", error.message);
      throw error;
    }
  } catch (err) {
    console.error("[syncReviewLogs] Failed to sync:", err);
    throw err;
  }
}
