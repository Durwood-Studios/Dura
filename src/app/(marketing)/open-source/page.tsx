import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, GitBranch, Heart, Scale } from "lucide-react";
import { buildMetadata } from "@/lib/og";

export const metadata: Metadata = buildMetadata({
  title: "Open Source",
  description:
    "DURA is AGPLv3 licensed. The source stays open. The core is free forever. Contribute, fork, self-host — the only thing you can't do is take it closed.",
  path: "/open-source",
});

const GITHUB_URL = "https://github.com/Durwood-Studios/Dura";

export default function OpenSourcePage(): React.ReactElement {
  return (
    <main className="mx-auto max-w-[760px] px-6 py-16">
      <header className="mb-12">
        <p className="font-mono text-xs tracking-widest text-[var(--color-text-muted)] uppercase">
          Open Source
        </p>
        <h1 className="mt-2 text-4xl font-semibold text-[var(--color-text-primary)] sm:text-5xl">
          Built in the open. Free forever. By design.
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-[var(--color-text-secondary)]">
          DURA&apos;s entire source — platform, content, and APIs — lives on GitHub under licenses
          chosen so the core can never be taken away.
        </p>
      </header>

      {/* License cards */}
      <section className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <LicenseCard
          title="AGPLv3"
          scope="Core platform"
          body="The lesson engine, reader, sandboxes, review system, and dictionary are all AGPLv3. Use it, fork it, self-host it, modify it. If you run a modified version as a service, the AGPL asks you to share your changes."
        />
        <LicenseCard
          title="Apache 2.0"
          scope="APIs and integrations"
          body="The public API (dictionary, phases, verification) and integration libraries are Apache 2.0. Build on them without friction, commercial or otherwise."
        />
      </section>

      {/* Why AGPL */}
      <section className="mb-12">
        <h2 className="mb-3 text-2xl font-semibold text-[var(--color-text-primary)]">
          Why AGPL, not MIT
        </h2>
        <p className="mb-4 leading-[1.9] text-[var(--color-text-primary)]">
          MIT is a wonderful license for libraries. It&apos;s the wrong license for a learning
          platform whose value proposition is staying free forever.
        </p>
        <p className="mb-4 leading-[1.9] text-[var(--color-text-primary)]">
          Under AGPL, anyone can take DURA, make it better, and run their own version — but they
          have to share what they change. Nobody gets to fork it, put it behind a paywall, and pull
          up the ladder.
        </p>
        <p className="leading-[1.9] text-[var(--color-text-primary)]">
          That&apos;s the point. The license is the promise.
        </p>
      </section>

      {/* Contributing */}
      <section className="mb-12">
        <h2 className="mb-3 text-2xl font-semibold text-[var(--color-text-primary)]">
          How to contribute
        </h2>
        <p className="mb-4 leading-[1.9] text-[var(--color-text-primary)]">
          DURA welcomes contributions of every size — from a typo fix to a whole new dictionary
          term.
        </p>
        <ul className="mb-4 ml-6 list-disc space-y-2 leading-[1.9] text-[var(--color-text-primary)]">
          <li>
            <strong>Content</strong>: add or improve a lesson, dictionary term, or assessment
            question. Every MDX file lives under{" "}
            <code className="rounded bg-[var(--color-bg-subtle)] px-1 py-0.5 font-mono text-sm">
              src/content/
            </code>{" "}
            and follows a documented frontmatter schema.
          </li>
          <li>
            <strong>Code</strong>: pick up a{" "}
            <code className="rounded bg-[var(--color-bg-subtle)] px-1 py-0.5 font-mono text-sm">
              good-first-issue
            </code>{" "}
            label on GitHub. The repo runs ESLint, TypeScript strict, and a pre-commit hook so CI
            catches mistakes before you do.
          </li>
          <li>
            <strong>Translations</strong>: DURA is English-first. If you want to lead a localization
            effort (Spanish, Portuguese, Japanese, or your language), open an issue.
          </li>
          <li>
            <strong>Reviews and bug reports</strong>: read a lesson, spot something wrong, open an
            issue. That&apos;s a contribution.
          </li>
        </ul>
      </section>

      {/* Architecture snapshot */}
      <section className="mb-12 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6">
        <h2 className="mb-3 text-xl font-semibold text-[var(--color-text-primary)]">
          Architecture at a glance
        </h2>
        <ul className="flex flex-col gap-1.5 text-sm leading-[1.8] text-[var(--color-text-secondary)]">
          <li>
            <strong>Next.js 15</strong> App Router, React Server Components, static generation for
            lessons and dictionary terms
          </li>
          <li>
            <strong>TypeScript strict</strong> throughout, zero <code>any</code>
          </li>
          <li>
            <strong>Tailwind v4</strong> with CSS variable tokens for theming
          </li>
          <li>
            <strong>IndexedDB via idb</strong> — every byte of user progress lives locally; nothing
            sent to any server
          </li>
          <li>
            <strong>FSRS-5</strong> spaced repetition, implemented from scratch (no external dep)
          </li>
          <li>
            <strong>Sandpack</strong> for in-browser code execution, lazy-loaded so the initial
            bundle stays small
          </li>
          <li>
            <strong>Zustand</strong> for cross-component state, no Redux/MobX
          </li>
          <li>
            <strong>Privacy-first analytics</strong> — events queued to IndexedDB, no cookies, no
            third parties
          </li>
        </ul>
      </section>

      {/* Roadmap snapshot */}
      <section className="mb-12">
        <h2 className="mb-3 text-2xl font-semibold text-[var(--color-text-primary)]">
          Where we are on the roadmap
        </h2>
        <ol className="ml-6 list-decimal space-y-1 text-sm leading-[1.8] text-[var(--color-text-secondary)]">
          <li>
            Infrastructure · routes, IDB, API, theme · <strong>shipped</strong>
          </li>
          <li>
            Lesson pipeline · MDX, reader, interactive components · <strong>shipped</strong>
          </li>
          <li>
            Review, sandbox, dictionary · <strong>shipped</strong>
          </li>
          <li>
            Assessments, mastery gates, certificates · <strong>shipped</strong>
          </li>
          <li>
            Goals, gamification, study modes · <strong>shipped</strong>
          </li>
          <li>
            Marketing pages, TipButton · <strong>in progress</strong>
          </li>
          <li>Teacher dashboard and export engine · next</li>
          <li>Content sprint — all 406 lessons and 500 dictionary terms · after</li>
          <li>Polish, PWA, accessibility audit, launch · last</li>
        </ol>
      </section>

      {/* Contributors placeholder */}
      <section className="mb-12">
        <h2 className="mb-3 text-2xl font-semibold text-[var(--color-text-primary)]">
          Contributors
        </h2>
        <p className="mb-4 leading-[1.9] text-[var(--color-text-primary)]">
          DURA is new. The contributors wall is waiting for its first entry. Yours could be it.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)]">
            <Heart className="h-3 w-3 text-rose-500" aria-hidden />
            Dustin Snellings · founder
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-dashed border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-muted)]">
            Your name here
          </span>
        </div>
      </section>

      {/* GitHub CTA */}
      <section>
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 text-center">
          <h2 className="text-2xl font-semibold text-[var(--color-text-primary)]">
            Read the source
          </h2>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            Everything that powers DURA is a git clone away.
          </p>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--color-text-primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            <ExternalLink className="h-4 w-4" />
            github.com/Durwood-Studios/Dura
          </a>
          <div className="mt-3 flex items-center justify-center gap-3 text-xs text-[var(--color-text-muted)]">
            <Link href="/how-it-works" className="hover:text-emerald-600">
              How it works
            </Link>
            <span aria-hidden>·</span>
            <Link href="/about" className="hover:text-emerald-600">
              About
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function LicenseCard({
  title,
  scope,
  body,
}: {
  title: string;
  scope: string;
  body: string;
}): React.ReactElement {
  return (
    <article className="flex flex-col gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5 shadow-sm">
      <header className="flex items-center gap-2">
        {title === "AGPLv3" ? (
          <Scale className="h-4 w-4 text-emerald-600" aria-hidden />
        ) : (
          <GitBranch className="h-4 w-4 text-cyan-600" aria-hidden />
        )}
        <span className="font-mono text-xs font-semibold text-[var(--color-text-primary)]">
          {title}
        </span>
      </header>
      <p className="font-mono text-[10px] tracking-widest text-[var(--color-text-muted)] uppercase">
        {scope}
      </p>
      <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">{body}</p>
    </article>
  );
}
