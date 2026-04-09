import Link from "next/link";

/**
 * Marketing group layout — a minimal header, plain footer, and no app
 * chrome. Used for /about, /how-it-works, /open-source (and eventually
 * /howto and /tutorials). Kept deliberately light: these are read-once
 * pages, not the learning surface.
 */
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
      <header className="sticky top-0 z-30 border-b border-[var(--color-border)] bg-[var(--color-bg-primary)]/80 backdrop-blur-xl">
        <nav className="mx-auto flex h-14 max-w-[960px] items-center gap-6 px-6">
          <Link href="/" className="text-lg font-semibold text-[var(--color-text-primary)]">
            DURA
          </Link>
          <div className="hidden items-center gap-5 text-sm text-[var(--color-text-secondary)] sm:flex">
            <Link href="/how-it-works" className="hover:text-emerald-700">
              How it works
            </Link>
            <Link href="/about" className="hover:text-emerald-700">
              About
            </Link>
            <Link href="/open-source" className="hover:text-emerald-700">
              Open source
            </Link>
          </div>
          <Link
            href="/paths/0/0-1/01"
            className="ml-auto inline-flex items-center gap-1 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-600"
          >
            Start learning
          </Link>
        </nav>
      </header>

      <div className="flex-1">{children}</div>

      <footer className="border-t border-[var(--color-border)] bg-[var(--color-bg-surface)]">
        <div className="mx-auto flex max-w-[960px] flex-col gap-4 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">DURA</p>
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
              Durwood Studios LLC · AGPLv3 · Free forever
            </p>
          </div>
          <nav className="flex flex-wrap gap-4 text-xs text-[var(--color-text-secondary)]">
            <Link href="/about" className="hover:text-emerald-700">
              About
            </Link>
            <Link href="/how-it-works" className="hover:text-emerald-700">
              How it works
            </Link>
            <Link href="/open-source" className="hover:text-emerald-700">
              Open source
            </Link>
            <a
              href="https://github.com/Durwood-Studios/Dura"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-700"
            >
              GitHub
            </a>
            <Link href="/dashboard" className="hover:text-emerald-700">
              Dashboard
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
