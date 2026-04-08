import { getDB } from "@/lib/db";
import type { FlashCard, ReviewLog } from "@/types/flashcard";

export async function getCard(id: string): Promise<FlashCard | undefined> {
  try {
    const db = await getDB();
    return await db.get("flashcards", id);
  } catch (error) {
    console.error("[flashcards] getCard failed", error);
    return undefined;
  }
}

export async function putCard(card: FlashCard): Promise<void> {
  try {
    const db = await getDB();
    await db.put("flashcards", card);
  } catch (error) {
    console.error("[flashcards] putCard failed", error);
  }
}

export async function deleteCard(id: string): Promise<void> {
  try {
    const db = await getDB();
    await db.delete("flashcards", id);
  } catch (error) {
    console.error("[flashcards] deleteCard failed", error);
  }
}

export async function getDueCards(now: number = Date.now()): Promise<FlashCard[]> {
  try {
    const db = await getDB();
    const range = IDBKeyRange.upperBound(now);
    return await db.getAllFromIndex("flashcards", "by-due", range);
  } catch (error) {
    console.error("[flashcards] getDueCards failed", error);
    return [];
  }
}

export async function getCardsByLesson(lessonId: string): Promise<FlashCard[]> {
  try {
    const db = await getDB();
    return await db.getAllFromIndex("flashcards", "by-lesson", lessonId);
  } catch (error) {
    console.error("[flashcards] getCardsByLesson failed", error);
    return [];
  }
}

export async function getAllCards(): Promise<FlashCard[]> {
  try {
    const db = await getDB();
    return await db.getAll("flashcards");
  } catch (error) {
    console.error("[flashcards] getAllCards failed", error);
    return [];
  }
}

export async function logReview(log: ReviewLog): Promise<void> {
  try {
    const db = await getDB();
    await db.put("reviewLogs", log);
  } catch (error) {
    console.error("[flashcards] logReview failed", error);
  }
}

export async function getReviewLogsForCard(cardId: string): Promise<ReviewLog[]> {
  try {
    const db = await getDB();
    return await db.getAllFromIndex("reviewLogs", "by-card", cardId);
  } catch (error) {
    console.error("[flashcards] getReviewLogsForCard failed", error);
    return [];
  }
}
