import { create } from "zustand";
import { getPreferences, patchPreferences as patchPreferencesDb } from "@/lib/db/preferences";
import { DEFAULT_PREFERENCES, type Preferences } from "@/types/preferences";

interface PreferencesState {
  prefs: Preferences;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  update: (patch: Partial<Preferences>) => Promise<void>;
}

export const usePreferencesStore = create<PreferencesState>((set) => ({
  prefs: DEFAULT_PREFERENCES,
  hydrated: false,

  hydrate: async () => {
    try {
      const stored = await getPreferences();
      set({ prefs: stored, hydrated: true });
    } catch (error) {
      console.error("[preferences] Failed to hydrate:", error);
      set({ hydrated: true });
    }
  },

  update: async (patch) => {
    // Optimistic update — UI reacts immediately, IDB persistence is background
    set((s) => ({ prefs: { ...s.prefs, ...patch } }));
    try {
      const persisted = await patchPreferencesDb(patch);
      // Re-sync in case patchPreferences normalised any values
      set({ prefs: persisted });
    } catch (error) {
      console.error("[preferences] Failed to persist update:", error);
    }
  },
}));
