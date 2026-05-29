"use client";

import { useState } from "react";
import { ALL_EXAMPLES } from "@/lib/diagnostic/examples";
import type { EvaluationResult } from "@/lib/diagnostic/types";
import { Question } from "./Question";

export function DiagnosticDemo(): React.ReactElement {
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<(EvaluationResult | null)[]>(() =>
    ALL_EXAMPLES.map(() => null)
  );

  const current = ALL_EXAMPLES[index];

  function recordResult(next: EvaluationResult): void {
    setResults((prev) => {
      const copy = [...prev];
      copy[index] = next;
      return copy;
    });
  }

  function goNext(): void {
    setIndex((i) => Math.min(i + 1, ALL_EXAMPLES.length - 1));
  }

  function reset(): void {
    setIndex(0);
    setResults(ALL_EXAMPLES.map(() => null));
  }

  const isLast = index === ALL_EXAMPLES.length - 1;
  const hasAnswered = results[index] !== null;

  return (
    <section className="flex flex-col gap-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6">
      <nav className="flex items-center justify-between gap-3 border-b border-[var(--color-border)] pb-3">
        <ol className="flex items-center gap-2">
          {ALL_EXAMPLES.map((q, i) => {
            const status = results[i];
            const isActive = i === index;
            const dotColor =
              status === null
                ? "var(--color-border)"
                : status.correct
                  ? "var(--color-rating-good)"
                  : "var(--color-rating-again)";
            return (
              <li key={q.id}>
                <button
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-pressed={isActive}
                  className="flex items-center gap-2 rounded-lg px-2 py-1 text-xs font-medium transition-colors"
                  style={{
                    color: isActive ? "var(--color-text-primary)" : "var(--color-text-muted)",
                    backgroundColor: isActive ? "var(--color-bg-surface-hover)" : "transparent",
                  }}
                >
                  <span
                    aria-hidden
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ backgroundColor: dotColor }}
                  />
                  Question {i + 1}
                </button>
              </li>
            );
          })}
        </ol>
        <button
          type="button"
          onClick={reset}
          className="text-xs font-medium text-[var(--color-text-muted)] underline underline-offset-2 hover:text-[var(--color-text-primary)]"
        >
          Reset
        </button>
      </nav>

      <Question key={current.id} question={current} onResolved={recordResult} />

      {hasAnswered && !isLast && (
        <button
          type="button"
          onClick={goNext}
          className="self-end rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-4 py-2 text-sm font-medium text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-bg-surface-hover)]"
        >
          Next question →
        </button>
      )}
    </section>
  );
}
