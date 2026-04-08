import { getDB } from "@/lib/db";
import type { LessonProgress, ModuleProgress, PhaseProgress } from "@/types/curriculum";

export async function getLessonProgress(lessonId: string): Promise<LessonProgress | undefined> {
  try {
    const db = await getDB();
    return await db.get("progress", lessonId);
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
    return await db.getAllFromIndex("progress", "by-phase", phaseId);
  } catch (error) {
    console.error("[progress] getProgressByPhase failed", error);
    return [];
  }
}

export async function getProgressByModule(moduleId: string): Promise<LessonProgress[]> {
  try {
    const db = await getDB();
    return await db.getAllFromIndex("progress", "by-module", moduleId);
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

export async function getAllPhaseProgress(): Promise<PhaseProgress[]> {
  try {
    const db = await getDB();
    return await db.getAll("phaseProgress");
  } catch (error) {
    console.error("[progress] getAllPhaseProgress failed", error);
    return [];
  }
}
