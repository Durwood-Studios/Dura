"use client";

import { useEffect, useState } from "react";
import { Check, X, Plus } from "lucide-react";
import { useProgressStore } from "@/stores/progress";
import { track } from "@/lib/analytics";
import { createCard } from "@/lib/fsrs";
import { putCard } from "@/lib/db/flashcards";
import type { DictionaryTerm } from "@/types/dictionary";
import { generateId, cn } from "@/lib/utils";
import { XP_AWARDS } from "@/lib/xp";
import { awardXPWithToast } from "@/lib/xp-manager";

export type QuizQuestionType = "multiple-choice" | "multiple-select" | "true-false" | "code-output";

export interface QuizQuestion {
  type?: QuizQuestionType;
  question: string;
  options: string[];
  correct: number | number[];
  explanation?: string;
  /** Optional dictionary term slugs the user can add to their deck if they miss this question. */
  terms?: string[];
}

interface QuizProps {
  /** Array-format: pass an array of questions. */
  questions?: QuizQuestion[];
  /** Single-question format props (used in many Phase 3-9 lessons). */
  question?: string;
  options?: string[];
  answer?: number;
  correct?: number;
  explanation?: string;
  type?: QuizQuestionType;
  terms?: string[];
  passingScore?: number;
}

interface AnswerRecord {
  questionIndex: number;
  selected: number[];
  correct: boolean;
}

function arraysEqual(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  const sa = [...a].sort();
  const sb = [...b].sort();
  return sa.every((v, i) => v === sb[i]);
}

function correctAsArray(correct: number | number[]): number[] {
  return Array.isArray(correct) ? correct : [correct];
}

export function Quiz(props: QuizProps): React.ReactElement {
  const { passingScore = 0.8 } = props;

  // Normalize: support both array format and single-question format
  const safeQuestions: QuizQuestion[] = (() => {
    if (props.questions && props.questions.length > 0) return props.questions;
    if (props.question && props.options) {
      return [
        {
          question: props.question,
          options: props.options,
          correct: props.answer ?? props.correct ?? 0,
          explanation: props.explanation,
          type: props.type,
          terms: props.terms,
        },
      ];
    }
    return [];
  })();
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [history, setHistory] = useState<AnswerRecord[]>([]);
  const [done, setDone] = useState(false);
  const [addedTerms, setAddedTerms] = useState<Set<string>>(new Set());
  const [termCache, setTermCache] = useState<Map<string, DictionaryTerm>>(new Map());
  const passQuiz = useProgressStore((s) => s.passQuiz);
  const setQuizScore = useProgressStore((s) => s.setQuizScore);
  const currentLesson = useProgressStore((s) => s.current);

  // Fetch missed term data lazily when quiz is done
  useEffect(() => {
    if (!done || safeQuestions.length === 0) return;
    const slugs = new Set<string>();
    for (const record of history) {
      if (record.correct) continue;
      const q = safeQuestions[record.questionIndex];
      for (const s of q.terms ?? []) slugs.add(s);
    }
    const toFetch = Array.from(slugs).filter((s) => !termCache.has(s));
    if (toFetch.length === 0) return;
    void Promise.all(
      toFetch.map(async (s) => {
        try {
          const res = await fetch(`/api/v1/terms/${encodeURIComponent(s)}`);
          if (!res.ok) return null;
          const json = await res.json();
          return json.data as DictionaryTerm;
        } catch {
          return null;
        }
      })
    ).then((results) => {
      setTermCache((prev) => {
        const next = new Map(prev);
        results.forEach((t, i) => {
          if (t) next.set(toFetch[i], t);
        });
        return next;
      });
    });
  }, [done, history, safeQuestions, termCache]);

  if (safeQuestions.length === 0) {
    return (
      <div className="my-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
        Quiz: No questions provided.
      </div>
    );
  }

  const total = safeQuestions.length;
  const question = safeQuestions[index];
  const type: QuizQuestionType = question.type ?? "multiple-choice";
  const isMulti = type === "multiple-select";
  const correctOptions = correctAsArray(question.correct);

  const toggleOption = (i: number) => {
    if (submitted) return;
    if (isMulti) {
      setSelected((prev) => (prev.includes(i) ? prev.filter((p) => p !== i) : [...prev, i]));
    } else {
      setSelected([i]);
    }
  };

  const submit = () => {
    if (selected.length === 0) return;
    const isCorrect = arraysEqual(selected, correctOptions);
    setSubmitted(true);
    setHistory((h) => [
      ...h,
      { questionIndex: index, selected: [...selected], correct: isCorrect },
    ]);
    void track("quiz_attempted", { type, index, correct: isCorrect });
  };

  const next = () => {
    if (index + 1 < total) {
      setIndex((i) => i + 1);
      setSelected([]);
      setSubmitted(false);
    } else {
      finish();
    }
  };

  const finish = () => {
    const correctCount = history.filter((h) => h.correct).length;
    const finalScore = correctCount / total;
    setDone(true);
    void setQuizScore(finalScore);
    if (finalScore >= passingScore) {
      passQuiz();
      void track("quiz_passed", { score: finalScore, total });
      if (currentLesson) {
        void awardXPWithToast("quiz", XP_AWARDS.quiz, currentLesson.lessonId);
      }
    }
  };

  const missedTerms = (() => {
    const slugs = new Set<string>();
    for (const record of history) {
      if (record.correct) continue;
      const q = safeQuestions[record.questionIndex];
      for (const slug of q.terms ?? []) slugs.add(slug);
    }
    return Array.from(slugs);
  })();

  const addTermToDeck = async (slug: string) => {
    const term = termCache.get(slug);
    if (!term) return;
    const card = createCard({
      id: generateId("card"),
      front: term.term,
      back: term.definitions.intermediate,
      termSlug: slug,
    });
    await putCard(card);
    setAddedTerms((prev) => new Set(prev).add(slug));
    void track("flashcard_rated", { source: "quiz-summary", slug });
  };

  if (done) {
    const correctCount = history.filter((h) => h.correct).length;
    const finalScore = correctCount / total;
    const passed = finalScore >= passingScore;
    return (
      <section className="my-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6">
        <header className="mb-4 text-center">
          <h3 className="text-2xl font-semibold text-[var(--color-text-primary)]">
            {passed ? "Nice work" : "Almost there"}
          </h3>
          <p className="mt-1 text-[var(--color-text-secondary)]">
            {correctCount} / {total} correct · {Math.round(finalScore * 100)}%
          </p>
          {passed && (
            <p className="mt-1 text-sm font-medium text-emerald-600">+{XP_AWARDS.quiz} XP earned</p>
          )}
        </header>
        {missedTerms.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-sm font-medium text-[var(--color-text-primary)]">
              Add missed terms to your review deck
            </p>
            <ul className="flex flex-wrap gap-2">
              {missedTerms.map((slug) => {
                const term = termCache.get(slug);
                if (!term) return null;
                const added = addedTerms.has(slug);
                return (
                  <li key={slug}>
                    <button
                      type="button"
                      onClick={() => void addTermToDeck(slug)}
                      disabled={added}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition",
                        added
                          ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                          : "border-[var(--color-border)] bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] hover:border-emerald-400 hover:text-emerald-700"
                      )}
                    >
                      {added ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                      {term.term}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
        <button
          type="button"
          onClick={() => {
            setIndex(0);
            setSelected([]);
            setSubmitted(false);
            setHistory([]);
            setDone(false);
            setAddedTerms(new Set());
          }}
          className="mt-6 rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] transition hover:bg-[var(--color-bg-subtle)]"
        >
          Retry
        </button>
      </section>
    );
  }

  return (
    <section className="my-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6">
      <div className="mb-3 flex items-center justify-between">
        <p className="font-mono text-xs text-[var(--color-text-muted)]">
          Question {index + 1} of {total}
        </p>
        <p className="font-mono text-xs text-[var(--color-text-muted)]">
          Score: {history.filter((h) => h.correct).length}/{history.length}
        </p>
      </div>
      <h3 className="mb-1 text-lg font-semibold text-[var(--color-text-primary)]">
        {question.question}
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
              onClick={() => toggleOption(i)}
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
      <div className="mt-4 flex items-center gap-2">
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
            {index + 1 === total ? "Finish" : "Next question"}
          </button>
        )}
      </div>
    </section>
  );
}
