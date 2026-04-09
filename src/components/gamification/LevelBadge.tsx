import { cn } from "@/lib/utils";

interface LevelBadgeProps {
  level: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_CLASS: Record<NonNullable<LevelBadgeProps["size"]>, string> = {
  sm: "h-5 w-5 text-[10px]",
  md: "h-8 w-8 text-xs",
  lg: "h-12 w-12 text-sm",
};

function colorFor(level: number): string {
  if (level >= 21) return "border-amber-300 bg-amber-50 text-amber-800";
  if (level >= 11) return "border-cyan-300 bg-cyan-50 text-cyan-800";
  if (level >= 6) return "border-emerald-300 bg-emerald-50 text-emerald-800";
  return "border-[var(--color-border)] bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)]";
}

export function LevelBadge({ level, size = "md", className }: LevelBadgeProps): React.ReactElement {
  return (
    <span
      aria-label={`Level ${level}`}
      className={cn(
        "inline-flex items-center justify-center rounded-full border font-semibold",
        SIZE_CLASS[size],
        colorFor(level),
        className
      )}
    >
      {level}
    </span>
  );
}
