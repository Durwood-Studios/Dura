import { Skeleton } from "@/components/ui/Skeleton";

export function SandboxExerciseSkeleton(): React.ReactElement {
  return (
    <div className="my-8 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)]">
      <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-7 w-20" />
      </div>
      <div className="grid gap-2 p-4">
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-3/4" />
      </div>
      <div className="border-t border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-3">
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  );
}
