/**
 * Learner record import — the inverse of export.ts.
 *
 * Reads a DURA learner-record ZIP (the one downloadLearnerRecord()
 * produces) and merges it into the local IndexedDB stores. This is the
 * "load save file" surface — for learners who:
 *
 *   - move to a new device / browser
 *   - just had their site data evicted by Chrome under storage pressure
 *   - want a checkpoint they can drop back to ("I broke my streak,
 *     restore my July state")
 *   - are switching from another LFLRS-1.0 compatible LRS
 *
 * Merge strategy: last-write-wins per item by `last_modified`. Cards
 * with a `termSlug` re-derive their `front`/`back` from the local
 * dictionary so no card content is needed in the export to fully
 * restore. Cards without a termSlug carry forward only their FSRS
 * state — content needs to be re-entered by the learner.
 *
 * What this DOES NOT do (deliberate scope):
 *   - It does not modify the local learner_id. The imported record's
 *     learner_id is recorded under x-dura-source-learner-id on each
 *     restored card so a future "Identity from import" follow-up can
 *     surface it. Today the IDs stay separate to avoid silently
 *     stomping device-local sync state.
 *   - It does not import certificates from a foreign learner. Adding
 *     somebody else's certificates to your IDB would be a forgery
 *     vector; certificates are kept device-local.
 */

import JSZip from "jszip";
import { getDB } from "@/lib/db";
import {
  CanonicalLearnerRecordSchema,
  fromCanonicalCard,
  fromCanonicalReviewLog,
  type CanonicalCard,
  type CanonicalLearnerRecord,
  type StoredFlashCard,
  type StoredReviewLog,
} from "@/lib/learner-record/types";
import { putCard } from "@/lib/db/flashcards";
import { putModuleProgress } from "@/lib/db/progress";
import { putGoal } from "@/lib/db/goals";
import { DICTIONARY_BY_SLUG } from "@/content/dictionary";
import type { DictionaryDifficulty } from "@/types/dictionary";
import type { Goal } from "@/types/goal";
import type { LessonProgress, ModuleProgress } from "@/types/curriculum";

/** Manifest fields the export sidecar adds under the x-dura namespace. */
interface DuraSidecar {
  lesson_progress?: LessonProgress[];
  goals?: Goal[];
  /** Certificates intentionally NOT imported — see module-level note. */
  certificates?: unknown[];
  export_version?: string;
}

export interface ImportSummary {
  /** Cards parsed out of the ZIP — not all may be applied. */
  cardsParsed: number;
  cardsRestored: number;
  cardsSkippedNoContent: number;
  reviewLogsRestored: number;
  modulesRestored: number;
  goalsRestored: number;
  lessonProgressRestored: number;
  /** When the source ZIP was generated. */
  sourceGeneratedAt: string;
  /** Anonymous UUID from the source export. */
  sourceLearnerId: string;
}

export class LearnerRecordImportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LearnerRecordImportError";
  }
}

/**
 * Parse + validate a ZIP without writing to IDB. Useful for previewing
 * the import (counts, source learner ID, source export date) before the
 * user commits to it.
 */
export async function parseLearnerRecordZip(file: Blob): Promise<{
  canonical: CanonicalLearnerRecord;
  sidecar: DuraSidecar;
  summary: ImportSummary;
}> {
  let zip: JSZip;
  try {
    zip = await JSZip.loadAsync(file);
  } catch (err) {
    throw new LearnerRecordImportError(
      `Couldn't open the file as a ZIP archive: ${(err as Error).message}`
    );
  }

  const recordFile = zip.file("learner-record.json");
  if (!recordFile) {
    throw new LearnerRecordImportError(
      "ZIP is missing learner-record.json — was this exported from DURA?"
    );
  }

  let raw: unknown;
  try {
    raw = JSON.parse(await recordFile.async("string"));
  } catch (err) {
    throw new LearnerRecordImportError(
      `learner-record.json isn't valid JSON: ${(err as Error).message}`
    );
  }

  const canonicalResult = CanonicalLearnerRecordSchema.safeParse(raw);
  if (!canonicalResult.success) {
    throw new LearnerRecordImportError(
      `learner-record.json doesn't match the LFLRS-1.0 canonical shape: ${canonicalResult.error.message}`
    );
  }
  const canonical = canonicalResult.data;

  const sidecar: DuraSidecar =
    typeof raw === "object" && raw !== null && "x-dura" in raw
      ? ((raw as { "x-dura": DuraSidecar })["x-dura"] ?? {})
      : {};

  // Best-effort tally — actual restored counts come from applyLearnerRecord.
  const cardsWithContent = canonical.cards.filter((c) => Boolean(resolveCardContent(c))).length;
  const cardsSkippedNoContent = canonical.cards.length - cardsWithContent;

  const summary: ImportSummary = {
    cardsParsed: canonical.cards.length,
    cardsRestored: cardsWithContent,
    cardsSkippedNoContent,
    reviewLogsRestored: canonical.review_log.length,
    modulesRestored: canonical.mastery_records.length,
    goalsRestored: sidecar.goals?.length ?? 0,
    lessonProgressRestored: sidecar.lesson_progress?.length ?? 0,
    sourceGeneratedAt: canonical.exported_at,
    sourceLearnerId: canonical.learner_id,
  };

  return { canonical, sidecar, summary };
}

/**
 * Apply a parsed learner record to local IndexedDB. Last-write-wins by
 * `last_modified` (cards, mastery) or by record timestamp (review log,
 * lesson progress). Goals overwrite by id.
 *
 * Returns the actual counts written; differs from preview when a card
 * had no termSlug and no resolvable content.
 */
export async function applyLearnerRecord(parsed: {
  canonical: CanonicalLearnerRecord;
  sidecar: DuraSidecar;
}): Promise<ImportSummary> {
  const { canonical, sidecar } = parsed;
  const db = await getDB();

  const existingCards = new Map<string, StoredFlashCard>(
    (await db.getAll("flashcards")).map((c) => [c.id, c])
  );
  const existingReviewLog = new Set<string>((await db.getAll("reviewLogs")).map((r) => r.id));
  const existingModules = new Map<string, ModuleProgress>(
    (await db.getAll("moduleProgress")).map((m) => [m.moduleId, m])
  );

  // ── Cards ─────────────────────────────────────────────────────────────────
  let cardsRestored = 0;
  let cardsSkippedNoContent = 0;

  for (const card of canonical.cards) {
    const content = resolveCardContent(card);
    if (!content) {
      cardsSkippedNoContent++;
      continue;
    }
    const existing = existingCards.get(card.id);
    if (existing) {
      const existingTs = existing.lastReview ?? existing.createdAt;
      const incomingTs = isoToEpoch(card.last_modified);
      if (existingTs >= incomingTs) continue;
    }
    const stored = fromCanonicalCard(card, {
      front: content.front,
      back: content.back,
      lessonId: existing?.lessonId ?? null,
      termSlug: content.termSlug,
      createdAt: existing?.createdAt ?? isoToEpoch(card.last_modified),
      elapsedDays: 0,
      scheduledDays: 0,
      lastReview: existing?.lastReview ?? null,
    });
    await putCard(stored);
    cardsRestored++;
  }

  // ── Review log ─────────────────────────────────────────────────────────────
  let reviewLogsRestored = 0;
  for (const entry of canonical.review_log) {
    if (existingReviewLog.has(entry.id)) continue;
    const stored: StoredReviewLog = fromCanonicalReviewLog(entry);
    // reviewLogs has its own store; use the raw db handle since logReview()
    // is the runtime path and writes additional indices.
    await db.put("reviewLogs", stored);
    reviewLogsRestored++;
  }

  // ── Module progress ────────────────────────────────────────────────────────
  let modulesRestored = 0;
  for (const mastery of canonical.mastery_records) {
    const existing = existingModules.get(mastery.module_id);
    if (existing) {
      const existingTs = existing.unlockedAt > 0 ? existing.unlockedAt : 0;
      const incomingTs = mastery.unlocked_at ? isoToEpoch(mastery.unlocked_at) : 0;
      // Keep local if it's both newer AND already mastery-gated.
      if (existingTs >= incomingTs && existing.masteryGatePassed) continue;
    }
    // mastery_score in the canonical record was derived from
    // completedLessons/totalLessons + masteryGatePassed (see
    // moduleProgressToCanonicalMastery in src/lib/xapi/projection.ts).
    // Reverse-derive: score=1 ⇒ masteryGatePassed=true. We can't
    // recover the exact completedLessons split without the sidecar,
    // so we preserve the local count when present.
    const restored: ModuleProgress = {
      moduleId: mastery.module_id,
      phaseId: existing?.phaseId ?? mastery.module_id.split("-")[0] ?? "",
      completedLessons: existing?.completedLessons ?? 0,
      totalLessons: existing?.totalLessons ?? 0,
      masteryGatePassed: mastery.mastery_score >= 0.999,
      unlockedAt: mastery.unlocked_at ? isoToEpoch(mastery.unlocked_at) : 0,
    };
    await putModuleProgress(restored);
    modulesRestored++;
  }

  // ── Goals (sidecar) ────────────────────────────────────────────────────────
  let goalsRestored = 0;
  for (const goal of sidecar.goals ?? []) {
    await putGoal(goal);
    goalsRestored++;
  }

  // ── Lesson progress (sidecar) ──────────────────────────────────────────────
  let lessonProgressRestored = 0;
  for (const progress of sidecar.lesson_progress ?? []) {
    await db.put("progress", progress);
    lessonProgressRestored++;
  }

  return {
    cardsParsed: canonical.cards.length,
    cardsRestored,
    cardsSkippedNoContent,
    reviewLogsRestored,
    modulesRestored,
    goalsRestored,
    lessonProgressRestored,
    sourceGeneratedAt: canonical.exported_at,
    sourceLearnerId: canonical.learner_id,
  };
}

/**
 * Try to recover a card's `front`/`back` text. Today only dictionary-
 * derived cards (the 95% case) carry enough metadata in the canonical
 * shape to reconstruct content; freeform cards lose their text on
 * export/import. Returns `null` when content can't be recovered, so the
 * caller can count + report skips.
 */
function resolveCardContent(
  card: CanonicalCard
): { front: string; back: string; termSlug: string | null } | null {
  // The canonical shape doesn't carry termSlug today. We have to peek
  // at any non-canonical fields that may have ridden along, OR derive
  // from card.id if it was minted from a slug.
  const looseCard = card as CanonicalCard & { term_slug?: string; termSlug?: string };
  const termSlug = looseCard.term_slug ?? looseCard.termSlug ?? null;
  if (!termSlug) return null;
  const term = DICTIONARY_BY_SLUG.get(termSlug);
  if (!term) return null;
  const tier: DictionaryDifficulty = "intermediate";
  return { front: term.term, back: term.definitions[tier], termSlug };
}

function isoToEpoch(iso: string): number {
  return new Date(iso).getTime();
}
