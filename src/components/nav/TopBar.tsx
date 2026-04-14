"use client";

import { Menu, Search, Sun, Moon } from "lucide-react";
import { useUIStore } from "@/stores/ui";
import { usePreferencesStore } from "@/stores/preferences";
import { SprintTimer } from "@/components/study/SprintTimer";
import { TopBarGamification } from "@/components/gamification/TopBarGamification";

export function TopBar(): React.ReactElement {
  const toggleMobileNav = useUIStore((s) => s.toggleMobileNav);
  const toggleCommandPalette = useUIStore((s) => s.toggleCommandPalette);
  const theme = usePreferencesStore((s) => s.prefs.theme);
  const update = usePreferencesStore((s) => s.update);

  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  const cycleTheme = () => {
    const next = theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
    void update({ theme: next });
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-[var(--color-border)] bg-[var(--color-bg-primary)]/80 px-4 backdrop-blur-xl">
      <button
        type="button"
        onClick={toggleMobileNav}
        aria-label="Open navigation"
        className="rounded-lg p-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface)] lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="ml-auto flex items-center gap-3">
        <TopBarGamification />
        <SprintTimer />
      </div>
      <button
        type="button"
        onClick={cycleTheme}
        aria-label={`Theme: ${theme}. Click to change.`}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-muted)] transition hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-primary)]"
      >
        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>
      <button
        type="button"
        onClick={toggleCommandPalette}
        className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3 py-1.5 text-sm text-[var(--color-text-muted)] transition hover:bg-[var(--color-bg-subtle)]"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Search</span>
        <kbd className="ml-2 hidden rounded border border-[var(--color-border)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--color-text-muted)] sm:inline">
          ⌘K
        </kbd>
      </button>
    </header>
  );
}
