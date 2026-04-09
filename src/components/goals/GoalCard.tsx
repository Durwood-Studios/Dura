"use client";

import { Trash2, Check } from "lucide-react";
import { useGoalsStore } from "@/stores/goals";
import { cn } from "@/lib/utils";
import type { Goal } from "@/types/goal";

interface GoalCardProps {
  goal: Goal;
  progress: number;
}

export function GoalCard({ goal, progress }: GoalCardProps): React.ReactElement {
  const remove = useGoalsStore((s) => s.remove);
  const complete = useGoalsStore((s) => s.complete);
  const achieved = goal.achievedAt !== null;

  const ratio = goal.target === 0 ? 0 : Math.min(1, progress / goal.target);
  const percent = Math.round(ratio * 100);

  // Deadline-aware pacing color
  const now = Date.now();
  const ontrack = (() => {
    if (!goal.deadline) return ratio >= 0.25; // rough daily/weekly heuristic
    const totalMs = goal.deadline - goal.startedAt;
    const elapsedMs = now - goal.startedAt;
    const timeRatio = totalMs > 0 ? elapsedMs / totalMs : 0;
    return ratio >= timeRatio - 0.1;
  })();
  const ringColor = achieved
    ? "text-emerald-500"
    : ontrack
      ? "text-emerald-500"
      : percent > 0
        ? "text-amber-500"
        : "text-rose-400";

  const circumference = 2 * Math.PI * 32;
  const dashOffset = circumference * (1 - ratio);

  return (
    <article className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5 shadow-sm">
      <header className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] tracking-widest text-[var(--color-text-muted)] uppercase">
            {goal.type}
          </p>
          <h3 className="mt-1 font-semibold text-[var(--color-text-primary)]">{goal.label}</h3>
        </div>
        <button
          type="button"
          onClick={() => void remove(goal.id)}
          aria-label="Delete goal"
          className="rounded-md p-1.5 text-[var(--color-text-muted)] hover:bg-rose-50 hover:text-rose-600"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </header>

      <div className="flex items-center gap-4">
        <div className="relative h-20 w-20">
          <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90">
            <circle
              cx="40"
              cy="40"
              r="32"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              className="text-[var(--color-bg-subtle)]"
            />
            <circle
              cx="40"
              cy="40"
              r="32"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              className={cn("transition-all duration-500", ringColor)}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-[var(--color-text-primary)]">
            {percent}%
          </span>
        </div>
        <div className="flex-1 text-sm">
          <p className="text-[var(--color-text-primary)]">
            <span className="font-mono text-lg font-semibold">{progress}</span>{" "}
            <span className="text-[var(--color-text-muted)]">
              / {goal.target} {goal.unit}
            </span>
          </p>
          {goal.deadline && (
            <p className="mt-0.5 text-[10px] text-[var(--color-text-muted)]">
              Deadline: {new Date(goal.deadline).toLocaleDateString()}
            </p>
          )}
          {achieved && (
            <p className="mt-0.5 inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600">
              <Check className="h-3 w-3" />
              Achieved {new Date(goal.achievedAt!).toLocaleDateString()}
            </p>
          )}
          {!achieved && ratio >= 1 && (
            <button
              type="button"
              onClick={() => void complete(goal.id)}
              className="mt-2 inline-flex items-center gap-1 rounded-md bg-emerald-500 px-2.5 py-1 text-[10px] font-semibold text-white hover:bg-emerald-600"
            >
              Mark complete
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
