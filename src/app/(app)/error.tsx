"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): React.ReactElement {
  useEffect(() => {
    console.error("[dura] App error boundary caught:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 p-8 text-center">
      <p className="font-mono text-sm tracking-widest text-rose-500 uppercase">Error</p>
      <h2 className="text-2xl font-semibold text-[var(--color-text-primary)]">
        Something broke here
      </h2>
      <p className="max-w-md text-[var(--color-text-secondary)]">
        Your local progress is intact. Try again or head back to the dashboard.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600"
        >
          Try again
        </button>
        <Link
          href="/dashboard"
          className="rounded-lg border border-[var(--color-border)] px-5 py-2.5 text-sm font-semibold text-[var(--color-text-secondary)] transition hover:bg-[var(--color-bg-surface)]"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
