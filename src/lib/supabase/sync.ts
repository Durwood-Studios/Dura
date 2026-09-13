import { mergeRemoteProgress, mergeRemoteFlashcard } from "@/lib/idb/encrypted-store";
import { fetchOwnedRows } from "@/lib/supabase/queries/record-sync";
import { getStorageOwner, getOwnerGeneration, assertOwnerGeneration } from "@/lib/storage/owner";
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
import { syncSandboxSaves, fetchSandboxSaves } from "./queries/sandbox";
import { syncAssessmentResults, fetchAssessmentResults } from "./queries/assessments";
import { syncTutorialProgress, fetchTutorialProgress } from "./queries/tutorial";
import { syncDojoSessions, fetchDojoSessions } from "./queries/dojo";
import { isAnalyticsEnabled } from "@/lib/analytics/consent-gate";
import {
  getAllEncryptedFlashcards,
  getAllEncryptedReviewLogs,
  putEncryptedReviewLog,
  getEncryptedUnsyncedLessonProgress,
} from "@/lib/idb/encrypted-store";
import type { LessonProgress } from "@/types/curriculum";
import type { FlashCard, ReviewLog } from "@/types/flashcard";
import type { Goal } from "@/types/goal";
import type { SandboxSave } from "@/types/sandbox";
import type { TutorialProgress } from "@/types/tutorial";

interface SyncResult {
  pushed: number;
  pulled: number;
  conflicts: number;
  errors: string[];
}

let backgroundSyncInterval: ReturnType<typeof setInterval> | null = null;

let isResetting = false;
let syncQueue: Promise<unknown> = Promise.resolve();
const activeOperations = new Set<Promise<unknown>>();

async function trackOperation<T>(operation: () => Promise<T>): Promise<T> {
  const generation = getOwnerGeneration();
  const run = async (): Promise<T> => {
    assertOwnerGeneration(generation);
    const result = await operation();
    assertOwnerGeneration(generation);
    return result;
  };
  const pending = activeOperations.size === 0 ? run() : syncQueue.catch((): void => {}).then(run);
  syncQueue = pending;
  activeOperations.add(pending);
  try {
    return await pending;
  } finally {
    activeOperations.delete(pending);
  }
}

/** Push changes unless a local data reset has suspended synchronization. */
export async function pushChanges(): Promise<number> {
  if (isResetting) return 0;
  return trackOperation(performPushChanges);
}

/** Pull changes unless a local data reset has suspended synchronization. */
export async function pullChanges(): Promise<{ pulled: number; conflicts: number }> {
  if (isResetting) return { pulled: 0, conflicts: 0 };
  return trackOperation(performPullChanges);
}

/** Drain writes before erasing local data; synchronization stays paused until reload. */
export async function suspendSyncForReset(): Promise<void> {
  isResetting = true;
  stopBackgroundSync();
  await Promise.allSettled(activeOperations);
}

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
async function performPushChanges(): Promise<number> {
  const userId = await getAuthUserId();
  if (!userId) return 0;

  const db = await getDB();
  if (getStorageOwner() !== `account:${userId}`)
    throw new Error("The sync account changed. Reload before syncing.");
  let pushed = 0;
  const supabase = createClient();
  for (const marker of await db.getAll("tombstones")) {
    if (marker.synced) continue;
    const { error } = await supabase.rpc("delete_learner_record", {
      p_user_id: userId,
      p_table: marker.table,
      p_id: marker.recordId,
      p_deleted_at: marker.deletedAt,
    });
    if (error) throw error;
    await db.put("tombstones", { ...marker, synced: 1 });
  }

  // Push unsynced lesson progress — read via encrypted wrapper so the
  // plaintext fields are correctly decrypted before handing to syncLessonProgress.
  const capturedProgress = await db.getAllFromIndex("progress", "by-synced", 0);
  const capturedById = new Map(capturedProgress.map((row) => [row.lessonId, row]));
  const unsyncedProgress = await getEncryptedUnsyncedLessonProgress(db);
  if (unsyncedProgress.length > 0) {
    await syncLessonProgress(userId, unsyncedProgress);
    // Write synced flag back through the encrypted wrapper to preserve encryption
    const acknowledge = db.transaction("progress", "readwrite");
    for (const record of unsyncedProgress) {
      const current = await acknowledge.store.get(record.lessonId);
      const captured = capturedById.get(record.lessonId);
      if (current && captured && sameStoredRecord(current, captured)) {
        await acknowledge.store.put({ ...current, synced: 1 });
      }
    }
    await acknowledge.done;
    pushed += unsyncedProgress.length;
  }

  // Push all flashcards (client owns SRS state). Decrypt locally before
  // sending plaintext upstream — Supabase stores in its own at-rest
  // encryption (managed) and TLS protects in transit.
  const allCards = await getAllEncryptedFlashcards(db);
  if (allCards.length > 0) {
    await syncFlashcards(userId, allCards);
    pushed += allCards.length;
  }

  // Push all review logs (append-only, server deduplicates). Decrypt via
  // encrypted wrapper before transmitting plaintext to Supabase.
  const allLogs = await getAllEncryptedReviewLogs(db);
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
        const current = await tx.store.get(event.id);
        if (current && isAnalyticsEnabled()) await tx.store.put({ ...current, synced: 1 });
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

  // Push sandbox saves (LWW by updatedAt on pull)
  const allSandbox = await db.getAll("sandbox-saves");
  if (allSandbox.length > 0) {
    await syncSandboxSaves(userId, allSandbox);
    pushed += allSandbox.length;
  }

  // Push assessment results (append-only, immutable)
  const allAssessments = await db.getAll("assessment-results");
  if (allAssessments.length > 0) {
    await syncAssessmentResults(userId, allAssessments);
    pushed += allAssessments.length;
  }

  // Push tutorial progress (LWW by lastActiveAt on pull)
  const allTutorial = await db.getAll("tutorial-progress");
  if (allTutorial.length > 0) {
    await syncTutorialProgress(userId, allTutorial);
    pushed += allTutorial.length;
  }

  // Push dojo sessions (append-only, immutable)
  const allDojo = await db.getAll("dojo-sessions");
  if (allDojo.length > 0) {
    await syncDojoSessions(userId, allDojo);
    pushed += allDojo.length;
  }

  return pushed;
}

/**
 * Pull remote data and merge with local.
 * Called on sign-in and periodically.
 */
async function performPullChanges(): Promise<{ pulled: number; conflicts: number }> {
  const userId = await getAuthUserId();
  if (!userId) return { pulled: 0, conflicts: 0 };

  const db = await getDB();
  if (getStorageOwner() !== `account:${userId}`)
    throw new Error("The sync account changed. Reload before syncing.");
  let pulled = 0;
  let conflicts = 0;
  const deleted = await fetchOwnedRows("learner_tombstones", userId);
  for (const row of deleted ?? []) {
    if (!["flashcards", "goals", "sandbox_saves"].includes(String(row.table_name))) continue;
    const table = row.table_name as "flashcards" | "goals" | "sandbox_saves";
    const store = table === "sandbox_saves" ? "sandbox-saves" : table;
    const tx = db.transaction([store, "tombstones"], "readwrite");
    await Promise.all([
      tx.objectStore(store).delete(String(row.record_id)),
      tx.objectStore("tombstones").put({
        id: `${table}:${row.record_id}`,
        table,
        recordId: String(row.record_id),
        deletedAt: Number(row.deleted_at),
        synced: 1,
      }),
      tx.done,
    ]);
  }
  const remoteXP = await fetchOwnedRows("xp_events", userId);
  for (const row of remoteXP ?? []) {
    if (!(await db.get("xp-events", String(row.id))))
      await db.put("xp-events", {
        id: String(row.id),
        source: row.source as import("@/types/xp").XPEventSource,
        amount: Number(row.amount),
        sourceId: String(row.source_id),
        awardedAt: Number(row.awarded_at),
      });
  }

  const tombstones = new Set(
    (await db.getAll("tombstones")).map((row) => `${row.table}:${row.recordId}`)
  );

  // Pull lesson progress — read/write via encrypted wrapper
  const remoteProgress = await fetchLessonProgress(userId);
  for (const remote of remoteProgress) {
    await mergeRemoteProgress(db, remote, mergeProgress);
    pulled++;
  }

  // Pull flashcards — remote is merged by taking the version with the
  // latest lastReview. Reads/writes go through the encryption wrapper so
  // the locally-stored copy stays at-rest-encrypted.
  const remoteCards = await fetchFlashcards(userId);
  for (const remote of remoteCards) {
    if (tombstones.has(`flashcards:${remote.id}`)) continue;
    await mergeRemoteFlashcard(db, remote, mergeFlashcard);
    pulled++;
  }

  // Pull goals — latest updated_at wins (use achievedAt as proxy)
  const remoteGoals = await fetchGoals(userId);
  for (const remote of remoteGoals) {
    if (tombstones.has(`goals:${remote.id}`)) continue;
    const tx = db.transaction(["goals", "tombstones"], "readwrite");
    if (await tx.objectStore("tombstones").get(`goals:${remote.id}`)) {
      await tx.done;
      continue;
    }
    const store = tx.objectStore("goals");
    const local = await store.get(remote.id);
    const merged = local ? mergeGoal(local, remote) : remote;
    if (local && merged !== local) conflicts++;
    await store.put(merged);
    await tx.done;
    pulled++;
  }

  // Pull review logs — G-Set semantics (append-only set; merge by id-union).
  // Existing entries are NEVER overwritten on either side, even if a remote
  // copy of an existing id has different field values (which shouldn't
  // happen — review log entries are immutable by contract — but if it
  // does, the local copy wins because the server is authoritative-on-write
  // not authoritative-on-read for an append-only log).
  // New entries from remote are written via encrypted wrapper so they
  // are stored at-rest-encrypted locally (P5-A.4).
  const remoteLogs = await fetchReviewLogs(userId);
  const localLogIds = new Set((await getAllEncryptedReviewLogs(db)).map((entry) => entry.id));
  for (const remote of remoteLogs) {
    if (localLogIds.has(remote.id)) continue;
    await putEncryptedReviewLog(db, remote);
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

  // Pull sandbox saves — LWW by updatedAt
  const remoteSandbox = await fetchSandboxSaves(userId);
  for (const remote of remoteSandbox) {
    if (tombstones.has(`sandbox_saves:${remote.id}`)) continue;
    const tx = db.transaction(["sandbox-saves", "tombstones"], "readwrite");
    if (await tx.objectStore("tombstones").get(`sandbox_saves:${remote.id}`)) {
      await tx.done;
      continue;
    }
    const store = tx.objectStore("sandbox-saves");
    const local = await store.get(remote.id);
    const merged = local ? mergeSandboxSave(local, remote) : remote;
    if (local && merged !== local) conflicts++;
    await store.put(merged);
    await tx.done;
    pulled++;
  }

  // Pull assessment results — G-Set by id (immutable; add missing only)
  const remoteAssessments = await fetchAssessmentResults(userId);
  for (const remote of remoteAssessments) {
    const local = await db.get("assessment-results", remote.id);
    if (!local) {
      await db.put("assessment-results", remote);
      pulled++;
    }
  }

  // Pull tutorial progress — LWW by lastActiveAt
  const remoteTutorial = await fetchTutorialProgress(userId);
  for (const remote of remoteTutorial) {
    const tx = db.transaction("tutorial-progress", "readwrite");
    const store = tx.objectStore("tutorial-progress");
    const local = await store.get(remote.id);
    const merged = local ? mergeTutorialProgress(local, remote) : remote;
    if (local && merged !== local) conflicts++;
    await store.put(merged);
    await tx.done;
    pulled++;
  }

  // Pull dojo sessions — G-Set by id (immutable; add missing only)
  const remoteDojo = await fetchDojoSessions(userId);
  for (const remote of remoteDojo) {
    const local = await db.get("dojo-sessions", remote.id);
    if (!local) {
      await db.put("dojo-sessions", remote);
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
    synced: 0,
    activityEvidence: mergeActivityEvidence(local.activityEvidence, remote.activityEvidence),
    dailyTimeMs: Object.fromEntries(
      [
        ...new Set([
          ...Object.keys(local.dailyTimeMs ?? {}),
          ...Object.keys(remote.dailyTimeMs ?? {}),
        ]),
      ].map((day) => [day, Math.max(local.dailyTimeMs?.[day] ?? 0, remote.dailyTimeMs?.[day] ?? 0)])
    ),
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

/**
 * Merge sandbox saves: whole-record LWW keyed by `updatedAt`. Strict `>` keeps
 * mergeSandboxSave(x, x) === x (idempotent — the unchanged remote is ignored).
 */
export function mergeSandboxSave(local: SandboxSave, remote: SandboxSave): SandboxSave {
  return remote.updatedAt > local.updatedAt ? remote : local;
}

/**
 * Merge tutorial progress: whole-record LWW keyed by `lastActiveAt`. A tutorial's
 * fields (currentStep, checkpoints, completedAt) advance together as the learner
 * works, so the most-recently-active record is authoritative. Strict `>` keeps
 * mergeTutorialProgress(x, x) === x (idempotent).
 */
export function mergeTutorialProgress(
  local: TutorialProgress,
  remote: TutorialProgress
): TutorialProgress {
  return remote.lastActiveAt > local.lastActiveAt ? remote : local;
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
  if (isResetting || backgroundSyncInterval) return;

  backgroundSyncInterval = setInterval(() => {
    if (!navigator.onLine) return;

    const doSync = (): void => {
      fullSync().catch((err: unknown) => {
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

/** Preserve newly edited drafts and their deliberate completion invalidation. */
function mergeActivityEvidence(
  local: LessonProgress["activityEvidence"],
  remote: LessonProgress["activityEvidence"]
): LessonProgress["activityEvidence"] {
  const merged = { ...local };
  for (const [id, entry] of Object.entries(remote ?? {})) {
    if (!merged[id] || entry.updatedAt > merged[id].updatedAt) merged[id] = entry;
  }
  return Object.keys(merged).length ? merged : undefined;
}
function sameStoredRecord(a: unknown, b: unknown): boolean {
  const encode = (_key: string, value: unknown): unknown =>
    value instanceof ArrayBuffer ? Array.from(new Uint8Array(value)) : value;
  return JSON.stringify(a, encode) === JSON.stringify(b, encode);
}
