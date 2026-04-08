import { Skeleton } from "@/components/ui/Skeleton";

export function FreeformSandboxSkeleton(): React.ReactElement {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)]">
      <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
        <Skeleton className="h-5 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-7 w-16" />
          <Skeleton className="h-7 w-16" />
          <Skeleton className="h-7 w-16" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div className="space-y-2 border-b border-[var(--color-border)] p-4 lg:border-r lg:border-b-0">
          {Array.from({ length: 10 }, (_, i) => (
            <Skeleton key={i} className="h-3" style={{ width: `${50 + Math.random() * 40}%` }} />
          ))}
        </div>
        <div className="space-y-2 p-4">
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      </div>
    </div>
  );
}
