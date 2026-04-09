import { recordActivity, type StreakState } from "@/lib/streak";
import { getPreferences, patchPreferences } from "@/lib/db/preferences";
import { track } from "@/lib/analytics";

/**
 * Extend (or start) the user's learning streak.
 *
 * Reads current streak state from preferences, applies recordActivity,
 * persists, fires streak_extended if the counter advanced, and returns
 * the updated state so the caller can show a celebration.
 */
export async function extendStreak(): Promise<StreakState> {
  try {
    const prefs = await getPreferences();
    const previous = prefs.streak;
    const updated = recordActivity(previous);
    if (updated === previous) return previous;
    await patchPreferences({ streak: updated });
    if (updated.current !== previous.current) {
      void track("streak_extended", { streakDays: updated.current });
    }
    return updated;
  } catch (error) {
    console.error("[streak] extendStreak failed", error);
    try {
      const prefs = await getPreferences();
      return prefs.streak;
    } catch {
      return {
        current: 0,
        longest: 0,
        lastActivityAt: null,
        freezesAvailable: 1,
        freezesEarnedAt: null,
      };
    }
  }
}

export async function getCurrentStreak(): Promise<StreakState> {
  try {
    const prefs = await getPreferences();
    return prefs.streak;
  } catch (error) {
    console.error("[streak] getCurrentStreak failed", error);
    return {
      current: 0,
      longest: 0,
      lastActivityAt: null,
      freezesAvailable: 1,
      freezesEarnedAt: null,
    };
  }
}
