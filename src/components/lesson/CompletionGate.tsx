"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Check, Lock, Trophy, ArrowRight, Repeat } from "lucide-react";
import { useProgressStore } from "@/stores/progress";
import { XP_AWARDS, levelFromXP } from "@/lib/xp";
import { track } from "@/lib/analytics";
import { getDueCards } from "@/lib/db/flashcards";
import { getCompletedLessonCount } from "@/lib/db/progress";
import { getTotalXP } from "@/lib/db/xp";
import { awardXPWithToast } from "@/lib/xp-manager";
import { extendStreak } from "@/lib/streak-manager";
import { StreakFlame } from "@/components/gamification/StreakFlame";
import { Confetti } from "@/components/motion/Confetti";
import { ShareButton } from "@/components/seo/ShareButton";
import { SITE_URL } from "@/lib/og";
import { cn } from "@/lib/utils";

interface CompletionGateProps {
  estimatedMinutes: number;
  lessonTitle: string;
  /** Whether this lesson contains a Quiz component. */
  hasQuiz?: boolean;
  nextHref?: string;
  nextTitle?: string;
  /** Vocabulary terms from the lesson frontmatter. Shown on completion. */
  vocabulary?: string[];
}

const SCROLL_REQUIRED = 85;
const TIME_REQUIRED_RATIO = 0.7;
const XP_TWEEN_MS = 1000;

const MILESTONE_MESSAGES: Record<number, string> = {
  1: "First lesson complete. You know things now that you didn't an hour ago.",
  5: "Five lessons. The concepts are starting to connect.",
  10: "Ten lessons in. Your vocabulary has grown.",
  25: "25 lessons. These ideas are yours now.",
  50: "50 lessons. You can explain things you couldn't before.",
  100: "100 lessons. The foundation is real.",
  200: "200 lessons. You're reading code differently now.",
  300: "300 lessons. The patterns are becoming intuitive.",
  400: "400 lessons. Nearly the full picture.",
};

const DEFAULT_MESSAGES = [
  "Lesson complete.",
  "New knowledge, locked in.",
  "Another concept understood.",
  "That's one more thing you can build with.",
  "Filed away. It'll connect to something later.",
  "Done. The next one builds on this.",
];

/** Pick a milestone or rotating encouragement message. */
function getCompletionMessage(count: number): string {
  if (MILESTONE_MESSAGES[count]) return MILESTONE_MESSAGES[count];
  return DEFAULT_MESSAGES[count % DEFAULT_MESSAGES.length];
}

/** Format a millisecond duration as `M:SS`. Floors to whole seconds. */
function formatTimeRemaining(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
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
  hasQuiz = true,
  nextHref,
  nextTitle,
  vocabulary = [],
}: CompletionGateProps): React.ReactElement {
  const scrollPercent = useProgressStore((s) => s.scrollPercent);
  const timeSpentMs = useProgressStore((s) => s.timeSpentMs);
  const quizPassed = useProgressStore((s) => s.quizPassed);
  const completed = useProgressStore((s) => s.current?.completedAt);
  const complete = useProgressStore((s) => s.complete);
  const current = useProgressStore((s) => s.current);

  const requiredMs = estimatedMinutes * 60_000 * TIME_REQUIRED_RATIO;
  const requiredMinutes = Math.ceil(estimatedMinutes * TIME_REQUIRED_RATIO);
  const scrollOk = scrollPercent >= SCROLL_REQUIRED;
  const timeOk = timeSpentMs >= requiredMs;
  const quizOk = hasQuiz ? quizPassed : true;
  const ready = scrollOk && timeOk && quizOk;

  const timeProgress = Math.min(1, timeSpentMs / requiredMs);
  const timeRemainingMs = Math.max(0, requiredMs - timeSpentMs);

  // Detect the false → true unlock transition so we can pulse the button
  // and announce it for screen readers without firing on every render.
  const wasReadyRef = useRef(false);
  const [justUnlocked, setJustUnlocked] = useState(false);
  useEffect(() => {
    if (ready && !wasReadyRef.current) {
      wasReadyRef.current = true;
      setJustUnlocked(true);
      const t = setTimeout(() => setJustUnlocked(false), 1200);
      return () => clearTimeout(t);
    }
    if (!ready) wasReadyRef.current = false;
  }, [ready]);

  const [celebrating, setCelebrating] = useState(false);
  const [previousLevel, setPreviousLevel] = useState<number | null>(null);
  const [newLevel, setNewLevel] = useState<number | null>(null);
  const [dueAfter, setDueAfter] = useState<number>(0);
  const [completionMessage, setCompletionMessage] = useState<string>("");
  const [streakDays, setStreakDays] = useState<number>(0);
  const [streakExtended, setStreakExtended] = useState<boolean>(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);
  const xp = useTween(XP_AWARDS.lesson, XP_TWEEN_MS, celebrating);

  type Check = { label: string; done: boolean; subtitle?: string; progress?: number };
  const checks = useMemo<Check[]>(
    () => [
      { label: `Read at least ${SCROLL_REQUIRED}% of the lesson`, done: scrollOk },
      {
        label: `Spend at least ${requiredMinutes} minutes`,
        done: timeOk,
        subtitle: timeOk ? `Time logged.` : `${formatTimeRemaining(timeRemainingMs)} remaining`,
        progress: timeProgress,
      },
      ...(hasQuiz ? [{ label: "Pass the quiz", done: quizPassed }] : []),
    ],
    [scrollOk, timeOk, quizPassed, requiredMinutes, timeRemainingMs, timeProgress, hasQuiz]
  );

  // If the lesson was already completed in a previous session, skip celebration animation.
  useEffect(() => {
    if (completed && !celebrating) {
      setCelebrating(true);
    }
  }, [completed, celebrating]);

  // After celebrating, fetch due card count and completed lesson count.
  useEffect(() => {
    if (!celebrating) return;
    void getDueCards().then((cards) => setDueAfter(cards.length));
    void getCompletedLessonCount().then((count) =>
      setCompletionMessage(getCompletionMessage(count))
    );
  }, [celebrating]);

  const onComplete = async () => {
    if (!current || completed) return;
    try {
      const before = await getTotalXP();
      if (!mountedRef.current) return;
      setPreviousLevel(levelFromXP(before));
      await complete(XP_AWARDS.lesson);
      await awardXPWithToast("lesson", XP_AWARDS.lesson, current.lessonId);
      if (!mountedRef.current) return;
      const after = before + XP_AWARDS.lesson;
      setNewLevel(levelFromXP(after));
      setCelebrating(true);
    } catch (error) {
      console.error("[gate] completion failed", error);
      return;
    }
    // Extend the streak and record whether it grew.
    try {
      const { getCurrentStreak } = await import("@/lib/streak-manager");
      const prev = await getCurrentStreak();
      const updated = await extendStreak();
      if (mountedRef.current) {
        setStreakDays(updated.current);
        setStreakExtended(updated.current > prev.current);
      }
    } catch (error) {
      console.error("[gate] streak extend failed", error);
    }
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
    const shareText = `Just learned about ${lessonTitle} on DURA`;

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
        {completionMessage && (
          <p
            className="mt-2 font-serif text-base text-[var(--color-text-secondary)] italic opacity-0"
            style={{ animation: "celebrate-in 400ms ease-out 0.45s forwards" }}
          >
            {completionMessage}
          </p>
        )}
        {vocabulary.length > 0 && (
          <div
            className="mx-auto mt-4 max-w-md opacity-0"
            style={{ animation: "celebrate-in 400ms ease-out 0.55s forwards" }}
          >
            <p className="mb-2 text-xs font-medium text-[var(--color-text-muted)]">You now know</p>
            <div className="flex flex-wrap justify-center gap-1.5">
              {vocabulary.slice(0, 6).map((term) => (
                <span
                  key={term}
                  className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300"
                >
                  {term}
                </span>
              ))}
            </div>
          </div>
        )}
        <p
          className="mt-3 font-mono text-2xl font-semibold text-emerald-600 opacity-0"
          style={{ animation: "celebrate-in 400ms ease-out 0.7s forwards" }}
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
        {streakExtended && streakDays > 0 && (
          <p
            className="mt-2 inline-flex items-center justify-center gap-1 text-sm font-medium text-amber-600 opacity-0"
            style={{ animation: "celebrate-in 400ms ease-out 1s forwards" }}
          >
            <StreakFlame days={streakDays} />
            {streakDays} day streak
            {[7, 14, 30, 60, 100, 365].includes(streakDays) && " — milestone!"}
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
              className="inline-flex items-center gap-2 rounded-lg border border-emerald-300 bg-[var(--color-bg-surface)] px-4 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50"
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
      <ul className="mb-4 flex flex-col gap-3">
        {checks.map((c) => (
          <li key={c.label} className="flex items-start gap-2 text-sm">
            <span
              className={cn(
                "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors duration-300",
                c.done
                  ? "border-emerald-500 bg-emerald-500 text-white"
                  : "border-[var(--color-border)] text-[var(--color-text-muted)]"
              )}
            >
              {c.done ? <Check className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
            </span>
            <span className="flex-1">
              <span
                className={
                  c.done ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-secondary)]"
                }
              >
                {c.label}
              </span>
              {c.subtitle && (
                <span
                  className={cn(
                    "ml-2 font-mono text-xs tabular-nums transition-colors duration-300",
                    c.done ? "text-emerald-600" : "text-[var(--color-text-muted)]"
                  )}
                >
                  {c.subtitle}
                </span>
              )}
              {typeof c.progress === "number" && !c.done && (
                <span
                  className="mt-1.5 block h-1 w-full overflow-hidden rounded-full bg-[var(--color-bg-subtle)]"
                  aria-hidden
                >
                  <span
                    className="block h-full rounded-full bg-emerald-500 transition-[width] duration-1000 ease-linear"
                    style={{ width: `${c.progress * 100}%` }}
                  />
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>
      <p className="sr-only" aria-live="polite" role="status">
        {ready ? "Lesson requirements complete. You can finish the lesson." : ""}
      </p>
      <button
        type="button"
        onClick={() => void onComplete()}
        disabled={!ready}
        className={cn(
          "rounded-lg px-5 py-2.5 text-sm font-semibold transition",
          ready
            ? "bg-emerald-500 text-white hover:bg-emerald-600"
            : "cursor-not-allowed bg-[var(--color-bg-subtle)] text-[var(--color-text-muted)]",
          justUnlocked && "gate-unlock-pulse"
        )}
      >
        {ready ? `Complete lesson (+${XP_AWARDS.lesson} XP)` : "Keep going"}
      </button>
    </section>
  );
}
