"use client";

import type { EvaluationResult, RemediationPointer, ReviewRating } from "@/lib/diagnostic/types";

interface FeedbackProps {
  result: EvaluationResult;
}

const RATING_LABEL: Record<ReviewRating, string> = {
  again: "Again",
  hard: "Hard",
  good: "Good",
  easy: "Easy",
};

const RATING_VAR: Record<ReviewRating, string> = {
  again: "var(--color-rating-again)",
  hard: "var(--color-rating-hard)",
  good: "var(--color-rating-good)",
  easy: "var(--color-rating-easy)",
};

function remediationHref(pointer: RemediationPointer): string {
  if (pointer.kind === "lesson") return pointer.path;
  if (pointer.kind === "drill") return `/drills/${pointer.id}`;
  return pointer.href;
}

export function Feedback({ result }: FeedbackProps): React.ReactElement {
  const verdictColor = result.correct ? "var(--color-accent-emerald)" : "var(--color-rating-again)";

  return (
    <section
      aria-live="polite"
      className="flex flex-col gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5"
    >
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className="inline-flex h-7 items-center rounded-full px-3 text-xs font-semibold text-white"
            style={{ backgroundColor: verdictColor }}
          >
            {result.correct ? "Correct" : "Incorrect"}
          </span>
          {!result.correct && (
            <span className="text-xs text-[var(--color-text-muted)]">
              Answer: <span className="text-[var(--color-text-primary)]">{result.correctText}</span>
            </span>
          )}
        </div>
        <span
          className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium tracking-wide uppercase"
          style={{
            borderColor: RATING_VAR[result.rating],
            color: RATING_VAR[result.rating],
          }}
          title="Next-review schedule signal — fed to the local FSRS scheduler"
        >
          FSRS · {RATING_LABEL[result.rating]}
        </span>
      </header>

      {result.diagnosis && (
        <div className="rounded-lg border border-[var(--color-rating-again)]/30 bg-[var(--color-rating-again)]/5 p-4">
          <p className="mb-1.5 text-xs font-semibold tracking-wide text-[var(--color-rating-again)] uppercase">
            Diagnosis · {result.diagnosis.misconception.name}
          </p>
          <p className="text-sm leading-relaxed text-[var(--color-text-primary)]">
            {result.diagnosis.explanation}
          </p>
          <a
            href={remediationHref(result.diagnosis.misconception.remediation)}
            className="mt-3 inline-block text-xs font-medium text-[var(--color-accent)] underline underline-offset-2"
          >
            Fix this → {result.diagnosis.misconception.remediation.label}
          </a>
        </div>
      )}

      <div>
        <p className="mb-2 text-xs font-semibold tracking-wide text-[var(--color-text-muted)] uppercase">
          Worked solution
        </p>
        <ol className="flex list-decimal flex-col gap-1.5 pl-5 text-sm text-[var(--color-text-secondary)]">
          {result.worked.steps.map((step, i) => (
            <li key={i} className="leading-relaxed">
              {step}
            </li>
          ))}
        </ol>
      </div>

      {result.calibration && (
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-4">
          <p className="mb-1.5 text-xs font-semibold tracking-wide text-[var(--color-text-muted)] uppercase">
            Calibration · {result.calibration.flag}
          </p>
          <p className="text-sm leading-relaxed text-[var(--color-text-primary)]">
            You rated yourself {result.calibration.confidence}/5. {result.calibration.note}
          </p>
        </div>
      )}
    </section>
  );
}
