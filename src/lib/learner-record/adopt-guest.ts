import { openDB } from "idb";
import { type DuraDBSchema } from "@/lib/db";
import { getStorageOwner, ownerDatabaseName } from "@/lib/storage/owner";
import { resolveEncryptionKey } from "@/lib/idb/encryption-key";
import { buildPortableRecord, applyPortableRecord } from "@/lib/learner-record/portable";

/** Explicitly copy guest learning work into the signed-in namespace; never delete the source. */
export async function adoptGuestRecord(): Promise<void> {
  if (getStorageOwner() === "guest") throw new Error("Sign in before copying guest work.");
  const source = await openDB<DuraDBSchema>(ownerDatabaseName("guest"));
  try {
    if (!source.objectStoreNames.contains("progress"))
      throw new Error("No guest learning record was found on this device.");
    const key = await resolveEncryptionKey(null);
    if (!key.key) throw new Error("Guest encryption key unavailable.");
    const portable = await buildPortableRecord(source, key.key);
    await applyPortableRecord(portable);
  } finally {
    source.close();
  }
}
