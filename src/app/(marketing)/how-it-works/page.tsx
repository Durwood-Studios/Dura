import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Wrench, ShieldCheck } from "lucide-react";
import { buildMetadata } from "@/lib/og";
import { AITransparencyDisclosure } from "@/components/about/AITransparencyDisclosure";

export const metadata: Metadata = buildMetadata({
  title: "How it works",
  description:
    "Read, practice, verify. DURA uses mastery gates, spaced repetition, and standards-backed assessments to turn knowledge into skill.",
  path: "/how-it-works",
});

export default function HowItWorksPage(): React.ReactElement {
  return (
    <main className="mx-auto max-w-[760px] px-6 py-16">
      <header className="mb-12">
        <p className="font-mono text-xs tracking-widest text-[var(--color-text-muted)] uppercase">
          How it works
        </p>
        <h1 className="mt-2 text-4xl font-semibold text-[var(--color-text-primary)] sm:text-5xl">
          Read. Practice. Verify.
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-[var(--color-text-secondary)]">
          Three steps, repeated thousands of times, from your first byte to your first board
          meeting. No theatrics. No shortcuts. Just a loop that compounds.
        </p>
      </header>

      {/* Three-step loop */}
      <section className="mb-12 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Step
          number="1"
          icon={<BookOpen className="h-5 w-5 text-emerald-600" aria-hidden />}
          title="Read"
          body="5–8 minute lessons. Short paragraphs. Runnable code. Every concept explained why-before-how. No filler."
        />
        <Step
          number="2"
          icon={<Wrench className="h-5 w-5 text-emerald-600" aria-hidden />}
          title="Practice"
          body="An interaction every 2–3 minutes: quizzes, fill-in-the-blank, drag-to-solve, live sandbox exercises. You don't read alone — you do."
        />
        <Step
          number="3"
          icon={<ShieldCheck className="h-5 w-5 text-emerald-600" aria-hidden />}
          title="Verify"
          body="80% on the module assessment to advance. A timed phase test at the end. Pass and you earn a verifiable certificate with a public URL."
        />
      </section>

      {/* Mastery gates */}
      <section className="mb-12">
        <h2 className="mb-3 text-2xl font-semibold text-[var(--color-text-primary)]">
          Mastery, not just completion
        </h2>
        <p className="mb-4 leading-[1.9] text-[var(--color-text-primary)]">
          Most learning platforms track what you <em>watched</em>. DURA tracks what you can{" "}
          <em>do</em>.
        </p>
        <p className="mb-4 leading-[1.9] text-[var(--color-text-primary)]">
          After every module, you take a <strong>mastery gate</strong>: 10–15 randomized questions
          drawn from that module&apos;s pool. Score 80% or higher and the next module unlocks. Fail
          and the assessment cools down for 24 hours, then you try again with different questions.
        </p>
        <p className="leading-[1.9] text-[var(--color-text-primary)]">
          At the end of each phase, a longer verification test confirms your grasp of the whole
          phase. Passing generates a tamper-resistant certificate with a public verification URL you
          can share on LinkedIn, in a resume, or with a hiring manager.
        </p>
      </section>

      {/* Spaced repetition */}
      <section className="mb-12">
        <h2 className="mb-3 text-2xl font-semibold text-[var(--color-text-primary)]">
          Remembering, not cramming
        </h2>
        <p className="mb-4 leading-[1.9] text-[var(--color-text-primary)]">
          Every vocabulary term and missed quiz question becomes a flashcard. DURA uses{" "}
          <strong>FSRS-5</strong>, the same spaced-repetition algorithm Anki power users swear by,
          to decide when to show each card next.
        </p>
        <p className="leading-[1.9] text-[var(--color-text-primary)]">
          The goal is 90% retention. You see a card right before you would have forgotten it — not a
          day later, not a week earlier. The algorithm learns your rhythm.
        </p>
      </section>

      {/* AI transparency — EU AI Act Art. 13/14 */}
      <section className="mb-12">
        <AITransparencyDisclosure />
      </section>

      {/* Standards */}
      <section className="mb-12 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6">
        <h2 className="mb-3 text-xl font-semibold text-[var(--color-text-primary)]">
          Backed by the standards universities use
        </h2>
        <p className="mb-2 text-sm leading-[1.8] text-[var(--color-text-secondary)]">
          Every lesson is tagged with the exact knowledge unit it teaches:
        </p>
        <ul className="ml-6 list-disc space-y-1 text-sm leading-[1.8] text-[var(--color-text-secondary)]">
          <li>
            <strong>ACM CS2023</strong> — the computing curriculum used by accredited CS programs
          </li>
          <li>
            <strong>SWEBOK v4</strong> — the IEEE software engineering body of knowledge
          </li>
          <li>
            <strong>SFIA 9</strong> — the skills framework used by governments and enterprise HR
          </li>
          <li>
            <strong>Bloom&apos;s taxonomy</strong> and <strong>Dreyfus stages</strong> per question
            and lesson
          </li>
        </ul>
      </section>

      {/* Offline-first */}
      <section className="mb-12">
        <h2 className="mb-3 text-2xl font-semibold text-[var(--color-text-primary)]">
          Yours on every device, online or not
        </h2>
        <p className="mb-4 leading-[1.9] text-[var(--color-text-primary)]">
          DURA is a Progressive Web App. First visit loads the shell; after that it runs offline.
          Your progress, flashcards, goals, and certificates live in your browser&apos;s IndexedDB —
          never on a remote server you don&apos;t control.
        </p>
        <p className="leading-[1.9] text-[var(--color-text-primary)]">
          You can export every byte of it as JSON from the settings page. That&apos;s not a GDPR
          afterthought — it&apos;s the point. Your learning is yours.
        </p>
      </section>

      {/* CTA */}
      <section>
        <div className="rounded-2xl border border-emerald-200 bg-[var(--color-bg-accent)] p-6 text-center">
          <h2 className="text-2xl font-semibold text-[var(--color-text-primary)]">
            Start your first lesson
          </h2>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            Binary · 8 minutes · The language machines actually speak
          </p>
          <Link
            href="/paths/0/0-1/01"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600"
          >
            Begin Phase 0
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}

function Step({
  number,
  icon,
  title,
  body,
}: {
  number: string;
  icon: React.ReactNode;
  title: string;
  body: string;
}): React.ReactElement {
  return (
    <article className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 font-mono text-xs font-semibold text-emerald-700">
          {number}
        </span>
        {icon}
      </div>
      <h3 className="mt-3 font-semibold text-[var(--color-text-primary)]">{title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-secondary)]">{body}</p>
    </article>
  );
}
