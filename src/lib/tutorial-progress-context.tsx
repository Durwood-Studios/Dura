"use client";

import { createContext, useContext } from "react";

interface TutorialProgressContextValue {
  /**
   * IndexedDB id of the active TutorialProgress record for the current
   * tutorial page. Null while the record is being loaded/created on mount.
   */
  progressId: string | null;
}

const TutorialProgressContext = createContext<TutorialProgressContextValue>({
  progressId: null,
});

/**
 * Read the progressId for the nearest TutorialProgressProvider ancestor.
 * Returns null until the IDB record has been loaded or created.
 */
export function useTutorialProgressContext(): TutorialProgressContextValue {
  return useContext(TutorialProgressContext);
}

export { TutorialProgressContext };
