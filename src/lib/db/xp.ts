import { getDB } from "@/lib/db";
import { triggerShadowWrite } from "@/lib/storage/shadow-write";
import type { XPEvent, XPEventSource } from "@/types/xp";

/**
 * Deterministic id so the same award from the same source+sourceId can
 * never be double-written. Callers don't need to pre-generate an id.
 */
function deterministicId(source: XPEventSource, sourceId: string): string {
  return `xp_${source}_${sourceId}`;
}

export async function awardXP(
  source: XPEventSource,
  amount: number,
  sourceId: string
): Promise<XPEvent | null> {
  try {
    if (amount <= 0) return null;
    const id = deterministicId(source, sourceId);
    const db = await getDB();
    const existing = await db.get("xp-events", id);
    if (existing) return existing;
    const event: XPEvent = {
      id,
      source,
      amount,
      sourceId,
      awardedAt: Date.now(),
    };
    await db.put("xp-events", event);
    triggerShadowWrite();
    return event;
  } catch (error) {
    console.error("[xp] awardXP failed", error);
    return null;
  }
}

export async function getTotalXP(): Promise<number> {
  try {
    const db = await getDB();
    const all = await db.getAll("xp-events");
    return all.reduce((sum, e) => sum + e.amount, 0);
  } catch (error) {
    console.error("[xp] getTotalXP failed", error);
    return 0;
  }
}

export async function getXPHistory(limit = 50): Promise<XPEvent[]> {
  try {
    const db = await getDB();
    const all = await db.getAllFromIndex("xp-events", "by-awarded");
    return all.reverse().slice(0, limit);
  } catch (error) {
    console.error("[xp] getXPHistory failed", error);
    return [];
  }
}

export async function getXPBySource(source: XPEventSource): Promise<number> {
  try {
    const db = await getDB();
    const all = await db.getAllFromIndex("xp-events", "by-source", source);
    return all.reduce((sum, e) => sum + e.amount, 0);
  } catch (error) {
    console.error("[xp] getXPBySource failed", error);
    return 0;
  }
}

export async function getAllXPEvents(): Promise<XPEvent[]> {
  try {
    const db = await getDB();
    return await db.getAll("xp-events");
  } catch (error) {
    console.error("[xp] getAllXPEvents failed", error);
    return [];
  }
}
