"use client";

import { useEffect, useState } from "react";
import { Menu, Search, Sun, Moon } from "lucide-react";
import { useUIStore } from "@/stores/ui";
import { usePreferencesStore } from "@/stores/preferences";
import { SprintTimer } from "@/components/study/SprintTimer";
import { TopBarGamification } from "@/components/gamification/TopBarGamification";
import { UpdateAvailable } from "@/components/pwa/UpdateAvailable";

export function TopBar(): React.ReactElement {
  const toggleMobileNav = useUIStore((s) => s.toggleMobileNav);
  const toggleCommandPalette = useUIStore((s) => s.toggleCommandPalette);
  const theme = usePreferencesStore((s) => s.prefs.theme);
  const update = usePreferencesStore((s) => s.update);

  // System-resolved dark state lives in post-mount state so SSR and the
  // first client render agree. Reading `window.matchMedia` directly here
  // caused React #418 on /settings when a learner's OS preferred dark and
  // theme was "system": server rendered `<Moon />`, client rendered `<Sun />`.
  const [systemDark, setSystemDark] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setSystemDark(mq.matches);
    const handler = (e: MediaQueryListEvent): void => setSystemDark(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const isDark = theme === "dark" || (theme === "system" && systemDark);

  const toggleTheme = () => {
    // Simple binary toggle: light ↔ dark.
    // "system" collapses into whichever resolved mode is active so the
    // first click always flips the visible state rather than jumping to
    // an invisible intermediate.
    void update({ theme: isDark ? "light" : "dark" });
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-[var(--color-border)] bg-[var(--color-bg-primary)]/80 px-4 backdrop-blur-xl">
      <button
        type="button"
        onClick={toggleMobileNav}
        aria-label="Open navigation"
        className="rounded-lg p-3 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface)] lg:hidden lg:p-2"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="ml-auto flex items-center gap-3">
        <UpdateAvailable />
        <TopBarGamification />
        <SprintTimer />
      </div>
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={`Theme: ${theme}. Click to change.`}
        className={
          isDark
            ? "flex h-11 w-11 items-center justify-center rounded-lg text-amber-400 transition hover:bg-amber-500/10 hover:text-amber-300 lg:h-8 lg:w-8"
            : "flex h-11 w-11 items-center justify-center rounded-lg text-[var(--color-text-muted)] transition hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-primary)] lg:h-8 lg:w-8"
        }
      >
        {isDark ? (
          <Sun className="h-4 w-4 drop-shadow-[0_0_6px_rgba(251,191,36,0.7)]" aria-hidden />
        ) : (
          <Moon className="h-4 w-4" aria-hidden />
        )}
      </button>
      <button
        type="button"
        onClick={toggleCommandPalette}
        className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3 py-2.5 text-sm text-[var(--color-text-muted)] transition hover:bg-[var(--color-bg-subtle)] lg:py-1.5"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Search</span>
        <kbd className="ml-2 hidden rounded border border-[var(--color-border)] px-1.5 py-0.5 font-mono text-xs text-[var(--color-text-muted)] sm:inline">
          ⌘K
        </kbd>
      </button>
    </header>
  );
}
