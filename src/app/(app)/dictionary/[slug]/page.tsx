import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { DICTIONARY } from "@/content/dictionary";
import { getTerm } from "@/lib/dictionary";
import { getPhase } from "@/content/phases";
import { buildMetadata } from "@/lib/og";

type Params = Promise<{ slug: string }>;

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  return DICTIONARY.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const term = getTerm(slug);
  if (!term) return { title: "Term not found — DURA" };
  return buildMetadata({
    title: term.term,
    description: term.definitions.beginner,
    path: `/dictionary/${slug}`,
  });
}

const TIERS = [
  { key: "beginner" as const, label: "Beginner", hint: "Plain English" },
  { key: "intermediate" as const, label: "Intermediate", hint: "Technical" },
  { key: "advanced" as const, label: "Advanced", hint: "Spec-level" },
];

export default async function TermPage({
  params,
}: {
  params: Params;
}): Promise<React.ReactElement> {
  const { slug } = await params;
  const term = getTerm(slug);
  if (!term) notFound();

  const phases = term.phaseIds.map((id) => getPhase(id)).filter(Boolean);

  return (
    <article className="mx-auto max-w-3xl px-6 py-10">
      <Link
        href="/dictionary"
        className="mb-6 inline-flex items-center gap-1 text-sm text-[var(--color-text-secondary)] hover:text-emerald-700"
      >
        <ChevronLeft className="h-4 w-4" />
        Dictionary
      </Link>

      <header className="mb-8">
        <h1 className="font-mono text-4xl font-semibold text-[var(--color-text-primary)]">
          {term.term}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[var(--color-text-muted)]">
          <span className="rounded-full border border-[var(--color-border)] px-2 py-0.5">
            {term.category}
          </span>
          {phases.map(
            (p) =>
              p && (
                <span
                  key={p.id}
                  className="rounded-full px-2 py-0.5"
                  style={{ backgroundColor: `${p.color}33`, color: "#171717" }}
                >
                  Phase {p.id}
                </span>
              )
          )}
          {term.aliases.length > 0 && <span>also: {term.aliases.join(", ")}</span>}
        </div>
      </header>

      <div className="flex flex-col gap-6">
        {TIERS.map((tier) => (
          <section
            key={tier.key}
            className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6"
          >
            <header className="mb-2 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
                {tier.label}
              </h2>
              <span className="text-[10px] text-[var(--color-text-muted)] uppercase">
                {tier.hint}
              </span>
            </header>
            <p className="leading-relaxed text-[var(--color-text-secondary)]">
              {term.definitions[tier.key]}
            </p>
          </section>
        ))}
      </div>

      {term.examples && term.examples.length > 0 && (
        <section className="mt-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6">
          <h2 className="mb-3 text-lg font-semibold text-[var(--color-text-primary)]">Example</h2>
          {term.examples.map((ex, i) => (
            <pre
              key={i}
              className="overflow-x-auto rounded-lg bg-[var(--color-bg-subtle)] p-4 text-sm"
            >
              <code>{ex.code}</code>
            </pre>
          ))}
        </section>
      )}

      {term.seeAlso.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-2 text-sm font-medium text-[var(--color-text-primary)]">See also</h2>
          <div className="flex flex-wrap gap-2">
            {term.seeAlso.map((s) => (
              <Link
                key={s}
                href={`/dictionary/${s}`}
                className="rounded-full border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3 py-1 text-xs font-medium text-[var(--color-text-secondary)] hover:border-emerald-400 hover:text-emerald-700"
              >
                {s}
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
