import { getLessonProgress } from "@/lib/db/progress";
import { awardXP as awardXPToDB, getTotalXP } from "@/lib/db/xp";
import { levelFromXP } from "@/lib/xp";
import { useToastsStore } from "@/stores/toasts";
import type { XPEventSource } from "@/types/xp";

/**
 * Client-side XP award pipeline:
 * 1) write (deduped) via awardXPToDB
 * 2) if a fresh event was written, push an XP toast
 * 3) check for a level crossing and push a level-up toast
 *
 * Callers use this from client components where the toast layer is
 * mounted. Server / background callers should prefer awardXPToDB.
 */
export async function awardXPWithToast(
  source: XPEventSource,
  amount: number,
  sourceId: string
): Promise<number> {
  try {
    const before = await getTotalXP();
    const event = await awardXPToDB(source, amount, sourceId);
    if (!event) return 0;
    const after = await getTotalXP();
    const toasts = useToastsStore.getState();
    toasts.push({ kind: "xp", amount });
    const beforeLevel = levelFromXP(before);
    const afterLevel = levelFromXP(after);
    if (afterLevel > beforeLevel) {
      toasts.push({ kind: "level-up", message: `Level ${afterLevel}` });
    }
    return event.amount;
  } catch (error) {
    console.error("[xp-manager] awardXPWithToast failed", error);
    return 0;
  }
}

const pendingLessonAwards = new Map<string, Promise<number>>();

/** Repair an interrupted award only after checking the durable completed lesson. */
export function awardSavedLessonXP(lessonId: string): Promise<number> {
  const pending = pendingLessonAwards.get(lessonId);
  if (pending) return pending;
  const award = (async (): Promise<number> => {
    try {
      const progress = await getLessonProgress(lessonId);
      if (
        !progress ||
        progress.completedAt === null ||
        !Number.isFinite(progress.completedAt) ||
        !Number.isFinite(progress.xpEarned) ||
        progress.xpEarned <= 0
      )
        return 0;
      return await awardXPWithToast("lesson", progress.xpEarned, progress.lessonId);
    } catch (error) {
      console.error("[xp-manager] Completed lesson award recovery failed", error);
      return 0;
    }
  })().finally((): void => {
    pendingLessonAwards.delete(lessonId);
  });
  pendingLessonAwards.set(lessonId, award);
  return award;
}
