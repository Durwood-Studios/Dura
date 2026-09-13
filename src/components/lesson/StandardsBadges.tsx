"use client";

import { useState } from "react";
import { Popover } from "@base-ui/react/popover";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { decodeCode, type StandardsBadge } from "@/lib/standards";

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
  if (badges.length === 0) return null;

  return (
    <div className="mb-4 flex flex-wrap items-center gap-1.5">
      <span className="mr-1 text-xs font-medium tracking-wide text-[var(--color-text-muted)] uppercase">
        Aligned to
      </span>
      {badges.map(({ body, codes }) => {
        const isOpen = openId === body.id;
        const preview = codes[0] + (codes.length > 1 ? ` +${codes.length - 1}` : "");
        return (
          <Popover.Root
            key={body.id}
            open={isOpen}
            onOpenChange={(open): void => setOpenId(open ? body.id : null)}
          >
            <Popover.Trigger
              type="button"
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
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Positioner
                side="bottom"
                align="start"
                sideOffset={8}
                positionMethod="fixed"
                sticky
                collisionPadding={12}
                collisionAvoidance={{ side: "flip", align: "shift" }}
                className="z-50"
              >
                <Popover.Popup
                  role="dialog"
                  aria-label={body.full}
                  className="block max-h-[min(var(--available-height),calc(100dvh-24px))] w-80 max-w-[min(var(--available-width),calc(100vw-24px))] overflow-y-auto overscroll-contain rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4 text-left break-words shadow-xl focus:outline-none"
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
                  <span className="mt-1 flex flex-col gap-1">
                    {codes.map((c) => (
                      <span
                        key={c}
                        className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-2 py-1 text-xs text-[var(--color-text-primary)]"
                      >
                        <span className="font-mono">{decodeCode(body.id, c)}</span>
                      </span>
                    ))}
                  </span>
                  <span className="mt-3 flex flex-wrap items-center gap-3">
                    <a
                      href={`/standards#${body.id}`}
                      className="inline-flex items-center gap-1 text-xs font-medium text-[var(--color-accent)] hover:underline"
                    >
                      All DURA coverage →
                    </a>
                    <a
                      href={body.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-[var(--color-accent)] hover:underline"
                    >
                      Official spec
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </span>
                </Popover.Popup>
              </Popover.Positioner>
            </Popover.Portal>
          </Popover.Root>
        );
      })}
    </div>
  );
}
