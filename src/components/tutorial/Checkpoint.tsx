"use client";

import { useState } from "react";
import type { CheckpointStatus } from "@/types/tutorial";

interface CheckpointProps {
  /** Unique checkpoint id within the tutorial */
  id: string;
  /** Display label */
  label: string;
  /** Current status */
  status: CheckpointStatus;
  /** Validation question or prompt */
  challenge?: string;
  /** Expected answer (case-insensitive match) */
  answer?: string;
  /** Called when user completes this checkpoint */
  onComplete?: (id: string) => void;
  children?: React.ReactNode;
}

/** Interactive checkpoint that gates tutorial progression. */
export function Checkpoint({
  id,
  label,
  status,
  challenge,
  answer,
  onComplete,
  children,
}: CheckpointProps): React.ReactElement {
  const [userInput, setUserInput] = useState("");
  const [isWrong, setIsWrong] = useState(false);

  function handleSubmit(e: React.FormEvent): void {
    e.preventDefault();
    if (!answer) {
      onComplete?.(id);
      return;
    }
    if (userInput.trim().toLowerCase() === answer.trim().toLowerCase()) {
      setIsWrong(false);
      onComplete?.(id);
    } else {
      setIsWrong(true);
    }
  }

  const statusColors: Record<CheckpointStatus, string> = {
    locked: "border-[var(--color-text-muted)] bg-[var(--color-bg-surface)] opacity-60",
    active: "border-emerald-500 bg-emerald-500/10",
    completed: "border-emerald-400 bg-emerald-400/10",
  };

  const statusIcons: Record<CheckpointStatus, string> = {
    locked: "🔒",
    active: "▶",
    completed: "✓",
  };

  return (
    <div
      className={`my-6 rounded-xl border-2 p-5 transition-all duration-300 ${statusColors[status]}`}
    >
      <div className="mb-3 flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-bg-surface)] text-sm font-semibold">
          {statusIcons[status]}
        </span>
        <h4 className="text-lg font-semibold text-[var(--color-text-primary)]">{label}</h4>
      </div>

      {children && <div className="mb-4 text-[var(--color-text-secondary)]">{children}</div>}

      {status === "active" && challenge && (
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <p className="text-sm font-medium text-[var(--color-text-primary)]">{challenge}</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={userInput}
              onChange={(e) => {
                setUserInput(e.target.value);
                setIsWrong(false);
              }}
              placeholder="Type your answer…"
              className={`flex-1 rounded-lg border bg-[var(--color-bg-primary)] px-3 py-2 text-sm text-[var(--color-text-primary)] transition-colors outline-none focus:border-emerald-500 ${isWrong ? "border-red-500" : "border-[var(--color-border)]"}`}
            />
            <button
              type="submit"
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-500"
            >
              Check
            </button>
          </div>
          {isWrong && <p className="text-sm text-red-400">Not quite — try again.</p>}
        </form>
      )}

      {status === "active" && !challenge && (
        <button
          onClick={() => onComplete?.(id)}
          className="mt-3 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-500"
        >
          Mark Complete
        </button>
      )}
    </div>
  );
}
