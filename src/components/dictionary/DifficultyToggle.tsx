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
      className="inline-flex items-center gap-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-1"
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
              "rounded-md px-3 py-1.5 text-xs font-medium transition",
              active
                ? "bg-emerald-50 text-emerald-700"
                : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]"
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
