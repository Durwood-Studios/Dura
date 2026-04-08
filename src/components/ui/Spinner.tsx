import { cn } from "@/lib/utils";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

const SIZE: Record<NonNullable<SpinnerProps["size"]>, string> = {
  sm: "h-4 w-4 border",
  md: "h-6 w-6 border-2",
  lg: "h-8 w-8 border-2",
};

export function Spinner({
  size = "md",
  className,
  label = "Loading",
}: SpinnerProps): React.ReactElement {
  return (
    <div
      role="status"
      aria-label={label}
      className={cn(
        "inline-block animate-spin rounded-full border-neutral-200 border-t-emerald-500",
        SIZE[size],
        className
      )}
    />
  );
}
