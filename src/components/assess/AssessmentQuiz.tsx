"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, X } from "lucide-react";
import { SKILL_QUESTIONS } from "@/content/skill-assessment";
import { scoreAssessment, recommendPath, dreyfusLabel } from "@/lib/skill-assessment";
import { LEARNING_PATHS } from "@/lib/paths";
import { useAssessmentStore } from "@/stores/assessment";
import { PathCard } from "@/components/assess/PathCard";
import { generateId, cn } from "@/lib/utils";
import type { SkillAnswer, PathId, SkillAssessmentResult } from "@/types/skill-assessment";

type Stage = "intro" | "quiz" | "feedback" | "results";

export function AssessmentQuiz(): React.ReactElement {
  const router = useRouter();
  const setResult = useAssessmentStore((s) => s.setResult);
  const existingResult = useAssessmentStore((s) => s.result);
  const hydrated = useAssessmentStore((s) => s.hydrated);
  const hydrate = useAssessmentStore((s) => s.hydrate);

  const [stage, setStage] = useState<Stage>("intro");
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<SkillAnswer[]>([]);
  const [result, setLocalResult] = useState<SkillAssessmentResult | null>(null);
  const [selectedPath, setSelectedPath] = useState<PathId | null>(null);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    if (!hydrated) void hydrate();
  }, [hydrated, hydrate]);

  const questions = SKILL_QUESTIONS;
  const current = questions[index];
  const total = questions.length;

  const handleAnswer = useCallback(
    (optionIdx: number) => {
      if (stage !== "quiz") return;
      setSelected(optionIdx);
      const answer: SkillAnswer = {
        questionId: current.id,
        selectedOption: optionIdx,
        correct: optionIdx === current.correctIndex,
        phaseLevel: current.phaseLevel,
      };
      setAnswers((prev) => [...prev, answer]);
      setStage("feedback");
    },
    [stage, current]
  );

  const advance = useCallback(() => {
    if (index + 1 < total) {
      setIndex((i) => i + 1);
      setSelected(null);
      setStage("quiz");
    } else {
      // All questions answered — score
      const finalAnswers = [...answers];
      const score = scoreAssessment(finalAnswers);
      const recommended = recommendPath(score);
      const assessmentResult: SkillAssessmentResult = {
        id: generateId("assess"),
        completedAt: Date.now(),
        answers: finalAnswers,
        score,
        recommendedPath: recommended,
        selectedPath: recommended,
      };
      setLocalResult(assessmentResult);
      setSelectedPath(recommended);
      void setResult(assessmentResult);
      setStage("results");
    }
  }, [index, total, answers, setResult]);

  const handlePathSelect = (pathId: string) => {
    setSelectedPath(pathId as PathId);
  };

  const handleStartPath = () => {
    if (!result || !selectedPath) return;
    const updated = { ...result, selectedPath };
    void setResult(updated);
    const path = LEARNING_PATHS[selectedPath];
    const firstPhase = path.phases[0];
    router.push(`/paths/${firstPhase}`);
  };

  // Intro screen
  if (stage === "intro") {
    return (
      <div className="mx-auto max-w-lg text-center">
        <h1 className="text-3xl font-semibold text-[var(--color-text-primary)]">
          Skill Assessment
        </h1>
        <p className="mt-3 text-[var(--color-text-secondary)]">
          35 questions across all engineering topics. Takes about 10 minutes. We&apos;ll recommend
          the best starting point based on your answers.
        </p>
        {existingResult && (
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">
            You&apos;ve taken this before. Your current path:{" "}
            <strong>{LEARNING_PATHS[existingResult.selectedPath].name}</strong>. Retaking will
            replace your previous result.
          </p>
        )}
        <div className="mt-8 flex flex-col items-center gap-3">
          <button
            onClick={() => setStage("quiz")}
            className="rounded-lg bg-emerald-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600"
          >
            Begin Assessment
          </button>
          <button
            onClick={() => {
              const defaultResult: SkillAssessmentResult = {
                id: generateId("assess"),
                completedAt: Date.now(),
                answers: [],
                score: {
                  total: 0,
                  correct: 0,
                  byBracket: {},
                  dreyfusLevel: "novice",
                },
                recommendedPath: "foundation",
                selectedPath: "foundation",
              };
              void setResult(defaultResult);
              router.push("/paths/0");
            }}
            className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
          >
            Skip — start from Phase 0
          </button>
        </div>
      </div>
    );
  }

  // Results screen
  if (stage === "results" && result) {
    const score = result.score;
    const brackets = Object.entries(score.byBracket);
    const pathEntries = Object.values(LEARNING_PATHS);

    return (
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-semibold text-[var(--color-text-primary)]">Your Results</h2>
          <p className="mt-2 text-lg font-semibold text-emerald-600">
            {score.correct}/{score.total} correct — {dreyfusLabel(score.dreyfusLevel)}
          </p>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Completed in {Math.round((Date.now() - startTime) / 60000)} minutes
          </p>
        </div>

        {/* Score by bracket */}
        <div className="mb-8 grid grid-cols-5 gap-2">
          {brackets.map(([label, data]) => {
            const pct = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
            return (
              <div
                key={label}
                className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-3 text-center"
              >
                <p className="text-xs font-medium text-[var(--color-text-muted)]">Phase {label}</p>
                <p className="mt-1 text-lg font-semibold text-[var(--color-text-primary)]">
                  {pct}%
                </p>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[var(--color-bg-subtle)]">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Path cards */}
        <h3 className="mb-4 text-xl font-semibold text-[var(--color-text-primary)]">
          Choose your path
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {pathEntries.map((path) => (
            <PathCard
              key={path.id}
              path={path}
              recommended={path.id === result.recommendedPath}
              selected={path.id === selectedPath}
              onSelect={handlePathSelect}
            />
          ))}
        </div>
        <div className="mt-6 text-center">
          <button
            onClick={handleStartPath}
            disabled={!selectedPath}
            className="rounded-lg bg-emerald-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-50"
          >
            Start {selectedPath ? LEARNING_PATHS[selectedPath].name : ""} Path
          </button>
        </div>
      </div>
    );
  }

  // Quiz + feedback screens
  return (
    <div className="mx-auto max-w-lg">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="mb-1 flex items-center justify-between text-xs text-[var(--color-text-muted)]">
          <span>
            Question {index + 1} of {total}
          </span>
          <span>Phase {current.phaseLevel} level</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[var(--color-bg-subtle)]">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${((index + (stage === "feedback" ? 1 : 0)) / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <h2 className="mb-6 text-xl font-semibold text-[var(--color-text-primary)]">
        {current.question}
      </h2>

      {/* Options */}
      <div className="flex flex-col gap-2">
        {current.options.map((option, i) => {
          const isSelected = selected === i;
          const isCorrect = i === current.correctIndex;
          const showResult = stage === "feedback";

          return (
            <button
              key={i}
              type="button"
              onClick={() => handleAnswer(i)}
              disabled={stage === "feedback"}
              className={cn(
                "flex items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition",
                showResult &&
                  isCorrect &&
                  "border-emerald-400 bg-emerald-50 dark:bg-emerald-500/10",
                showResult &&
                  isSelected &&
                  !isCorrect &&
                  "border-rose-400 bg-rose-50 dark:bg-rose-500/10",
                !showResult &&
                  "border-[var(--color-border)] bg-[var(--color-bg-surface)] hover:border-emerald-300",
                !showResult &&
                  isSelected &&
                  "border-emerald-400 bg-emerald-50 dark:bg-emerald-500/10"
              )}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[var(--color-border)] text-xs font-medium">
                {showResult && isCorrect ? (
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                ) : showResult && isSelected ? (
                  <X className="h-3.5 w-3.5 text-rose-500" />
                ) : (
                  String.fromCharCode(65 + i)
                )}
              </span>
              <span className="text-[var(--color-text-primary)]">{option}</span>
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      {stage === "feedback" && (
        <div className="mt-4">
          <p className="rounded-lg bg-[var(--color-bg-subtle)] p-3 text-sm text-[var(--color-text-secondary)]">
            {current.explanation}
          </p>
          <button
            onClick={advance}
            className="mt-3 inline-flex items-center gap-1 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600"
          >
            {index + 1 < total ? "Next Question" : "See Results"} <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
