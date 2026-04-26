import { getDB } from "@/lib/db";
import { triggerShadowWrite } from "@/lib/storage/shadow-write";
import {
  getAllEncryptedFlashcards,
  getEncryptedDueFlashcards,
  getEncryptedFlashcard,
  getEncryptedFlashcardsByLesson,
  getEncryptedReviewLogsForCard,
  putEncryptedFlashcard,
  putEncryptedReviewLog,
} from "@/lib/idb/encrypted-store";
import type { FlashCard, ReviewLog } from "@/types/flashcard";

export async function getCard(id: string): Promise<FlashCard | undefined> {
  try {
    const db = await getDB();
    return await getEncryptedFlashcard(db, id);
  } catch (error) {
    console.error("[flashcards] getCard failed", error);
    return undefined;
  }
}

export async function putCard(card: FlashCard): Promise<void> {
  try {
    const db = await getDB();
    await putEncryptedFlashcard(db, card);
    triggerShadowWrite();
  } catch (error) {
    console.error("[flashcards] putCard failed", error);
  }
}

export async function deleteCard(id: string): Promise<void> {
  try {
    const db = await getDB();
    await db.delete("flashcards", id);
    triggerShadowWrite();
  } catch (error) {
    console.error("[flashcards] deleteCard failed", error);
  }
}

export async function getDueCards(now: number = Date.now()): Promise<FlashCard[]> {
  try {
    const db = await getDB();
    return await getEncryptedDueFlashcards(db, now);
  } catch (error) {
    console.error("[flashcards] getDueCards failed", error);
    return [];
  }
}

export async function getCardsByLesson(lessonId: string): Promise<FlashCard[]> {
  try {
    const db = await getDB();
    return await getEncryptedFlashcardsByLesson(db, lessonId);
  } catch (error) {
    console.error("[flashcards] getCardsByLesson failed", error);
    return [];
  }
}

export async function getCardByTermSlug(slug: string): Promise<FlashCard | undefined> {
  try {
    const all = await getAllCards();
    return all.find((c) => c.termSlug === slug);
  } catch (error) {
    console.error("[flashcards] getCardByTermSlug failed", error);
    return undefined;
  }
}

export async function getAllCards(): Promise<FlashCard[]> {
  try {
    const db = await getDB();
    return await getAllEncryptedFlashcards(db);
  } catch (error) {
    console.error("[flashcards] getAllCards failed", error);
    return [];
  }
}

export async function logReview(log: ReviewLog): Promise<void> {
  try {
    const db = await getDB();
    await putEncryptedReviewLog(db, log);
    triggerShadowWrite();
  } catch (error) {
    console.error("[flashcards] logReview failed", error);
  }
}

export async function getReviewLogsForCard(cardId: string): Promise<ReviewLog[]> {
  try {
    const db = await getDB();
    return await getEncryptedReviewLogsForCard(db, cardId);
  } catch (error) {
    console.error("[flashcards] getReviewLogsForCard failed", error);
    return [];
  }
}
