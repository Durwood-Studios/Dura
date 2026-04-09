"use client";

import { useEffect, useMemo, useState } from "react";
import { Lock, Trophy, Clock, RotateCcw } from "lucide-react";
import { QuestionDisplay } from "@/components/verify/QuestionDisplay";
import {
  selectMasteryQuestions,
  scoreAssessment,
  canRetakeAssessment,
  ASSESSMENT_PASSING_SCORE,
} from "@/lib/assessment";
import { putResult, getLatestResult } from "@/lib/db/assessments";
import { awardXPWithToast } from "@/lib/xp-manager";
import { XP_AWARDS } from "@/lib/xp";
import { extendStreak } from "@/lib/streak-manager";
import { track } from "@/lib/analytics";
import { generateId, formatTime, cn } from "@/lib/utils";
import type { AssessmentQuestion, AssessmentResult, QuestionResult } from "@/types/assessment";

interface MasteryGateProps {
  moduleId: string;
  moduleTitle: string;
  questionPool: AssessmentQuestion[];
  questionCount?: number;
}

type GateStatus = "loading" | "locked" | "in-progress" | "results" | "passed" | "cooldown";

export function MasteryGate({
  moduleId,
  moduleTitle,
  questionPool,
  questionCount = 12,
}: MasteryGateProps): React.ReactElement {
  const [status, setStatus] = useState<GateStatus>("loading");
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, number[]>>(new Map());
  const [submitted, setSubmitted] = useState(false);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [latestResult, setLatestResult] = useState<AssessmentResult | null>(null);
  const [resultRecord, setResultRecord] = useState<{
    score: number;
    correctCount: number;
    results: QuestionResult[];
  } | null>(null);
  const [retryAt, setRetryAt] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());

  // Tick for cooldown countdown
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Load latest attempt on mount
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const latest = await getLatestResult(moduleId, "mastery-gate");
      if (cancelled) return;
      setLatestResult(latest);
      if (latest?.passed) {
        setStatus("passed");
      } else if (latest) {
        const cooldown = canRetakeAssessment(latest.completedAt);
        if (cooldown.canRetake) {
          setStatus("locked");
        } else {
          setStatus("cooldown");
          setRetryAt(cooldown.retryAt);
        }
      } else {
        setStatus("locked");
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [moduleId]);

  const startAssessment = () => {
    const picked = selectMasteryQuestions(moduleId, questionPool, questionCount);
    if (picked.length === 0) {
      console.error("[mastery-gate] no questions available for module", moduleId);
      return;
    }
    setQuestions(picked);
    setAnswers(new Map());
    setIndex(0);
    setSubmitted(false);
    setStartedAt(Date.now());
    setStatus("in-progress");
    void track("verification_started", { type: "mastery-gate", targetId: moduleId });
  };

  const current = questions[index];
  const isMulti = current?.type === "multiple-select";
  const selected = current ? (answers.get(current.id) ?? []) : [];

  const toggleOption = (i: number) => {
    if (submitted || !current) return;
    setAnswers((prev) => {
      const next = new Map(prev);
      const existing = next.get(current.id) ?? [];
      if (isMulti) {
        next.set(
          current.id,
          existing.includes(i) ? existing.filter((x) => x !== i) : [...existing, i]
        );
      } else {
        next.set(current.id, [i]);
      }
      return next;
    });
  };

  const submit = () => {
    if (selected.length === 0) return;
    setSubmitted(true);
  };

  const next = () => {
    if (index + 1 < questions.length) {
      setIndex((i) => i + 1);
      setSubmitted(false);
    } else {
      void finish();
    }
  };

  const finish = async () => {
    const answerMap = new Map<string, number | number[] | null>();
    for (const q of questions) {
      const a = answers.get(q.id);
      if (!a || a.length === 0) {
        answerMap.set(q.id, null);
      } else if (q.type === "multiple-select") {
        answerMap.set(q.id, a);
      } else {
        answerMap.set(q.id, a[0]);
      }
    }
    const scored = scoreAssessment(questions, answerMap);
    const passed = scored.score >= ASSESSMENT_PASSING_SCORE;
    const completedAt = Date.now();
    const record: AssessmentResult = {
      id: generateId("ar"),
      type: "mastery-gate",
      targetId: moduleId,
      score: scored.score,
      totalQuestions: questions.length,
      correctCount: scored.correctCount,
      passed,
      startedAt: startedAt ?? completedAt,
      completedAt,
      timeSpentMs: startedAt ? completedAt - startedAt : 0,
      questionResults: scored.results,
    };
    await putResult(record);
    void extendStreak();
    setLatestResult(record);
    setResultRecord(scored);
    setStatus("results");
    if (passed) {
      void track("verification_passed", {
        type: "mastery-gate",
        targetId: moduleId,
        score: scored.score,
      });
      void awardXPWithToast("mastery-gate", XP_AWARDS.moduleComplete, moduleId);
    }
  };

  const closeResults = () => {
    if (latestResult?.passed) {
      setStatus("passed");
    } else if (latestResult) {
      const cooldown = canRetakeAssessment(latestResult.completedAt);
      if (!cooldown.canRetake) {
        setStatus("cooldown");
        setRetryAt(cooldown.retryAt);
      } else {
        setStatus("locked");
      }
    }
  };

  const cooldownRemaining = useMemo(() => {
    if (!retryAt) return "";
    const ms = Math.max(0, retryAt - now);
    return formatTime(ms);
  }, [retryAt, now]);

  // ── Render ───────────────────────────────────────────────────────────────

  if (status === "loading") {
    return (
      <section className="my-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6">
        <p className="text-sm text-[var(--color-text-muted)]">Loading mastery gate…</p>
      </section>
    );
  }

  if (status === "locked") {
    return (
      <section className="my-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6">
        <div className="flex items-start gap-3">
          <Lock className="mt-1 h-5 w-5 text-[var(--color-text-muted)]" aria-hidden />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
              Module Assessment
            </h3>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              {questionCount} questions · 80% to pass · 24h cooldown on a miss
            </p>
            <button
              type="button"
              onClick={startAssessment}
              className="mt-4 rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600"
            >
              Start assessment
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (status === "cooldown") {
    return (
      <section className="my-8 rounded-2xl border border-amber-200 bg-amber-50/40 p-6">
        <div className="flex items-start gap-3">
          <Clock className="mt-1 h-5 w-5 text-amber-600" aria-hidden />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
              Cooldown active
            </h3>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              You can retake this assessment in{" "}
              <span className="font-mono">{cooldownRemaining}</span>.
            </p>
            {latestResult && (
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                Last attempt: {latestResult.correctCount}/{latestResult.totalQuestions} ·{" "}
                {Math.round(latestResult.score * 100)}%
              </p>
            )}
          </div>
        </div>
      </section>
    );
  }

  if (status === "passed") {
    return (
      <section className="my-8 rounded-2xl border border-emerald-200 bg-[var(--color-bg-accent)] p-6">
        <div className="flex items-start gap-3">
          <Trophy className="mt-1 h-5 w-5 text-emerald-600" aria-hidden />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
              Module Unlocked
            </h3>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              Passed {latestResult && new Date(latestResult.completedAt).toLocaleDateString()} ·{" "}
              Score: {latestResult ? Math.round(latestResult.score * 100) : 0}%
            </p>
            <button
              type="button"
              onClick={startAssessment}
              className="mt-3 inline-flex items-center gap-1 rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] transition hover:bg-[var(--color-bg-subtle)]"
            >
              <RotateCcw className="h-3 w-3" />
              Retake for practice
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (status === "in-progress" && current) {
    const elapsed = startedAt ? now - startedAt : 0;
    const percent = Math.round((index / questions.length) * 100);
    return (
      <section className="my-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6">
        <header className="mb-4">
          <div className="mb-2 flex items-center justify-between text-xs text-[var(--color-text-muted)]">
            <span className="font-mono">
              Question {index + 1} of {questions.length}
            </span>
            <span className="font-mono">{formatTime(elapsed)}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-[var(--color-bg-subtle)]">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${percent}%` }}
            />
          </div>
        </header>
        <p className="mb-3 text-xs tracking-wide text-[var(--color-text-muted)] uppercase">
          {moduleTitle} Assessment
        </p>
        <QuestionDisplay
          question={current}
          selected={selected}
          submitted={submitted}
          onToggle={toggleOption}
        />
        <div className="mt-4">
          {!submitted ? (
            <button
              type="button"
              onClick={submit}
              disabled={selected.length === 0}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-semibold transition",
                selected.length > 0
                  ? "bg-emerald-500 text-white hover:bg-emerald-600"
                  : "cursor-not-allowed bg-[var(--color-bg-subtle)] text-[var(--color-text-muted)]"
              )}
            >
              Submit
            </button>
          ) : (
            <button
              type="button"
              onClick={next}
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600"
            >
              {index + 1 === questions.length ? "Finish" : "Next question"}
            </button>
          )}
        </div>
      </section>
    );
  }

  if (status === "results" && resultRecord) {
    const passed = resultRecord.score >= ASSESSMENT_PASSING_SCORE;
    return (
      <section
        className={cn(
          "my-8 rounded-2xl border p-6",
          passed
            ? "border-emerald-200 bg-[var(--color-bg-accent)]"
            : "border-rose-200 bg-rose-50/40"
        )}
      >
        <h3 className="text-2xl font-semibold text-[var(--color-text-primary)]">
          {passed ? "Module Unlocked 🏆" : "Almost there"}
        </h3>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          {resultRecord.correctCount}/{questions.length} correct ·{" "}
          {Math.round(resultRecord.score * 100)}%
        </p>
        {!passed && (
          <p className="mt-2 text-sm text-rose-700">
            You need 80% to advance. Try again in 24 hours.
          </p>
        )}
        <button
          type="button"
          onClick={closeResults}
          className="mt-4 rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] transition hover:bg-[var(--color-bg-subtle)]"
        >
          Done
        </button>
      </section>
    );
  }

  return <></>;
}
