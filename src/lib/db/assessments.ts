import { getDB } from "@/lib/db";
import { triggerShadowWrite } from "@/lib/storage/shadow-write";
import type { AssessmentResult, AssessmentType } from "@/types/assessment";

export async function putResult(result: AssessmentResult): Promise<void> {
  try {
    const db = await getDB();
    await db.put("assessment-results", result);
    triggerShadowWrite();
  } catch (error) {
    console.error("[assessments] putResult failed", error);
  }
}

export async function getResultsByTarget(targetId: string): Promise<AssessmentResult[]> {
  try {
    const db = await getDB();
    return await db.getAllFromIndex("assessment-results", "by-target", targetId);
  } catch (error) {
    console.error("[assessments] getResultsByTarget failed", error);
    return [];
  }
}

export async function getLatestResult(
  targetId: string,
  type: AssessmentType
): Promise<AssessmentResult | null> {
  try {
    const all = await getResultsByTarget(targetId);
    const filtered = all.filter((r) => r.type === type);
    if (filtered.length === 0) return null;
    return filtered.reduce((a, b) => (b.completedAt > a.completedAt ? b : a));
  } catch (error) {
    console.error("[assessments] getLatestResult failed", error);
    return null;
  }
}

export async function getAllResults(): Promise<AssessmentResult[]> {
  try {
    const db = await getDB();
    return await db.getAll("assessment-results");
  } catch (error) {
    console.error("[assessments] getAllResults failed", error);
    return [];
  }
}
