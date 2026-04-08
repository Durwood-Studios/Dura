/**
 * Share URL builders. No SDKs, no trackers — pure URL composition.
 */

export type SharePlatform = "x" | "linkedin" | "reddit" | "email" | "facebook";

export interface ShareOptions {
  url: string;
  title: string;
  text?: string;
  hashtags?: string[];
}

export function buildShareUrl(platform: SharePlatform, options: ShareOptions): string {
  const { url, title, text = "", hashtags = [] } = options;
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedText = encodeURIComponent(text);
  const tags = hashtags.join(",");

  switch (platform) {
    case "x":
      return `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}${
        tags ? `&hashtags=${encodeURIComponent(tags)}` : ""
      }`;
    case "linkedin":
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
    case "reddit":
      return `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`;
    case "facebook":
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    case "email":
      return `mailto:?subject=${encodedTitle}&body=${encodedText}%20${encodedUrl}`;
  }
}

/** Detect Web Share API support (Safari iOS, Android Chrome, etc.). */
export function canNativeShare(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.share === "function";
}

export async function nativeShare(options: ShareOptions): Promise<boolean> {
  if (!canNativeShare()) return false;
  try {
    await navigator.share({ url: options.url, title: options.title, text: options.text });
    return true;
  } catch {
    return false;
  }
}

export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.clipboard) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
