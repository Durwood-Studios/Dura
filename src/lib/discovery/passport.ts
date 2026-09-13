import { getDB } from "@/lib/db";
import { triggerShadowWrite } from "@/lib/storage/shadow-write";
import { assertOwnerGeneration, getOwnerGeneration, ownerDatabaseName } from "@/lib/storage/owner";
import { DEFAULT_PREFERENCES } from "@/types/preferences";
import {
  DiscoveryActivitiesSchema,
  isDiscoveryActivitySlug,
  type DiscoveryActivitySlug,
} from "@/lib/discovery/registry";

export const LEGACY_PASSPORT_KEY = "dura-discovery-passport";
export interface DiscoveryPassportRecord {
  activities: DiscoveryActivitySlug[];
  warning?: string;
}

async function transactPassport(slug?: string): Promise<DiscoveryPassportRecord> {
  if (slug !== undefined && !isDiscoveryActivitySlug(slug))
    throw new Error("This activity is not in the current Discovery passport.");
  const generation = getOwnerGeneration();
  try {
    const db = await getDB();
    assertOwnerGeneration(generation);
    const isOriginalOwner = ownerDatabaseName() === "dura";
    const tx = db.transaction("preferences", "readwrite");
    const current = (await tx.store.get("user")) ?? DEFAULT_PREFERENCES;
    const activities = new Set(DiscoveryActivitiesSchema.parse(current.discoveryActivities ?? []));
    let warning: string | undefined;
    let importedLegacyRaw: string | null = null;
    if (!current.discoveryPassportMigrated && isOriginalOwner) {
      const raw = localStorage.getItem(LEGACY_PASSPORT_KEY);

      if (raw !== null) {
        let legacy: unknown;
        try {
          legacy = raw.length <= 16384 ? JSON.parse(raw) : null;
        } catch {
          legacy = null;
        }
        if (Array.isArray(legacy)) {
          for (const item of legacy) {
            if (typeof item === "string" && isDiscoveryActivitySlug(item)) activities.add(item);
            else
              warning =
                "Only currently available activities were imported. The original passport was kept on this device.";
          }
          if (!warning) importedLegacyRaw = raw;
        } else
          warning =
            "The old passport was unreadable and was kept on this device. A new passport is ready for this learner.";
      }
    }
    if (slug !== undefined && isDiscoveryActivitySlug(slug)) activities.add(slug);
    const next = [...activities];
    const hasChanged =
      !current.discoveryPassportMigrated ||
      next.length !== (current.discoveryActivities?.length ?? 0);
    if (hasChanged) {
      await tx.store.put({
        ...current,
        discoveryActivities: next,
        discoveryPassportMigrated: true,
        updatedAt: Math.max(Date.now(), current.updatedAt + 1),
      });
    }
    await tx.done;
    assertOwnerGeneration(generation);
    if (hasChanged) triggerShadowWrite();
    if (importedLegacyRaw !== null) {
      try {
        // Another tab may have written a newer legacy record while IDB committed.
        if (localStorage.getItem(LEGACY_PASSPORT_KEY) === importedLegacyRaw)
          localStorage.removeItem(LEGACY_PASSPORT_KEY);
      } catch (error) {
        console.error("[discovery] Legacy passport cleanup failed", error);
        warning = "Your passport was saved, but the old device copy could not be removed.";
      }
    }
    return { activities: next, warning };
  } catch (error) {
    console.error("[discovery] Passport storage failed", error);
    throw new Error(
      "Your Discovery passport could not be saved or loaded. Check device storage and retry.",
      { cause: error }
    );
  }
}

/** Read the current learner's portable passport, migrating only its original legacy namespace. */
export async function getDiscoveryPassport(): Promise<DiscoveryPassportRecord> {
  return transactPassport();
}

/** Atomically add a stamp without replacing concurrent stamps or unrelated preferences. */
export async function saveDiscoveryActivity(slug: string): Promise<DiscoveryPassportRecord> {
  return transactPassport(slug);
}
