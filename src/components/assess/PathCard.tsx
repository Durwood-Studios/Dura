"use client";

import { ArrowRight, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LearningPath } from "@/types/skill-assessment";

/** Phase colors from the design system. */
const PHASE_COLORS: Record<string, string> = {
  "0": "#6ee7b7",
  "1": "#93c5fd",
  "2": "#c4b5fd",
  "3": "#fda4af",
  "4": "#fdba74",
  "5": "#f0abfc",
  "6": "#67e8f9",
  "7": "#fcd34d",
  "8": "#a3e635",
  "9": "#f472b6",
};

interface PathCardProps {
  path: LearningPath;
  recommended?: boolean;
  selected?: boolean;
  onSelect: (id: string) => void;
}

export function PathCard({
  path,
  recommended,
  selected,
  onSelect,
}: PathCardProps): React.ReactElement {
  return (
    <button
      type="button"
      onClick={() => onSelect(path.id)}
      className={cn(
        "relative w-full rounded-xl border p-5 text-left transition",
        selected
          ? "border-emerald-400 bg-emerald-50/50 shadow-md dark:bg-emerald-500/10"
          : "border-[var(--color-border)] bg-[var(--color-bg-surface)] hover:border-emerald-300 hover:shadow-sm"
      )}
    >
      {recommended && (
        <span className="absolute -top-2.5 right-4 inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-0.5 text-[10px] font-semibold text-white">
          <Star className="h-3 w-3" /> Recommended
        </span>
      )}
      <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">{path.name}</h3>
      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{path.description}</p>
      <p className="mt-1 text-xs text-[var(--color-text-muted)]">{path.targetAudience}</p>
      <div className="mt-3 flex items-center gap-2">
        {path.phases.map((p) => (
          <span
            key={p}
            className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold"
            style={{
              backgroundColor: `${PHASE_COLORS[p] ?? "#10b981"}44`,
              color: "var(--color-text-primary)",
            }}
          >
            {p}
          </span>
        ))}
        <span className="ml-auto text-xs text-[var(--color-text-muted)]">
          ~{path.estimatedHours.toLocaleString()}h
        </span>
      </div>
      {selected && (
        <div className="mt-3 flex items-center gap-1 text-sm font-medium text-emerald-600">
          Start this path <ArrowRight className="h-4 w-4" />
        </div>
      )}
    </button>
  );
}
