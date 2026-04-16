import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Shield, BookOpen, Code2 } from "lucide-react";
import { buildMetadata } from "@/lib/og";
import { TipButton } from "@/components/support/TipButton";

export const metadata: Metadata = buildMetadata({
  title: "About",
  description:
    "DURA is an open-source learning platform that takes anyone from absolute zero to engineering leadership through mastery-gated, standards-backed education.",
  path: "/about",
});

export default function AboutPage(): React.ReactElement {
  return (
    <main className="mx-auto max-w-[720px] px-6 py-16">
      <header className="mb-12">
        <p className="font-mono text-xs tracking-widest text-[var(--color-text-muted)] uppercase">
          About
        </p>
        <h1 className="mt-2 text-4xl font-semibold text-[var(--color-text-primary)] sm:text-5xl">
          Engineering education, hardened by design.
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-[var(--color-text-secondary)]">
          DURA takes anyone from absolute zero toward engineering leadership. No shortcuts. No
          promises. Just the means — verified through hardened skills testing — for those willing to
          do the work.
        </p>
      </header>

      <section className="mb-12">
        <h2 className="mb-3 text-2xl font-semibold text-[var(--color-text-primary)]">
          Why DURA exists
        </h2>
        <p className="mb-4 leading-[1.9] text-[var(--color-text-primary)]">
          Programming education has a problem. Courses sell completion. Bootcamps sell vibes.
          Tutorials sell novelty. Almost nothing sells mastery.
        </p>
        <p className="mb-4 leading-[1.9] text-[var(--color-text-primary)]">
          DURA is the result of asking a different question: if we dropped the marketing and built
          exactly what a person would need to actually reach senior engineer — and then verified it
          at every step — what would that look like?
        </p>
        <p className="leading-[1.9] text-[var(--color-text-primary)]">
          The answer is 10 phases, 52 modules, 406 lessons, and hardened assessments between every
          step. Built by one person in the open, because that&apos;s the only way to keep it honest.
        </p>
      </section>

      <section className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Pillar
          icon={<BookOpen className="h-5 w-5 text-emerald-600" aria-hidden />}
          title="Reading-first"
          body="No videos, no bloat. Every lesson works on any connection and every device. Offline after first load."
        />
        <Pillar
          icon={<Shield className="h-5 w-5 text-emerald-600" aria-hidden />}
          title="Mastery-gated"
          body="You advance when you prove it — not when time passes. 80% on the module assessment. Verification at every phase."
        />
        <Pillar
          icon={<Code2 className="h-5 w-5 text-emerald-600" aria-hidden />}
          title="Free forever"
          body="AGPLv3 licensed. The source stays open. No feature gates. No paywalls. No upgrade pressure. Ever."
        />
      </section>

      <section className="mb-12">
        <h2 className="mb-3 text-2xl font-semibold text-[var(--color-text-primary)]">
          Built on real standards
        </h2>
        <p className="mb-4 leading-[1.9] text-[var(--color-text-primary)]">
          Every lesson in DURA maps to a specific knowledge unit in one or more of these frameworks:
        </p>
        <ul className="mb-4 ml-6 list-disc space-y-2 leading-[1.9] text-[var(--color-text-primary)]">
          <li>
            <strong>ACM CS2023</strong> — the computing curriculum standard used by most accredited
            CS programs.
          </li>
          <li>
            <strong>SWEBOK v4</strong> — the IEEE&apos;s Software Engineering Body of Knowledge.
          </li>
          <li>
            <strong>SFIA 9</strong> — the Skills Framework for the Information Age, used by
            governments and enterprise HR.
          </li>
        </ul>
        <p className="leading-[1.9] text-[var(--color-text-primary)]">
          Bloom&apos;s taxonomy tags every question. Dreyfus stages tag every lesson. Your
          certificate lists the standards you demonstrated mastery of, by name.
        </p>
      </section>

      <section className="mb-12 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6">
        <h2 className="mb-3 text-xl font-semibold text-[var(--color-text-primary)]">
          Durwood Studios LLC
        </h2>
        <p className="mb-3 text-sm leading-[1.8] text-[var(--color-text-secondary)]">
          DURA is built by <strong>Dustin Snellings</strong> at Durwood Studios, a small independent
          studio focused on software that respects the people who use it. No VC. No ads. No
          tracking. Funded entirely by voluntary tips and (eventually) new products built{" "}
          <em>on top</em> of the open core — never by restricting what already exists.
        </p>
        <p className="text-sm leading-[1.8] text-[var(--color-text-secondary)]">
          If this platform helps your journey, a tip keeps the lights on. If it doesn&apos;t, it
          costs you nothing. That&apos;s the whole deal.
        </p>
        <div className="mt-4">
          <TipButton variant="inline" />
        </div>
      </section>

      <section>
        <div className="rounded-2xl border border-emerald-200 bg-[var(--color-bg-accent)] p-6 text-center">
          <h2 className="text-2xl font-semibold text-[var(--color-text-primary)]">Start Phase 0</h2>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            Digital Literacy · 16 lessons · ~50 hours · Free forever
          </p>
          <Link
            href="/paths/0/0-1/01"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600"
          >
            Open the first lesson
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}

function Pillar({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}): React.ReactElement {
  return (
    <article className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5 shadow-sm">
      {icon}
      <h3 className="mt-3 font-semibold text-[var(--color-text-primary)]">{title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-secondary)]">{body}</p>
    </article>
  );
}
