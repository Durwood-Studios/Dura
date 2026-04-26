import { getDB } from "@/lib/db";
import { triggerShadowWrite } from "@/lib/storage/shadow-write";
import {
  getAllEncryptedLessonProgress,
  getAllEncryptedModuleProgress,
  getEncryptedLessonProgress,
  getEncryptedLessonProgressByModule,
  getEncryptedLessonProgressByPhase,
  getEncryptedModuleProgress,
  getEncryptedUnsyncedLessonProgress,
  putEncryptedLessonProgress,
  putEncryptedModuleProgress,
} from "@/lib/idb/encrypted-store";
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
    return normalize(await getEncryptedLessonProgress(db, lessonId));
  } catch (error) {
    console.error("[progress] getLessonProgress failed", error);
    return undefined;
  }
}

export async function putLessonProgress(progress: LessonProgress): Promise<void> {
  try {
    const db = await getDB();
    await putEncryptedLessonProgress(db, progress);
    triggerShadowWrite();
  } catch (error) {
    console.error("[progress] putLessonProgress failed", error);
  }
}

export async function getProgressByPhase(phaseId: string): Promise<LessonProgress[]> {
  try {
    const db = await getDB();
    const records = await getEncryptedLessonProgressByPhase(db, phaseId);
    return records.map((r) => normalize(r) as LessonProgress);
  } catch (error) {
    console.error("[progress] getProgressByPhase failed", error);
    return [];
  }
}

export async function getProgressByModule(moduleId: string): Promise<LessonProgress[]> {
  try {
    const db = await getDB();
    const records = await getEncryptedLessonProgressByModule(db, moduleId);
    return records.map((r) => normalize(r) as LessonProgress);
  } catch (error) {
    console.error("[progress] getProgressByModule failed", error);
    return [];
  }
}

export async function getUnsyncedProgress(): Promise<LessonProgress[]> {
  try {
    const db = await getDB();
    return await getEncryptedUnsyncedLessonProgress(db);
  } catch (error) {
    console.error("[progress] getUnsyncedProgress failed", error);
    return [];
  }
}

export async function getModuleProgress(moduleId: string): Promise<ModuleProgress | undefined> {
  try {
    const db = await getDB();
    return await getEncryptedModuleProgress(db, moduleId);
  } catch (error) {
    console.error("[progress] getModuleProgress failed", error);
    return undefined;
  }
}

export async function putModuleProgress(progress: ModuleProgress): Promise<void> {
  try {
    const db = await getDB();
    await putEncryptedModuleProgress(db, progress);
    triggerShadowWrite();
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
    triggerShadowWrite();
  } catch (error) {
    console.error("[progress] putPhaseProgress failed", error);
  }
}

export async function getCompletedLessonCount(): Promise<number> {
  try {
    const db = await getDB();
    const all = await getAllEncryptedLessonProgress(db);
    return all.filter((r) => r.completedAt !== null).length;
  } catch (error) {
    console.error("[progress] getCompletedLessonCount failed", error);
    return 0;
  }
}

export async function getAllModuleProgress(): Promise<ModuleProgress[]> {
  try {
    const db = await getDB();
    return await getAllEncryptedModuleProgress(db);
  } catch (error) {
    console.error("[progress] getAllModuleProgress failed", error);
    return [];
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
