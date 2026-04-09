import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakFlameProps {
  days: number;
  className?: string;
}

/**
 * Animated streak flame. Intensity scales with streak length.
 * 0-2 days: gray static
 * 3-6 days: orange static
 * 7-29 days: orange pulsing
 * 30+ days: gradient pulsing
 */
export function StreakFlame({ days, className }: StreakFlameProps): React.ReactElement {
  const level = days >= 30 ? "elite" : days >= 7 ? "strong" : days >= 3 ? "warm" : "cold";
  return (
    <Flame
      aria-hidden
      className={cn(
        "h-4 w-4",
        level === "cold" && "text-neutral-400",
        level === "warm" && "text-amber-500",
        level === "strong" && "streak-flame-pulse text-amber-500",
        level === "elite" && "streak-flame-pulse streak-flame-elite",
        className
      )}
    />
  );
}
