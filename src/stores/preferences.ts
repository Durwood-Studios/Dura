import { create } from "zustand";
import { getPreferences, patchPreferences as patchPreferencesDb } from "@/lib/db/preferences";
import { DEFAULT_PREFERENCES, type Preferences } from "@/types/preferences";

interface PreferencesState {
  prefs: Preferences;
  hydrated: boolean;
  /** Tracks whether update() has been called this session. Prevents
   *  a late-completing hydrate() from overwriting an explicit user change. */
  _pendingUpdate: boolean;
  hydrate: () => Promise<void>;
  update: (patch: Partial<Preferences>) => Promise<void>;
}

export const usePreferencesStore = create<PreferencesState>((set) => ({
  prefs: DEFAULT_PREFERENCES,
  hydrated: false,
  _pendingUpdate: false,

  hydrate: async () => {
    try {
      const stored = await getPreferences();
      set((s) => {
        // If update() already fired this session, don't clobber it
        if (s._pendingUpdate) return { hydrated: true };
        return { prefs: stored, hydrated: true };
      });
    } catch (error) {
      console.error("[preferences] Failed to hydrate:", error);
      set({ hydrated: true });
    }
  },

  update: async (patch) => {
    // Mark update in-flight BEFORE the optimistic set so hydrate()
    // racing on another tick cannot overwrite it
    set((s) => ({ prefs: { ...s.prefs, ...patch }, _pendingUpdate: true }));
    try {
      await patchPreferencesDb(patch);
    } catch (error) {
      console.error("[preferences] Failed to persist update:", error);
    } finally {
      set({ _pendingUpdate: false });
    }
  },
}));
