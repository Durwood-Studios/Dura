import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { TipButton } from "@/components/support/TipButton";

export const metadata: Metadata = {
  title: "Support the developer — DURA",
  description:
    "DURA is free forever. If it helped you, a voluntary tip supports continued development. It unlocks nothing — the whole platform is already open and free.",
};

/**
 * Post-checkout landing page for the tip flow (Stripe redirects here with
 * ?status=thanks|canceled). The TipButton modal is the single money surface;
 * this page just says thank you and re-offers it inline.
 */
export default async function SupportPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}): Promise<React.ReactElement> {
  const { status } = await searchParams;

  return (
    <main className="mx-auto max-w-[560px] px-6 py-16">
      <header className="mb-8 text-center">
        <p className="mb-2 font-mono text-xs tracking-wide text-[var(--color-text-muted)] uppercase">
          Support the developer
        </p>
        <h1 className="mb-4 text-4xl font-semibold text-[var(--color-text-primary)]">
          DURA is free forever
        </h1>
        <p className="text-lg text-[var(--color-text-secondary)]">
          Every lesson, sandbox, flashcard, and certificate is free and open source — and always
          will be. If DURA helped you and you want to chip in, a tip keeps the work going.
        </p>
      </header>

      {status === "thanks" && (
        <div
          role="status"
          className="mb-6 flex items-center gap-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-4 py-3 text-sm text-[var(--color-text-primary)]"
        >
          <CheckCircle2 className="h-5 w-5 shrink-0 text-[var(--color-celebration)]" aria-hidden />
          Thank you — genuinely. Your support means a lot.
        </div>
      )}
      {status === "canceled" && (
        <div
          role="status"
          className="mb-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-4 py-3 text-sm text-[var(--color-text-secondary)]"
        >
          No worries — checkout was canceled and nothing was charged.
        </div>
      )}

      <div className="flex justify-center">
        <TipButton variant="inline" />
      </div>

      <div className="mt-8 space-y-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">
        <p>
          <strong className="text-[var(--color-text-primary)]">A tip unlocks nothing.</strong> There
          is no premium tier, no paywall, and no “supporter-only” content — that is a permanent
          commitment under DURA&rsquo;s AGPLv3 license. You are supporting the work, not buying
          access.
        </p>
        <p>
          Prefer not to pay? Contributing code, reporting bugs, or telling one other person about
          DURA helps just as much.{" "}
          <Link href="/open-source" className="text-[var(--color-accent)] hover:underline">
            See how to contribute
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
