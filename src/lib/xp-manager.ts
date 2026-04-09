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
): Promise<void> {
  try {
    const before = await getTotalXP();
    const event = await awardXPToDB(source, amount, sourceId);
    if (!event) return;
    // If the existing event was already there, getTotalXP didn't change —
    // we compare before vs after to distinguish a real award from a dedupe.
    const after = await getTotalXP();
    if (after === before) return;
    const toasts = useToastsStore.getState();
    toasts.push({ kind: "xp", amount });
    const beforeLevel = levelFromXP(before);
    const afterLevel = levelFromXP(after);
    if (afterLevel > beforeLevel) {
      toasts.push({ kind: "level-up", message: `Level ${afterLevel}` });
    }
  } catch (error) {
    console.error("[xp-manager] awardXPWithToast failed", error);
  }
}
