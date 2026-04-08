"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { useProgressStore } from "@/stores/progress";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation?: string;
}

interface QuizProps {
  questions: QuizQuestion[];
  passingScore?: number;
}

/**
 * Base quiz: multiple-choice questions, one at a time, with explanations
 * after every answer. Phase B (B3) adds multi-type questions, summary
 * screen, and "add missed terms to flashcards".
 */
export function Quiz({ questions, passingScore = 0.8 }: QuizProps): React.ReactElement {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const passQuiz = useProgressStore((s) => s.passQuiz);

  const question = questions[index];
  const total = questions.length;
  const answered = selected !== null;
  const correct = answered && selected === question.correct;

  const submit = (i: number) => {
    if (answered) return;
    setSelected(i);
    if (i === question.correct) setScore((s) => s + 1);
    void track("quiz_attempted", {
      type: "multiple-choice",
      index,
      correct: i === question.correct,
    });
  };

  const next = () => {
    if (index + 1 < total) {
      setIndex((i) => i + 1);
      setSelected(null);
    } else {
      setDone(true);
      const finalScore = (score + (correct ? 0 : 0)) / total;
      const passed = score / total >= passingScore;
      if (passed) {
        passQuiz();
        void track("quiz_passed", { score: finalScore });
      }
    }
  };

  if (done) {
    const passed = score / total >= passingScore;
    return (
      <section className="my-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 text-center">
        <h3 className="text-xl font-semibold text-[var(--color-text-primary)]">
          {passed ? "Nice work" : "Almost there"}
        </h3>
        <p className="mt-2 text-[var(--color-text-secondary)]">
          {score} / {total} correct
        </p>
      </section>
    );
  }

  return (
    <section className="my-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6">
      <p className="mb-3 font-mono text-xs text-[var(--color-text-muted)]">
        Question {index + 1} of {total}
      </p>
      <h3 className="mb-4 text-lg font-semibold text-[var(--color-text-primary)]">
        {question.question}
      </h3>
      <div className="flex flex-col gap-2">
        {question.options.map((option, i) => {
          const isSelected = selected === i;
          const isAnswer = i === question.correct;
          const state = !answered
            ? "idle"
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
              onClick={() => submit(i)}
              disabled={answered}
              className={cn(
                "flex items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition",
                state === "idle" &&
                  "border-[var(--color-border)] bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-subtle)]",
                state === "correct" && "border-emerald-500 bg-emerald-50 text-emerald-900",
                state === "answer" && "border-emerald-300 bg-emerald-50/60 text-emerald-900",
                state === "wrong" && "border-rose-500 bg-rose-50 text-rose-900"
              )}
            >
              {state === "correct" || state === "answer" ? (
                <Check className="h-4 w-4 text-emerald-600" aria-hidden />
              ) : state === "wrong" ? (
                <X className="h-4 w-4 text-rose-600" aria-hidden />
              ) : (
                <span className="h-4 w-4" />
              )}
              {option}
            </button>
          );
        })}
      </div>
      {answered && question.explanation && (
        <p className="mt-4 rounded-lg bg-[var(--color-bg-subtle)] p-3 text-sm text-[var(--color-text-secondary)]">
          {question.explanation}
        </p>
      )}
      {answered && (
        <button
          type="button"
          onClick={next}
          className="mt-4 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600"
        >
          {index + 1 === total ? "Finish" : "Next question"}
        </button>
      )}
    </section>
  );
}
