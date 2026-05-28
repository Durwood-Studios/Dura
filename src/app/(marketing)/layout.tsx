import Link from "next/link";
import { UpdateAvailable } from "@/components/pwa/UpdateAvailable";
import { Footer } from "@/components/splash/Footer";

/**
 * Marketing group layout — a minimal header, no app chrome. Used for
 * /about, /how-it-works, /open-source, /discover, /standards, /privacy,
 * /terms, /install. Kept deliberately light: these are read-once pages,
 * not the learning surface.
 *
 * The Footer is the shared splash Footer so home and marketing pages
 * render identical chrome — previously the marketing layout had its
 * own sparse inline footer (with "Dashboard" as one of five links)
 * which produced a jarring inconsistency between / and /about etc.
 *
 * The UpdateAvailable pill rides into the header here too. Web-only
 * visitors (no PWA install) need a way to accept service-worker
 * updates; without this mount they'd be held on the cached version
 * indefinitely.
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
            <Link href="/standards" className="hover:text-emerald-700">
              Standards
            </Link>
            <Link href="/about" className="hover:text-emerald-700">
              About
            </Link>
            <Link href="/open-source" className="hover:text-emerald-700">
              Open source
            </Link>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <UpdateAvailable />
            <Link
              href="/paths/0/0-1/01"
              className="inline-flex items-center gap-1 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-600"
            >
              Start learning
            </Link>
          </div>
        </nav>
      </header>

      <div className="flex-1">{children}</div>

      <Footer />
    </div>
  );
}
