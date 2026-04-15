"use client";

import { useEffect } from "react";
import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FlashCard } from "@/types/flashcard";

interface FlashcardDisplayProps {
  card: FlashCard;
  flipped: boolean;
  onFlip: () => void;
}

export function FlashcardDisplay({
  card,
  flipped,
  onFlip,
}: FlashcardDisplayProps): React.ReactElement {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" && !flipped) {
        e.preventDefault();
        onFlip();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flipped, onFlip]);

  return (
    <div
      onClick={() => !flipped && onFlip()}
      className={cn(
        "flashcard-3d perspective relative mx-auto h-72 w-full max-w-xl",
        !flipped && "cursor-pointer"
      )}
      role="button"
      tabIndex={0}
      aria-label={flipped ? "Card definition" : "Card term — click or press space to flip"}
    >
      <div
        className={cn(
          "flashcard-inner relative h-full w-full transition-transform duration-500",
          flipped && "is-flipped"
        )}
      >
        {/* Front */}
        <div className="flashcard-face absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-8 shadow-md">
          <span className="mb-3 font-mono text-[10px] tracking-widest text-[var(--color-text-muted)] uppercase">
            Term
          </span>
          <h2 className="text-center text-3xl font-semibold text-[var(--color-text-primary)] sm:text-4xl">
            {card.front}
          </h2>
          <div className="mt-6 flex flex-col items-center gap-1">
            <RotateCcw className="h-4 w-4 text-[var(--color-text-muted)]" aria-hidden />
            <span className="text-xs text-[var(--color-text-muted)]">Tap to flip</span>
          </div>
        </div>
        {/* Back */}
        <div className="flashcard-face flashcard-back absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-8 shadow-md">
          <span className="mb-3 font-mono text-[10px] tracking-widest text-[var(--color-text-muted)] uppercase">
            Definition
          </span>
          <p className="max-w-[480px] text-center leading-relaxed text-[var(--color-text-secondary)]">
            {card.back}
          </p>
        </div>
      </div>
    </div>
  );
}
