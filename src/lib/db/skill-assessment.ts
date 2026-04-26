import { getDB } from "@/lib/db";
import { triggerShadowWrite } from "@/lib/storage/shadow-write";
import type { SkillAssessmentResult } from "@/types/skill-assessment";

const STORE = "preferences";
const KEY = "skill-assessment";

interface SkillAssessmentRecord {
  id: string;
  data: SkillAssessmentResult;
}

/**
 * Retrieve the most recent skill assessment result from IDB.
 * Falls back to localStorage for migration from the legacy storage.
 */
export async function getSkillAssessment(): Promise<SkillAssessmentResult | null> {
  try {
    const db = await getDB();
    const stored = await db.get(STORE, KEY);
    if (stored) {
      const record = stored as unknown as SkillAssessmentRecord;
      return record.data ?? null;
    }

    // Migrate from legacy localStorage if present
    const legacy = migrateLegacyLocalStorage();
    if (legacy) {
      await putSkillAssessment(legacy);
      return legacy;
    }

    return null;
  } catch (error) {
    console.error("[skill-assessment] getSkillAssessment failed:", error);
    return null;
  }
}

/** Save the skill assessment result to IDB. */
export async function putSkillAssessment(result: SkillAssessmentResult): Promise<void> {
  try {
    const db = await getDB();
    const record = { id: KEY, data: result } as SkillAssessmentRecord;
    await db.put(STORE, record as never);
    triggerShadowWrite();
  } catch (error) {
    console.error("[skill-assessment] putSkillAssessment failed:", error);
  }
}

/**
 * One-time migration: read from localStorage, clean up the key.
 */
function migrateLegacyLocalStorage(): SkillAssessmentResult | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("dura-skill-assessment");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SkillAssessmentResult;
    localStorage.removeItem("dura-skill-assessment");
    return parsed;
  } catch {
    return null;
  }
}
