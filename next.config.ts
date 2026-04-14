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
};

export default withSerwist(nextConfig);
