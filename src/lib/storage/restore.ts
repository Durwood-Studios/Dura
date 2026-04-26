import { loadFromOPFS, opfsAvailable } from "@/lib/storage/opfs";
import {
  isLearnerStoreEmpty,
  restoreSnapshotToIDB,
  type LearnerRecordSnapshot,
} from "@/lib/storage/snapshot";

export type RestoreOutcome = "restored" | "not-needed" | "no-backup" | "unsupported" | "error";

/**
 * If IndexedDB is empty AND an OPFS snapshot exists, restore the
 * snapshot back into IndexedDB. Logs the outcome — never throws.
 *
 * Run this on app init BEFORE any code reads from IndexedDB.
 */
export async function restoreFromOPFSIfNeeded(): Promise<RestoreOutcome> {
  if (!opfsAvailable()) return "unsupported";

  try {
    const empty = await isLearnerStoreEmpty();
    if (!empty) return "not-needed";

    const snapshot = await loadFromOPFS<LearnerRecordSnapshot>();
    if (!snapshot) return "no-backup";

    if (snapshot.schemaVersion !== 1) {
      console.warn(
        "[opfs-restore] snapshot schemaVersion mismatch — skipping",
        snapshot.schemaVersion
      );
      return "error";
    }

    await restoreSnapshotToIDB(snapshot);
    console.info(
      "[opfs-restore] IndexedDB was empty. Restored from OPFS shadow backup.",
      snapshotSummary(snapshot)
    );
    return "restored";
  } catch (error) {
    console.error("[opfs-restore] unexpected failure", error);
    return "error";
  }
}

function snapshotSummary(s: LearnerRecordSnapshot): Record<string, number> {
  return {
    progress: s.progress.length,
    flashcards: s.flashcards.length,
    reviewLogs: s.reviewLogs.length,
    xpEvents: s.xpEvents.length,
    certificates: s.certificates.length,
  };
}
