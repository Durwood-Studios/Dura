import Link from "next/link";

export default function NotFound(): React.ReactElement {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[var(--color-bg-primary)] p-8 text-center">
      <p className="font-mono text-sm tracking-widest text-emerald-600 uppercase">404</p>
      <h1 className="text-3xl font-semibold text-[var(--color-text-primary)]">
        Wrong path. Right spirit.
      </h1>
      <p className="max-w-md text-[var(--color-text-secondary)]">
        This page doesn&apos;t exist, but your curiosity is exactly what DURA is built for.
      </p>
      <div className="flex flex-col items-center gap-2">
        <p className="text-sm font-medium text-[var(--color-text-muted)]">
          Try one of these instead:
        </p>
        <div className="flex gap-3">
          <Link
            href="/paths"
            className="rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600"
          >
            Learning Paths
          </Link>
          <Link
            href="/dictionary"
            className="rounded-lg border border-[var(--color-border)] px-5 py-2.5 text-sm font-semibold text-[var(--color-text-secondary)] transition hover:bg-[var(--color-bg-surface)]"
          >
            Dictionary
          </Link>
          <Link
            href="/tutorials"
            className="rounded-lg border border-[var(--color-border)] px-5 py-2.5 text-sm font-semibold text-[var(--color-text-secondary)] transition hover:bg-[var(--color-bg-surface)]"
          >
            Tutorials
          </Link>
        </div>
      </div>
      <p className="mt-8 font-mono text-[10px] text-[var(--color-text-muted)]">DURA</p>
    </div>
  );
}
