import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Offline — DURA" };

export default function OfflinePage(): React.ReactElement {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mx-auto max-w-md">
        <div className="mb-6 text-5xl">&#x1F4F6;</div>
        <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">
          You&apos;re offline
        </h1>
        <p className="mt-3 leading-relaxed text-[var(--color-text-secondary)]">
          No worries — DURA is built to work without internet. Pages you&apos;ve visited before are
          cached and available right now.
        </p>
        <p className="mt-4 text-sm text-[var(--color-text-muted)]">
          Your progress, flashcards, goals, and settings are all stored locally on your device.
          Nothing is lost.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/review"
            className="inline-flex items-center justify-center rounded-lg border border-[var(--color-border)] px-6 py-2.5 text-sm font-medium text-[var(--color-text-secondary)] transition hover:bg-[var(--color-bg-subtle)]"
          >
            Review Flashcards
          </Link>
        </div>
        <p className="mt-8 text-xs text-[var(--color-text-muted)]">
          When you reconnect, any changes will sync automatically if you have an account.
        </p>
      </div>
    </main>
  );
}
