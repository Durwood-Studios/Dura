"use client";

import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";

interface Puzzle {
  goal: string;
  steps: string[];
  bugIndex: number;
  fixedStep: string;
  result: string;
}

const PUZZLES: Puzzle[] = [
  {
    goal: "Draw a blue square",
    steps: ["Pick color: red", "Draw square", "Fill"],
    bugIndex: 0,
    fixedStep: "Pick color: blue",
    result: "Draws a red square instead of blue",
  },
  {
    goal: "Count to 5",
    steps: ["Start at 1", "Add 1 each time", "Stop at 6"],
    bugIndex: 2,
    fixedStep: "Stop at 5",
    result: "Counts to 6 instead of 5 (off-by-one!)",
  },
  {
    goal: "Say hello to Alex",
    steps: ["Get name: undefined", "Print 'Hello ' + name", "Print '!'"],
    bugIndex: 0,
    fixedStep: "Get name: Alex",
    result: 'Shows "Hello undefined!" instead of "Hello Alex!"',
  },
  {
    goal: "Make a list of 3 fruits",
    steps: ["Create list", "Add apple", "Add banana", "Add banana"],
    bugIndex: 3,
    fixedStep: "Add cherry",
    result: "List has two bananas instead of three different fruits",
  },
  {
    goal: "Calculate 2 + 3",
    steps: ["First number: 2", "Second number: 3", "Multiply them"],
    bugIndex: 2,
    fixedStep: "Add them",
    result: "Gets 6 instead of 5",
  },
];

interface StepState {
  isClicked: boolean;
  isCorrect: boolean | null;
  isFixed: boolean;
}

/**
 * Interactive debugging discovery activity.
 *
 * Users find the buggy step in a series of simple visual "programs" to learn
 * that debugging is about comparing expected vs. actual behavior.
 */
export function BugDetective(): React.ReactElement {
  const [currentPuzzle, setCurrentPuzzle] = useState(0);
  const [stepStates, setStepStates] = useState<StepState[]>(() =>
    PUZZLES[0].steps.map(() => ({ isClicked: false, isCorrect: null, isFixed: false }))
  );
  const [isSolved, setIsSolved] = useState(false);
  const [isAllComplete, setIsAllComplete] = useState(false);
  const [wrongGuesses, setWrongGuesses] = useState(0);

  const puzzle = PUZZLES[currentPuzzle];

  const handleStepClick = useCallback(
    (stepIndex: number): void => {
      if (isSolved) return;

      const isCorrectGuess = stepIndex === puzzle.bugIndex;

      setStepStates((prev) =>
        prev.map((state, i) => {
          if (i !== stepIndex) return state;
          return {
            isClicked: true,
            isCorrect: isCorrectGuess,
            isFixed: isCorrectGuess,
          };
        })
      );

      if (isCorrectGuess) {
        setIsSolved(true);
      } else {
        setWrongGuesses((prev) => prev + 1);
        // Clear wrong highlight after a brief flash
        setTimeout(() => {
          setStepStates((prev) =>
            prev.map((state, i) => {
              if (i !== stepIndex) return state;
              return { isClicked: false, isCorrect: null, isFixed: false };
            })
          );
        }, 600);
      }
    },
    [isSolved, puzzle.bugIndex]
  );

  const nextPuzzle = useCallback((): void => {
    const next = currentPuzzle + 1;
    if (next >= PUZZLES.length) {
      setIsAllComplete(true);
      return;
    }
    setCurrentPuzzle(next);
    setStepStates(
      PUZZLES[next].steps.map(() => ({
        isClicked: false,
        isCorrect: null,
        isFixed: false,
      }))
    );
    setIsSolved(false);
    setWrongGuesses(0);
  }, [currentPuzzle]);

  const restart = useCallback((): void => {
    setCurrentPuzzle(0);
    setStepStates(
      PUZZLES[0].steps.map(() => ({
        isClicked: false,
        isCorrect: null,
        isFixed: false,
      }))
    );
    setIsSolved(false);
    setIsAllComplete(false);
    setWrongGuesses(0);
  }, []);

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-8 py-8">
      <h2 className="text-center text-2xl font-semibold text-[var(--color-text-primary)]">
        Bug Detective
      </h2>
      <p className="text-center text-sm text-[var(--color-text-secondary)]">
        Find the mistake in each program
      </p>

      {/* Progress */}
      <div className="flex gap-1.5">
        {PUZZLES.map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-2 w-8 rounded-full transition-colors duration-200",
              i < currentPuzzle
                ? "bg-[var(--color-accent-emerald)]"
                : i === currentPuzzle && !isAllComplete
                  ? "bg-[var(--color-accent-cyan)]"
                  : "bg-[var(--color-bg-surface)]"
            )}
          />
        ))}
      </div>

      {isAllComplete ? (
        /* Completion screen */
        <div className="flex flex-col items-center gap-6">
          <div className="rounded-xl border border-[var(--color-accent-emerald)]/30 bg-[var(--color-accent-emerald)]/10 p-8 text-center">
            <p className="mb-2 text-lg font-semibold text-[var(--color-accent-emerald)]">
              All bugs squashed!
            </p>
            <p className="text-sm text-[var(--color-text-secondary)]">
              You found every bug across {PUZZLES.length} programs.
            </p>
          </div>
          <button
            type="button"
            onClick={restart}
            className="min-h-[48px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-6 py-3 text-sm font-medium text-[var(--color-text-secondary)] transition-colors duration-150 hover:bg-[var(--color-bg-surface-hover)]"
          >
            Play again
          </button>
        </div>
      ) : (
        /* Puzzle view */
        <div className="w-full">
          {/* Puzzle header */}
          <div className="mb-2 text-center text-xs font-medium text-[var(--color-text-muted)]">
            Puzzle {currentPuzzle + 1} of {PUZZLES.length}
          </div>

          {/* Goal */}
          <div className="mb-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4 backdrop-blur-xl">
            <p className="mb-1 text-xs font-semibold text-[var(--color-accent-cyan)]">The Goal</p>
            <p className="text-sm font-medium text-[var(--color-text-primary)]">{puzzle.goal}</p>
          </div>

          {/* Result (what actually happens) */}
          <div className="mb-4 rounded-xl border border-red-400/20 bg-red-400/5 p-4">
            <p className="mb-1 text-xs font-semibold text-red-400">
              The Result (something is wrong)
            </p>
            <p className="text-sm text-[var(--color-text-secondary)]">{puzzle.result}</p>
          </div>

          {/* Program steps */}
          <div className="mb-4">
            <p className="mb-3 text-xs font-semibold text-[var(--color-text-muted)]">
              The Program — click the buggy step
            </p>
            <div className="flex flex-col gap-2">
              {puzzle.steps.map((step, i) => {
                const state = stepStates[i];
                const showFixed = state.isFixed;

                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleStepClick(i)}
                    disabled={isSolved}
                    aria-label={`Step ${i + 1}: ${step}`}
                    className={cn(
                      "flex min-h-[48px] items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-all duration-200",
                      state.isCorrect === true
                        ? "border-[var(--color-accent-emerald)]/50 bg-[var(--color-accent-emerald)]/10"
                        : state.isCorrect === false
                          ? "border-red-400/50 bg-red-400/10"
                          : "border-[var(--color-border)] bg-[var(--color-bg-surface)]",
                      !isSolved &&
                        state.isCorrect === null &&
                        "cursor-pointer hover:bg-[var(--color-bg-surface-hover)]",
                      isSolved && "cursor-default"
                    )}
                  >
                    <span className="font-[family-name:var(--font-mono)] text-xs text-[var(--color-text-muted)]">
                      {i + 1}.
                    </span>
                    <span className={cn("flex-1", showFixed && "line-through opacity-50")}>
                      {step}
                    </span>
                    {showFixed && (
                      <span className="font-medium text-[var(--color-accent-emerald)]">
                        {puzzle.fixedStep}
                      </span>
                    )}
                    {state.isCorrect === false && (
                      <span className="text-xs text-red-400">Not that one</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Wrong guess hint */}
          {wrongGuesses > 0 && !isSolved && (
            <p className="mb-4 text-center text-xs text-[var(--color-text-muted)]">
              Not that one — try again. Compare the goal to the result.
            </p>
          )}

          {/* Solved feedback + next button */}
          {isSolved && (
            <div className="flex flex-col items-center gap-4">
              <p className="text-center text-sm font-medium text-[var(--color-accent-emerald)]">
                Bug found and fixed!
              </p>
              <button
                type="button"
                onClick={nextPuzzle}
                className="min-h-[48px] rounded-lg bg-[var(--color-accent-emerald)] px-6 py-3 text-sm font-semibold text-black transition-colors duration-150 hover:brightness-110"
              >
                {currentPuzzle < PUZZLES.length - 1 ? "Next Puzzle" : "See Results"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* What you just learned */}
      <div className="mt-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 backdrop-blur-xl">
        <h3 className="mb-2 text-sm font-semibold text-[var(--color-accent-emerald)]">
          What you just learned
        </h3>
        <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
          Every program has bugs — mistakes that make it do the wrong thing. Debugging is the skill
          of reading carefully, comparing what should happen to what actually happens, and finding
          the difference. Professional programmers spend more time debugging than writing new code.
        </p>
      </div>
    </div>
  );
}
