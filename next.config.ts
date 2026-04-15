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
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
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
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.codesandbox.io",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data:",
              "connect-src 'self' https://*.supabase.co https://*.codesandbox.io wss://*.codesandbox.io",
              "frame-src 'self' https://*.codesandbox.io https://*.csb.app",
              "worker-src 'self' blob:",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default withSerwist(nextConfig);
