"use client";

import { useEffect, useMemo } from "react";
import { schedule } from "@/lib/fsrs";
import { cn } from "@/lib/utils";
import type { FlashCard, ReviewRating } from "@/types/flashcard";

interface RatingButtonsProps {
  card: FlashCard;
  visible: boolean;
  onRate: (rating: ReviewRating) => void;
}

const RATINGS: { value: ReviewRating; label: string; key: string; classes: string }[] = [
  {
    value: "again",
    label: "Again",
    key: "1",
    classes: "border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100",
  },
  {
    value: "hard",
    label: "Hard",
    key: "2",
    classes: "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100",
  },
  {
    value: "good",
    label: "Good",
    key: "3",
    classes: "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
  },
  {
    value: "easy",
    label: "Easy",
    key: "4",
    classes: "border-cyan-300 bg-cyan-50 text-cyan-700 hover:bg-cyan-100",
  },
];

function formatInterval(days: number): string {
  if (days < 1 / 1440) return "<1m";
  if (days < 1 / 24) return `${Math.round(days * 1440)}m`;
  if (days < 1) return `${Math.round(days * 24)}h`;
  if (days < 30) return `${Math.round(days)}d`;
  if (days < 365) return `${Math.round(days / 30)}mo`;
  return `${Math.round(days / 365)}y`;
}

export function RatingButtons({ card, visible, onRate }: RatingButtonsProps): React.ReactElement {
  const previews = useMemo(() => {
    const out: Record<ReviewRating, string> = {
      again: "",
      hard: "",
      good: "",
      easy: "",
    };
    for (const r of RATINGS) {
      const { intervalDays } = schedule(card, r.value);
      out[r.value] = formatInterval(intervalDays);
    }
    return out;
  }, [card]);

  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => {
      const match = RATINGS.find((r) => r.key === e.key);
      if (match) {
        e.preventDefault();
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
    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {RATINGS.map((r) => (
        <button
          key={r.value}
          type="button"
          onClick={() => onRate(r.value)}
          className={cn(
            "flex min-h-[64px] flex-col items-center justify-center rounded-xl border px-3 py-2 text-sm font-semibold transition",
            r.classes
          )}
        >
          <span className="flex items-center gap-1.5">
            <kbd className="hidden rounded border border-current/30 px-1 py-0 font-mono text-[10px] opacity-70 sm:inline">
              {r.key}
            </kbd>
            {r.label}
          </span>
          <span className="mt-0.5 font-mono text-[11px] opacity-80">{previews[r.value]}</span>
        </button>
      ))}
    </div>
  );
}
