// Theme bootstrap — runs before React hydrates to prevent a flash of the wrong
// theme. Kept as an external script (not inline) so CSP can drop `'unsafe-inline'`
// from `script-src`. STORAGE_KEY mirrors src/components/providers/ThemeProvider.tsx
// — if you rename it there, rename it here too.
(function () {
  try {
    var stored = localStorage.getItem("dura-theme");
    var theme = stored || "light";
    var resolved =
      theme === "system"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : theme;
    if (resolved === "dark") document.documentElement.classList.add("dark");
    document.documentElement.style.colorScheme = resolved;
  } catch {
    // localStorage may be unavailable (private mode, etc.); fall through to default.
  }
})();
