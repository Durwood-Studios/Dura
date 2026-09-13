import {
  knownOwnerDatabaseNames,
  ownerSnapshotName,
  getOwnerGeneration,
  assertOwnerGeneration,
} from "@/lib/storage/owner";
import { assertCurrentStorageGeneration } from "@/lib/storage/reset-coordination";
/**
 * Origin Private File System (OPFS) shadow layer.
 *
 * OPFS provides a second local copy beneath IndexedDB. Both remain browser-managed
 * origin storage and can be removed by eviction or user action. Independent
 * downloadable exports are still needed for recovery after origin-wide data loss.
 *
 * The user never sees this. OPFS failure is non-fatal — IDB remains
 * the source of truth. We log and continue.
 *
 * Supported in: Chrome/Edge 86+, Firefox 111+, Safari 15.2+.
 */

export function opfsAvailable(): boolean {
  return (
    typeof navigator !== "undefined" &&
    typeof navigator.storage !== "undefined" &&
    typeof navigator.storage.getDirectory === "function"
  );
}

export async function saveToOPFS(data: unknown): Promise<void> {
  if (!opfsAvailable()) return;
  const generation = getOwnerGeneration();
  try {
    const root = await navigator.storage.getDirectory();
    const handle = await root.getFileHandle(ownerSnapshotName(), { create: true });
    const writable = await handle.createWritable();
    try {
      assertOwnerGeneration(generation);
      assertCurrentStorageGeneration();
      await writable.write(
        JSON.stringify(data, (_key: string, value: unknown): unknown =>
          value instanceof ArrayBuffer
            ? { __duraArrayBuffer: Array.from(new Uint8Array(value)) }
            : value
        )
      );
      assertOwnerGeneration(generation);
      assertCurrentStorageGeneration();
      await writable.close();
    } catch (error) {
      await writable.abort();
      throw error;
    }
  } catch (error) {
    console.warn("[opfs] save failed — IndexedDB is source of truth", error);
  }
}

export async function loadFromOPFS<T = unknown>(): Promise<T | null> {
  if (!opfsAvailable()) return null;
  const generation = getOwnerGeneration();
  const filename = ownerSnapshotName();
  try {
    const root = await navigator.storage.getDirectory();
    const handle = await root.getFileHandle(filename);
    const file = await handle.getFile();
    const text = await file.text();
    assertOwnerGeneration(generation);
    if (!text) return null;
    return JSON.parse(text, (_key: string, value: unknown): unknown => {
      if (value && typeof value === "object" && "__duraArrayBuffer" in value) {
        const bytes = value.__duraArrayBuffer;
        if (
          !Array.isArray(bytes) ||
          !bytes.every(
            (byte: unknown): boolean =>
              typeof byte === "number" && Number.isInteger(byte) && byte >= 0 && byte <= 255
          )
        )
          throw new Error("Invalid backup binary data");
        return new Uint8Array(bytes).buffer;
      }
      if (_key === "_e" && !(value instanceof ArrayBuffer)) {
        throw new Error("This backup has lost its encrypted data and cannot be restored");
      }
      return value;
    }) as T;
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
    for (const name of knownOwnerDatabaseNames()) {
      const filename = name === "dura" ? "dura-learner-record.json" : `${name}-record.json`;
      try {
        await root.removeEntry(filename);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "NotFoundError")) throw error;
      }
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === "NotFoundError") return;
    console.error("[opfs] delete failed", error);
    throw error;
  }
}
