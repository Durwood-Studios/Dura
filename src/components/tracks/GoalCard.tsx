"use client";

import {
  Rocket,
  ArrowRightLeft,
  Zap,
  Brain,
  Users,
  Shield,
  Database,
  Activity,
  TrendingUp,
  Cpu,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { TrackGoal } from "@/types/career-track";

const ICON_MAP: Record<string, LucideIcon> = {
  Rocket,
  ArrowRightLeft,
  Zap,
  Brain,
  Users,
  Shield,
  Database,
  Activity,
  TrendingUp,
  Cpu,
};

interface GoalCardProps {
  goal: TrackGoal;
  onClick: (goalId: string) => void;
}

/** Interactive goal card — calls onClick with the goal ID when pressed. */
export function GoalCard({ goal, onClick }: GoalCardProps): React.ReactElement {
  const Icon = ICON_MAP[goal.icon];

  return (
    <button
      type="button"
      onClick={() => onClick(goal.id)}
      className="dura-card flex w-full items-start gap-4 p-5 text-left transition-colors"
    >
      {Icon && (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-bg-surface)]">
          <Icon className="h-5 w-5 text-emerald-400" aria-hidden="true" />
        </div>
      )}
      <div className="min-w-0">
        <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
          {goal.question}
        </h3>
        <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-secondary)]">
          {goal.description}
        </p>
      </div>
    </button>
  );
}
