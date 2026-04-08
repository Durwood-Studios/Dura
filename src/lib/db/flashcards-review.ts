import { schedule } from "@/lib/fsrs";
import { putCard, logReview } from "@/lib/db/flashcards";
import { generateId } from "@/lib/utils";
import type { FlashCard, ReviewRating, ReviewLog } from "@/types/flashcard";

/**
 * Complete review pipeline: schedule → persist updated card → log review.
 *
 * Single entry point for the post-rating flow so the store, the dashboard,
 * and any future replay tools all run the exact same code path.
 *
 * Safe fallback: on any failure the card is rescheduled for tomorrow so a
 * scheduling bug can never strand a card.
 */
export async function applyReview(card: FlashCard, rating: ReviewRating): Promise<FlashCard> {
  try {
    const { card: updatedCard } = schedule(card, rating);
    await putCard(updatedCard);
    const log: ReviewLog = {
      id: generateId("rlog"),
      cardId: card.id,
      rating,
      reviewedAt: Date.now(),
      elapsedDays: updatedCard.elapsedDays,
      scheduledDays: updatedCard.scheduledDays,
      state: updatedCard.state,
    };
    await logReview(log);
    return updatedCard;
  } catch (error) {
    console.error("[review] applyReview failed", { cardId: card.id, rating, error });
    const fallback: FlashCard = { ...card, due: Date.now() + 86_400_000 };
    try {
      await putCard(fallback);
    } catch {
      // swallow — fallback persistence is best-effort
    }
    return fallback;
  }
}
