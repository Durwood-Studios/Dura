/**
 * xAPI 1.0.3 statement projection layer (LFLRS-R4).
 *
 * Projects DURA's canonical learner record types onto xAPI Statements that
 * any conforming Learning Record Store (LRS) can ingest. Used by:
 *   - Learner data export (P2-D) — emits a `xapi-statements.json` alongside
 *     the JSON learner record
 *   - Future LRS sync (out of scope for the compliance sprint)
 *
 * Privacy contract:
 *   - actor.account.name is ALWAYS the learner's local UUID — never an email,
 *     real name, or Supabase auth UID.
 *   - The homePage is a fixed namespace identifier; it does not resolve.
 *   - No additional fields beyond xAPI's well-known shape are emitted.
 *
 * Spec reference: https://github.com/adlnet/xAPI-Spec/blob/master/xAPI-Data.md
 */

import { z } from "zod";
import type { ModuleProgress } from "@/types/curriculum";
import type { CanonicalMasteryRecord, CanonicalReviewLogEntry } from "@/lib/learner-record/types";

// ─── xAPI Statement schema (Zod) ────────────────────────────────────────────

export const XAPIVerbSchema = z.object({
  id: z.string().url(),
  display: z.record(z.string(), z.string()),
});

export const XAPIActorSchema = z.object({
  objectType: z.literal("Agent"),
  account: z.object({
    name: z.string().uuid(),
    homePage: z.string().url(),
  }),
});

export const XAPIActivitySchema = z.object({
  id: z.string().url(),
  objectType: z.literal("Activity"),
  definition: z.object({
    name: z.record(z.string(), z.string()),
    type: z.string().url(),
  }),
});

export const XAPIScoreSchema = z.object({
  scaled: z.number().min(0).max(1).optional(),
  raw: z.number().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
});

export const XAPIResultSchema = z.object({
  score: XAPIScoreSchema.optional(),
  completion: z.boolean().optional(),
  success: z.boolean().optional(),
  duration: z.string().optional(),
  extensions: z.record(z.string(), z.unknown()).optional(),
});

export const XAPIStatementSchema = z.object({
  id: z.string().uuid(),
  actor: XAPIActorSchema,
  verb: XAPIVerbSchema,
  object: XAPIActivitySchema,
  result: XAPIResultSchema.optional(),
  context: z
    .object({
      extensions: z.record(z.string(), z.unknown()).optional(),
    })
    .optional(),
  timestamp: z.string().datetime(),
});

export type XAPIStatement = z.infer<typeof XAPIStatementSchema>;

// ─── Verb registry ──────────────────────────────────────────────────────────

const VERBS = {
  answered: {
    id: "http://adlnet.gov/expapi/verbs/answered",
    display: { "en-US": "answered" },
  },
  completed: {
    id: "http://adlnet.gov/expapi/verbs/completed",
    display: { "en-US": "completed" },
  },
  passed: {
    id: "http://adlnet.gov/expapi/verbs/passed",
    display: { "en-US": "passed" },
  },
  attempted: {
    id: "http://adlnet.gov/expapi/verbs/attempted",
    display: { "en-US": "attempted" },
  },
} as const;

const LEARNER_HOMEPAGE = "https://dura.app/learner";
const ACTIVITY_TYPE_ASSESSMENT = "http://adlnet.gov/expapi/activities/assessment";
const ACTIVITY_TYPE_MODULE = "http://adlnet.gov/expapi/activities/module";

const PASS_THRESHOLD = 0.8;
const MASTERY_PASS_THRESHOLD = 1.0;

// ─── Projections ────────────────────────────────────────────────────────────

/**
 * Project a canonical review log entry onto an xAPI `answered` statement.
 *
 * The 1-4 canonical rating maps to a 0..1 scaled score: rating 1 (again) → 0,
 * rating 4 (easy) → 1. The mapping is intentionally linear; consumers that
 * want FSRS-aware scoring should read the extension fields instead.
 */
export function reviewEventToXAPI(
  entry: CanonicalReviewLogEntry,
  learnerId: string,
  statementId: string
): XAPIStatement {
  const scaled = (entry.rating - 1) / 3;
  return XAPIStatementSchema.parse({
    id: statementId,
    actor: {
      objectType: "Agent",
      account: { name: learnerId, homePage: LEARNER_HOMEPAGE },
    },
    verb: VERBS.answered,
    object: {
      id: `https://dura.app/cards/${entry.card_id}`,
      objectType: "Activity",
      definition: {
        name: { "en-US": "Flashcard Review" },
        type: ACTIVITY_TYPE_ASSESSMENT,
      },
    },
    result: {
      score: { scaled },
      completion: true,
      success: scaled >= PASS_THRESHOLD,
      extensions: {
        "https://dura.app/xapi/extensions/fsrs-state": entry.state,
        "https://dura.app/xapi/extensions/elapsed-days": entry.elapsed_days,
        "https://dura.app/xapi/extensions/scheduled-days": entry.scheduled_days,
        "https://dura.app/xapi/extensions/raw-rating": entry.rating,
      },
    },
    timestamp: entry.review,
  });
}

/**
 * Project a canonical mastery record onto an xAPI `passed`/`completed`
 * statement. Verb is `passed` once mastery_score reaches 1.0; otherwise
 * `completed` (work was done) with success=true at the project's pass
 * threshold.
 */
export function masteryTransitionToXAPI(
  record: CanonicalMasteryRecord,
  learnerId: string,
  statementId: string
): XAPIStatement {
  const verb = record.mastery_score >= MASTERY_PASS_THRESHOLD ? VERBS.passed : VERBS.completed;
  return XAPIStatementSchema.parse({
    id: statementId,
    actor: {
      objectType: "Agent",
      account: { name: learnerId, homePage: LEARNER_HOMEPAGE },
    },
    verb,
    object: {
      id: `https://dura.app/modules/${encodeURIComponent(record.module_id)}`,
      objectType: "Activity",
      definition: {
        name: { "en-US": "Learning Module" },
        type: ACTIVITY_TYPE_MODULE,
      },
    },
    result: {
      score: { scaled: record.mastery_score },
      completion: record.unlocked_at !== null,
      success: record.mastery_score >= PASS_THRESHOLD,
    },
    timestamp: record.unlocked_at ?? record.last_modified,
  });
}

// ─── Adapter: ModuleProgress → CanonicalMasteryRecord ───────────────────────

/**
 * DURA stores mastery as discrete `ModuleProgress` records; LFLRS-1.0's
 * canonical wire format expects a `MasteryRecord` with a 0..1 mastery_score.
 * This adapter derives the score from completed/total lessons and lifts the
 * unlock timestamp.
 *
 * masteryGatePassed=true overrides the lesson-fraction calculation by
 * pinning mastery_score to 1.0 — the gate is the authoritative signal of
 * full mastery, not the lesson count (a learner can pass the gate with
 * fewer-than-all lessons completed in some module configurations).
 */
export function moduleProgressToCanonicalMastery(
  progress: ModuleProgress,
  lastModifiedMs: number
): CanonicalMasteryRecord {
  const lessonFraction =
    progress.totalLessons > 0 ? Math.min(1, progress.completedLessons / progress.totalLessons) : 0;
  const score = progress.masteryGatePassed ? 1 : lessonFraction;
  return {
    module_id: progress.moduleId,
    mastery_score: score,
    unlocked_at: progress.unlockedAt > 0 ? new Date(progress.unlockedAt).toISOString() : null,
    last_modified: new Date(lastModifiedMs).toISOString(),
  };
}
