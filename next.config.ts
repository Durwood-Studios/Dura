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
              // 'unsafe-inline' dropped — theme bootstrap moved to /theme-bootstrap.js,
              // console easter-egg removed. JSON-LD remains inline but
              // type="application/ld+json" is not script-executable so CSP doesn't gate it.
              //
              // 'unsafe-eval' kept for Sandpack. Sandpack itself runs in the
              // codesandbox.io iframe (governed by that iframe's own CSP), but the
              // host-side bundler can use Function() in some configurations. To drop
              // 'unsafe-eval' safely we need runtime verification that every Sandpack
              // flow still works — staged as a separate work item.
              "script-src 'self' 'unsafe-eval' https://*.codesandbox.io",
              "style-src 'self' 'unsafe-inline'",
              // Tightened from 'self' data: blob: https: — only Supabase storage
              // (avatars / certificates / shared assets) is a legitimate external
              // image source. data: + blob: stay for canvas exports and inline UI primitives.
              "img-src 'self' data: blob: https://*.supabase.co",
              "font-src 'self' data:",
              "connect-src 'self' https://*.supabase.co https://*.codesandbox.io wss://*.codesandbox.io https://vitals.vercel-insights.com",
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
