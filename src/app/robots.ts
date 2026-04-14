import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/og";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/teach/",
        "/dashboard",
        "/settings",
        "/stats",
        "/verify/",
        "/goals",
        "/review",
        "/sandbox",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
