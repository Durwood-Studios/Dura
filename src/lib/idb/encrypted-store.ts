import { ownerDatabaseName, getStorageOwner } from "@/lib/storage/owner";
import { resolveEncryptionKey } from "@/lib/idb/encryption-key";
/**
 * IDB encryption wrapper (P5-A.2 + P5-A.3) — at-rest encryption for the
 * four sensitive stores: flashcards, reviewLogs, progress, moduleProgress.
 *
 * Each wrapper splits records into two parts:
 *   - PLAINTEXT FIELDS: keypath + every field referenced by an existing
 *     index. These stay readable so IDB indexes (by-due, by-state, by-card,
 *     by-phase, by-synced, …) keep working without rebuilds.
 *   - ENCRYPTED ENVELOPE (`_e`): every remaining field, JSON-serialized
 *     and AES-256-GCM-encrypted into a single ArrayBuffer.
 *
 * Best-effort migration:
 *   - On read: if `_e` present, decrypt and reattach the fields. If not,
 *     return the legacy plaintext record unchanged. No failure mode leaves
 *     a learner unable to read their existing data.
 *   - On write: with an active key, encrypt the behavioral fields. Without
 *     a key (SSR, pre-AuthProvider mount, etc.), pass through plaintext —
 *     the next write under a key will encrypt.
 *   - Wrong key: throws. That's the cryptographic contract — sign-out
 *     destroys auth-tier access until re-auth.
 */

import type { DuraDB } from "@/lib/db";
import type { FlashCard, ReviewLog } from "@/types/flashcard";
import type { LessonProgress, ModuleProgress } from "@/types/curriculum";
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
  if (!isEncryptedRecord(stored._e))
    throw new Error("Encrypted flashcard data is damaged; restore a valid backup.");
  const resolution = peekActiveKey();
  if (!resolution || !resolution.key) {
    // Encrypted record but no key in scope — surface a clear error so
    // a misconfigured caller doesn't silently render blank flashcards.
    throw new Error(
      "[encrypted-store] Encrypted flashcard found but no active encryption key. " +
        "AuthProvider must call setActiveKey() before reads."
    );
  }
  const plaintext = (await decryptOwnedRecord(stored._e, resolution.key)) as FlashCardEnvelope;
  const rest = { ...stored };
  delete rest._e;
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

// ─── Generic hydrate/dehydrate for behavioral stores (P5-A.3) ────────────────
//
// `plaintextFields` is the list of fields that MUST stay readable at rest
// (keypath + every field referenced by an existing IDB index). The wrapper
// encrypts everything else into `_e`.

async function hydrateGeneric<T extends { _e?: ArrayBuffer }>(
  stored: T | undefined,
  storeLabel: string
): Promise<T | undefined> {
  if (!stored) return stored;
  if (!stored._e) return stored;
  if (!isEncryptedRecord(stored._e))
    throw new Error(`Encrypted ${storeLabel} data is damaged; restore a valid backup.`);
  const resolution = peekActiveKey();
  if (!resolution || !resolution.key) {
    throw new Error(
      `[encrypted-store] Encrypted ${storeLabel} record found but no active encryption key.`
    );
  }
  const plaintext = (await decryptOwnedRecord(stored._e, resolution.key)) as Record<
    string,
    unknown
  >;
  const rest = { ...stored };
  delete (rest as { _e?: ArrayBuffer })._e;
  return { ...rest, ...plaintext } as T;
}

async function dehydrateGeneric<T extends object>(
  record: T,
  plaintextFields: readonly (keyof T)[]
): Promise<T & { _e?: ArrayBuffer }> {
  const resolution = peekActiveKey();
  if (!resolution || !resolution.key) return record as T & { _e?: ArrayBuffer };
  const plain: Partial<T> = {};
  const secret: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(record)) {
    if (k === "_e") continue;
    if ((plaintextFields as readonly string[]).includes(k)) {
      (plain as Record<string, unknown>)[k] = v;
    } else {
      secret[k] = v;
    }
  }
  const ciphertext = await encryptRecord(secret, resolution.key);
  return { ...plain, _e: ciphertext } as T & { _e?: ArrayBuffer };
}

// ─── reviewLogs ──────────────────────────────────────────────────────────────
const REVIEW_LOG_PLAINTEXT = ["id", "cardId", "reviewedAt"] as const;

export async function putEncryptedReviewLog(db: DuraDB, log: ReviewLog): Promise<void> {
  const sealed = await dehydrateGeneric(log, REVIEW_LOG_PLAINTEXT);
  await db.put("reviewLogs", sealed);
}

/** Commit a scheduled card and its review log together, after encryption finishes. */
export async function putEncryptedCardReview(
  db: DuraDB,
  card: FlashCard,
  log: ReviewLog
): Promise<void> {
  const [sealedCard, sealedLog] = await Promise.all([
    dehydrate(card),
    dehydrateGeneric(log, REVIEW_LOG_PLAINTEXT),
  ]);
  const transaction = db.transaction(["flashcards", "reviewLogs"], "readwrite");
  await Promise.all([
    transaction.objectStore("flashcards").put(sealedCard),
    transaction.objectStore("reviewLogs").put(sealedLog),
    transaction.done,
  ]);
}

export async function getAllEncryptedReviewLogs(db: DuraDB): Promise<ReviewLog[]> {
  const stored = await db.getAll("reviewLogs");
  return Promise.all(stored.map((r) => hydrateGeneric(r, "reviewLog") as Promise<ReviewLog>));
}

export async function getEncryptedReviewLogsForCard(
  db: DuraDB,
  cardId: string
): Promise<ReviewLog[]> {
  const stored = await db.getAllFromIndex("reviewLogs", "by-card", cardId);
  return Promise.all(stored.map((r) => hydrateGeneric(r, "reviewLog") as Promise<ReviewLog>));
}

// ─── progress (lesson) ───────────────────────────────────────────────────────
const PROGRESS_PLAINTEXT = ["lessonId", "phaseId", "moduleId", "synced"] as const;

export async function getEncryptedLessonProgress(
  db: DuraDB,
  lessonId: string
): Promise<LessonProgress | undefined> {
  const stored = await db.get("progress", lessonId);
  return hydrateGeneric(stored, "lessonProgress");
}

export async function putEncryptedLessonProgress(
  db: DuraDB,
  progress: LessonProgress
): Promise<void> {
  const sealed = await dehydrateGeneric(progress, PROGRESS_PLAINTEXT);
  await db.put("progress", sealed);
}

export async function getAllEncryptedLessonProgress(db: DuraDB): Promise<LessonProgress[]> {
  const stored = await db.getAll("progress");
  return Promise.all(
    stored.map((p) => hydrateGeneric(p, "lessonProgress") as Promise<LessonProgress>)
  );
}

export async function getEncryptedLessonProgressByPhase(
  db: DuraDB,
  phaseId: string
): Promise<LessonProgress[]> {
  const stored = await db.getAllFromIndex("progress", "by-phase", phaseId);
  return Promise.all(
    stored.map((p) => hydrateGeneric(p, "lessonProgress") as Promise<LessonProgress>)
  );
}

export async function getEncryptedLessonProgressByModule(
  db: DuraDB,
  moduleId: string
): Promise<LessonProgress[]> {
  const stored = await db.getAllFromIndex("progress", "by-module", moduleId);
  return Promise.all(
    stored.map((p) => hydrateGeneric(p, "lessonProgress") as Promise<LessonProgress>)
  );
}

export async function getEncryptedUnsyncedLessonProgress(db: DuraDB): Promise<LessonProgress[]> {
  const stored = await db.getAllFromIndex("progress", "by-synced", 0);
  return Promise.all(
    stored.map((p) => hydrateGeneric(p, "lessonProgress") as Promise<LessonProgress>)
  );
}

// ─── moduleProgress ──────────────────────────────────────────────────────────
const MODULE_PROGRESS_PLAINTEXT = ["moduleId", "phaseId"] as const;

export async function getEncryptedModuleProgress(
  db: DuraDB,
  moduleId: string
): Promise<ModuleProgress | undefined> {
  const stored = await db.get("moduleProgress", moduleId);
  return hydrateGeneric(stored, "moduleProgress");
}

export async function putEncryptedModuleProgress(
  db: DuraDB,
  progress: ModuleProgress
): Promise<void> {
  const sealed = await dehydrateGeneric(progress, MODULE_PROGRESS_PLAINTEXT);
  await db.put("moduleProgress", sealed);
}

export async function getAllEncryptedModuleProgress(db: DuraDB): Promise<ModuleProgress[]> {
  const stored = await db.getAll("moduleProgress");
  return Promise.all(
    stored.map((m) => hydrateGeneric(m, "moduleProgress") as Promise<ModuleProgress>)
  );
}

/** Seal a complete import before starting its single IDB transaction. */
export async function sealPortableRows(rows: {
  flashcards: FlashCard[];
  reviewLogs: ReviewLog[];
  progress: LessonProgress[];
  moduleProgress: ModuleProgress[];
}): Promise<{
  flashcards: FlashCard[];
  reviewLogs: ReviewLog[];
  progress: LessonProgress[];
  moduleProgress: ModuleProgress[];
}> {
  const [flashcards, reviewLogs, progress, moduleProgress] = await Promise.all([
    Promise.all(rows.flashcards.map(dehydrate)),
    Promise.all(
      rows.reviewLogs.map((row): Promise<ReviewLog> => dehydrateGeneric(row, REVIEW_LOG_PLAINTEXT))
    ),
    Promise.all(
      rows.progress.map((row): Promise<LessonProgress> => dehydrateGeneric(row, PROGRESS_PLAINTEXT))
    ),
    Promise.all(
      rows.moduleProgress.map(
        (row): Promise<ModuleProgress> => dehydrateGeneric(row, MODULE_PROGRESS_PLAINTEXT)
      )
    ),
  ]);
  return { flashcards, reviewLogs, progress, moduleProgress };
}

/** Old pre-namespace records may retain their original guest key inside the legacy owner's DB. */
async function decryptOwnedRecord(ciphertext: ArrayBuffer, key: CryptoKey): Promise<unknown> {
  try {
    return await decryptRecord(ciphertext, key);
  } catch (error) {
    if (
      ownerDatabaseName() !== "dura" ||
      !getStorageOwner().startsWith("account:") ||
      peekActiveKey()?.tier !== "auth"
    )
      throw error;
    const original = await resolveEncryptionKey(null);
    if (!original.key) throw error;
    return decryptRecord(ciphertext, original.key);
  }
}

/** Merge a remote progress row without overwriting work changed during decryption/encryption. */
export async function mergeRemoteProgress(
  db: DuraDB,
  remote: LessonProgress,
  merge: (local: LessonProgress, remote: LessonProgress) => LessonProgress
): Promise<void> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const captured = await db.get("progress", remote.lessonId);
    const local = await hydrateGeneric(captured, "lessonProgress");
    const sealed = await dehydrateGeneric(
      local ? merge(local, remote) : remote,
      PROGRESS_PLAINTEXT
    );
    const tx = db.transaction("progress", "readwrite");
    const current = await tx.store.get(remote.lessonId);
    if (!sameEnvelope(current, captured)) {
      await tx.done;
      continue;
    }
    await tx.store.put(sealed);
    await tx.done;
    return;
  }
  // A busy learner wins; a later periodic pull can retry the remote merge.
}

/** Merge scheduling atomically with respect to a concurrent local review. */
export async function mergeRemoteFlashcard(
  db: DuraDB,
  remote: FlashCard,
  merge: (local: FlashCard, remote: FlashCard) => FlashCard
): Promise<void> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const captured = await db.get("flashcards", remote.id);
    const local = await hydrate(captured);
    const sealed = await dehydrate(local ? merge(local, remote) : remote);
    const tx = db.transaction("flashcards", "readwrite");
    const current = await tx.store.get(remote.id);
    if (!sameEnvelope(current, captured)) {
      await tx.done;
      continue;
    }
    await tx.store.put(sealed);
    await tx.done;
    return;
  }
}
function sameEnvelope(a: unknown, b: unknown): boolean {
  const encode = (_key: string, value: unknown): unknown =>
    value instanceof ArrayBuffer ? Array.from(new Uint8Array(value)) : value;
  return JSON.stringify(a, encode) === JSON.stringify(b, encode);
}
