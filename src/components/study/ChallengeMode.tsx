"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Check, X, Timer, Zap, Trophy } from "lucide-react";
import { ALL_QUESTIONS } from "@/content/questions";
import { awardXPWithToast } from "@/lib/xp-manager";
import { XP_AWARDS } from "@/lib/xp";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import type { AssessmentQuestion } from "@/types/assessment";

type Bracket = "0-1" | "2-3" | "4-5" | "6-7" | "8-9" | "mixed";

const BRACKETS: { value: Bracket; label: string }[] = [
  { value: "0-1", label: "Phases 0–1 (Beginner)" },
  { value: "2-3", label: "Phases 2–3 (Intermediate)" },
  { value: "4-5", label: "Phases 4–5 (Backend/Systems)" },
  { value: "6-7", label: "Phases 6–7 (AI/Advanced)" },
  { value: "8-9", label: "Phases 8–9 (Professional/CTO)" },
  { value: "mixed", label: "Mixed (All Phases)" },
];

const QUESTION_COUNT = 10;
const TIME_PER_QUESTION = 60;

function filterQuestions(bracket: Bracket): AssessmentQuestion[] {
  if (bracket === "mixed") return ALL_QUESTIONS;
  const [lo, hi] = bracket.split("-");
  return ALL_QUESTIONS.filter((q) => q.phaseId === lo || q.phaseId === hi);
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

interface SessionState {
  questions: AssessmentQuestion[];
  current: number;
  answers: (number | null)[];
  timeLeft: number;
  streak: number;
  maxStreak: number;
  xpEarned: number;
  finished: boolean;
}

export function ChallengeMode(): React.ReactElement {
  const [bracket, setBracket] = useState<Bracket | null>(null);
  const [session, setSession] = useState<SessionState | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startSession = useCallback((b: Bracket) => {
    setBracket(b);
    const pool = filterQuestions(b);
    const picked = shuffle(pool).slice(0, QUESTION_COUNT);
    setSession({
      questions: picked,
      current: 0,
      answers: new Array(picked.length).fill(null) as (number | null)[],
      timeLeft: TIME_PER_QUESTION,
      streak: 0,
      maxStreak: 0,
      xpEarned: 0,
      finished: false,
    });
  }, []);

  const sessionCurrent = session?.current ?? -1;
  const sessionFinished = session?.finished ?? true;

  // Timer
  useEffect(() => {
    if (sessionFinished || sessionCurrent < 0) return;

    timerRef.current = setInterval(() => {
      setSession((s) => {
        if (!s || s.finished) return s;
        if (s.timeLeft <= 1) {
          // Time's up — skip question
          return advanceQuestion(s, null);
        }
        return { ...s, timeLeft: s.timeLeft - 1 };
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [sessionCurrent, sessionFinished]);

  const handleAnswer = useCallback((optionIndex: number) => {
    setSession((s) => {
      if (!s || s.finished) return s;
      return advanceQuestion(s, optionIndex);
    });
  }, []);

  if (!session) {
    return <BracketPicker onStart={startSession} />;
  }

  if (session.finished) {
    return (
      <SessionSummary
        session={session}
        bracket={bracket!}
        onRestart={() => {
          setSession(null);
          setBracket(null);
        }}
      />
    );
  }

  const q = session.questions[session.current];
  const progress = (session.current / session.questions.length) * 100;

  return (
    <div>
      {/* Progress bar */}
      <div className="mb-4 h-1 w-full rounded-full bg-[var(--color-border)]">
        <div
          className="h-1 rounded-full bg-emerald-500 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Header */}
      <div className="mb-6 flex items-center justify-between text-sm text-[var(--color-text-muted)]">
        <span className="flex items-center gap-1">
          <Timer className="h-4 w-4" />
          {session.timeLeft}s
        </span>
        <span>
          {session.current + 1} / {session.questions.length}
        </span>
        {session.streak >= 2 && (
          <span className="flex items-center gap-1 font-medium text-amber-500">
            <Zap className="h-4 w-4" />
            {session.streak}× streak
          </span>
        )}
      </div>

      {/* Question */}
      <h2 className="mb-6 text-lg font-medium text-[var(--color-text-primary)]">{q.question}</h2>

      {/* Options */}
      <div className="space-y-3">
        {q.options.map((option, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleAnswer(i)}
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-4 py-3 text-left text-sm transition hover:border-emerald-300 hover:bg-[var(--color-bg-subtle)]"
          >
            <span className="mr-2 font-mono text-xs text-[var(--color-text-muted)]">
              {String.fromCharCode(65 + i)}.
            </span>
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

function advanceQuestion(s: SessionState, answer: number | null): SessionState {
  const q = s.questions[s.current];
  const isCorrect = answer !== null && answer === q.correct;
  const newStreak = isCorrect ? s.streak + 1 : 0;
  const multiplier = newStreak >= 10 ? 5 : newStreak >= 5 ? 3 : newStreak >= 3 ? 2 : 1;
  const xpGain = isCorrect ? XP_AWARDS.quiz * multiplier : 0;

  const newAnswers = [...s.answers];
  newAnswers[s.current] = answer;

  const isLast = s.current >= s.questions.length - 1;

  if (isCorrect && xpGain > 0) {
    const day = new Date().toISOString().slice(0, 10);
    void awardXPWithToast("quiz", xpGain, `challenge_${day}_${s.current}`);
  }

  if (isLast) {
    void track("quiz_passed", {
      mode: "challenge",
      correct: newAnswers.filter((a, i) => a === s.questions[i].correct).length,
      total: s.questions.length,
    });
  }

  return {
    ...s,
    answers: newAnswers,
    current: isLast ? s.current : s.current + 1,
    timeLeft: isLast ? 0 : TIME_PER_QUESTION,
    streak: newStreak,
    maxStreak: Math.max(s.maxStreak, newStreak),
    xpEarned: s.xpEarned + xpGain,
    finished: isLast,
  };
}

function BracketPicker({ onStart }: { onStart: (b: Bracket) => void }): React.ReactElement {
  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Trophy className="h-6 w-6 text-amber-500" />
        <div>
          <h2 className="text-xl font-semibold">Challenge Mode</h2>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {QUESTION_COUNT} questions, {TIME_PER_QUESTION}s each. Streak bonuses multiply XP.
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {BRACKETS.map((b) => (
          <button
            key={b.value}
            type="button"
            onClick={() => onStart(b.value)}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-4 py-4 text-left transition hover:border-emerald-300 hover:bg-[var(--color-bg-subtle)]"
          >
            <span className="text-sm font-medium text-[var(--color-text-primary)]">{b.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function SessionSummary({
  session,
  bracket,
  onRestart,
}: {
  session: SessionState;
  bracket: Bracket;
  onRestart: () => void;
}): React.ReactElement {
  const correct = session.answers.filter((a, i) => a === session.questions[i].correct).length;
  const total = session.questions.length;
  const pct = Math.round((correct / total) * 100);

  return (
    <div>
      <div className="mb-8 text-center">
        <div className="mb-2 text-4xl font-bold text-[var(--color-text-primary)]">
          {correct}/{total}
        </div>
        <p className="text-lg text-[var(--color-text-secondary)]">{pct}% correct</p>
        <div className="mt-4 flex justify-center gap-6 text-sm text-[var(--color-text-muted)]">
          <span className="flex items-center gap-1">
            <Zap className="h-4 w-4 text-amber-500" />
            Best streak: {session.maxStreak}
          </span>
          <span className="flex items-center gap-1">
            <Trophy className="h-4 w-4 text-emerald-500" />
            {session.xpEarned} XP earned
          </span>
        </div>
      </div>

      {/* Missed questions */}
      <div className="space-y-4">
        {session.questions.map((q, i) => {
          const userAnswer = session.answers[i];
          const isCorrect = userAnswer === q.correct;
          if (isCorrect) return null;
          return (
            <div
              key={q.id}
              className="rounded-xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-900 dark:bg-rose-950/30"
            >
              <p className="mb-2 text-sm font-medium text-[var(--color-text-primary)]">
                {q.question}
              </p>
              <p className="text-xs text-[var(--color-text-secondary)]">
                <span className="flex items-center gap-1">
                  <Check className="h-3 w-3 text-emerald-500" />
                  {q.options[q.correct as number]}
                </span>
              </p>
              {userAnswer !== null && (
                <p className="mt-1 text-xs text-rose-600">
                  <span className="flex items-center gap-1">
                    <X className="h-3 w-3" />
                    Your answer: {q.options[userAnswer]}
                  </span>
                </p>
              )}
              <p className="mt-2 text-xs text-[var(--color-text-muted)]">{q.explanation}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex gap-3">
        <button
          type="button"
          onClick={onRestart}
          className="rounded-lg bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600"
        >
          Play Again
        </button>
        <button
          type="button"
          onClick={() => {
            const b = BRACKETS.find((x) => x.value === bracket);
            if (b) onRestart();
          }}
          className={cn(
            "rounded-lg border border-[var(--color-border)] px-6 py-2.5 text-sm font-medium",
            "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]"
          )}
        >
          Change Difficulty
        </button>
      </div>
    </div>
  );
}
