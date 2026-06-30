import { getDB } from "@/lib/db";
import { triggerShadowWrite } from "@/lib/storage/shadow-write";
import type { TutorialProgress, TutorialCheckpoint } from "@/types/tutorial";

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
 * - If the checkpoint already exists in the progress record, marks it
 *   "completed", unlocks the next "locked" checkpoint, and advances currentStep.
 * - If the checkpoint is NOT yet in the record (MDX-authored tutorials populate
 *   checkpoints lazily at completion time), adds it as "completed" and updates
 *   the step counter based on the number of completed checkpoints so far.
 * - If all checkpoints are completed (count === totalSteps), stamps completedAt.
 * - Persists the updated record via putTutorialProgress.
 *
 * Returns the updated record, or null if the progress record doesn't exist.
 *
 * @param progressId   - IDB key of the TutorialProgress record.
 * @param checkpointId - Unique id of the checkpoint being completed.
 * @param label        - Display label used when lazily inserting a new checkpoint.
 */
export async function completeCheckpoint(
  progressId: string,
  checkpointId: string,
  label?: string
): Promise<TutorialProgress | null> {
  try {
    const existing = await getTutorialProgress(progressId);
    if (!existing) return null;

    const now = Date.now();
    const checkpointIdx = existing.checkpoints.findIndex((c) => c.id === checkpointId);

    let updatedCheckpoints: TutorialCheckpoint[];

    if (checkpointIdx === -1) {
      // Checkpoint not pre-registered — lazily add it as completed.
      // This handles MDX tutorials where checkpoint IDs are only known at render time.
      const newEntry: TutorialCheckpoint = {
        id: checkpointId,
        label: label ?? checkpointId,
        status: "completed",
        completedAt: now,
      };
      updatedCheckpoints = [...existing.checkpoints, newEntry];
    } else {
      updatedCheckpoints = existing.checkpoints.map((cp, i) => {
        if (i === checkpointIdx) {
          return { ...cp, status: "completed" as const, completedAt: now };
        }
        // Unlock the checkpoint immediately following the one just completed.
        if (i === checkpointIdx + 1 && cp.status === "locked") {
          return { ...cp, status: "active" as const };
        }
        return cp;
      });
    }

    const completedCount = updatedCheckpoints.filter((cp) => cp.status === "completed").length;
    const allCompleted = completedCount >= existing.totalSteps;

    // currentStep is 1-based: next active checkpoint index, or totalSteps when done.
    const nextActiveIdx = updatedCheckpoints.findIndex((cp) => cp.status === "active");
    const currentStep =
      nextActiveIdx === -1
        ? Math.min(completedCount + 1, existing.totalSteps)
        : Math.min(nextActiveIdx + 1, existing.totalSteps);

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
