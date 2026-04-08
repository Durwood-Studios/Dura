"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Check, Lock, Trophy, ArrowRight, Repeat } from "lucide-react";
import { useProgressStore } from "@/stores/progress";
import { XP_AWARDS, levelFromXP } from "@/lib/xp";
import { track } from "@/lib/analytics";
import { getDB } from "@/lib/db";
import { getDueCards } from "@/lib/db/flashcards";
import { Confetti } from "@/components/motion/Confetti";
import { ShareButton } from "@/components/seo/ShareButton";
import { SITE_URL } from "@/lib/og";
import { cn } from "@/lib/utils";

interface CompletionGateProps {
  estimatedMinutes: number;
  lessonTitle: string;
  nextHref?: string;
  nextTitle?: string;
}

const SCROLL_REQUIRED = 85;
const TIME_REQUIRED_RATIO = 0.7;
const XP_TWEEN_MS = 1000;

async function readTotalXp(): Promise<number> {
  try {
    const db = await getDB();
    const all = await db.getAll("progress");
    return all.reduce((sum, p) => sum + (p.completedAt ? p.xpEarned : 0), 0);
  } catch (error) {
    console.error("[gate] readTotalXp failed", error);
    return 0;
  }
}

function useTween(target: number, durationMs: number, run: boolean): number {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number | null>(null);
  useEffect(() => {
    if (!run) return;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      setValue(Math.round(t * target));
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, durationMs, run]);
  return value;
}

export function CompletionGate({
  estimatedMinutes,
  lessonTitle,
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

  const [celebrating, setCelebrating] = useState(false);
  const [previousLevel, setPreviousLevel] = useState<number | null>(null);
  const [newLevel, setNewLevel] = useState<number | null>(null);
  const [dueAfter, setDueAfter] = useState<number>(0);
  const xp = useTween(XP_AWARDS.lesson, XP_TWEEN_MS, celebrating);

  const checks = useMemo(
    () => [
      { label: `Read at least ${SCROLL_REQUIRED}% of the lesson`, done: scrollOk },
      {
        label: `Spend at least ${Math.ceil(estimatedMinutes * TIME_REQUIRED_RATIO)} minutes`,
        done: timeOk,
      },
      { label: "Pass the quiz", done: quizPassed },
    ],
    [scrollOk, timeOk, quizPassed, estimatedMinutes]
  );

  // If the lesson was already completed in a previous session, skip celebration animation.
  useEffect(() => {
    if (completed && !celebrating) {
      setCelebrating(true);
    }
  }, [completed, celebrating]);

  // After celebrating, fetch due card count for the review prompt.
  useEffect(() => {
    if (!celebrating) return;
    void getDueCards().then((cards) => setDueAfter(cards.length));
  }, [celebrating]);

  const onComplete = async () => {
    if (!current || completed) return;
    const before = await readTotalXp();
    setPreviousLevel(levelFromXP(before));
    await complete(XP_AWARDS.lesson);
    const after = before + XP_AWARDS.lesson;
    setNewLevel(levelFromXP(after));
    setCelebrating(true);
    void track("lesson_completed", {
      lessonId: current.lessonId,
      phaseId: current.phaseId,
      moduleId: current.moduleId,
      xp: XP_AWARDS.lesson,
      timeSpentMs,
    });
  };

  const leveledUp = previousLevel !== null && newLevel !== null && newLevel > previousLevel;

  if (completed || celebrating) {
    const shareUrl = current
      ? `${SITE_URL}/paths/${current.phaseId}/${current.moduleId}/${current.lessonId}`
      : SITE_URL;
    const shareText = `I just completed "${lessonTitle}" on DURA 🧠`;

    return (
      <section className="my-12 overflow-hidden rounded-2xl border border-emerald-200 bg-[var(--color-bg-accent)] p-8 text-center">
        <Confetti active={celebrating && !completed} />
        <Trophy className="mx-auto h-12 w-12 text-amber-500" aria-hidden />
        <h2
          className="mt-4 text-3xl font-semibold text-[var(--color-text-primary)] opacity-0"
          style={{ animation: "celebrate-in 400ms ease-out 0.3s forwards" }}
        >
          Lesson complete
        </h2>
        <p
          className="mt-2 font-mono text-2xl font-semibold text-emerald-600 opacity-0"
          style={{ animation: "celebrate-in 400ms ease-out 0.6s forwards" }}
        >
          +{xp} XP
        </p>
        {leveledUp && (
          <p
            className="mt-2 text-sm font-medium text-amber-600 opacity-0"
            style={{ animation: "celebrate-in 400ms ease-out 0.9s forwards" }}
          >
            ⭐ Level up — Level {newLevel}
          </p>
        )}
        <div
          className="mt-6 flex flex-col items-center gap-3 opacity-0"
          style={{ animation: "celebrate-in 400ms ease-out 1.2s forwards" }}
        >
          {nextHref && nextTitle && (
            <Link
              href={nextHref}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600"
            >
              Next: {nextTitle}
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
          {dueAfter > 0 && (
            <Link
              href="/review"
              className="inline-flex items-center gap-2 rounded-lg border border-emerald-300 bg-white px-4 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50"
            >
              <Repeat className="h-4 w-4" />
              {dueAfter} flashcard{dueAfter === 1 ? "" : "s"} due for review
            </Link>
          )}
          <ShareButton url={shareUrl} title={shareText} text={shareText} />
        </div>
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
