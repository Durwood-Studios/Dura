import { createClient } from "@/lib/supabase/client";
import type { SandboxSave } from "@/types/sandbox";

/**
 * Sync sandbox saves to Supabase. Upsert by (user_id, id); last-write-wins on
 * pull by `updatedAt` (see mergeSandboxSave in sync.ts). Mirrors IDB
 * "sandbox-saves" store + the public.sandbox_saves table (005). Epoch-ms
 * columns are stored as raw bigints.
 */
export async function syncSandboxSaves(userId: string, saves: SandboxSave[]): Promise<void> {
  try {
    const supabase = createClient();
    const rows = saves.map((s) => ({
      id: s.id,
      user_id: userId,
      title: s.title,
      language: s.language,
      code: s.code,
      created_at: s.createdAt,
      updated_at: s.updatedAt,
    }));
    const { error } = await supabase
      .from("sandbox_saves")
      .upsert(rows, { onConflict: "id,user_id" });
    if (error) {
      console.error("[syncSandboxSaves] Upsert error:", error.message);
      throw error;
    }
  } catch (err) {
    console.error("[syncSandboxSaves] Failed to sync:", err);
    throw err;
  }
}

/** Fetch all sandbox saves for a user from Supabase. */
export async function fetchSandboxSaves(userId: string): Promise<SandboxSave[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from("sandbox_saves").select("*").eq("user_id", userId);
    if (error) {
      console.error("[fetchSandboxSaves] Query error:", error.message);
      throw error;
    }
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
