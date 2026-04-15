"use client";

import { cn } from "@/lib/utils";
import type { DictionaryDifficulty } from "@/types/dictionary";

interface DifficultyToggleProps {
  value: DictionaryDifficulty;
  onChange: (next: DictionaryDifficulty) => void;
}

const OPTIONS: { value: DictionaryDifficulty; label: string }[] = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export function DifficultyToggle({ value, onChange }: DifficultyToggleProps): React.ReactElement {
  return (
    <div
      role="radiogroup"
      aria-label="Difficulty"
      className="dura-glass inline-flex items-center gap-1 rounded-2xl p-1"
    >
      {OPTIONS.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={cn(
              "rounded-xl px-4 py-2 text-xs font-medium transition",
              active
                ? "dura-glow-emerald bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-text-primary)]"
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
