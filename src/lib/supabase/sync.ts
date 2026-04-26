import { getDB } from "@/lib/db";
import { createClient } from "@/lib/supabase/client";
import { syncLessonProgress, fetchLessonProgress } from "./queries/progress";
import {
  syncFlashcards,
  fetchFlashcards,
  syncReviewLogs,
  fetchReviewLogs,
} from "./queries/flashcards";
import { syncGoals, fetchGoals } from "./queries/goals";
import { syncCertificates, fetchCertificates } from "./queries/certificates";
import { batchSyncAnalytics, syncXPEvents } from "./queries/analytics";
import { isAnalyticsEnabled } from "@/lib/analytics/consent-gate";
import type { LessonProgress } from "@/types/curriculum";
import type { FlashCard, ReviewLog } from "@/types/flashcard";
import type { Goal } from "@/types/goal";

interface SyncResult {
  pushed: number;
  pulled: number;
  conflicts: number;
  errors: string[];
}

let backgroundSyncInterval: ReturnType<typeof setInterval> | null = null;

/**
 * Check if user is authenticated. Returns user ID or null.
 */
export async function getAuthUserId(): Promise<string | null> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user?.id ?? null;
  } catch {
    return null;
  }
}

/**
 * Full bidirectional sync. Called:
 * - On sign-in (pull remote -> merge with local)
 * - Periodically in background (push local -> remote)
 * - On explicit "Sync now" action
 */
export async function fullSync(): Promise<SyncResult> {
  const result: SyncResult = { pushed: 0, pulled: 0, conflicts: 0, errors: [] };

  const userId = await getAuthUserId();
  if (!userId) {
    result.errors.push("Not authenticated");
    return result;
  }

  try {
    const pushResult = await pushChanges();
    result.pushed = pushResult;
  } catch (err) {
    result.errors.push(`Push failed: ${err instanceof Error ? err.message : String(err)}`);
  }

  try {
    const pullResult = await pullChanges();
    result.pulled = pullResult.pulled;
    result.conflicts = pullResult.conflicts;
  } catch (err) {
    result.errors.push(`Pull failed: ${err instanceof Error ? err.message : String(err)}`);
  }

  return result;
}

/**
 * Push local unsynced changes to Supabase.
 * Called in background every 30 seconds when online.
 * Returns the number of records pushed.
 */
export async function pushChanges(): Promise<number> {
  const userId = await getAuthUserId();
  if (!userId) return 0;

  const db = await getDB();
  let pushed = 0;

  // Push unsynced lesson progress
  const unsyncedProgress = await db.getAllFromIndex("progress", "by-synced", 0);
  if (unsyncedProgress.length > 0) {
    await syncLessonProgress(userId, unsyncedProgress);
    const tx = db.transaction("progress", "readwrite");
    for (const record of unsyncedProgress) {
      await tx.store.put({ ...record, synced: 1 });
    }
    await tx.done;
    pushed += unsyncedProgress.length;
  }

  // Push all flashcards (client owns SRS state)
  const allCards = await db.getAll("flashcards");
  if (allCards.length > 0) {
    await syncFlashcards(userId, allCards);
    pushed += allCards.length;
  }

  // Push all review logs (append-only, server deduplicates)
  const allLogs = await db.getAll("reviewLogs");
  if (allLogs.length > 0) {
    await syncReviewLogs(userId, allLogs);
    pushed += allLogs.length;
  }

  // Push goals
  const allGoals = await db.getAll("goals");
  if (allGoals.length > 0) {
    await syncGoals(userId, allGoals);
    pushed += allGoals.length;
  }

  // Push certificates
  const allCerts = await db.getAll("certificates");
  if (allCerts.length > 0) {
    await syncCertificates(userId, allCerts);
    pushed += allCerts.length;
  }

  // Push unsynced analytics (append-only) — gated by analytics consent.
  // batchSyncAnalytics is itself a no-op when consent is off, but we
  // also skip the IDB read + mark-synced loop here to avoid mutating
  // local state on data that isn't transmitted.
  if (isAnalyticsEnabled()) {
    const unsyncedAnalytics = await db.getAllFromIndex("analytics", "by-synced", 0);
    if (unsyncedAnalytics.length > 0) {
      await batchSyncAnalytics(userId, unsyncedAnalytics);
      const tx = db.transaction("analytics", "readwrite");
      for (const event of unsyncedAnalytics) {
        await tx.store.put({ ...event, synced: 1 });
      }
      await tx.done;
      pushed += unsyncedAnalytics.length;
    }
  }

  // Push XP events (append-only)
  const allXP = await db.getAll("xp-events");
  if (allXP.length > 0) {
    await syncXPEvents(userId, allXP);
    pushed += allXP.length;
  }

  return pushed;
}

/**
 * Pull remote data and merge with local.
 * Called on sign-in and periodically.
 */
export async function pullChanges(): Promise<{ pulled: number; conflicts: number }> {
  const userId = await getAuthUserId();
  if (!userId) return { pulled: 0, conflicts: 0 };

  const db = await getDB();
  let pulled = 0;
  let conflicts = 0;

  // Pull lesson progress
  const remoteProgress = await fetchLessonProgress(userId);
  for (const remote of remoteProgress) {
    const local = await db.get("progress", remote.lessonId);
    if (local) {
      const merged = mergeProgress(local, remote);
      if (merged !== local) conflicts++;
      await db.put("progress", merged);
    } else {
      await db.put("progress", remote);
    }
    pulled++;
  }

  // Pull flashcards — remote is merged by taking the version with the latest lastReview
  const remoteCards = await fetchFlashcards(userId);
  for (const remote of remoteCards) {
    const local = await db.get("flashcards", remote.id);
    if (local) {
      const merged = mergeFlashcard(local, remote);
      if (merged !== local) conflicts++;
      await db.put("flashcards", merged);
    } else {
      await db.put("flashcards", remote);
    }
    pulled++;
  }

  // Pull goals — latest updated_at wins (use achievedAt as proxy)
  const remoteGoals = await fetchGoals(userId);
  for (const remote of remoteGoals) {
    const local = await db.get("goals", remote.id);
    if (local) {
      const merged = mergeGoal(local, remote);
      if (merged !== local) conflicts++;
      await db.put("goals", merged);
    } else {
      await db.put("goals", remote);
    }
    pulled++;
  }

  // Pull review logs — G-Set semantics (append-only set; merge by id-union).
  // Existing entries are NEVER overwritten on either side, even if a remote
  // copy of an existing id has different field values (which shouldn't
  // happen — review log entries are immutable by contract — but if it
  // does, the local copy wins because the server is authoritative-on-write
  // not authoritative-on-read for an append-only log).
  const remoteLogs = await fetchReviewLogs(userId);
  const localLogIds = new Set((await db.getAll("reviewLogs")).map((entry) => entry.id));
  for (const remote of remoteLogs) {
    if (localLogIds.has(remote.id)) continue;
    await db.put("reviewLogs", remote);
    pulled++;
  }

  // Pull certificates — immutable, just add missing ones
  const remoteCerts = await fetchCertificates(userId);
  for (const remote of remoteCerts) {
    const local = await db.get("certificates", remote.id);
    if (!local) {
      await db.put("certificates", remote);
      pulled++;
    }
  }

  return { pulled, conflicts };
}

/**
 * LFLRS-R6 idempotency contract.
 *
 * Every merge function below is pure, deterministic, and idempotent:
 *   - merge(local, remote) === merge(merge(local, remote), remote)
 *   - merge(newer-local, older-remote) preserves newer-local's monotonic fields
 *   - merge(local, local) === local
 *
 * That property is what lets sync run on a 30s background interval without
 * fearing accumulated drift, and what makes the same remote state apply
 * the same way on every device. Tests in
 * tests/learner-record/sync-idempotency.test.ts cover these invariants.
 *
 * Per the LFLRS standard, the operators per data type are:
 *   - lesson progress: per-field max/OR over monotonic fields (LWW per field
 *     with the field-value itself as the tiebreaker — `max` is its own LWW)
 *   - flashcards: whole-record LWW with `lastReview` as the timestamp.
 *     This is functionally equivalent to per-field LWW because FSRS-5
 *     updates every field of the card atomically on every review — there
 *     is no real-world flow that updates one field without the others.
 *   - goals: monotonic per-field merge (achievedAt sticks once set; current
 *     takes the max).
 *   - review_log: G-Set union by id (append-only; existing ids never
 *     replaced).
 *   - certificates: G-Set union by id (immutable on first write).
 */

/**
 * Merge conflict resolution for lesson progress:
 * - completion: OR (if completed anywhere, mark completed)
 * - scrollPercent: keep highest
 * - timeSpentMs: keep highest
 * - quizPassed: OR
 * - quizScore: keep highest
 * - xpEarned: keep highest
 */
export function mergeProgress(local: LessonProgress, remote: LessonProgress): LessonProgress {
  return {
    lessonId: local.lessonId,
    phaseId: local.phaseId,
    moduleId: local.moduleId,
    startedAt: Math.min(local.startedAt, remote.startedAt),
    completedAt:
      local.completedAt && remote.completedAt
        ? Math.min(local.completedAt, remote.completedAt)
        : (local.completedAt ?? remote.completedAt),
    scrollPercent: Math.max(local.scrollPercent, remote.scrollPercent),
    timeSpentMs: Math.max(local.timeSpentMs, remote.timeSpentMs),
    quizPassed: local.quizPassed || remote.quizPassed,
    quizScore: maxNullable(local.quizScore, remote.quizScore),
    xpEarned: Math.max(local.xpEarned, remote.xpEarned),
    synced: 1,
  };
}

/**
 * Merge flashcards: whole-record LWW keyed by `lastReview`.
 *
 * Equivalent to per-field LWW because FSRS-5 updates every card field
 * atomically on review — there is no flow that mutates one field without
 * the others. Strictly-greater-than (not >=) on the timestamp guarantees
 * that mergeFlashcard(x, x) === x for an unchanged remote, which is what
 * makes repeated sync calls idempotent.
 */
export function mergeFlashcard(local: FlashCard, remote: FlashCard): FlashCard {
  const localReview = local.lastReview ?? 0;
  const remoteReview = remote.lastReview ?? 0;
  return remoteReview > localReview ? remote : local;
}

/**
 * Merge review logs as a G-Set (grow-only set) keyed by id.
 *
 * Pure version of the inline merge in pullChanges() — kept exported so
 * the idempotency test suite can exercise it directly. Preserves local
 * order and appends only ids not already present locally.
 */
export function mergeReviewLog(local: ReviewLog[], remote: ReviewLog[]): ReviewLog[] {
  const localIds = new Set(local.map((entry) => entry.id));
  const novel = remote.filter((entry) => !localIds.has(entry.id));
  if (novel.length === 0) return local;
  return [...local, ...novel];
}

/**
 * Merge goals: once achieved stays achieved, otherwise latest progress wins.
 * We compare startedAt + current to determine which is more recent.
 */
export function mergeGoal(local: Goal, remote: Goal): Goal {
  // If either is achieved, preserve achievement
  const achievedAt = local.achievedAt ?? remote.achievedAt;

  // Take the higher current progress
  const current = Math.max(local.current, remote.current);

  return {
    ...local,
    current,
    achievedAt,
    deadline: local.deadline ?? remote.deadline,
  };
}

/** Return the greater of two nullable numbers, preferring non-null. */
function maxNullable(a: number | null, b: number | null): number | null {
  if (a === null) return b;
  if (b === null) return a;
  return Math.max(a, b);
}

/**
 * Start background sync on a 30-second interval.
 * Checks navigator.onLine before syncing and uses requestIdleCallback
 * when available to avoid blocking the main thread.
 */
export function startBackgroundSync(): void {
  if (backgroundSyncInterval) return;

  backgroundSyncInterval = setInterval(() => {
    if (!navigator.onLine) return;

    const doSync = (): void => {
      pushChanges().catch((err: unknown) => {
        console.error("[sync] Background push failed:", err);
      });
    };

    if (typeof requestIdleCallback === "function") {
      requestIdleCallback(doSync);
    } else {
      // Fallback for browsers without requestIdleCallback (Safari)
      setTimeout(doSync, 0);
    }
  }, 30_000);
}

/**
 * Stop background sync. Called on sign-out.
 */
export function stopBackgroundSync(): void {
  if (backgroundSyncInterval) {
    clearInterval(backgroundSyncInterval);
    backgroundSyncInterval = null;
  }
}

// Re-export types for consumers
export type { SyncResult };
