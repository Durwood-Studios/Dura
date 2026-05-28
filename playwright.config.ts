import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright e2e config — smoke suite for hot learner paths.
 *
 * Scope: routes that must never 500 / never throw runtime errors. Component-
 * level behavior (FSRS scoring, store mutations) stays in Vitest. Playwright
 * exercises the full request → render → hydrate pipeline that Vitest cannot.
 *
 * The webServer block boots `npm run dev` against an empty env (no Supabase),
 * which is the offline-first golden path: the app MUST work without auth.
 * Anyone running tests locally with .env.local set will still pass — the dev
 * server inherits the environment.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["html", { open: "never" }], ["list"]] : "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    actionTimeout: 10_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  // Boot a PRODUCTION build, not `npm run dev`. Reason: Next.js dev mode
  // injects inline scripts for Fast Refresh / error overlay, which violate
  // the CSP `script-src 'self' ...` directive. Those injections are dev
  // tooling, not something learners ever see — so testing against `dev`
  // would force us to either weaken the CSP test or weaken the prod CSP.
  // The build adds ~60s but exercises the bundle learners actually receive.
  webServer: {
    command: "npm run build && npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
  },
});
