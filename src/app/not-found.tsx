import Link from "next/link";

export default function NotFound(): React.ReactElement {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[var(--color-bg-primary)] p-8 text-center">
      <p className="font-mono text-sm tracking-widest text-emerald-600 uppercase">404</p>
      <h1 className="text-3xl font-semibold text-[var(--color-text-primary)]">Page not found</h1>
      <p className="max-w-md text-[var(--color-text-secondary)]">
        The page you&apos;re looking for doesn&apos;t exist or has moved. But you&apos;re here, and
        that&apos;s what matters.
      </p>
      <div className="flex gap-3">
        <Link
          href="/dashboard"
          className="rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600"
        >
          Back to Dashboard
        </Link>
        <Link
          href="/paths"
          className="rounded-lg border border-[var(--color-border)] px-5 py-2.5 text-sm font-semibold text-[var(--color-text-secondary)] transition hover:bg-[var(--color-bg-surface)]"
        >
          Browse Curriculum
        </Link>
      </div>
      <p className="mt-8 font-mono text-[10px] text-[var(--color-text-muted)]">DURA</p>
    </div>
  );
}
