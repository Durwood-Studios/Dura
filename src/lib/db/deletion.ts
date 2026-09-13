import { getDB } from "@/lib/db";
import { triggerShadowWrite } from "@/lib/storage/shadow-write";

/** Delete and persist the synchronization tombstone in the same local transaction. */
export async function deleteLearnerRecord(
  table: "flashcards" | "goals" | "sandbox_saves",
  recordId: string
): Promise<void> {
  const db = await getDB();
  const store = table === "sandbox_saves" ? "sandbox-saves" : table;
  const tx = db.transaction([store, "tombstones"], "readwrite");
  await Promise.all([
    tx.objectStore(store).delete(recordId),
    tx
      .objectStore("tombstones")
      .put({ id: `${table}:${recordId}`, table, recordId, deletedAt: Date.now(), synced: 0 }),
    tx.done,
  ]);
  triggerShadowWrite();
}
