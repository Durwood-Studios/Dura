"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StandardsBadge } from "@/lib/standards";

interface StandardsBadgesProps {
  badges: StandardsBadge[];
}

/**
 * Click-to-expand chip strip surfacing every standards body the lesson maps
 * to. Each chip opens a popover with the full standard name, what it is,
 * the specific codes from this lesson, and a link to the canonical spec.
 *
 * The data already exists on lesson frontmatter and PHASE_STANDARDS; this
 * component makes the alignment legible to learners, educators, and
 * employers rather than leaving it buried in metadata.
 */
export function StandardsBadges({ badges }: StandardsBadgesProps): React.ReactElement | null {
  const [openId, setOpenId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!openId) return;
    const onDocClick = (e: MouseEvent): void => {
      if (!containerRef.current?.contains(e.target as Node)) setOpenId(null);
    };
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") setOpenId(null);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [openId]);

  if (badges.length === 0) return null;

  return (
    <div ref={containerRef} className="mb-4 flex flex-wrap items-center gap-1.5">
      <span className="mr-1 text-xs font-medium tracking-wide text-[var(--color-text-muted)] uppercase">
        Aligned to
      </span>
      {badges.map(({ body, codes }) => {
        const isOpen = openId === body.id;
        const preview = codes[0] + (codes.length > 1 ? ` +${codes.length - 1}` : "");
        return (
          <span key={body.id} className="relative inline-block">
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : body.id)}
              aria-expanded={isOpen}
              aria-label={`${body.full}: ${codes.join(", ")}`}
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium transition",
                isOpen
                  ? "border-[var(--color-accent)] bg-[var(--color-bg-accent)] text-[var(--color-accent)]"
                  : "border-[var(--color-border)] bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
              )}
            >
              <span className="font-semibold">{body.short}</span>
              <span className="font-mono text-xs text-[var(--color-text-muted)]">{preview}</span>
            </button>
            {isOpen && (
              <span
                role="dialog"
                aria-label={body.full}
                className="absolute top-full left-0 z-30 mt-2 block w-80 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4 text-left shadow-xl"
              >
                <strong className="block text-sm text-[var(--color-text-primary)]">
                  {body.full}
                </strong>
                <span className="mt-1 block text-xs leading-relaxed text-[var(--color-text-secondary)]">
                  {body.description}
                </span>
                <span className="mt-3 block text-xs font-medium tracking-wide text-[var(--color-text-muted)] uppercase">
                  This lesson covers
                </span>
                <span className="mt-1 flex flex-wrap gap-1">
                  {codes.map((c) => (
                    <span
                      key={c}
                      className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-1.5 py-0.5 font-mono text-xs text-[var(--color-text-primary)]"
                    >
                      {c}
                    </span>
                  ))}
                </span>
                <a
                  href={body.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[var(--color-accent)] hover:underline"
                >
                  Official spec
                  <ExternalLink className="h-3 w-3" />
                </a>
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}
