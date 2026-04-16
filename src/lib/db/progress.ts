import { getDB } from "@/lib/db";
import type { LessonProgress, ModuleProgress, PhaseProgress } from "@/types/curriculum";

/** Backfill defaults for fields added in later schema versions. */
function normalize<T extends LessonProgress | undefined>(record: T): T {
  if (!record) return record;
  if (record.quizScore === undefined) {
    return { ...record, quizScore: null } as T;
  }
  return record;
}

export async function getLessonProgress(lessonId: string): Promise<LessonProgress | undefined> {
  try {
    const db = await getDB();
    return normalize(await db.get("progress", lessonId));
  } catch (error) {
    console.error("[progress] getLessonProgress failed", error);
    return undefined;
  }
}

export async function putLessonProgress(progress: LessonProgress): Promise<void> {
  try {
    const db = await getDB();
    await db.put("progress", progress);
  } catch (error) {
    console.error("[progress] putLessonProgress failed", error);
  }
}

export async function getProgressByPhase(phaseId: string): Promise<LessonProgress[]> {
  try {
    const db = await getDB();
    const records = await db.getAllFromIndex("progress", "by-phase", phaseId);
    return records.map((r) => normalize(r) as LessonProgress);
  } catch (error) {
    console.error("[progress] getProgressByPhase failed", error);
    return [];
  }
}

export async function getProgressByModule(moduleId: string): Promise<LessonProgress[]> {
  try {
    const db = await getDB();
    const records = await db.getAllFromIndex("progress", "by-module", moduleId);
    return records.map((r) => normalize(r) as LessonProgress);
  } catch (error) {
    console.error("[progress] getProgressByModule failed", error);
    return [];
  }
}

export async function getUnsyncedProgress(): Promise<LessonProgress[]> {
  try {
    const db = await getDB();
    return await db.getAllFromIndex("progress", "by-synced", 0);
  } catch (error) {
    console.error("[progress] getUnsyncedProgress failed", error);
    return [];
  }
}

export async function getModuleProgress(moduleId: string): Promise<ModuleProgress | undefined> {
  try {
    const db = await getDB();
    return await db.get("moduleProgress", moduleId);
  } catch (error) {
    console.error("[progress] getModuleProgress failed", error);
    return undefined;
  }
}

export async function putModuleProgress(progress: ModuleProgress): Promise<void> {
  try {
    const db = await getDB();
    await db.put("moduleProgress", progress);
  } catch (error) {
    console.error("[progress] putModuleProgress failed", error);
  }
}

export async function getPhaseProgress(phaseId: string): Promise<PhaseProgress | undefined> {
  try {
    const db = await getDB();
    return await db.get("phaseProgress", phaseId);
  } catch (error) {
    console.error("[progress] getPhaseProgress failed", error);
    return undefined;
  }
}

export async function putPhaseProgress(progress: PhaseProgress): Promise<void> {
  try {
    const db = await getDB();
    await db.put("phaseProgress", progress);
  } catch (error) {
    console.error("[progress] putPhaseProgress failed", error);
  }
}

export async function getCompletedLessonCount(): Promise<number> {
  try {
    const db = await getDB();
    const all = await db.getAll("progress");
    return all.filter((r) => r.completedAt !== null).length;
  } catch (error) {
    console.error("[progress] getCompletedLessonCount failed", error);
    return 0;
  }
}

export async function getAllPhaseProgress(): Promise<PhaseProgress[]> {
  try {
    const db = await getDB();
    return await db.getAll("phaseProgress");
  } catch (error) {
    console.error("[progress] getAllPhaseProgress failed", error);
    return [];
  }
}
