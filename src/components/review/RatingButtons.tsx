"use client";

import { useEffect, useMemo, useState } from "react";
import { schedule } from "@/lib/fsrs";
import { cn } from "@/lib/utils";
import type { FlashCard, ReviewRating } from "@/types/flashcard";

interface RatingButtonsProps {
  card: FlashCard;
  visible: boolean;
  onRate: (rating: ReviewRating) => void;
}

const RATINGS: { value: ReviewRating; label: string; key: string }[] = [
  { value: "again", label: "Again", key: "1" },
  { value: "hard", label: "Hard", key: "2" },
  { value: "good", label: "Good", key: "3" },
  { value: "easy", label: "Easy", key: "4" },
];

/**
 * Per-rating color applied AFTER the user taps — not before.
 * DLS-1.0 §Anti-Patterns: "Rating Button Color Before Rating" is explicitly
 * forbidden. Buttons start neutral; color reveals on the selected rating
 * as the card exits, so the color communicates the outcome, not a prompt.
 */
const RATED_CLASSES: Record<ReviewRating, string> = {
  again:
    "border-rose-400 bg-rose-50 text-rose-700 dark:border-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
  hard: "border-amber-400 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  good: "border-emerald-400 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  easy: "border-cyan-400 bg-cyan-50 text-cyan-700 dark:border-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300",
};

function formatInterval(days: number): string {
  if (days < 1 / 1440) return "<1m";
  if (days < 1 / 24) return `${Math.round(days * 1440)}m`;
  if (days < 1) return `${Math.round(days * 24)}h`;
  if (days < 30) return `${Math.round(days)}d`;
  if (days < 365) return `${Math.round(days / 30)}mo`;
  return `${Math.round(days / 365)}y`;
}

export function RatingButtons({ card, visible, onRate }: RatingButtonsProps): React.ReactElement {
  /**
   * The interval for each rating is computed ahead of time but only
   * REVEALED (shown to the user) after they tap. Before a tap the
   * interval label is hidden — showing it pre-tap biases choice and
   * violates DLS-1.0 §Rating Button behaviour.
   */
  const previews = useMemo(() => {
    const out: Record<ReviewRating, string> = { again: "", hard: "", good: "", easy: "" };
    for (const r of RATINGS) {
      const { intervalDays } = schedule(card, r.value);
      out[r.value] = formatInterval(intervalDays);
    }
    return out;
  }, [card]);

  // Which rating was just tapped — used to highlight that button and reveal interval
  const [tapped, setTapped] = useState<ReviewRating | null>(null);

  // Reset tapped state when card changes (new card presented)
  useEffect(() => {
    setTapped(null);
  }, [card]);

  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent): void => {
      const match = RATINGS.find((r) => r.key === e.key);
      if (match) {
        e.preventDefault();
        setTapped(match.value);
        onRate(match.value);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible, onRate]);

  if (!visible) {
    return (
      <p className="mt-6 text-center text-sm text-[var(--color-text-muted)]">
        Reveal the answer to rate it.
      </p>
    );
  }

  return (
    <div
      className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4"
      role="group"
      aria-label="Rate this card"
    >
      {RATINGS.map((r) => {
        const isSelected = tapped === r.value;
        return (
          <button
            key={r.value}
            type="button"
            onClick={() => {
              setTapped(r.value);
              onRate(r.value);
            }}
            aria-label={`${r.label} — next review in ${previews[r.value]} (keyboard shortcut ${r.key})`}
            aria-keyshortcuts={r.key}
            aria-pressed={isSelected}
            className={cn(
              "flex min-h-[64px] flex-col items-center justify-center rounded-xl border px-3 py-2 text-sm font-semibold transition focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:outline-none",
              isSelected
                ? RATED_CLASSES[r.value]
                : "border-[var(--color-border)] bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-subtle)]"
            )}
          >
            <span className="flex items-center gap-1.5" aria-hidden>
              <kbd className="hidden rounded border border-current/30 px-1 py-0 font-mono text-[10px] opacity-70 sm:inline">
                {r.key}
              </kbd>
              {r.label}
            </span>
            {/* Interval revealed only AFTER tap — not before (DLS-1.0 §Rating Button behaviour) */}
            <span
              className={cn(
                "mt-0.5 font-mono text-[11px] transition-opacity duration-150",
                isSelected ? "opacity-80" : "opacity-0 select-none"
              )}
              aria-hidden
            >
              {previews[r.value]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
