/**
 * Origin Private File System (OPFS) shadow layer.
 *
 * OPFS is exempt from Safari's 7-day eviction rule and from the
 * IndexedDB-style quota pressure that can clear a learner's months
 * of FSRS scheduling data. We use it as an invisible backup beneath
 * IndexedDB: every IDB mutation eventually flushes a snapshot here,
 * and on app init we restore from the snapshot if IDB is empty.
 *
 * The user never sees this. OPFS failure is non-fatal — IDB remains
 * the source of truth. We log and continue.
 *
 * Supported in: Chrome/Edge 86+, Firefox 111+, Safari 15.2+.
 */
const SNAPSHOT_FILENAME = "dura-learner-record.json";

export function opfsAvailable(): boolean {
  return (
    typeof navigator !== "undefined" &&
    typeof navigator.storage !== "undefined" &&
    typeof navigator.storage.getDirectory === "function"
  );
}

export async function saveToOPFS(data: unknown): Promise<void> {
  if (!opfsAvailable()) return;
  try {
    const root = await navigator.storage.getDirectory();
    const handle = await root.getFileHandle(SNAPSHOT_FILENAME, { create: true });
    const writable = await handle.createWritable();
    await writable.write(JSON.stringify(data));
    await writable.close();
  } catch (error) {
    console.warn("[opfs] save failed — IndexedDB is source of truth", error);
  }
}

export async function loadFromOPFS<T = unknown>(): Promise<T | null> {
  if (!opfsAvailable()) return null;
  try {
    const root = await navigator.storage.getDirectory();
    const handle = await root.getFileHandle(SNAPSHOT_FILENAME);
    const file = await handle.getFile();
    const text = await file.text();
    if (!text) return null;
    return JSON.parse(text) as T;
  } catch (error) {
    if (error instanceof DOMException && error.name === "NotFoundError") {
      return null;
    }
    console.warn("[opfs] load failed", error);
    return null;
  }
}

export async function deleteOPFSSnapshot(): Promise<void> {
  if (!opfsAvailable()) return;
  try {
    const root = await navigator.storage.getDirectory();
    await root.removeEntry(SNAPSHOT_FILENAME);
  } catch (error) {
    if (error instanceof DOMException && error.name === "NotFoundError") return;
    console.warn("[opfs] delete failed", error);
  }
}
