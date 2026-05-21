"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { RotateCcw, ArrowRight } from "lucide-react";
import { useAnimate } from "motion/react";
import { useReviewStore } from "@/stores/review";
import { FlashcardDisplay } from "@/components/review/FlashcardDisplay";
import { RatingButtons } from "@/components/review/RatingButtons";
import { IntervalReveal } from "@/components/review/IntervalReveal";
import { ReviewProgress } from "@/components/review/ReviewProgress";
import { Spinner } from "@/components/ui/Spinner";
import { schedule } from "@/lib/fsrs";
import { formatTime } from "@/lib/utils";
import { XP_AWARDS } from "@/lib/xp";
import type { ReviewRating } from "@/types/flashcard";

/** Labels for each rating value — shown alongside the interval on card exit. */
const RATING_LABELS: Record<ReviewRating, string> = {
  again: "Again",
  hard: "Hard",
  good: "Good",
  easy: "Easy",
};

function formatInterval(days: number): string {
  if (days < 1 / 1440) return "<1m";
  if (days < 1 / 24) return `${Math.round(days * 1440)}m`;
  if (days < 1) return `${Math.round(days * 24)}h`;
  if (days < 30) return `${Math.round(days)}d`;
  if (days < 365) return `${Math.round(days / 30)}mo`;
  return `${Math.round(days / 365)}y`;
}

function formatRelative(timestamp: number, now: number = Date.now()): string {
  const ms = timestamp - now;
  if (ms <= 0) return "now";
  const minutes = Math.round(ms / 60_000);
  if (minutes < 60) return `in ${minutes}m`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `in ${hours}h`;
  const days = Math.round(hours / 24);
  return `in ${days}d`;
}

export function ReviewSession(): React.ReactElement {
  const queue = useReviewStore((s) => s.queue);
  const index = useReviewStore((s) => s.index);
  const flippedAt = useReviewStore((s) => s.flippedAt);
  const sessionStats = useReviewStore((s) => s.sessionStats);
  const sessionComplete = useReviewStore((s) => s.sessionComplete);
  const startedAt = useReviewStore((s) => s.startedAt);
  const loading = useReviewStore((s) => s.loading);
  const dueCount = useReviewStore((s) => s.dueCount);
  const nextDue = useReviewStore((s) => s.nextDue);
  const loadQueue = useReviewStore((s) => s.loadQueue);
  const flip = useReviewStore((s) => s.flip);
  const rate = useReviewStore((s) => s.rate);
  const reset = useReviewStore((s) => s.reset);

  // DLS-1.0 §FSRS Interval Reveal: show the chosen interval during card-exit window
  const [revealInterval, setRevealInterval] = useState<string | null>(null);
  const [revealRating, setRevealRating] = useState<string | null>(null);

  const handleRate = useCallback(
    (rating: ReviewRating): void => {
      const card = queue[index];
      if (card) {
        const { intervalDays } = schedule(card, rating);
        setRevealInterval(formatInterval(intervalDays));
        setRevealRating(RATING_LABELS[rating]);
        // Clear after card-exit window (~400ms matches FlashcardDisplay transition)
        setTimeout(() => {
          setRevealInterval(null);
          setRevealRating(null);
        }, 400);
      }
      void rate(rating);
    },
    [queue, index, rate]
  );

  useEffect(() => {
    void loadQueue();
    return () => reset();
  }, [loadQueue, reset]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Empty state — no due cards
  if (sessionComplete && dueCount === 0) {
    return <AllCaughtUp nextDue={nextDue} />;
  }

  // Session complete summary
  if (sessionComplete) {
    const total = sessionStats.correct + sessionStats.wrong;
    const accuracy = total === 0 ? 0 : Math.round((sessionStats.correct / total) * 100);
    const xp = total * XP_AWARDS.flashcard;
    const elapsedMs = startedAt ? Date.now() - startedAt : 0;
    return (
      <div className="mx-auto max-w-xl py-16 text-center" role="status" aria-live="polite">
        <h2 className="text-3xl font-semibold text-[var(--color-text-primary)]">
          Session complete
        </h2>
        <p className="mt-2 text-[var(--color-text-secondary)]">
          {total} cards reviewed · {accuracy}% accuracy
        </p>
        <p className="mt-1 font-mono text-sm text-emerald-600">+{xp} XP</p>
        <p className="mt-4 text-xs text-[var(--color-text-muted)]">
          Cards marked &ldquo;Again&rdquo; will reappear shortly. Time: {formatTime(elapsedMs)}
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <button
            type="button"
            onClick={() => void loadQueue()}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600"
          >
            <RotateCcw className="h-4 w-4" />
            Review again
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] transition hover:bg-[var(--color-bg-subtle)]"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  const card = queue[index];
  if (!card) return <></>;

  return (
    <div className="mx-auto max-w-2xl py-12">
      {/* WCAG 2.2 — announce per-card progress so screen-reader users
          know where they are in the queue without scanning the visual
          progress bar. Updates whenever `index` changes, which is the
          single source of truth for "moved to next card." */}
      <p className="sr-only" aria-live="polite" role="status">
        Card {index + 1} of {queue.length}.
      </p>
      <ReviewProgress
        current={index}
        total={queue.length}
        correct={sessionStats.correct}
        wrong={sessionStats.wrong}
        startedAt={startedAt}
      />
      <FlashcardDisplay card={card} flipped={flippedAt !== null} onFlip={flip} />
      <IntervalReveal interval={revealInterval} rating={revealRating} />
      <RatingButtons card={card} visible={flippedAt !== null} onRate={handleRate} />
    </div>
  );
}

// ── AllCaughtUp ──────────────────────────────────────────────────────────────
// DLS-2.0 §Signature 4 — "The Clearing"
// 1600ms sequence: SVG checkmark draw-in → heading + copy stagger →
// button entry → 8-second background breath → haptic at 1400ms.
// --color-celebration (emerald) tint on the breath: learner reached the goal.

import { SPRINGS } from "@/lib/motion/springs";
import { useMotionPreference } from "@/hooks/use-reduced-motion";
import { haptic } from "@/lib/haptics";

function AllCaughtUp({ nextDue }: { nextDue: number | null }): React.ReactElement {
  const { shouldAnimate } = useMotionPreference();
  const [wrapScope, animateWrap] = useAnimate();
  const [checkScope, animateCheck] = useAnimate();
  const [headScope, animateHead] = useAnimate();
  const [copyScope, animateCopy] = useAnimate();
  const [btnScope, animateBtn] = useAnimate();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    if (!shouldAnimate) return;

    // Phase 1 (0ms–400ms): SVG checkmark draws in via stroke-dashoffset
    void animateCheck(
      checkScope.current,
      { strokeDashoffset: [100, 0] },
      { duration: 0.4, ease: "easeOut" }
    );

    // Phase 2 (400ms): heading fades + slides up
    void animateHead(
      headScope.current,
      { opacity: [0, 1], y: [10, 0] },
      { ...SPRINGS.fluid, duration: undefined, delay: 0.4 }
    );

    // Phase 3 (600ms): copy
    void animateCopy(
      copyScope.current,
      { opacity: [0, 1], y: [6, 0] },
      { ...SPRINGS.fluid, duration: undefined, delay: 0.6 }
    );

    // Phase 4 (900ms): buttons stagger in
    void animateBtn(
      btnScope.current,
      { opacity: [0, 1], y: [8, 0] },
      { ...SPRINGS.fluid, duration: undefined, delay: 0.9 }
    );

    // Phase 5 (0ms–∞): 8-second background breath
    void animateWrap(
      wrapScope.current,
      {
        background: [
          "radial-gradient(ellipse at 50% 60%, oklch(68% 0.18 145 / 0%) 0%, transparent 70%)",
          "radial-gradient(ellipse at 50% 60%, oklch(68% 0.18 145 / 6%) 0%, transparent 70%)",
          "radial-gradient(ellipse at 50% 60%, oklch(68% 0.18 145 / 0%) 0%, transparent 70%)",
        ],
      },
      { duration: 8, repeat: Infinity, ease: "easeInOut" }
    );

    // Phase 6 (1400ms): haptic
    const t = setTimeout(() => haptic("sessionEnd"), 1400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={wrapScope}
      className="mx-auto max-w-xl py-16 text-center"
      role="status"
      aria-live="polite"
      aria-label="All caught up — no cards due"
    >
      {/* SVG checkmark */}
      <svg width="56" height="56" viewBox="0 0 56 56" fill="none" className="mx-auto" aria-hidden>
        <circle cx="28" cy="28" r="26" stroke="oklch(68% 0.18 145)" strokeWidth="2.5" />
        <path
          ref={checkScope}
          d="M16 28l9 9 15-15"
          stroke="oklch(58% 0.18 145)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="100"
          strokeDashoffset={shouldAnimate ? 100 : 0}
        />
      </svg>

      <h2
        ref={headScope}
        className="mt-4 text-2xl font-semibold text-[var(--color-text-primary)]"
        style={{ opacity: shouldAnimate ? 0 : 1 }}
      >
        All caught up
      </h2>

      <div ref={copyScope} className="mt-2" style={{ opacity: shouldAnimate ? 0 : 1 }}>
        {nextDue ? (
          <p className="text-[var(--color-text-secondary)]">
            Your next review is {formatRelative(nextDue)}. Come back then to keep your memory fresh.
          </p>
        ) : (
          <>
            <p className="text-[var(--color-text-secondary)]">
              Flashcards are created automatically as you complete lessons. Each lesson adds
              vocabulary to your review deck.
            </p>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              Your first cards will be ready to review the day after your first lesson.
            </p>
          </>
        )}
      </div>

      <div ref={btnScope} style={{ opacity: shouldAnimate ? 0 : 1 }}>
        <Link
          href="/paths/0/0-1/01"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[color:oklch(58%_0.18_145)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[color:oklch(52%_0.18_145)]"
        >
          {nextDue ? "Keep learning" : "Start your first lesson"}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
