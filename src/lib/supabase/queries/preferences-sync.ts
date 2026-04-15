import { createClient } from "@/lib/supabase/client";
import type { Preferences } from "@/types/preferences";

/**
 * Save user preferences to auth metadata for instant cross-device sync.
 * Calls the update_user_preferences RPC function which merges the
 * provided partial into the existing user_metadata.preferences object.
 */
export async function syncPreferencesToAuth(prefs: Partial<Preferences>): Promise<void> {
  try {
    const supabase = createClient();
    const { error } = await supabase.rpc("update_user_preferences", {
      prefs: JSON.parse(JSON.stringify(prefs)),
    });

    if (error) {
      console.error("[syncPreferencesToAuth] RPC error:", error.message);
    }
  } catch (err) {
    console.error("[syncPreferencesToAuth] Failed:", err);
  }
}

/**
 * Load preferences from auth metadata on sign-in.
 * Reads from user.user_metadata.preferences. Returns null if the user
 * is not authenticated or no preferences have been synced yet.
 */
export async function loadPreferencesFromAuth(): Promise<Partial<Preferences> | null> {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error("[loadPreferencesFromAuth] Auth error:", error.message);
      return null;
    }

    if (!user) {
      return null;
    }

    const prefs = user.user_metadata?.preferences as Partial<Preferences> | undefined;
    return prefs ?? null;
  } catch (err) {
    console.error("[loadPreferencesFromAuth] Failed:", err);
    return null;
  }
}
