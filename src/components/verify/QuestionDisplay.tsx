"use client";

import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AssessmentQuestion } from "@/types/assessment";

interface QuestionDisplayProps {
  question: AssessmentQuestion;
  selected: number[];
  submitted: boolean;
  onToggle: (index: number) => void;
}

function correctAsArray(correct: number | number[]): number[] {
  return Array.isArray(correct) ? correct : [correct];
}

/**
 * Shared question renderer for mastery gates and phase tests.
 * Stateless — parent owns selected answers and submission state.
 */
export function QuestionDisplay({
  question,
  selected,
  submitted,
  onToggle,
}: QuestionDisplayProps): React.ReactElement {
  const isMulti = question.type === "multiple-select";
  const correctOptions = correctAsArray(question.correct);

  return (
    <div>
      <h3 className="mb-1 text-lg font-semibold text-[var(--color-text-primary)]">
        {question.question.split("\n").map((line, i) => (
          <span key={i} className="block">
            {line}
          </span>
        ))}
      </h3>
      {isMulti && (
        <p className="mb-3 text-xs text-[var(--color-text-muted)]">Select all that apply.</p>
      )}
      <div className="mt-3 flex flex-col gap-2">
        {question.options.map((option, i) => {
          const isSelected = selected.includes(i);
          const isAnswer = correctOptions.includes(i);
          const state = !submitted
            ? isSelected
              ? "selected"
              : "idle"
            : isSelected && isAnswer
              ? "correct"
              : isSelected
                ? "wrong"
                : isAnswer
                  ? "answer"
                  : "idle";
          return (
            <button
              key={i}
              type="button"
              onClick={() => onToggle(i)}
              disabled={submitted}
              className={cn(
                "flex items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition",
                state === "idle" &&
                  "border-[var(--color-border)] bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-subtle)]",
                state === "selected" && "border-emerald-400 bg-emerald-50/50",
                state === "correct" && "border-emerald-500 bg-emerald-50 text-emerald-900",
                state === "answer" && "border-emerald-300 bg-emerald-50/60 text-emerald-900",
                state === "wrong" && "border-rose-500 bg-rose-50 text-rose-900"
              )}
            >
              <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                {state === "correct" || state === "answer" ? (
                  <Check className="h-4 w-4 text-emerald-600" aria-hidden />
                ) : state === "wrong" ? (
                  <X className="h-4 w-4 text-rose-600" aria-hidden />
                ) : isMulti ? (
                  <span
                    className={cn(
                      "h-3.5 w-3.5 rounded border",
                      isSelected
                        ? "border-emerald-500 bg-emerald-500"
                        : "border-[var(--color-border)]"
                    )}
                  />
                ) : (
                  <span
                    className={cn(
                      "h-3.5 w-3.5 rounded-full border",
                      isSelected
                        ? "border-emerald-500 bg-emerald-500"
                        : "border-[var(--color-border)]"
                    )}
                  />
                )}
              </span>
              {option}
            </button>
          );
        })}
      </div>
      {submitted && question.explanation && (
        <p className="mt-4 rounded-lg bg-[var(--color-bg-subtle)] p-3 text-sm text-[var(--color-text-secondary)]">
          {question.explanation}
        </p>
      )}
    </div>
  );
}
