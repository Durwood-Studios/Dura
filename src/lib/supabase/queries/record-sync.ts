import { createClient } from "@/lib/supabase/client";

/** Keep mutations below the reviewed RPC batch bound without losing large histories. */
export async function syncMutableRecords(table: string, rows: object[]): Promise<void> {
  const client = createClient();
  for (let offset = 0; offset < rows.length; offset += 500) {
    const { error } = await client.rpc("sync_learner_records", {
      p_table: table,
      p_rows: rows.slice(offset, offset + 500),
    });
    if (error) throw error;
  }
}

/** Read every owner row with deterministic paging instead of silently accepting the API row cap. */
export async function fetchOwnedRows(
  table: string,
  userId: string
): Promise<Record<string, unknown>[]> {
  const client = createClient();
  const key =
    table === "lesson_progress"
      ? "lesson_id"
      : table === "module_progress"
        ? "module_id"
        : table === "learner_tombstones"
          ? "record_id"
          : "id";
  const rows: Record<string, unknown>[] = [];
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await client
      .from(table)
      .select("*")
      .eq("user_id", userId)
      .order(key)
      .range(offset, offset + 499);
    if (error) throw error;
    if (!data?.length) return rows;
    rows.push(...data);
    if (data.length < 500) return rows;
  }
}
