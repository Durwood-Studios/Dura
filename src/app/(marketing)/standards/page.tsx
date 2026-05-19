import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { aggregateStandards, type BodyCoverage } from "@/lib/standards-aggregate";

export const metadata: Metadata = {
  title: "Standards — DURA",
  description:
    "Every DURA lesson and module is mapped to a real, named education standard — ACM CS2023, SWEBOK v4, SFIA 9, Bloom's Taxonomy, the Dreyfus Model, CSTA K-12, AP Computer Science, ISTE, WCAG 2.2, OWASP Top 10, IEEE 7000 ethics, and NIST NICE. This page lists every code DURA covers and which modules teach it.",
};

export default async function StandardsIndexPage(): Promise<React.ReactElement> {
  const coverage = await aggregateStandards();
  const totalCodes = coverage.reduce((sum, c) => sum + c.codeCount, 0);
  const totalBodies = coverage.length;

  return (
    <main className="mx-auto max-w-[960px] px-6 py-16">
      <header className="mb-12">
        <p className="mb-2 font-mono text-xs tracking-wide text-[var(--color-text-muted)] uppercase">
          Curriculum alignment
        </p>
        <h1 className="mb-4 text-4xl font-semibold text-[var(--color-text-primary)] sm:text-5xl">
          The only standards-traceable open curriculum
        </h1>
        <p className="max-w-[640px] text-lg text-[var(--color-text-secondary)]">
          Every DURA lesson and module is mapped to a real, named education standard. Not
          &ldquo;inspired by&rdquo; — explicitly tagged in lesson frontmatter and module metadata,
          and surfaced in the chip strip on every lesson page. This is the index:{" "}
          <strong>{totalBodies} standards bodies</strong>,{" "}
          <strong>{totalCodes} distinct codes</strong>, with the exact modules that teach each one.
        </p>
      </header>

      <nav
        aria-label="Standards bodies"
        className="mb-12 flex flex-wrap gap-2 border-y border-[var(--color-border)] py-4"
      >
        {coverage.map(({ body, moduleCount, codeCount }) => (
          <a
            key={body.id}
            href={`#${body.id}`}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-3 py-1 text-xs font-medium text-[var(--color-text-secondary)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
          >
            <span className="font-semibold">{body.short}</span>
            <span className="text-[var(--color-text-muted)]">
              {codeCount} codes · {moduleCount} modules
            </span>
          </a>
        ))}
      </nav>

      <div className="flex flex-col gap-16">
        {coverage.map((c) => (
          <StandardsBodySection key={c.body.id} coverage={c} />
        ))}
      </div>

      <footer className="mt-20 border-t border-[var(--color-border)] pt-8 text-sm text-[var(--color-text-secondary)]">
        <p>
          Standards mapping is part of DURA&rsquo;s source of truth, not marketing copy.
          Lesson-level codes live in MDX frontmatter at{" "}
          <code className="rounded bg-[var(--color-bg-subtle)] px-1.5 py-0.5 font-mono text-xs">
            src/content/phases/**
          </code>
          ; module-level codes live in{" "}
          <code className="rounded bg-[var(--color-bg-subtle)] px-1.5 py-0.5 font-mono text-xs">
            src/content/standards-map.ts
          </code>
          . The chip strip on every lesson page renders directly from this data, and so does this
          index.
        </p>
        <p className="mt-3">
          To audit or contribute corrections, visit the repo at{" "}
          <a
            href="https://github.com/Durwood-Studios/Dura"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-accent)] hover:underline"
          >
            github.com/Durwood-Studios/Dura
          </a>
          .
        </p>
      </footer>
    </main>
  );
}

function StandardsBodySection({ coverage }: { coverage: BodyCoverage }): React.ReactElement {
  const { body, codes, codeCount, moduleCount } = coverage;
  return (
    <section id={body.id} className="scroll-mt-20">
      <header className="mb-4 flex flex-wrap items-baseline justify-between gap-3 border-b border-[var(--color-border)] pb-3">
        <div>
          <h2 className="text-2xl font-semibold text-[var(--color-text-primary)]">
            <span className="font-mono text-[var(--color-accent)]">{body.short}</span>{" "}
            <span className="text-[var(--color-text-primary)]">— {body.full}</span>
          </h2>
        </div>
        <a
          href={body.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm font-medium text-[var(--color-accent)] hover:underline"
        >
          Official spec
          <ExternalLink className="h-3 w-3" />
        </a>
      </header>

      <p className="mb-4 text-sm leading-relaxed text-[var(--color-text-secondary)]">
        {body.description}
      </p>

      <p className="mb-6 text-xs font-medium tracking-wide text-[var(--color-text-muted)] uppercase">
        DURA covers {codeCount} {codeCount === 1 ? "code" : "codes"} across {moduleCount}{" "}
        {moduleCount === 1 ? "module" : "modules"}
      </p>

      <ul className="flex flex-col gap-3">
        {codes.map(({ code, modules }) => (
          <li
            key={code}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4"
          >
            <p className="mb-2 font-mono text-sm font-semibold text-[var(--color-text-primary)]">
              {code}
            </p>
            <ul className="flex flex-wrap gap-1.5">
              {modules.map((m) => (
                <li key={`${m.phaseId}/${m.moduleId}`}>
                  <Link
                    href={`/paths/${m.phaseId}/${m.moduleId}`}
                    className="inline-flex items-center gap-1.5 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-2 py-0.5 text-xs text-[var(--color-text-secondary)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                  >
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ backgroundColor: m.phaseColor }}
                      aria-hidden
                    />
                    {m.moduleTitle}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  );
}
