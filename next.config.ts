import withSerwistInit from "@serwist/next";
import type { NextConfig } from "next";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/paths/[phaseId]/[moduleId]/[lessonId]": ["./src/content/phases/**/*.mdx"],
    "/howto/[slug]": ["./src/content/howto/**/*.mdx"],
    "/tutorials/[slug]": ["./src/content/tutorials/**/*.mdx"],
    "/teach/print/modules/[phaseId]/[moduleId]": ["./src/content/phases/**/*.mdx"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          // X-XSS-Protection removed — the legacy IE/Chrome XSS auditor is a no-op
          // on modern browsers (Chrome 78+, Edge, Firefox) and OWASP's 2025
          // guidance is to drop it. CSP is the load-bearing XSS defense.
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // 'unsafe-inline' is required because Next.js 15 App Router
              // emits inline <script> tags during streaming SSR (flight
              // payload pushes, render data, hydration). The 2026-05-27
              // hardening commit (c4bfac3) dropped 'unsafe-inline' without
              // catching that those streaming-SSR scripts would be blocked
              // — Playwright e2e (2026-05-28) flagged the regression: pages
              // SSR but hydrate-time chunks are CSP-blocked. Restored here.
              //
              // The right long-term fix is a nonce-based CSP: middleware
              // generates a per-request nonce, sets it on the CSP header,
              // and Next applies it to its emitted scripts. That requires a
              // middleware refactor and is filed for the next security
              // sweep — see ROADMAP.md "Security & supply chain".
              //
              // 'unsafe-eval' dropped 2026-05-28. Sandpack v2 runs user
              // code inside the codesandbox.io iframe — eval lives there,
              // not on the host. The Playwright sandbox-route test
              // (tests/e2e/smoke.spec.ts) keeps this honest: any future
              // regression that needs eval on the host will fail the
              // /sandbox smoke check before it ships.
              "script-src 'self' 'unsafe-inline' https://*.codesandbox.io",
              "style-src 'self' 'unsafe-inline'",
              // Tightened from 'self' data: blob: https: — only Supabase storage
              // (avatars / certificates / shared assets) is a legitimate external
              // image source. data: + blob: stay for canvas exports and inline UI primitives.
              "img-src 'self' data: blob: https://*.supabase.co",
              "font-src 'self' data:",
              // wttr.in: the AikenWeather splash easter-egg fetches a short
              // text weather string. It fails silently so users never saw
              // the CSP-blocked request, but the feature was broken since
              // c4bfac3. Allowed here as a single-host exception.
              //
              // api.anthropic.com: BYOK AI features (Settings → AI
              // Features). Requests go browser → Anthropic direct with
              // the learner's own key in localStorage. No Durwood-side
              // proxy. Design rationale: xDocs/active/ai-surfaces-
              // design-2026-05.md.
              "connect-src 'self' https://*.supabase.co https://*.codesandbox.io wss://*.codesandbox.io https://vitals.vercel-insights.com https://wttr.in https://api.anthropic.com",
              "frame-src 'self' https://*.codesandbox.io https://*.csb.app",
              "worker-src 'self' blob:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default withSerwist(nextConfig);
