"use client";

import { useEffect } from "react";
import { usePreferencesStore } from "@/stores/preferences";

/**
 * Mounts a body class when the user's studyMode is "focus".
 * Layout CSS then hides the sidebar, top bar, and mobile nav.
 * Also wires a keyboard shortcut: Ctrl+Shift+F toggles focus mode.
 */
export function FocusModeProvider(): null {
  const studyMode = usePreferencesStore((s) => s.prefs.studyMode);
  const hydrated = usePreferencesStore((s) => s.hydrated);
  const update = usePreferencesStore((s) => s.update);

  useEffect(() => {
    if (!hydrated) return;
    const root = document.documentElement;
    root.classList.toggle("dura-focus", studyMode === "focus");
    return () => {
      root.classList.remove("dura-focus");
    };
  }, [studyMode, hydrated]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "f") {
        e.preventDefault();
        const current = usePreferencesStore.getState().prefs.studyMode;
        void update({ studyMode: current === "focus" ? "standard" : "focus" });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [update]);

  return null;
}
