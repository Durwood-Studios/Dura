"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Award, Clock, ShieldCheck } from "lucide-react";
import { QuestionDisplay } from "@/components/verify/QuestionDisplay";
import {
  selectVerificationQuestions,
  scoreAssessment,
  canRetakeAssessment,
  ASSESSMENT_PASSING_SCORE,
} from "@/lib/assessment";
import { putResult, getLatestResult } from "@/lib/db/assessments";
import { putCertificate, getCertificatesByPhase } from "@/lib/db/certificates";
import { generateVerificationHash } from "@/lib/crypto";
import { track } from "@/lib/analytics";
import { generateId, formatTime, cn } from "@/lib/utils";
import { Confetti } from "@/components/motion/Confetti";
import type {
  AssessmentQuestion,
  AssessmentResult,
  Certificate,
  QuestionResult,
} from "@/types/assessment";

const TIME_LIMIT_MS = 60 * 60 * 1000;
const VERIFICATION_QUESTION_COUNT = 30;

interface PhaseTestProps {
  phaseId: string;
  phaseTitle: string;
  questionPool: AssessmentQuestion[];
}

type Status = "loading" | "intro" | "in-progress" | "results" | "verified" | "cooldown";

export function PhaseTest({
  phaseId,
  phaseTitle,
  questionPool,
}: PhaseTestProps): React.ReactElement {
  const [status, setStatus] = useState<Status>("loading");
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, number[]>>(new Map());
  const [submitted, setSubmitted] = useState(false);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [, setLatestResult] = useState<AssessmentResult | null>(null);
  const [resultRecord, setResultRecord] = useState<{
    score: number;
    correctCount: number;
    results: QuestionResult[];
  } | null>(null);
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [retryAt, setRetryAt] = useState<number | null>(null);

  // Tick for timer
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Hydrate latest attempt + existing certificate
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const latest = await getLatestResult(phaseId, "phase-verification");
      const certs = await getCertificatesByPhase(phaseId);
      if (cancelled) return;
      setLatestResult(latest);
      const existingCert = certs[0] ?? null;
      setCertificate(existingCert);
      if (existingCert) {
        setStatus("verified");
      } else if (latest && !latest.passed) {
        const cd = canRetakeAssessment(latest.completedAt);
        if (cd.canRetake) {
          setStatus("intro");
        } else {
          setStatus("cooldown");
          setRetryAt(cd.retryAt);
        }
      } else {
        setStatus("intro");
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [phaseId]);

  const startTest = () => {
    const picked = selectVerificationQuestions(phaseId, questionPool, VERIFICATION_QUESTION_COUNT);
    if (picked.length === 0) return;
    setQuestions(picked);
    setAnswers(new Map());
    setIndex(0);
    setSubmitted(false);
    setStartedAt(Date.now());
    setStatus("in-progress");
    void track("verification_started", { type: "phase-verification", targetId: phaseId });
  };

  const current = questions[index];
  const isMulti = current?.type === "multiple-select";
  const selected = current ? (answers.get(current.id) ?? []) : [];

  const elapsed = startedAt ? now - startedAt : 0;
  const remaining = Math.max(0, TIME_LIMIT_MS - elapsed);
  const timeUp = startedAt !== null && remaining <= 0;

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
      type: "phase-verification",
      targetId: phaseId,
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
    setLatestResult(record);
    setResultRecord(scored);

    if (passed) {
      const standards = Array.from(
        new Set(questions.flatMap((q) => q.standards?.cs2023 ?? []).filter(Boolean))
      );
      const certBase: Omit<Certificate, "id" | "verificationHash"> = {
        phaseId,
        userId: null,
        displayName: "Anonymous Learner",
        phaseTitle,
        score: scored.score,
        totalQuestions: questions.length,
        completedAt,
        standards,
      };
      const verificationHash = await generateVerificationHash(certBase);
      const cert: Certificate = {
        ...certBase,
        id: generateId("cert"),
        verificationHash,
      };
      await putCertificate(cert);
      setCertificate(cert);
      void track("verification_passed", {
        type: "phase-verification",
        targetId: phaseId,
        score: scored.score,
      });
    }
    setStatus("results");
  };

  // Auto-submit on time up
  useEffect(() => {
    if (status === "in-progress" && timeUp) {
      void finish();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, timeUp]);

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

  const nextQuestion = () => {
    if (index + 1 < questions.length) {
      setIndex((i) => i + 1);
      setSubmitted(false);
    } else {
      void finish();
    }
  };

  const cooldownRemaining = useMemo(() => {
    if (!retryAt) return "";
    return formatTime(Math.max(0, retryAt - now));
  }, [retryAt, now]);

  // ── Render ───────────────────────────────────────────────────────────────

  if (status === "loading") {
    return (
      <section className="my-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6">
        <p className="text-sm text-[var(--color-text-muted)]">Loading verification…</p>
      </section>
    );
  }

  if (status === "verified" && certificate) {
    return (
      <section className="my-8 rounded-2xl border border-emerald-200 bg-[var(--color-bg-accent)] p-6">
        <div className="flex items-start gap-3">
          <Award className="mt-1 h-6 w-6 text-emerald-600" aria-hidden />
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-[var(--color-text-primary)]">
              {phaseTitle} — Verified
            </h3>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              Score: {Math.round(certificate.score * 100)}% ·{" "}
              {new Date(certificate.completedAt).toLocaleDateString()}
            </p>
            <Link
              href={`/verify/${certificate.verificationHash}`}
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600"
            >
              View certificate
            </Link>
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
              You can retake the verification test in{" "}
              <span className="font-mono">{cooldownRemaining}</span>.
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (status === "intro") {
    return (
      <section className="my-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-1 h-6 w-6 text-emerald-600" aria-hidden />
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-[var(--color-text-primary)]">
              Phase Verification Test
            </h3>
            <p className="mt-1 text-[var(--color-text-secondary)]">{phaseTitle}</p>
            <ul className="mt-3 flex flex-col gap-1 text-sm text-[var(--color-text-secondary)]">
              <li>· {VERIFICATION_QUESTION_COUNT} questions across all modules</li>
              <li>· 60-minute time limit</li>
              <li>· 80% to pass</li>
              <li>· Passing generates a verifiable certificate</li>
            </ul>
            <button
              type="button"
              onClick={startTest}
              className="mt-4 rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600"
            >
              Start verification
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (status === "in-progress" && current) {
    const percent = Math.round((index / questions.length) * 100);
    const remainingMin = Math.floor(remaining / 60_000);
    const remainingSec = Math.floor((remaining % 60_000) / 1000);
    return (
      <section className="my-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6">
        <header className="mb-4">
          <div className="mb-2 flex items-center justify-between text-xs text-[var(--color-text-muted)]">
            <span className="font-mono">
              Question {index + 1} of {questions.length}
            </span>
            <span
              className={cn(
                "rounded px-2 py-0.5 font-mono",
                remaining < 5 * 60_000
                  ? "bg-rose-100 text-rose-700"
                  : "bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)]"
              )}
            >
              {String(remainingMin).padStart(2, "0")}:{String(remainingSec).padStart(2, "0")}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-[var(--color-bg-subtle)]">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${percent}%` }}
            />
          </div>
        </header>
        <p className="mb-3 text-xs tracking-wide text-[var(--color-text-muted)] uppercase">
          {phaseTitle} Verification
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
              onClick={nextQuestion}
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
          "relative my-8 overflow-hidden rounded-2xl border p-6 text-center",
          passed
            ? "border-emerald-200 bg-[var(--color-bg-accent)]"
            : "border-rose-200 bg-rose-50/40"
        )}
      >
        <Confetti active={passed} />
        <h3 className="text-2xl font-semibold text-[var(--color-text-primary)]">
          {passed ? `${phaseTitle} — Verified` : "Not quite there"}
        </h3>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          {resultRecord.correctCount}/{questions.length} correct ·{" "}
          {Math.round(resultRecord.score * 100)}%
        </p>
        {passed && certificate ? (
          <Link
            href={`/verify/${certificate.verificationHash}`}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600"
          >
            View certificate
          </Link>
        ) : (
          <p className="mt-4 text-sm text-rose-700">
            You need 80% to verify this phase. Try again in 24 hours.
          </p>
        )}
      </section>
    );
  }

  return <></>;
}
