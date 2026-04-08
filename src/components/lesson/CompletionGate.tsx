"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Check, Lock } from "lucide-react";
import { useProgressStore } from "@/stores/progress";
import { XP_AWARDS } from "@/lib/xp";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

interface CompletionGateProps {
  estimatedMinutes: number;
  nextHref?: string;
  nextTitle?: string;
}

const SCROLL_REQUIRED = 85;
const TIME_REQUIRED_RATIO = 0.7;

/**
 * Base completion gate. Phase B will swap this in for a celebration version
 * with confetti, XP animation, and streak/level checks. The gate logic
 * (scroll >= 85%, time >= 70% of estimate, quiz passed) is the contract.
 */
export function CompletionGate({
  estimatedMinutes,
  nextHref,
  nextTitle,
}: CompletionGateProps): React.ReactElement {
  const scrollPercent = useProgressStore((s) => s.scrollPercent);
  const timeSpentMs = useProgressStore((s) => s.timeSpentMs);
  const quizPassed = useProgressStore((s) => s.quizPassed);
  const completed = useProgressStore((s) => s.current?.completedAt);
  const complete = useProgressStore((s) => s.complete);
  const current = useProgressStore((s) => s.current);

  const requiredMs = estimatedMinutes * 60_000 * TIME_REQUIRED_RATIO;
  const scrollOk = scrollPercent >= SCROLL_REQUIRED;
  const timeOk = timeSpentMs >= requiredMs;
  const ready = scrollOk && timeOk && quizPassed;

  const checks = useMemo(
    () => [
      { label: `Read at least ${SCROLL_REQUIRED}% of the lesson`, done: scrollOk },
      {
        label: `Spend at least ${Math.ceil((estimatedMinutes * TIME_REQUIRED_RATIO) | 0)} minutes`,
        done: timeOk,
      },
      { label: "Pass the quiz", done: quizPassed },
    ],
    [scrollOk, timeOk, quizPassed, estimatedMinutes]
  );

  const onComplete = async () => {
    if (!current || completed) return;
    await complete(XP_AWARDS.lesson);
    void track("lesson_completed", {
      lessonId: current.lessonId,
      phaseId: current.phaseId,
      moduleId: current.moduleId,
      xp: XP_AWARDS.lesson,
      timeSpentMs,
    });
  };

  if (completed) {
    return (
      <section className="my-12 rounded-2xl border border-emerald-200 bg-[var(--color-bg-accent)] p-6 text-center">
        <Check className="mx-auto h-10 w-10 text-emerald-500" aria-hidden />
        <h2 className="mt-3 text-2xl font-semibold text-[var(--color-text-primary)]">
          Lesson complete
        </h2>
        <p className="mt-1 text-[var(--color-text-secondary)]">+{XP_AWARDS.lesson} XP earned</p>
        {nextHref && nextTitle && (
          <Link
            href={nextHref}
            className="mt-4 inline-block rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600"
          >
            Next: {nextTitle} →
          </Link>
        )}
      </section>
    );
  }

  return (
    <section className="my-12 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6">
      <h2 className="mb-3 text-xl font-semibold text-[var(--color-text-primary)]">
        Finish this lesson
      </h2>
      <ul className="mb-4 flex flex-col gap-2">
        {checks.map((c) => (
          <li key={c.label} className="flex items-center gap-2 text-sm">
            <span
              className={cn(
                "flex h-5 w-5 items-center justify-center rounded-full border",
                c.done
                  ? "border-emerald-500 bg-emerald-500 text-white"
                  : "border-[var(--color-border)] text-[var(--color-text-muted)]"
              )}
            >
              {c.done ? <Check className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
            </span>
            <span
              className={
                c.done ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-secondary)]"
              }
            >
              {c.label}
            </span>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => void onComplete()}
        disabled={!ready}
        className={cn(
          "rounded-lg px-5 py-2.5 text-sm font-semibold transition",
          ready
            ? "bg-emerald-500 text-white hover:bg-emerald-600"
            : "cursor-not-allowed bg-[var(--color-bg-subtle)] text-[var(--color-text-muted)]"
        )}
      >
        {ready ? `Complete lesson (+${XP_AWARDS.lesson} XP)` : "Keep going"}
      </button>
    </section>
  );
}
