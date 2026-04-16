import type { MetadataRoute } from "next";
import { readdirSync, readFileSync } from "fs";
import { join } from "path";
import matter from "gray-matter";
import { PHASES } from "@/content/phases";
import { DICTIONARY } from "@/content/dictionary";
import { ROLES } from "@/content/roles";
import { SITE_URL } from "@/lib/og";

/** Scan MDX files in a directory and extract slugs from frontmatter. */
function scanSlugs(dir: string): string[] {
  try {
    return readdirSync(dir)
      .filter((f) => f.endsWith(".mdx"))
      .map((f) => {
        const raw = readFileSync(join(dir, f), "utf-8");
        const { data } = matter(raw);
        return (data.slug as string) || "";
      })
      .filter(Boolean);
  } catch {
    return [];
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const contentDir = process.cwd();

  // Scan content directories dynamically
  const howtoSlugs = scanSlugs(join(contentDir, "src/content/howto"));
  const tutorialSlugs = scanSlugs(join(contentDir, "src/content/tutorials"));

  const staticPages: MetadataRoute.Sitemap = [
    // Marketing
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
    { url: `${SITE_URL}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/install`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    {
      url: `${SITE_URL}/standards/ai-engineering`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    // App
    { url: `${SITE_URL}/paths`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/dictionary`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/howto`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/tutorials`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/tracks`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/assess`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  ];

  // Phase pages
  const phasePages: MetadataRoute.Sitemap = PHASES.map((p) => ({
    url: `${SITE_URL}/paths/${p.id}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Career track pages
  const trackPages: MetadataRoute.Sitemap = ROLES.map((r) => ({
    url: `${SITE_URL}/tracks/${r.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  // Dictionary term pages (500+)
  const dictionaryPages: MetadataRoute.Sitemap = DICTIONARY.map((t) => ({
    url: `${SITE_URL}/dictionary/${t.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  // How-to guide pages (35)
  const howtoPages: MetadataRoute.Sitemap = howtoSlugs.map((slug) => ({
    url: `${SITE_URL}/howto/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  // Tutorial pages (100)
  const tutorialPages: MetadataRoute.Sitemap = tutorialSlugs.map((slug) => ({
    url: `${SITE_URL}/tutorials/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [
    ...staticPages,
    ...phasePages,
    ...trackPages,
    ...dictionaryPages,
    ...howtoPages,
    ...tutorialPages,
  ];
}
