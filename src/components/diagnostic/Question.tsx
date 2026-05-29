"use client";

import { useMemo, useState } from "react";
import { evaluate, renderChoices } from "@/lib/diagnostic/feedback";
import { MISCONCEPTIONS } from "@/lib/diagnostic/misconceptions";
import type { ConfidenceLevel, EvaluationResult, MCQQuestion } from "@/lib/diagnostic/types";
import { Confidence } from "./Confidence";
import { Feedback } from "./Feedback";

interface QuestionProps {
  question: MCQQuestion;
  onResolved?: (result: EvaluationResult) => void;
}

export function Question({ question, onResolved }: QuestionProps): React.ReactElement {
  const choices = useMemo(() => renderChoices(question), [question]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [confidence, setConfidence] = useState<ConfidenceLevel | undefined>(undefined);
  const [result, setResult] = useState<EvaluationResult | null>(null);

  const needsConfidence = question.confidenceCheck === true;
  const canSubmit =
    selectedIndex !== null && (!needsConfidence || confidence !== undefined) && result === null;

  function submit(): void {
    if (selectedIndex === null) return;
    const next = evaluate(
      question,
      { kind: "mcq", choiceIndex: selectedIndex, confidence },
      MISCONCEPTIONS
    );
    setResult(next);
    onResolved?.(next);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium tracking-wide text-[var(--color-text-muted)] uppercase">
          {question.difficulty} · {question.tags?.join(" · ")}
        </span>
        <p className="text-lg leading-relaxed text-[var(--color-text-primary)]">
          {question.prompt}
        </p>
      </div>

      <ul className="flex flex-col gap-2">
        {choices.map((choice, i) => {
          const isSelected = selectedIndex === i;
          const isResolved = result !== null;
          const isCorrectChoice = choice.correct;
          const stateClass = isResolved
            ? isCorrectChoice
              ? "border-[var(--color-accent-emerald)] bg-[var(--color-accent-emerald)]/10"
              : isSelected
                ? "border-[var(--color-rating-again)] bg-[var(--color-rating-again)]/10"
                : "border-[var(--color-border)] bg-[var(--color-bg-surface)] opacity-60"
            : isSelected
              ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10"
              : "border-[var(--color-border)] bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-surface-hover)]";

          return (
            <li key={`${question.id}-${i}`}>
              <button
                type="button"
                onClick={() => !isResolved && setSelectedIndex(i)}
                disabled={isResolved}
                aria-pressed={isSelected}
                className={`flex w-full items-start gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors ${stateClass}`}
              >
                <span className="mt-0.5 font-mono text-xs text-[var(--color-text-muted)]">
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="flex-1 text-[var(--color-text-primary)]">{choice.text}</span>
              </button>
            </li>
          );
        })}
      </ul>

      {needsConfidence && result === null && (
        <Confidence value={confidence} onChange={setConfidence} />
      )}

      {result === null && (
        <button
          type="button"
          onClick={submit}
          disabled={!canSubmit}
          className="self-start rounded-lg bg-[var(--color-accent)] px-5 py-2.5 text-sm font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
        >
          Submit
        </button>
      )}

      {result !== null && <Feedback result={result} />}
    </div>
  );
}
