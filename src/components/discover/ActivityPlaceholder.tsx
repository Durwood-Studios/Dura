"use client";

/** Placeholder for activities that haven't been built yet. */
export default function ActivityPlaceholder(): React.ReactElement {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-bg-surface)] p-10 text-center">
      <span className="text-5xl" role="img" aria-hidden="true">
        🚧
      </span>
      <h2 className="mt-4 text-xl font-semibold text-[var(--color-text-primary)]">Coming Soon</h2>
      <p className="mt-2 max-w-sm text-sm text-[var(--color-text-muted)]">
        This activity is still being built. Check back soon!
      </p>
    </div>
  );
}
