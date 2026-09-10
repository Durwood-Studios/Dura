import { lessonIdentity } from "@/lib/lesson-identity";
import type { DuraDB } from "@/lib/db";

/** Re-key legacy records atomically, preserving ciphertext without needing an auth key. */
export async function migrateLessonIdentities(db: DuraDB): Promise<void> {
  const tx = db.transaction("progress", "readwrite");
  try {
    const progress = tx.objectStore("progress");
    for (const record of await progress.getAll()) {
      const id = lessonIdentity(record.phaseId, record.moduleId, record.lessonId);
      if (id === record.lessonId) continue;
      // A canonical record is authoritative if an old backup has reintroduced its predecessor.
      if (!(await progress.get(id))) {
        await progress.put({ ...record, lessonId: id, synced: 0 });
      }
      // Keep legacy XP event IDs: old cloud copies can return on sync.
      // Completed records retain completion; all new awards use canonical IDs.
      await progress.delete(record.lessonId);
    }
    await tx.done;
  } catch (error) {
    console.error("[progress] Lesson identity migration failed", error);
    try {
      tx.abort();
    } catch {
      /* The transaction may already have aborted. */
    }
    await tx.done.catch(() => undefined);
    throw error;
  }
}
