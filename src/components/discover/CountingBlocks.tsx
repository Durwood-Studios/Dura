"use client";

import { useCallback, useState } from "react";
import { markActivityComplete } from "@/components/discover/Passport";

const ROUNDS = [3, 5, 2, 7, 10];
const TOTAL_BLOCKS = 10;

const BLOCK_COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f59e0b",
  "#6366f1",
];

/** A counting activity with visual blocks for early elementary learners. */
export function CountingBlocks(): React.ReactElement {
  const [roundIndex, setRoundIndex] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const target = ROUNDS[roundIndex];

  const handleBlockClick = useCallback(
    (index: number): void => {
      if (isCorrect || isComplete) return;

      // Toggle: if clicking the last active block, deactivate it; otherwise activate the next one
      const clickedPosition = index + 1;
      if (clickedPosition === activeCount) {
        setActiveCount(activeCount - 1);
      } else if (clickedPosition === activeCount + 1) {
        const newCount = activeCount + 1;
        setActiveCount(newCount);

        if (newCount === target) {
          setIsCorrect(true);

          if (roundIndex === ROUNDS.length - 1) {
            // All rounds done
            setTimeout(() => {
              setIsComplete(true);
              markActivityComplete("counting-blocks");
            }, 1500);
          } else {
            // Move to next round after a beat
            setTimeout(() => {
              setRoundIndex((prev) => prev + 1);
              setActiveCount(0);
              setIsCorrect(false);
            }, 1500);
          }
        }
      }
    },
    [activeCount, target, isCorrect, isComplete, roundIndex]
  );

  const handleReset = useCallback((): void => {
    setRoundIndex(0);
    setActiveCount(0);
    setIsCorrect(false);
    setIsComplete(false);
  }, []);

  if (isComplete) {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <p className="text-3xl font-bold text-[var(--color-text-primary)]">Great counting!</p>
        <div className="flex gap-1 text-3xl">
          {["🎉", "⭐", "🎉"].map((emoji, i) => (
            <span key={i} className="animate-bounce" style={{ animationDelay: `${i * 120}ms` }}>
              {emoji}
            </span>
          ))}
        </div>
        <button
          onClick={handleReset}
          className="mt-4 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400"
        >
          Play Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Round indicator */}
      <div className="flex gap-2">
        {ROUNDS.map((_, i) => (
          <div
            key={i}
            className="h-2 w-8 rounded-full transition-colors duration-300"
            style={{
              backgroundColor:
                i < roundIndex ? "#10b981" : i === roundIndex ? "#60a5fa" : "var(--color-border)",
            }}
          />
        ))}
      </div>

      {/* Target number */}
      <div className="flex flex-col items-center gap-2">
        <p className="text-lg text-[var(--color-text-secondary)]">Click this many blocks:</p>
        <span className="text-7xl font-bold text-[var(--color-text-primary)]">{target}</span>
      </div>

      {/* Success message */}
      {isCorrect && (
        <p className="animate-in text-2xl font-bold text-emerald-400 duration-300 fade-in">
          That&apos;s {target}!
        </p>
      )}

      {/* Blocks row */}
      <div className="flex flex-wrap justify-center gap-3">
        {Array.from({ length: TOTAL_BLOCKS }, (_, i) => {
          const isActive = i < activeCount;
          return (
            <button
              key={i}
              onClick={() => handleBlockClick(i)}
              aria-label={`Block ${i + 1}${isActive ? " (selected)" : ""}`}
              className="h-14 w-14 rounded-xl border-2 transition-all duration-200 sm:h-16 sm:w-16"
              style={{
                backgroundColor: isActive ? BLOCK_COLORS[i] : "transparent",
                borderColor: isActive ? BLOCK_COLORS[i] : "var(--color-border)",
                transform:
                  isCorrect && isActive
                    ? `translateY(${Math.sin(i * 0.8) * -8}px)`
                    : "translateY(0)",
                transition: isCorrect
                  ? `transform 0.3s ease-in-out ${i * 80}ms, background-color 0.2s, border-color 0.2s`
                  : "all 0.2s",
              }}
            />
          );
        })}
      </div>

      {/* Count display */}
      <p className="text-sm text-[var(--color-text-muted)]">
        {activeCount} of {target}
      </p>
    </div>
  );
}

export default CountingBlocks;
