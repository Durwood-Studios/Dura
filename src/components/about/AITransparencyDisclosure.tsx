/**
 * EU AI Act Art. 13/14 — AI Transparency Disclosure (P5-B).
 *
 * Surfaces the fact that DURA's lesson sequencing and review-interval
 * decisions are made by an algorithm (FSRS-5), explains what data the
 * algorithm processes, and points at the manual-study override path that
 * satisfies Art. 14's human-oversight requirement.
 *
 * Mounted in:
 *   - Settings (always-visible card)
 *   - /how-it-works (marketing page)
 *
 * Copy is intentionally plain-language per Art. 13's "in a clear and
 * comprehensible manner" requirement. Do not paraphrase without legal
 * review — the wording maps to the standard's transparency taxonomy.
 */

import Link from "next/link";
import { Cpu, Eye, ShieldCheck } from "lucide-react";

interface AITransparencyDisclosureProps {
  /** When `compact`, omit the heading + outer card and render a slimmer
   *  body. Useful inside Settings rows. Default: `full`. */
  variant?: "full" | "compact";
}

export function AITransparencyDisclosure({
  variant = "full",
}: AITransparencyDisclosureProps): React.ReactElement {
  const Body = (
    <>
      <p className="leading-relaxed text-[var(--color-text-primary)]">
        DURA uses an AI scheduling algorithm called <strong>FSRS-5</strong> to personalize when each
        flashcard becomes due for review and to decide when new content unlocks based on your
        demonstrated mastery.
      </p>
      <ul className="mt-4 flex flex-col gap-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">
        <li className="flex items-start gap-2">
          <Cpu className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
          <span>
            <strong className="text-[var(--color-text-primary)]">What it does:</strong> picks
            intervals between reviews and reorders due cards. It does not write content, choose your
            career path for you, or judge you.
          </span>
        </li>
        <li className="flex items-start gap-2">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
          <span>
            <strong className="text-[var(--color-text-primary)]">What it processes:</strong> only
            your local study history (review timestamps, ratings, FSRS state). It does not call any
            external AI service. Your data does not leave your browser unless you sign in to sync,
            and even then only the same study history fields are sent over TLS.
          </span>
        </li>
        <li className="flex items-start gap-2">
          <Eye className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
          <span>
            <strong className="text-[var(--color-text-primary)]">How to override it:</strong> the
            scheduler is advisory — you are never blocked from any card. Open{" "}
            <Link href="/review" className="underline">
              Review
            </Link>{" "}
            from your dashboard to study any due card immediately, regardless of when FSRS would
            have surfaced it next. You can also change study modes (Standard / Review / Sprint /
            Challenge) from Settings.
          </span>
        </li>
      </ul>
      <p className="mt-4 text-sm text-[var(--color-text-secondary)]">
        This disclosure satisfies the EU AI Act Article 13 transparency requirement; the override
        path satisfies Article 14&apos;s human-oversight provision. Read more about{" "}
        <Link href="/how-it-works" className="underline">
          how DURA makes decisions
        </Link>{" "}
        or{" "}
        <Link href="/privacy" className="underline">
          our privacy notice
        </Link>
        .
      </p>
    </>
  );

  if (variant === "compact") {
    return <div className="text-sm">{Body}</div>;
  }

  return (
    <section
      aria-labelledby="ai-disclosure-title"
      className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6"
    >
      <header className="mb-3 flex items-center gap-2">
        <Cpu className="h-5 w-5 text-emerald-600" aria-hidden />
        <h2
          id="ai-disclosure-title"
          className="text-xl font-semibold text-[var(--color-text-primary)]"
        >
          About DURA&apos;s AI scheduler
        </h2>
      </header>
      {Body}
    </section>
  );
}
