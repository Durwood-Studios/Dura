import { test, expect, type ConsoleMessage } from "@playwright/test";

/**
 * Hot-path smoke suite. Five routes that must always render without
 * runtime errors. Each test:
 *   1. captures every console message + page error
 *   2. navigates to the route
 *   3. asserts the response is 200
 *   4. asserts no error-level console messages and no uncaught exceptions
 *
 * A CSP violation surfaces in the browser as a console error, so the same
 * harness will catch CSP regressions when next.config.ts is tightened.
 *
 * The lesson path is a real lesson MDX, not a placeholder — `/paths/0-...`
 * was confirmed to render in the dev-server smoke check that found the
 * Supabase-middleware crash.
 */

const HOT_PATHS = [
  { name: "home", url: "/" },
  { name: "discover", url: "/discover" },
  { name: "lesson", url: "/paths/0-digital-literacy/0-1-how-computers-think/01-binary" },
  { name: "review", url: "/review" },
  { name: "settings", url: "/settings" },
];

// Console noise we deliberately ignore. Each entry must explain WHY.
const IGNORED_CONSOLE_PATTERNS: { pattern: RegExp; why: string }[] = [
  {
    // Next.js dev mode prints a "Fast Refresh" hint as info, occasionally
    // tagged warn during hot-reload; nothing the user can fix.
    pattern: /Fast Refresh|Compiled|Compiling/i,
    why: "Next.js dev tooling, not a real warning",
  },
  {
    // The crypto fallback logs warn when crypto.subtle is unavailable.
    // Playwright runs in a secure context, so this should not trigger,
    // but allow it for safety in unusual sandboxing scenarios.
    pattern: /crypto\.subtle unavailable/i,
    why: "documented fallback path; not an error",
  },
];

function shouldIgnore(msg: ConsoleMessage): boolean {
  const text = msg.text();
  return IGNORED_CONSOLE_PATTERNS.some(({ pattern }) => pattern.test(text));
}

for (const route of HOT_PATHS) {
  test(`${route.name} renders without runtime errors`, async ({ page }) => {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];

    page.on("console", (msg) => {
      if (msg.type() === "error" && !shouldIgnore(msg)) {
        consoleErrors.push(`[console.error] ${msg.text()}`);
      }
    });
    page.on("pageerror", (err) => {
      pageErrors.push(`[pageerror] ${err.message}`);
    });

    const response = await page.goto(route.url, { waitUntil: "networkidle" });
    expect(response, `no response for ${route.url}`).not.toBeNull();
    expect(response!.status(), `${route.url} returned ${response!.status()}`).toBe(200);

    expect(
      consoleErrors,
      `console errors on ${route.url}:\n${consoleErrors.join("\n")}`
    ).toHaveLength(0);
    expect(
      pageErrors,
      `uncaught exceptions on ${route.url}:\n${pageErrors.join("\n")}`
    ).toHaveLength(0);
  });
}
