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
  // sandbox: exercises the Sandpack host bundle. Catches CSP regressions
  // around script-src 'unsafe-eval' — Sandpack v2 runs user code in the
  // codesandbox.io iframe (its own CSP), but the host wrapper has been
  // historically suspect for eval/Function. If this passes with eval
  // dropped, the CSP can be tightened.
  { name: "sandbox", url: "/sandbox" },
  // discover/pathfinding: new activity (2026-05-28). Catches lazy-import
  // regressions on the activity registry, route param wiring, and any
  // runtime errors in the new component itself.
  { name: "pathfinding", url: "/discover/robot-chef/pathfinding" },
  // discover/embedding-galaxy: Phase 6 AI/ML activity. Same role as
  // pathfinding — guards the lazy-import wiring + the SVG/state render
  // path of the new component.
  { name: "embedding-galaxy", url: "/discover/pattern-factory/embedding-galaxy" },
  // discover/race-condition: Phase 5 concurrency activity (2026-05-28).
  // Same coverage role as pathfinding/embedding-galaxy.
  { name: "race-condition", url: "/discover/bug-lab/race-condition" },
  // discover/gc-visualizer: Phase 7 mark-and-sweep heap simulation
  // (2026-05-28). Guards the lazy-import wiring and the BFS/sweep state
  // machine on first mount.
  { name: "gc-visualizer", url: "/discover/bug-lab/gc-visualizer" },
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

    // `networkidle` hangs on routes with persistent connections
    // (Sandpack's iframe bundler holds a WebSocket open). `load` fires
    // after all blocking resources but is still safe for catching
    // runtime errors — anything that throws at mount lands within the
    // 2s settle window below.
    const response = await page.goto(route.url, { waitUntil: "load" });
    expect(response, `no response for ${route.url}`).not.toBeNull();
    expect(response!.status(), `${route.url} returned ${response!.status()}`).toBe(200);
    // Give late-mounting client components a beat to register their
    // own console errors / promise rejections (e.g. lazy imports,
    // useEffect-fired fetches). 2s is generous on a healthy build and
    // short enough to keep the suite fast.
    await page.waitForTimeout(2000);

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
