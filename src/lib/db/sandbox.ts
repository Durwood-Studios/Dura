import { getDB } from "@/lib/db";
import type { SandboxSave } from "@/types/sandbox";

export async function getSave(id: string): Promise<SandboxSave | undefined> {
  try {
    const db = await getDB();
    return await db.get("sandbox-saves", id);
  } catch (error) {
    console.error("[sandbox] getSave failed", error);
    return undefined;
  }
}

export async function getRecentSaves(limit = 10): Promise<SandboxSave[]> {
  try {
    const db = await getDB();
    const all = await db.getAllFromIndex("sandbox-saves", "by-updated");
    return all.reverse().slice(0, limit);
  } catch (error) {
    console.error("[sandbox] getRecentSaves failed", error);
    return [];
  }
}

export async function putSave(save: SandboxSave): Promise<void> {
  try {
    const db = await getDB();
    await db.put("sandbox-saves", save);
  } catch (error) {
    console.error("[sandbox] putSave failed", error);
  }
}

export async function deleteSave(id: string): Promise<void> {
  try {
    const db = await getDB();
    await db.delete("sandbox-saves", id);
  } catch (error) {
    console.error("[sandbox] deleteSave failed", error);
  }
}
