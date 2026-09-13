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
  update: (patch: Partial<Preferences>) => Promise<boolean>;
  error: string | null;
}

let pendingWrites = 0;
let writeQueue: Promise<unknown> = Promise.resolve();

export const usePreferencesStore = create<PreferencesState>((set) => ({
  prefs: DEFAULT_PREFERENCES,
  hydrated: false,
  _pendingUpdate: false,
  error: null,

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
    pendingWrites += 1;
    set({ _pendingUpdate: true, error: null });
    const write = writeQueue.then(() => patchPreferencesDb(patch));
    writeQueue = write.catch(() => undefined);
    try {
      const persisted = await write;
      set({ prefs: persisted });
      return true;
    } catch (error) {
      console.error("[preferences] Failed to persist update:", error);
      set({ error: "Your preference could not be saved. Reload and try again." });
      return false;
    } finally {
      pendingWrites -= 1;
      set({ _pendingUpdate: pendingWrites > 0 });
    }
  },
}));
