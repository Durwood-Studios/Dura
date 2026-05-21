"use client";

import { useEffect, useRef } from "react";
import { useAnimate } from "motion/react";
import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { SPRINGS } from "@/lib/motion/springs";
import { useMotionPreference } from "@/hooks/use-reduced-motion";
import type { FlashCard } from "@/types/flashcard";

interface FlashcardDisplayProps {
  card: FlashCard;
  flipped: boolean;
  onFlip: () => void;
}

/**
 * DLS-2.0 §Signature 1 — "The Reveal"
 *
 * 340ms spring flip on the Y axis. Shadow lifts at the 50% rotation point
 * (card appears to rise as it flips). SPRINGS.fluid governs the physics.
 *
 * Reduced-motion: 200ms opacity crossfade — no rotational transform.
 */
export function FlashcardDisplay({
  card,
  flipped,
  onFlip,
}: FlashcardDisplayProps): React.ReactElement {
  const { shouldAnimate } = useMotionPreference();
  const [innerScope, animateInner] = useAnimate();
  const [frontScope, animateFront] = useAnimate();
  const [backScope, animateBack] = useAnimate();
  const prevFlipped = useRef(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.code === "Space" && !flipped) {
        e.preventDefault();
        onFlip();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flipped, onFlip]);

  // Drive the flip animation whenever `flipped` changes
  useEffect(() => {
    const wasFlipped = prevFlipped.current;
    prevFlipped.current = flipped;
    if (wasFlipped === flipped) return; // no change (initial mount)

    if (!shouldAnimate) {
      // Reduced-motion: instant opacity crossfade
      void animateFront(frontScope.current, { opacity: flipped ? 0 : 1 }, { duration: 0.2 });
      void animateBack(backScope.current, { opacity: flipped ? 1 : 0 }, { duration: 0.2 });
      return;
    }

    // Spring flip — Y axis rotation with shadow lift at 90°
    const targetDeg = flipped ? 180 : 0;

    // Phase 1: rotate to 90° (card edge-on) with shadow rising
    void animateInner(
      innerScope.current,
      { rotateY: targetDeg > 90 ? 90 : -90, boxShadow: "0 24px 48px rgba(0,0,0,0.18)" },
      { ...SPRINGS.fluid, duration: undefined }
    ).then(() => {
      // Phase 2: complete rotation + shadow settles
      void animateInner(
        innerScope.current,
        { rotateY: targetDeg, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" },
        { ...SPRINGS.fluid, duration: undefined }
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flipped, shouldAnimate]);

  return (
    <div
      onClick={() => !flipped && onFlip()}
      className={cn(
        "perspective relative mx-auto h-72 w-full max-w-xl",
        !flipped && "cursor-pointer"
      )}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !flipped) onFlip();
      }}
      aria-label={flipped ? "Card definition" : "Card term — click or press space to flip"}
    >
      {shouldAnimate ? (
        // Spring flip: single inner div rotates on Y
        <div
          ref={innerScope}
          className="relative h-full w-full"
          style={{ transformStyle: "preserve-3d", willChange: "transform" }}
        >
          {/* Front */}
          <div
            className="flashcard-face absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-8 shadow-md"
            style={{ backfaceVisibility: "hidden" }}
          >
            <FrontContent card={card} />
          </div>
          {/* Back */}
          <div
            className="flashcard-face flashcard-back absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-8 shadow-md"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <BackContent card={card} />
          </div>
        </div>
      ) : (
        // Reduced-motion: two faces stacked, opacity crossfade
        <div className="relative h-full w-full">
          <div
            ref={frontScope}
            className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-8 shadow-md"
            style={{ opacity: flipped ? 0 : 1 }}
          >
            <FrontContent card={card} />
          </div>
          <div
            ref={backScope}
            className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-8 shadow-md"
            style={{ opacity: flipped ? 1 : 0 }}
          >
            <BackContent card={card} />
          </div>
        </div>
      )}
    </div>
  );
}

function FrontContent({ card }: { card: FlashCard }): React.ReactElement {
  return (
    <>
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
    </>
  );
}

function BackContent({ card }: { card: FlashCard }): React.ReactElement {
  return (
    <>
      <span className="mb-3 font-mono text-[10px] tracking-widest text-[var(--color-text-muted)] uppercase">
        Definition
      </span>
      <p className="max-w-[480px] text-center leading-relaxed text-[var(--color-text-secondary)]">
        {card.back}
      </p>
    </>
  );
}
