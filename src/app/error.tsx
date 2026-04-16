"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): React.ReactElement {
  useEffect(() => {
    console.error("[dura] Root error boundary caught:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[var(--color-bg-primary)] p-8 text-center">
      <p className="font-mono text-sm tracking-widest text-rose-500 uppercase">Error</p>
      <h1 className="text-3xl font-semibold text-[var(--color-text-primary)]">
        Something went wrong
      </h1>
      <p className="max-w-md text-[var(--color-text-secondary)]">
        We hit an unexpected error. Your progress is safe — everything is stored locally on your
        device.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="rounded-lg bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-emerald-600"
        >
          Try again
        </button>
        <Link
          href="/dashboard"
          className="rounded-lg border border-[var(--color-border)] px-6 py-3 text-sm font-semibold text-[var(--color-text-secondary)] transition hover:bg-[var(--color-bg-surface)]"
        >
          Back to Dashboard
        </Link>
      </div>
      <p className="mt-6 text-xs text-[var(--color-text-muted)]">
        If this keeps happening,{" "}
        <Link href="/settings" className="text-emerald-500 hover:underline">
          export your data from Settings
        </Link>{" "}
        as a backup.
      </p>
      <p className="mt-4 font-mono text-[10px] text-[var(--color-text-muted)]">DURA</p>
    </div>
  );
}
