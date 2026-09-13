import {
  PORTABLE_RECORD_SCHEMA,
  PORTABLE_PROGRESS_SCHEMA,
  type PortableRecord,
} from "@/lib/learner-record/portable-schema";
import { buildPortableRecord, applyPortableRecord } from "@/lib/learner-record/portable";
import { z } from "zod";
/**
 * Import validates the canonical archive and its versioned plaintext inventory
 * before mutation. Version 2 restores complete content under the destination
 * key in one transaction and merges newer local work. Legacy records can only
 * recover fields actually present in their archive. Imported certificates remain
 * learner-controlled records; their signed artifacts require independent verification.
 */

import JSZip from "jszip";

/**
 * Defensive limits applied before the ZIP is parsed. Aimed at a class
 * of attack where a malicious actor convinces a learner to import a
 * crafted save file that decompresses to gigabytes ("zip bomb"). All
 * three bounds must hold or parseLearnerRecordZip throws before any
 * entry is read into memory.
 *
 * Tuned for the actual shape DURA exports: typical learner-record ZIPs
 * are well under 1 MB; the README + summary + xAPI projection take a
 * few hundred KB even for power users. 50 MB compressed + 200 MB
 * uncompressed leaves ~50x headroom while still bounding worst-case
 * RAM use.
 */
const MAX_ZIP_BYTES = 50 * 1024 * 1024; // 50 MB compressed
const MAX_ENTRIES = 64; // way more than the 4 files DURA writes
const MAX_ENTRY_BYTES = 200 * 1024 * 1024; // 200 MB per file decompressed
const MAX_TOTAL_UNCOMPRESSED_BYTES = 200 * 1024 * 1024; // 200 MB across all entries
import {
  CanonicalLearnerRecordSchema,
  fromCanonicalCard,
  fromCanonicalReviewLog,
  type CanonicalCard,
  type CanonicalLearnerRecord,
} from "@/lib/learner-record/types";
import { DICTIONARY_BY_SLUG } from "@/content/dictionary";
import type { DictionaryDifficulty } from "@/types/dictionary";
import type { Goal } from "@/types/goal";
import type { LessonProgress } from "@/types/curriculum";

/** Manifest fields the export sidecar adds under the x-dura namespace. */
interface DuraSidecar {
  portable?: PortableRecord;
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
  // Bound the raw archive size BEFORE asking JSZip to parse it. JSZip
  // reads the central directory eagerly; a multi-GB blob hands off all
  // the work before our checks would run otherwise.
  if (file.size > MAX_ZIP_BYTES) {
    throw new LearnerRecordImportError(
      `Save file is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). ` +
        `DURA save files are under 50 MB.`
    );
  }

  let zip: JSZip;
  try {
    zip = await JSZip.loadAsync(file);
  } catch (err) {
    throw new LearnerRecordImportError(
      `Couldn't open the file as a ZIP archive: ${(err as Error).message}`
    );
  }

  // Bound the number of entries — DURA writes 4 (learner-record.json,
  // xapi-statements.json, summary.md, README.txt). Anything dramatically
  // higher is either a malformed export or a hostile archive.
  const entryNames = Object.keys(zip.files);
  if (entryNames.length > MAX_ENTRIES) {
    throw new LearnerRecordImportError(
      `Save file has ${entryNames.length} entries; DURA exports never exceed ${MAX_ENTRIES}. ` +
        `This doesn't look like a DURA save.`
    );
  }
  // Per-entry size sanity. JSZip exposes the central-directory
  // uncompressed size before we read the entry, so this is cheap to
  // check.
  let totalUncompressed = 0;
  for (const name of entryNames) {
    const entry = zip.files[name];
    if (!entry || entry.dir) continue;
    // _data may be absent in older JSZip; guard defensively.
    const meta = (entry as unknown as { _data?: { uncompressedSize?: number } })._data;
    const uncompressed = meta?.uncompressedSize ?? 0;
    if (uncompressed > MAX_ENTRY_BYTES) {
      throw new LearnerRecordImportError(
        `Save file entry "${name}" claims ${(uncompressed / 1024 / 1024).toFixed(1)} MB ` +
          `uncompressed — over the per-entry limit. Refusing to decompress.`
      );
    }
    totalUncompressed += uncompressed;
  }
  if (totalUncompressed > MAX_TOTAL_UNCOMPRESSED_BYTES) {
    throw new LearnerRecordImportError(
      `Save file would decompress to ${(totalUncompressed / 1024 / 1024).toFixed(1)} MB ` +
        `total — over the safety limit. Refusing to proceed.`
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

  const rawSidecar =
    typeof raw === "object" && raw !== null && "x-dura" in raw ? raw["x-dura"] : {};
  const sidecar: DuraSidecar = z
    .object({
      portable: PORTABLE_RECORD_SCHEMA.optional(),
      lesson_progress: z.array(PORTABLE_PROGRESS_SCHEMA).optional(),
      goals: PORTABLE_RECORD_SCHEMA.shape.goals.optional(),
      certificates: z.array(z.unknown()).optional(),
      export_version: z.string().optional(),
    })
    .parse(rawSidecar ?? {});

  // Best-effort tally — actual restored counts come from applyLearnerRecord.
  const cardsWithContent =
    sidecar.portable?.flashcards.length ??
    canonical.cards.filter((c) => Boolean(resolveCardContent(c))).length;
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
  if (sidecar.portable) {
    const portable = PORTABLE_RECORD_SCHEMA.parse(sidecar.portable);
    await applyPortableRecord(portable);
    return {
      cardsParsed: portable.flashcards.length,
      cardsRestored: portable.flashcards.length,
      cardsSkippedNoContent: 0,
      reviewLogsRestored: portable.reviewLogs.length,
      modulesRestored: portable.moduleProgress.length,
      goalsRestored: portable.goals.length,
      lessonProgressRestored: portable.progress.length,
      sourceGeneratedAt: canonical.exported_at,
      sourceLearnerId: canonical.learner_id,
    };
  }
  // Legacy archives lack a complete portable inventory. Validate their sidecar,
  // retain existing categories, and commit the recoverable subset atomically too.
  const snapshot = await buildPortableRecord();
  const goals = PORTABLE_RECORD_SCHEMA.shape.goals.parse(sidecar.goals ?? []);
  const progress = z.array(PORTABLE_PROGRESS_SCHEMA).parse(sidecar.lesson_progress ?? []);
  let skipped = 0;
  const cards = canonical.cards.flatMap((card) => {
    const content = resolveCardContent(card);
    if (!content) {
      skipped++;
      return [];
    }
    return [
      fromCanonicalCard(card, {
        ...content,
        lessonId: null,
        createdAt: isoToEpoch(card.last_modified),
        elapsedDays: 0,
        scheduledDays: 0,
        lastReview: null,
      }),
    ];
  });
  const knownCards = new Set([...snapshot.flashcards, ...cards].map((card) => card.id));
  const logs = canonical.review_log
    .filter((row) => knownCards.has(row.card_id))
    .map(fromCanonicalReviewLog);
  await applyPortableRecord({ ...snapshot, flashcards: cards, reviewLogs: logs, goals, progress });
  return {
    cardsParsed: canonical.cards.length,
    cardsRestored: cards.length,
    cardsSkippedNoContent: skipped,
    reviewLogsRestored: logs.length,
    modulesRestored: 0,
    goalsRestored: goals.length,
    lessonProgressRestored: progress.length,
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
