import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { JudgmentCaseClient } from "@/components/judgment/JudgmentCaseClient";
import { JUDGMENT_CASES, JUDGMENT_RUBRICS, JUDGMENT_SOURCES } from "@/lib/judgment/cases";

export function generateStaticParams(): { id: string }[] {
  return JUDGMENT_CASES.map((scenario) => ({ id: scenario.id }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `${JUDGMENT_CASES.find((scenario) => scenario.id === id)?.title ?? "Case not found"} — Engineering judgment`,
  };
}
/** Server-rendered evidence remains readable while the local practice journal initializes. */
export default async function JudgmentCasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactElement> {
  const { id } = await params;
  const scenario = JUDGMENT_CASES.find((entry) => entry.id === id);
  if (!scenario) notFound();
  return (
    <main className="mx-auto max-w-[760px] px-4 py-10 sm:px-6">
      <Link href="/judgment" className="inline-block min-h-12 py-3 text-sm underline">
        Engineering judgment cases
      </Link>
      <p className="text-sm text-[var(--color-text-secondary)]">
        {scenario.domain} · {scenario.difficulty} · version {scenario.version}
      </p>
      <h1 className="mt-2 text-3xl font-semibold">{scenario.title}</h1>
      <p className="mt-5 leading-relaxed whitespace-pre-wrap">{scenario.brief}</p>
      <section className="mt-6">
        <h2 className="text-xl font-semibold">Before you begin</h2>
        <ul className="mt-2 list-disc space-y-2 pl-5">
          {scenario.prerequisites.map((prerequisite) => (
            <li key={prerequisite.href}>
              <Link className="underline" href={prerequisite.href}>
                {prerequisite.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <section className="mt-6">
        <h2 className="text-xl font-semibold">Constraints</h2>
        <ul className="mt-2 list-disc space-y-2 pl-5">
          {scenario.constraints.map((constraint) => (
            <li key={constraint}>{constraint}</li>
          ))}
        </ul>
      </section>
      <section className="mt-6">
        <h2 className="text-xl font-semibold">Evidence available now</h2>
        <dl className="mt-3 space-y-4">
          {scenario.evidence.map((evidence) => (
            <div key={evidence.id} className="rounded-lg border border-[var(--color-border)] p-4">
              <dt className="font-semibold">
                {evidence.id}: {evidence.label}{" "}
                <span className="text-sm font-normal">({evidence.kind})</span>
              </dt>
              <dd className="mt-2 text-sm whitespace-pre-wrap">{evidence.detail}</dd>
            </div>
          ))}
        </dl>
      </section>
      <section className="mt-6">
        <h2 className="text-xl font-semibold">Relevant sources and their limits</h2>
        <ul className="mt-3 space-y-4">
          {scenario.standards.map((standard) => {
            const source = JUDGMENT_SOURCES.find((entry) => entry.id === standard.sourceId);
            return (
              <li key={standard.sourceId} className="text-sm">
                <a
                  href={source?.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold underline"
                >
                  {source?.title ?? standard.sourceId}
                </a>
                <p className="mt-1">{standard.application}</p>
                <p className="mt-1 text-[var(--color-text-secondary)]">{source?.scope}</p>
              </li>
            );
          })}
        </ul>
      </section>
      <JudgmentCaseClient
        key={`${scenario.id}:${scenario.version}`}
        scenario={scenario}
        rubrics={JUDGMENT_RUBRICS}
        sources={JUDGMENT_SOURCES}
      />
    </main>
  );
}
