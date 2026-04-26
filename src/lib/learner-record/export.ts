/**
 * Learner data export (LFLRS-R5 + GDPR Art. 20).
 *
 * Builds an offline ZIP containing:
 *   - learner-record.json — full local state (cards, reviewLog, progress,
 *     moduleProgress, certificates, goals)
 *   - xapi-statements.json — every learning event projected onto xAPI 1.0.3
 *   - summary.md — human-readable narrative summary
 *   - README.txt — short orientation note
 *
 * Works fully offline — does NOT call Supabase, does NOT require auth, does
 * NOT transmit anything. Everything is read from IndexedDB + localStorage
 * and packaged client-side.
 *
 * The export is the contractual evidence for GDPR Art. 20 (right to data
 * portability) and LFLRS-R5 (learner export). It is also the canonical
 * format for transferring a learner's history into a different LRS.
 */

import JSZip from "jszip";
import { getDB } from "@/lib/db";
import { getLocalLearnerId } from "@/lib/learner-record/identity";
import { toCanonicalCard, toCanonicalReviewLog } from "@/lib/learner-record/types";
import {
  masteryTransitionToXAPI,
  moduleProgressToCanonicalMastery,
  reviewEventToXAPI,
} from "@/lib/xapi/projection";
import { generateMarkdownSummary } from "@/lib/learner-record/summary";
import type { CanonicalLearnerRecord } from "@/lib/learner-record/types";
import type { XAPIStatement } from "@/lib/xapi/projection";

const EXPORT_VERSION = "1.0";

const README_TEXT = `DURA Learner Record Export
==========================

Files in this archive:
  - learner-record.json: Complete local study state (LFLRS-1.0 canonical
    wire format). Cards, review log, mastery records, lesson progress.
  - xapi-statements.json: Learning events in xAPI 1.0.3 format —
    importable into any conforming Learning Record Store.
  - summary.md: Human-readable summary of your study history.
  - README.txt: This file.

Your learner ID is a local anonymous UUID generated in your browser. It
is NOT linked to your name or email. If you signed in with Supabase, the
auth UID is separate and not present in this export.

This export satisfies your right to data portability under GDPR Article
20 and equivalent regulations.
`;

export interface LearnerExportBundle {
  blob: Blob;
  filename: string;
  generatedAt: string;
  stats: {
    cards: number;
    reviewLog: number;
    progress: number;
    modules: number;
    xapiStatements: number;
  };
}

/**
 * Assemble and return the learner record export ZIP. Pure data flow:
 * IDB → canonical → xAPI → ZIP. No I/O outside the browser; safe to call
 * from anywhere in the app once the IDB is open.
 */
export async function exportLearnerRecord(): Promise<LearnerExportBundle> {
  const db = await getDB();
  const learnerId = getLocalLearnerId();
  const now = Date.now();
  const generatedAt = new Date(now).toISOString();

  const [cards, reviewLog, progress, moduleProgress, goals, certificates] = await Promise.all([
    db.getAll("flashcards"),
    db.getAll("reviewLogs"),
    db.getAll("progress"),
    db.getAll("moduleProgress"),
    db.getAll("goals"),
    db.getAll("certificates"),
  ]);

  // ── Build the canonical learner record ─────────────────────────────────
  const canonicalCards = cards.map((card) =>
    toCanonicalCard(card, card.lastReview ?? card.createdAt)
  );
  const canonicalReviewLog = reviewLog.map(toCanonicalReviewLog);
  const canonicalMastery = moduleProgress.map((m) =>
    moduleProgressToCanonicalMastery(m, m.unlockedAt > 0 ? m.unlockedAt : now)
  );

  const canonicalRecord: CanonicalLearnerRecord = {
    schema_version: "lflrs-1.0",
    learner_id: learnerId,
    exported_at: generatedAt,
    cards: canonicalCards,
    review_log: canonicalReviewLog,
    mastery_records: canonicalMastery,
  };

  // The non-LFLRS bits (goals, certificates, lesson progress) are still
  // useful for portability — they ride along under a reserved namespace
  // that's flagged as project-specific in the JSON.
  const fullRecord = {
    ...canonicalRecord,
    "x-dura": {
      lesson_progress: progress,
      goals,
      certificates,
      export_version: EXPORT_VERSION,
    },
  };

  // ── Project to xAPI ────────────────────────────────────────────────────
  const xapiStatements: XAPIStatement[] = [];
  for (const entry of canonicalReviewLog) {
    xapiStatements.push(reviewEventToXAPI(entry, learnerId, crypto.randomUUID()));
  }
  for (const record of canonicalMastery) {
    if (record.unlocked_at !== null || record.mastery_score >= 0.8) {
      xapiStatements.push(masteryTransitionToXAPI(record, learnerId, crypto.randomUUID()));
    }
  }

  // ── Markdown summary ───────────────────────────────────────────────────
  const summary = generateMarkdownSummary({
    exportedAt: generatedAt,
    learnerId,
    cards,
    reviewLog,
    progress,
    moduleProgress,
  });

  // ── Pack ───────────────────────────────────────────────────────────────
  const zip = new JSZip();
  zip.file("learner-record.json", JSON.stringify(fullRecord, null, 2));
  zip.file("xapi-statements.json", JSON.stringify({ statements: xapiStatements }, null, 2));
  zip.file("summary.md", summary);
  zip.file("README.txt", README_TEXT);

  const blob = await zip.generateAsync({ type: "blob" });
  const filename = `dura-learner-record-${generatedAt.slice(0, 10)}.zip`;

  return {
    blob,
    filename,
    generatedAt,
    stats: {
      cards: cards.length,
      reviewLog: reviewLog.length,
      progress: progress.length,
      modules: moduleProgress.length,
      xapiStatements: xapiStatements.length,
    },
  };
}

/**
 * Trigger a browser download of the learner record bundle. Uses the standard
 * a[download] hack — no native file picker dependency, works offline.
 */
export async function downloadLearnerRecord(): Promise<LearnerExportBundle["stats"]> {
  const bundle = await exportLearnerRecord();
  const url = URL.createObjectURL(bundle.blob);
  try {
    const a = document.createElement("a");
    a.href = url;
    a.download = bundle.filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  } finally {
    URL.revokeObjectURL(url);
  }
  return bundle.stats;
}
