import { schedule } from "@/lib/fsrs";
import { getDB } from "@/lib/db";
import { putEncryptedCardReview } from "@/lib/idb/encrypted-store";
import { triggerShadowWrite } from "@/lib/storage/shadow-write";
import { generateId } from "@/lib/utils";
import type { FlashCard, ReviewRating, ReviewLog } from "@/types/flashcard";

/**
 * Complete review pipeline: schedule → persist updated card → log review.
 *
 * Single entry point for the post-rating flow so the store, the dashboard,
 * and any future replay tools all run the exact same code path.
 *
 * Failed persistence leaves the card due and the rating available for retry.
 */
export async function applyReview(card: FlashCard, rating: ReviewRating): Promise<FlashCard> {
  try {
    const { card: updatedCard } = schedule(card, rating);
    const log: ReviewLog = {
      id: generateId("rlog"),
      cardId: card.id,
      rating,
      reviewedAt: Date.now(),
      elapsedDays: updatedCard.elapsedDays,
      scheduledDays: updatedCard.scheduledDays,
      state: updatedCard.state,
    };
    await putEncryptedCardReview(await getDB(), updatedCard, log);
    triggerShadowWrite();
    return updatedCard;
  } catch (error) {
    console.error("[review] applyReview failed", { cardId: card.id, rating, error });
    throw new Error("Your review could not be saved. Please try again.", { cause: error });
  }
}
