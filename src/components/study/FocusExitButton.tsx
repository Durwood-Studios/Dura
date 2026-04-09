"use client";

import { Eye } from "lucide-react";
import { usePreferencesStore } from "@/stores/preferences";

/**
 * Small floating button shown only when focus mode is active.
 * Clicking it returns the user to standard mode.
 */
export function FocusExitButton(): React.ReactElement | null {
  const studyMode = usePreferencesStore((s) => s.prefs.studyMode);
  const update = usePreferencesStore((s) => s.update);

  if (studyMode !== "focus") return null;

  return (
    <button
      type="button"
      onClick={() => void update({ studyMode: "standard" })}
      className="fixed top-4 right-4 z-50 inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] shadow-md transition hover:bg-[var(--color-bg-subtle)]"
    >
      <Eye className="h-3.5 w-3.5" />
      Exit focus
    </button>
  );
}
