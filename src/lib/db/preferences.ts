import { getDB } from "@/lib/db";
import { DEFAULT_PREFERENCES, type Preferences } from "@/types/preferences";
import { INITIAL_STREAK } from "@/lib/streak";

/** Backfill defaults for fields added in later schema versions. */
function normalize(stored: Preferences | undefined): Preferences {
  if (!stored) return DEFAULT_PREFERENCES;
  return {
    ...DEFAULT_PREFERENCES,
    ...stored,
    streak: stored.streak ?? INITIAL_STREAK,
    strictGating: stored.strictGating ?? false,
  };
}

export async function getPreferences(): Promise<Preferences> {
  try {
    const db = await getDB();
    const stored = await db.get("preferences", "user");
    return normalize(stored);
  } catch (error) {
    console.error("[preferences] getPreferences failed", error);
    return DEFAULT_PREFERENCES;
  }
}

export async function putPreferences(prefs: Preferences): Promise<void> {
  try {
    const db = await getDB();
    await db.put("preferences", { ...prefs, updatedAt: Date.now() });
  } catch (error) {
    console.error("[preferences] putPreferences failed", error);
  }
}

export async function patchPreferences(patch: Partial<Preferences>): Promise<Preferences> {
  const current = await getPreferences();
  const next: Preferences = { ...current, ...patch, id: "user", updatedAt: Date.now() };
  await putPreferences(next);
  return next;
}
