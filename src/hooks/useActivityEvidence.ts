"use client";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { getOwnerGeneration, isOwnerInitialized } from "@/lib/storage/owner";
import { useProgressStore } from "@/stores/progress";
import type { ActivityEvidence } from "@/lib/activity-evidence";

export interface ActivityProps {
  activityId?: string;
  activityLessonId?: string;
}

function subscribeOwner(callback: () => void): () => void {
  window.addEventListener("dura:storage-owner-ready", callback);
  window.addEventListener("storage", callback);
  return (): void => {
    window.removeEventListener("dura:storage-owner-ready", callback);
    window.removeEventListener("storage", callback);
  };
}

export interface ActivityPersistence {
  evidence: ActivityEvidence | undefined;
  isReady: boolean;
  ownerReady: boolean;
  ownerGeneration: number;
  hasContext: boolean;
  isSaving: boolean;
  saveError: string | null;
  retryEvidence: () => Promise<void>;
  saveEvidence: (evidence: ActivityEvidence) => Promise<void>;
}

/** Persist only against the authored lesson and retain failed/early results for explicit retry. */
export function useActivityEvidence({
  activityId,
  activityLessonId,
}: ActivityProps): ActivityPersistence {
  const ownerGeneration = useSyncExternalStore(subscribeOwner, getOwnerGeneration, () => 0);
  const ownerReady = useSyncExternalStore(subscribeOwner, isOwnerInitialized, () => false);
  const hasContext = Boolean(activityId && activityLessonId);
  const isReady = useProgressStore(
    (state) =>
      ownerReady &&
      state.currentOwnerGeneration === ownerGeneration &&
      state.current?.lessonId === activityLessonId &&
      hasContext
  );
  const evidence = useProgressStore((state) =>
    isReady && activityId ? state.current?.activityEvidence?.[activityId] : undefined
  );
  const record = useProgressStore((state) => state.recordActivity);
  const context = `${activityLessonId ?? ""}|${activityId ?? ""}`;
  const pending = useRef<{ value: ActivityEvidence; generation: number; context: string } | null>(
    null
  );
  const queue = useRef<Promise<void>>(Promise.resolve());
  const [isSaving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const persist = useCallback(async (): Promise<void> => {
    const request = pending.current;
    if (!request || !hasContext || request.context !== context) return;
    if (!isReady || !activityId || !activityLessonId) {
      setSaveError(
        "The lesson is still loading. Your result is waiting on this page; do not leave yet."
      );
      return;
    }
    setSaving(true);
    const write = queue.current.then(async (): Promise<void> => {
      if (getOwnerGeneration() !== request.generation || request.generation !== ownerGeneration)
        throw new Error("The active learner changed. Reload before continuing.");
      await record(activityLessonId, activityId, request.value);
    });
    queue.current = write.catch((): void => {});
    try {
      await write;
      if (pending.current === request && getOwnerGeneration() === ownerGeneration) {
        pending.current = null;
        setSaveError(null);
      }
    } catch (error: unknown) {
      if (pending.current === request && getOwnerGeneration() === ownerGeneration)
        setSaveError("Your activity result could not be saved. Keep this page open and retry.");
      throw error;
    } finally {
      if (getOwnerGeneration() === ownerGeneration) setSaving(false);
    }
  }, [activityId, activityLessonId, record, isReady, ownerGeneration, hasContext, context]);
  const saveEvidence = useCallback(
    async (value: ActivityEvidence): Promise<void> => {
      if (!hasContext) return;
      pending.current = { value, generation: ownerGeneration, context };
      await persist();
    },
    [hasContext, ownerGeneration, persist, context]
  );
  useEffect(() => {
    const request = pending.current;
    if (!request) return;
    let active = true;
    // Readiness is external state; defer the queued write until this render has committed.
    void Promise.resolve()
      .then(async (): Promise<void> => {
        if (!active || pending.current !== request) return;
        if (
          pending.current?.generation !== ownerGeneration ||
          pending.current?.context !== context
        ) {
          pending.current = null;
          setSaveError(null);
          setSaving(false);
        } else if (isReady) await persist();
      })
      .catch((error: unknown): void =>
        console.error("[activity] Deferred result save failed", error)
      );
    return (): void => {
      active = false;
    };
  }, [isReady, ownerGeneration, persist, context]);
  return {
    evidence,
    saveEvidence,
    isReady,
    ownerReady,
    ownerGeneration,
    hasContext,
    isSaving,
    saveError,
    retryEvidence: persist,
  };
}
