/**
 * IDB encryption wrapper (P5-A.2) — flashcard text content.
 *
 * Wraps reads and writes of the `flashcards` store so that the
 * learner-authored text fields (front, back) are stored as an
 * AES-256-GCM-encrypted envelope (`_e`) at rest. Everything else on a
 * card — id, FSRS state, indexes — stays plaintext so that:
 *   - the existing IDB indexes (by-due, by-state, by-lesson) keep working
 *   - migrations are in-place and reversible
 *   - the wrapper stays narrow + reviewable
 *
 * Behavioral data on the other 3 sensitive stores (reviewLogs, progress,
 * moduleProgress) is left plaintext — those records contain only numbers
 * and IDs (no learner-authored text) and the threat model from
 * src/lib/idb/encryption.ts treats those fields as low-risk in isolation.
 * Extending this wrapper to those stores is owed as P5-A.3.
 *
 * Best-effort migration policy:
 *   - On read: if the stored record has `_e`, decrypt into {front, back};
 *     if not, treat as legacy plaintext and return as-is. NO failure mode
 *     leaves a learner unable to read their existing data.
 *   - On write: if an active key is available, encrypt {front, back}
 *     into `_e` and blank the plaintext fields. If no key (e.g. SSR
 *     boundary, key not yet set, intentional fallback), write the
 *     plaintext untouched — a future write with a key will encrypt.
 *
 * The wrapper functions take the IDB handle as their first argument so
 * existing transaction-aware callers (sync.ts) can compose them inside
 * their own transactions.
 */

import type { DuraDB } from "@/lib/db";
import type { FlashCard } from "@/types/flashcard";
import { decryptRecord, encryptRecord, isEncryptedRecord } from "./encryption";
import { peekActiveKey } from "./active-key";

interface FlashCardEnvelope {
  front: string;
  back: string;
}

/**
 * Decrypt a flashcard's `_e` field if present and reattach the
 * plaintext front/back. No-op for legacy plaintext records.
 */
async function hydrate(stored: FlashCard | undefined): Promise<FlashCard | undefined> {
  if (!stored) return stored;
  if (!stored._e) return stored;
  if (!isEncryptedRecord(stored._e)) {
    // Defensive: an `_e` field that doesn't carry the magic prefix is
    // corrupt or wasn't produced by us. Best-effort: drop the field
    // and return whatever plaintext fields we have.
    const { _e: _drop, ...rest } = stored;
    return rest as FlashCard;
  }
  const resolution = peekActiveKey();
  if (!resolution || !resolution.key) {
    // Encrypted record but no key in scope — surface a clear error so
    // a misconfigured caller doesn't silently render blank flashcards.
    throw new Error(
      "[encrypted-store] Encrypted flashcard found but no active encryption key. " +
        "AuthProvider must call setActiveKey() before reads."
    );
  }
  const plaintext = (await decryptRecord(stored._e, resolution.key)) as FlashCardEnvelope;
  const { _e: _drop, ...rest } = stored;
  return { ...rest, front: plaintext.front, back: plaintext.back } as FlashCard;
}

/**
 * Produce the at-rest shape of a card. With a key: blank front/back,
 * stash ciphertext in `_e`. Without a key: pass through unchanged.
 */
async function dehydrate(card: FlashCard): Promise<FlashCard> {
  const resolution = peekActiveKey();
  if (!resolution || !resolution.key) return card;
  const envelope: FlashCardEnvelope = { front: card.front, back: card.back };
  const ciphertext = await encryptRecord(envelope, resolution.key);
  return { ...card, front: "", back: "", _e: ciphertext };
}

// ─── Public wrapper API ─────────────────────────────────────────────────────

export async function getEncryptedFlashcard(
  db: DuraDB,
  id: string
): Promise<FlashCard | undefined> {
  const stored = await db.get("flashcards", id);
  return hydrate(stored);
}

export async function putEncryptedFlashcard(db: DuraDB, card: FlashCard): Promise<void> {
  const sealed = await dehydrate(card);
  await db.put("flashcards", sealed);
}

export async function getAllEncryptedFlashcards(db: DuraDB): Promise<FlashCard[]> {
  const stored = await db.getAll("flashcards");
  return Promise.all(stored.map((c) => hydrate(c) as Promise<FlashCard>));
}

export async function getEncryptedFlashcardsByLesson(
  db: DuraDB,
  lessonId: string
): Promise<FlashCard[]> {
  const stored = await db.getAllFromIndex("flashcards", "by-lesson", lessonId);
  return Promise.all(stored.map((c) => hydrate(c) as Promise<FlashCard>));
}

export async function getEncryptedDueFlashcards(
  db: DuraDB,
  upperBound: number
): Promise<FlashCard[]> {
  const range = IDBKeyRange.upperBound(upperBound);
  const stored = await db.getAllFromIndex("flashcards", "by-due", range);
  return Promise.all(stored.map((c) => hydrate(c) as Promise<FlashCard>));
}
