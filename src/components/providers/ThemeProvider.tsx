"use client";

import { useEffect } from "react";
import { usePreferencesStore } from "@/stores/preferences";
import type { Theme } from "@/types/preferences";

const STORAGE_KEY = "dura-theme";

function resolveSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: Theme): void {
  if (typeof document === "undefined") return;
  const resolved = theme === "system" ? resolveSystemTheme() : theme;
  const root = document.documentElement;
  root.classList.toggle("dark", resolved === "dark");
  root.style.colorScheme = resolved;
}

export function ThemeProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const theme = usePreferencesStore((s) => s.prefs.theme);
  const highContrast = usePreferencesStore((s) => s.prefs.highContrast);
  const dyslexiaFont = usePreferencesStore((s) => s.prefs.dyslexiaFont);
  const hydrated = usePreferencesStore((s) => s.hydrated);
  const hydrate = usePreferencesStore((s) => s.hydrate);

  useEffect(() => {
    if (!hydrated) void hydrate();
  }, [hydrated, hydrate]);

  useEffect(() => {
    applyTheme(theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // ignore — private mode
    }
  }, [theme]);

  // Apply accessibility classes to <html>
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("dura-high-contrast", highContrast);
    document.documentElement.classList.toggle("dura-dyslexia", dyslexiaFont);
  }, [highContrast, dyslexiaFont]);

  // React to system theme changes when in "system" mode
  useEffect(() => {
    if (theme !== "system" || typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme]);

  return <>{children}</>;
}

/**
 * Inline script that applies the stored theme before React hydrates,
 * preventing a flash of the wrong theme. Inject inside <head>.
 */
export const themeBootstrapScript = `
(function(){
  try {
    var stored = localStorage.getItem('${STORAGE_KEY}');
    var theme = stored || 'light';
    var resolved = theme === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : theme;
    if (resolved === 'dark') document.documentElement.classList.add('dark');
    document.documentElement.style.colorScheme = resolved;
  } catch (e) {}
})();
`;
