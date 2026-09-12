"use client";

import { useState } from "react";
import Link from "next/link";
import { PHASES } from "@/content/phases";
import {
  ASSESSMENT_START_RESPONSE_SCHEMA,
  ASSESSMENT_SUBMISSION_RESPONSE_SCHEMA,
} from "@/lib/verify/assessment-contract";
import { saveVerification } from "@/lib/verify/persistence";
import type { AssessmentStart, AssessmentSubmission } from "@/lib/verify/assessment-contract";
import type { Certificate, AssessmentResult } from "@/types/assessment";

const CONTROL =
  "min-h-12 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-4 py-3 text-base text-[var(--color-text-primary)] focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]";
const BUTTON =
  "min-h-12 rounded-lg bg-[var(--color-accent)] px-5 py-3 font-semibold text-white focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] disabled:opacity-50";

async function requestAssessment(path: string, body: unknown): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout((): void => controller.abort(), 15000);
  try {
    const response = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const data: unknown = await response.json();
    if (!response.ok)
      throw new Error(
        typeof data === "object" &&
          data !== null &&
          "error" in data &&
          typeof data.error === "string"
          ? data.error
          : "The assessment could not be processed."
      );
    return data;
  } catch (error: unknown) {
    console.error("[assessment] Request failed", error);
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

/** Optional online practice with server scoring; offline lesson assessments remain independent. */
export function ServerAssessment(): React.ReactElement {
  const [phaseId, setPhaseId] = useState("0");
  const [displayName, setDisplayName] = useState("");
  const [attempt, setAttempt] = useState<AssessmentStart | null>(null);
  const [answers, setAnswers] = useState<Record<string, number[]>>({});
  const [result, setResult] = useState<AssessmentSubmission | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const start = async (): Promise<void> => {
    setIsBusy(true);
    setError(null);
    setResult(null);
    setIsSaved(false);
    try {
      const data = await requestAssessment("/api/verify/assessment/start", {
        phaseId,
        displayName,
      });
      setAttempt(ASSESSMENT_START_RESPONSE_SCHEMA.parse(data));
      setAnswers({});
    } catch (cause: unknown) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not start. Connect to the internet and try again."
      );
    } finally {
      setIsBusy(false);
    }
  };
  const save = async (outcome: AssessmentSubmission): Promise<void> => {
    if (!outcome.credential || !outcome.claims) return;
    const claims = outcome.claims;
    const certificate: Certificate = {
      id: `issued_${claims.id}`,
      phaseId: claims.phaseId,
      userId: null,
      displayName: claims.selfReportedName,
      phaseTitle: claims.phaseTitle,
      score: claims.score,
      totalQuestions: claims.totalQuestions,
      completedAt: claims.attemptStartedAt,
      verificationHash: claims.id,
      standards: [],
      serverCredential: outcome.credential,
    };
    const record: AssessmentResult = {
      id: `issued_result_${claims.id}`,
      type: "phase-verification",
      targetId: claims.phaseId,
      score: claims.score,
      totalQuestions: claims.totalQuestions,
      correctCount: claims.correctCount,
      passed: true,
      startedAt: claims.attemptStartedAt,
      completedAt: claims.attemptStartedAt,
      timeSpentMs: 0,
      questionResults: [],
    };
    try {
      await saveVerification(record, certificate);
      setIsSaved(true);
    } catch (cause: unknown) {
      console.error("[assessment] Local copy failed", cause);
      setError(
        "Your signed result is ready, but this device could not save it. Open and bookmark the verification link, or try saving again."
      );
    }
  };
  const submit = async (): Promise<void> => {
    if (!attempt || isBusy) return;
    setIsBusy(true);
    setError(null);
    try {
      const data = await requestAssessment("/api/verify/assessment/submit", {
        attempt: attempt.attempt,
        answers: attempt.questions.map((q) => ({
          questionId: q.id,
          selected: answers[q.id] ?? [],
        })),
      });
      const outcome = ASSESSMENT_SUBMISSION_RESPONSE_SCHEMA.parse(data);
      setResult(outcome);
      await save(outcome);
    } catch (cause: unknown) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Your answers could not be submitted. They remain on this page; reconnect and retry."
      );
    } finally {
      setIsBusy(false);
    }
  };
  return (
    <section>
      <h1 className="text-3xl font-semibold text-[var(--color-text-primary)]">
        Server-scored assessment
      </h1>
      <p className="mt-3 text-base text-[var(--color-text-secondary)]">
        Take an online practice assessment and receive a signed result after scoring at least 80%.
        Questions are scored by the server, with exact matches required for multiple selections.
      </p>
      <p className="mt-3 text-base text-[var(--color-text-secondary)]">
        This is unproctored with unlimited practice. Your name is self-reported. A signed result
        confirms submitted answers, not identity, independent knowledge, or accreditation. Shared
        links include your name and score.
      </p>
      {error && (
        <p role="alert" className="mt-4 text-base text-[var(--color-error)]">
          {error}
        </p>
      )}
      {!attempt ? (
        <form
          className="mt-6 flex flex-col gap-4"
          onSubmit={(event): void => {
            event.preventDefault();
            void start();
          }}
        >
          <label className="flex flex-col gap-2 text-base">
            Phase
            <select
              className={CONTROL}
              value={phaseId}
              onChange={(event): void => setPhaseId(event.target.value)}
              disabled={isBusy}
            >
              {PHASES.map((phase) => (
                <option key={phase.id} value={phase.id}>
                  {phase.title}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2 text-base">
            Self-reported name
            <input
              className={CONTROL}
              value={displayName}
              maxLength={80}
              required
              onChange={(event): void => setDisplayName(event.target.value)}
              disabled={isBusy}
            />
          </label>
          <button className={BUTTON} disabled={isBusy || !displayName.trim()}>
            {isBusy ? "Starting…" : "Start online assessment"}
          </button>
        </form>
      ) : result ? (
        <div className="mt-6 rounded-2xl border border-[var(--color-border)] p-6">
          <h2 className="text-2xl font-semibold">
            {result.passed ? "Passing score recorded" : "Keep practicing"}
          </h2>
          <p className="mt-3 text-base">
            {result.correctCount} of {result.totalQuestions} correct ·{" "}
            {Math.round(result.score * 100)}%
          </p>
          {result.credential && (
            <>
              <Link
                className="mt-4 inline-flex min-h-12 items-center text-[var(--color-accent)] underline"
                href={`/verify/issued?credential=${encodeURIComponent(result.credential)}`}
              >
                Open signed verification link
              </Link>
              <p role="status" className="text-sm text-[var(--color-text-secondary)]">
                {isSaved
                  ? "Saved on this device in your certificates."
                  : "Keep this link to preserve your signed result."}
              </p>
              {!isSaved && (
                <button
                  type="button"
                  className={`${BUTTON} mt-3`}
                  onClick={(): void => {
                    void save(result);
                  }}
                >
                  Try saving again
                </button>
              )}
            </>
          )}
          <button
            type="button"
            className={`${CONTROL} mt-4 block`}
            onClick={(): void => {
              setAttempt(null);
              setResult(null);
              setError(null);
            }}
          >
            Start another assessment
          </button>
        </div>
      ) : (
        <form
          className="mt-6 flex flex-col gap-6"
          onSubmit={(event): void => {
            event.preventDefault();
            void submit();
          }}
        >
          <p className="text-sm text-[var(--color-text-secondary)]">
            Submit within one hour. Unanswered questions count as incorrect. If a request fails,
            your answers stay here while you retry.
          </p>
          {attempt.questions.map((question, index) => (
            <fieldset
              key={question.id}
              className="rounded-xl border border-[var(--color-border)] p-4"
              disabled={isBusy}
            >
              <legend className="px-2 text-base font-medium">
                {index + 1}. {question.question}
              </legend>
              {question.isMultiple && (
                <p className="mb-2 text-sm text-[var(--color-text-secondary)]">
                  Select all correct answers.
                </p>
              )}
              {question.options.map((option, optionIndex) => (
                <label
                  key={optionIndex}
                  className="flex min-h-12 cursor-pointer items-center gap-3 py-2 text-base"
                >
                  <input
                    type={question.isMultiple ? "checkbox" : "radio"}
                    name={question.id}
                    checked={(answers[question.id] ?? []).includes(optionIndex)}
                    onChange={(): void =>
                      setAnswers((previous) => {
                        const selected = previous[question.id] ?? [];
                        return {
                          ...previous,
                          [question.id]: question.isMultiple
                            ? selected.includes(optionIndex)
                              ? selected.filter((i) => i !== optionIndex)
                              : [...selected, optionIndex]
                            : [optionIndex],
                        };
                      })
                    }
                  />
                  {option}
                </label>
              ))}
            </fieldset>
          ))}
          <button className={BUTTON} disabled={isBusy}>
            {isBusy ? "Submitting…" : "Submit for server scoring"}
          </button>
          <button
            type="button"
            className={CONTROL}
            disabled={isBusy}
            onClick={(): void => {
              setAttempt(null);
              setError(null);
            }}
          >
            Discard attempt and start over
          </button>
        </form>
      )}
      <Link
        href="/verify"
        className="mt-6 inline-flex min-h-12 items-center text-[var(--color-accent)] underline"
      >
        Local learning certificates
      </Link>
    </section>
  );
}
