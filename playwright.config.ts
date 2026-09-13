import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright e2e config — smoke suite for hot learner paths.
 *
 * Scope: routes that must never 500 / never throw runtime errors. Component-
 * level behavior (FSRS scoring, store mutations) stays in Vitest. Playwright
 * exercises the full request → render → hydrate pipeline that Vitest cannot.
 *
 * The webServer block builds and starts production against an empty env (no Supabase),
 * which is the offline-first golden path: the app MUST work without auth.
 * Anyone running tests locally with .env.local set will still pass — the dev
 * server inherits the environment.
 */
const port = process.env.DURA_E2E_PORT ?? "3000";
if (!/^\d{4,5}$/.test(port) || Number(port) > 65535) throw new Error("Invalid DURA_E2E_PORT");

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["html", { open: "never" }], ["list"]] : "list",
  use: {
    baseURL: `http://localhost:${port}`,
    trace: "on-first-retry",
    actionTimeout: 10_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      testMatch: /(?:standards-viewport|product-viewport|judgment-workflow)\.spec\.ts/,
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "mobile-webkit",
      testMatch: /(?:standards-viewport|product-viewport|judgment-workflow)\.spec\.ts/,
      use: { ...devices["iPhone 13"] },
    },
  ],
  // Boot a PRODUCTION build, not `npm run dev`. Reason: Next.js dev mode
  // injects inline scripts for Fast Refresh / error overlay, which violate
  // the CSP `script-src 'self' ...` directive. Those injections are dev
  // tooling, not something learners ever see — so testing against `dev`
  // would force us to either weaken the CSP test or weaken the prod CSP.
  // The build adds ~60s but exercises the bundle learners actually receive.
  webServer: {
    command: `npm run build && npm run start -- --port ${port}`,
    url: `http://localhost:${port}`,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
  },
});
