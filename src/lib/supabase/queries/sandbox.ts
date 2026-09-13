import { fetchOwnedRows } from "@/lib/supabase/queries/record-sync";
import { syncMutableRecords } from "@/lib/supabase/queries/record-sync";
import type { SandboxSave } from "@/types/sandbox";

/**
 * Sync sandbox saves to Supabase. Upsert by (user_id, id); last-write-wins on
 * pull by `updatedAt` (see mergeSandboxSave in sync.ts). Mirrors IDB
 * "sandbox-saves" store + the public.sandbox_saves table (005). Epoch-ms
 * columns are stored as raw bigints.
 */
export async function syncSandboxSaves(userId: string, saves: SandboxSave[]): Promise<void> {
  try {
    const rows = saves.map((s) => ({
      id: s.id,
      user_id: userId,
      title: s.title,
      language: s.language,
      code: s.code,
      created_at: s.createdAt,
      updated_at: s.updatedAt,
    }));
    await syncMutableRecords("sandbox_saves", rows);
  } catch (err) {
    console.error("[syncSandboxSaves] Failed to sync:", err);
    throw err;
  }
}

/** Fetch all sandbox saves for a user from Supabase. */
export async function fetchSandboxSaves(userId: string): Promise<SandboxSave[]> {
  try {
    const data = await fetchOwnedRows("sandbox_saves", userId);
    return (data ?? []).map((row) => ({
      id: row.id as string,
      title: row.title as string,
      language: row.language as SandboxSave["language"],
      code: row.code as string,
      createdAt: Number(row.created_at),
      updatedAt: Number(row.updated_at),
    }));
  } catch (err) {
    console.error("[fetchSandboxSaves] Failed to fetch:", err);
    throw err;
  }
}
