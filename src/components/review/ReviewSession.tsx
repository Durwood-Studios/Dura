"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Brain, RotateCcw, ArrowRight } from "lucide-react";
import { useReviewStore } from "@/stores/review";
import { FlashcardDisplay } from "@/components/review/FlashcardDisplay";
import { RatingButtons } from "@/components/review/RatingButtons";
import { ReviewProgress } from "@/components/review/ReviewProgress";
import { Spinner } from "@/components/ui/Spinner";
import { formatTime } from "@/lib/utils";
import { XP_AWARDS } from "@/lib/xp";

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
    return (
      <div className="mx-auto max-w-xl py-16 text-center">
        <Brain className="mx-auto h-14 w-14 text-emerald-500" aria-hidden />
        <h2 className="mt-4 text-2xl font-semibold text-[var(--color-text-primary)]">
          All caught up
        </h2>
        <p className="mt-2 text-[var(--color-text-secondary)]">
          {nextDue
            ? `Your next review is ${formatRelative(nextDue)}.`
            : "You don't have any flashcards yet — add some from a lesson."}
        </p>
        <Link
          href="/paths/0/0-1/01"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600"
        >
          Add cards from a lesson
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  // Session complete summary
  if (sessionComplete) {
    const total = sessionStats.correct + sessionStats.wrong;
    const accuracy = total === 0 ? 0 : Math.round((sessionStats.correct / total) * 100);
    const xp = total * XP_AWARDS.flashcard;
    const elapsedMs = startedAt ? Date.now() - startedAt : 0;
    return (
      <div className="mx-auto max-w-xl py-16 text-center">
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
      <ReviewProgress
        current={index}
        total={queue.length}
        correct={sessionStats.correct}
        wrong={sessionStats.wrong}
        startedAt={startedAt}
      />
      <FlashcardDisplay card={card} flipped={flippedAt !== null} onFlip={flip} />
      <RatingButtons card={card} visible={flippedAt !== null} onRate={(r) => void rate(r)} />
    </div>
  );
}
