"use client";

import { useState } from "react";
import { getTerm } from "@/lib/dictionary";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

interface VocabTooltipProps {
  slug: string;
  children?: React.ReactNode;
}

/**
 * Base vocabulary tooltip. Click reveals the intermediate-tier definition
 * inline. Phase B (B5) adds difficulty tier toggle, "add to flashcards"
 * with FSRS card creation, and auto-highlighting in lesson body text.
 */
export function VocabTooltip({ slug, children }: VocabTooltipProps): React.ReactElement {
  const [open, setOpen] = useState(false);
  const term = getTerm(slug);

  if (!term) {
    return <span>{children ?? slug}</span>;
  }

  const toggle = () => {
    setOpen((v) => {
      if (!v) void track("dictionary_term_viewed", { slug });
      return !v;
    });
  };

  return (
    <span className="relative inline-block">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        className={cn(
          "inline border-b border-dotted border-emerald-500 text-[var(--color-text-primary)] underline-offset-4 transition hover:text-emerald-700",
          open && "text-emerald-700"
        )}
      >
        {children ?? term.term}
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute top-full left-0 z-20 mt-2 block w-72 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-3 text-left text-xs leading-relaxed text-[var(--color-text-secondary)] shadow-lg"
        >
          <strong className="mb-1 block text-sm text-[var(--color-text-primary)]">
            {term.term}
          </strong>
          {term.definitions.intermediate}
        </span>
      )}
    </span>
  );
}
