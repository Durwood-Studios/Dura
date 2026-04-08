import type { Metadata } from "next";

export const SITE_NAME = "DURA";
export const SITE_TAGLINE = "Engineering education, hardened by design.";
export const SITE_DESCRIPTION =
  "From absolute zero to CTO-ready. 10 phases. 2,850 hours. Standards-backed. Free forever.";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://dura.dev");

export const TWITTER_HANDLE = "@durastudios";

export interface OGOptions {
  title: string;
  description?: string;
  path?: string;
  image?: string;
  type?: "website" | "article";
  publishedTime?: string;
  authors?: string[];
  tags?: string[];
}

function absoluteUrl(path: string): string {
  if (path.startsWith("http")) return path;
  const base = SITE_URL.replace(/\/$/, "");
  const rel = path.startsWith("/") ? path : `/${path}`;
  return `${base}${rel}`;
}

/**
 * Build a Next.js Metadata object with consistent OG/Twitter tags.
 * Use in page-level `export const metadata = buildMetadata(...)`.
 */
export function buildMetadata(options: OGOptions): Metadata {
  const {
    title,
    description = SITE_DESCRIPTION,
    path = "/",
    image = "/og/default.png",
    type = "website",
    publishedTime,
    authors,
    tags,
  } = options;

  const url = absoluteUrl(path);
  const imageUrl = absoluteUrl(image);
  const fullTitle =
    title === SITE_NAME ? `${SITE_NAME} — ${SITE_TAGLINE}` : `${title} — ${SITE_NAME}`;

  return {
    title: fullTitle,
    description,
    metadataBase: new URL(SITE_URL),
    alternates: { canonical: url },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE_NAME,
      type,
      locale: "en_US",
      images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
      ...(publishedTime ? { publishedTime } : {}),
      ...(authors ? { authors } : {}),
      ...(tags ? { tags } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [imageUrl],
      creator: TWITTER_HANDLE,
      site: TWITTER_HANDLE,
    },
  };
}

/** Build OG metadata for a curriculum lesson page. */
export function lessonMetadata(params: {
  title: string;
  description: string;
  phaseId: string;
  moduleId: string;
  lessonId: string;
}): Metadata {
  return buildMetadata({
    title: params.title,
    description: params.description,
    path: `/paths/${params.phaseId}/${params.moduleId}/${params.lessonId}`,
    type: "article",
  });
}

/** Build OG metadata for a dictionary term page. */
export function termMetadata(params: { term: string; definition: string; slug: string }): Metadata {
  return buildMetadata({
    title: params.term,
    description: params.definition,
    path: `/dictionary/${params.slug}`,
  });
}

/** Build OG metadata for a verification certificate. */
export function verificationMetadata(params: {
  hash: string;
  phaseTitle: string;
  score: number;
}): Metadata {
  return buildMetadata({
    title: `${params.phaseTitle} — Verified`,
    description: `Verified mastery of ${params.phaseTitle} with a score of ${params.score}%.`,
    path: `/verify/${params.hash}`,
    image: `/og/verify/${params.hash}.png`,
  });
}
