import { getDB } from "@/lib/db";
import { triggerShadowWrite } from "@/lib/storage/shadow-write";
import type { TutorialProgress } from "@/types/tutorial";

/**
 * Retrieve a single tutorial progress record by its unique id.
 * Returns null (not undefined) to make null-checks explicit at call sites.
 */
export async function getTutorialProgress(id: string): Promise<TutorialProgress | null> {
  try {
    const db = await getDB();
    return (await db.get("tutorial-progress", id)) ?? null;
  } catch (error) {
    console.error("[tutorial-progress] getTutorialProgress failed", error);
    return null;
  }
}

/** Upsert a tutorial progress record and schedule a sync write. */
export async function putTutorialProgress(progress: TutorialProgress): Promise<void> {
  try {
    const db = await getDB();
    await db.put("tutorial-progress", progress);
    triggerShadowWrite();
  } catch (error) {
    console.error("[tutorial-progress] putTutorialProgress failed", error);
  }
}

/** Return every tutorial progress record stored locally. */
export async function getAllTutorialProgress(): Promise<TutorialProgress[]> {
  try {
    const db = await getDB();
    return await db.getAll("tutorial-progress");
  } catch (error) {
    console.error("[tutorial-progress] getAllTutorialProgress failed", error);
    return [];
  }
}

/**
 * Mark a checkpoint completed, advance currentStep, and touch lastActiveAt.
 *
 * - Finds the checkpoint by id inside the progress record.
 * - Sets its status to "completed" and stamps completedAt.
 * - Unlocks the next checkpoint (status: "locked" → "active") if one exists.
 * - Advances currentStep to reflect the newly unlocked step.
 * - If all checkpoints are completed, stamps completedAt on the record itself.
 * - Persists the updated record via putTutorialProgress.
 *
 * Returns the updated record, or null if the progress record doesn't exist
 * or the checkpoint id is not found.
 */
export async function completeCheckpoint(
  progressId: string,
  checkpointId: string
): Promise<TutorialProgress | null> {
  try {
    const existing = await getTutorialProgress(progressId);
    if (!existing) return null;

    const checkpointIdx = existing.checkpoints.findIndex((c) => c.id === checkpointId);
    if (checkpointIdx === -1) return null;

    const now = Date.now();
    const updatedCheckpoints = existing.checkpoints.map((cp, i) => {
      if (i === checkpointIdx) {
        return { ...cp, status: "completed" as const, completedAt: now };
      }
      // Unlock the checkpoint immediately following the one just completed.
      if (i === checkpointIdx + 1 && cp.status === "locked") {
        return { ...cp, status: "active" as const };
      }
      return cp;
    });

    const allCompleted = updatedCheckpoints.every((cp) => cp.status === "completed");

    // currentStep is 1-based: point to the next active checkpoint, capped at totalSteps.
    const nextActiveIdx = updatedCheckpoints.findIndex((cp) => cp.status === "active");
    const currentStep =
      nextActiveIdx === -1 ? existing.totalSteps : Math.min(nextActiveIdx + 1, existing.totalSteps);

    const updated: TutorialProgress = {
      ...existing,
      checkpoints: updatedCheckpoints,
      currentStep,
      lastActiveAt: now,
      completedAt: allCompleted ? now : existing.completedAt,
    };

    await putTutorialProgress(updated);
    return updated;
  } catch (error) {
    console.error("[tutorial-progress] completeCheckpoint failed", error);
    return null;
  }
}
