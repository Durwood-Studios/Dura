"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { markActivityComplete } from "@/components/discover/Passport";
import { cn } from "@/lib/utils";

interface Move {
  label: string;
  emoji: string;
  color: string;
  /** CSS transform applied to the robot during this move. */
  transform: string;
}

const MOVES: Move[] = [
  { label: "Step Left", emoji: "👈", color: "#60a5fa", transform: "translateX(-40px)" },
  { label: "Step Right", emoji: "👉", color: "#f472b6", transform: "translateX(40px)" },
  { label: "Spin", emoji: "🔄", color: "#a78bfa", transform: "rotate(360deg)" },
  { label: "Jump", emoji: "⬆️", color: "#34d399", transform: "translateY(-40px)" },
  { label: "Wave", emoji: "👋", color: "#fbbf24", transform: "rotate(-15deg) scale(1.1)" },
  { label: "Bow", emoji: "🎩", color: "#fb923c", transform: "scaleY(0.7) translateY(16px)" },
];

/** Robot Dance Choreographer — teach sequencing by building a dance routine. */
export function RobotDance(): React.ReactElement {
  const [sequence, setSequence] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [completed, setCompleted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const addMove = useCallback(
    (moveIndex: number): void => {
      if (isPlaying) return;
      setSequence((prev) => [...prev, moveIndex]);
    },
    [isPlaying]
  );

  const clearSequence = useCallback((): void => {
    if (isPlaying) return;
    setSequence([]);
    setCurrentStep(-1);
    setCompleted(false);
  }, [isPlaying]);

  const play = useCallback((): void => {
    if (sequence.length === 0 || isPlaying) return;
    setIsPlaying(true);
    setCurrentStep(0);
  }, [sequence, isPlaying]);

  // Step through the sequence during playback
  useEffect(() => {
    if (!isPlaying || currentStep < 0) return;

    if (currentStep >= sequence.length) {
      // Playback complete
      timerRef.current = setTimeout(() => {
        setIsPlaying(false);
        setCurrentStep(-1);
        if (!completed) {
          setCompleted(true);
          markActivityComplete("robot-dance");
        }
      }, 300);
      return;
    }

    timerRef.current = setTimeout(() => {
      setCurrentStep((s) => s + 1);
    }, 600);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, currentStep, sequence.length, completed]);

  const activeMove =
    isPlaying && currentStep >= 0 && currentStep < sequence.length
      ? MOVES[sequence[currentStep]]
      : null;

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-8 py-8">
      <h2 className="text-center text-2xl font-semibold text-[var(--color-text-primary)]">
        Robot Dance Choreographer
      </h2>
      <p className="text-center text-sm text-[var(--color-text-secondary)]">
        Pick moves to build a dance routine, then hit Play!
      </p>

      {/* Robot */}
      <div className="flex h-40 w-40 items-center justify-center">
        <div
          className="text-7xl transition-all duration-500 ease-in-out"
          style={{ transform: activeMove ? activeMove.transform : "none" }}
          role="img"
          aria-label="Dancing robot"
        >
          🤖
        </div>
      </div>

      {/* Move buttons */}
      <div className="flex flex-wrap justify-center gap-3">
        {MOVES.map((move, i) => (
          <button
            key={move.label}
            type="button"
            onClick={() => addMove(i)}
            disabled={isPlaying}
            className="flex min-h-[48px] items-center gap-2 rounded-2xl px-5 py-3 text-base font-medium text-white transition-transform duration-150 hover:scale-105 active:scale-95 disabled:opacity-40"
            style={{ backgroundColor: move.color }}
          >
            <span>{move.emoji}</span>
            <span>{move.label}</span>
          </button>
        ))}
      </div>

      {/* Sequence strip */}
      {sequence.length > 0 && (
        <div className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4">
          <p className="mb-3 text-xs font-medium text-[var(--color-text-muted)]">
            Your routine ({sequence.length} move{sequence.length !== 1 ? "s" : ""})
          </p>
          <div className="flex flex-wrap gap-2">
            {sequence.map((moveIdx, seqIdx) => {
              const move = MOVES[moveIdx];
              const isActive = isPlaying && seqIdx === currentStep;
              return (
                <div
                  key={seqIdx}
                  className={cn(
                    "flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-white transition-all duration-200",
                    isActive && "scale-110 ring-2 ring-white"
                  )}
                  style={{ backgroundColor: move.color }}
                >
                  <span>{move.emoji}</span>
                  <span>{move.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={play}
          disabled={isPlaying || sequence.length === 0}
          className="min-h-[48px] rounded-2xl bg-[var(--color-accent-emerald)] px-8 py-3 text-base font-semibold text-white transition-transform duration-150 hover:scale-105 active:scale-95 disabled:opacity-40"
        >
          ▶ Play
        </button>
        <button
          type="button"
          onClick={clearSequence}
          disabled={isPlaying}
          className="min-h-[48px] rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-8 py-3 text-base font-medium text-[var(--color-text-secondary)] transition-transform duration-150 hover:scale-105 active:scale-95 disabled:opacity-40"
        >
          Clear
        </button>
      </div>

      {/* What you just learned */}
      {completed && (
        <div className="mt-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 backdrop-blur-xl">
          <h3 className="mb-2 text-sm font-semibold text-[var(--color-accent-emerald)]">
            What you just learned
          </h3>
          <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
            You just wrote a program — a list of instructions executed in order. Every app on your
            phone is a sequence of instructions, just like your dance routine.
          </p>
        </div>
      )}
    </div>
  );
}
