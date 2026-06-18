import withSerwistInit from "@serwist/next";
import type { NextConfig } from "next";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  // Tree-shake barrel-heavy libs at import time. Framer Motion ("motion") is
  // the dominant client-JS cost on lesson pages (it lands in the 4 largest
  // chunks); lucide-react re-exports hundreds of icons. optimizePackageImports
  // rewrites these to per-symbol imports so only used code is bundled.
  experimental: {
    optimizePackageImports: ["motion", "lucide-react"],
  },
  // Serve modern image formats (smaller than PNG/JPEG) via next/image.
  images: {
    formats: ["image/avif", "image/webp"],
  },
  outputFileTracingIncludes: {
    "/paths/[phaseId]/[moduleId]/[lessonId]": ["./src/content/phases/**/*.mdx"],
    "/howto/[slug]": ["./src/content/howto/**/*.mdx"],
    "/tutorials/[slug]": ["./src/content/tutorials/**/*.mdx"],
    "/teach/print/modules/[phaseId]/[moduleId]": ["./src/content/phases/**/*.mdx"],
  },
  async headers() {
    return [
      // Auth pages must never be cached — shared-device session exposure.
      {
        source: "/auth/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          },
          { key: "Pragma", value: "no-cache" },
          { key: "Expires", value: "0" },
        ],
      },
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
          // HSTS — pin the browser to HTTPS for 2 years + include subdomains.
          // `preload` makes the site eligible for the browser-shipped
          // preload list (still requires hstspreload.org submission to
          // actually be preloaded; the directive is the prerequisite).
          // Vercel auto-sets HSTS on prod HTTPS, but explicit > implicit:
          // belt-and-suspenders so dev/preview deploys behave the same as
          // prod and a future infra change can't silently drop it.
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          // COOP isolates the top-level browsing context from cross-origin
          // openers. Prevents window-reference attacks (where a cross-
          // origin opener reaches into DURA's window) and is a prerequisite
          // for browser-level process isolation. `same-origin` is the
          // strictest level; `same-origin-allow-popups` would relax for
          // /auth/callback if the OAuth provider needed a window handle
          // back, but Supabase's redirect-callback flow doesn't.
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
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
