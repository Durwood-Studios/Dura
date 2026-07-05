import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { SupportTip } from "@/components/support/SupportTip";
import { isTippingEnabled } from "@/lib/payments/stripe";

export const metadata: Metadata = {
  title: "Support the developer — DURA",
  description:
    "DURA is free forever. If it helped you, a voluntary tip supports continued development. It unlocks nothing — the whole platform is already open and free.",
};

export default async function SupportPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}): Promise<React.ReactElement> {
  const { status } = await searchParams;
  const tippingEnabled = isTippingEnabled();

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

      {tippingEnabled ? (
        <SupportTip />
      ) : (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 text-center text-sm text-[var(--color-text-secondary)]">
          Tipping isn’t enabled on this deployment. The best free way to help:{" "}
          <a
            href="https://github.com/Durwood-Studios/Dura"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-accent)] hover:underline"
          >
            star the repo
          </a>{" "}
          or share DURA with someone learning.
        </div>
      )}

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
