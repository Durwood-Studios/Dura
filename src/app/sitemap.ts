import type { MetadataRoute } from "next";
import { PHASES } from "@/content/phases";
import { DICTIONARY } from "@/content/dictionary";
import { SITE_URL } from "@/lib/og";

/** How-to guide slugs — must match src/content/howto filenames. */
const HOWTO_SLUGS = [
  "dev-environment",
  "error-messages",
  "git-basics",
  "debugging",
  "deploying",
  "api-basics",
  "interview-prep",
  "reading-docs",
  "open-source",
  "portfolio",
];

/** Tutorial slugs — must match src/content/tutorials filenames. */
const TUTORIAL_SLUGS = ["cli-tool", "rest-api", "react-dashboard", "rag-chatbot", "portfolio-site"];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    {
      url: `${SITE_URL}/how-it-works`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/open-source`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    { url: `${SITE_URL}/paths`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/dictionary`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/howto`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/tutorials`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
  ];

  const phasePages: MetadataRoute.Sitemap = PHASES.map((p) => ({
    url: `${SITE_URL}/paths/${p.id}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const dictionaryPages: MetadataRoute.Sitemap = DICTIONARY.map((t) => ({
    url: `${SITE_URL}/dictionary/${t.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const howtoPages: MetadataRoute.Sitemap = HOWTO_SLUGS.map((slug) => ({
    url: `${SITE_URL}/howto/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const tutorialPages: MetadataRoute.Sitemap = TUTORIAL_SLUGS.map((slug) => ({
    url: `${SITE_URL}/tutorials/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...phasePages, ...dictionaryPages, ...howtoPages, ...tutorialPages];
}
