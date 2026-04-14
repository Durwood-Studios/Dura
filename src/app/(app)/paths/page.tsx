import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PHASES } from "@/content/phases";

export const metadata: Metadata = {
  title: "Learning Paths — DURA",
  description: "Choose your starting phase. 10 phases from digital literacy to CTO readiness.",
};

export default function PathsPage(): React.ReactElement {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="mb-2 text-3xl font-semibold text-[var(--color-text-primary)]">
        Learning Paths
      </h1>
      <p className="mb-8 text-[var(--color-text-secondary)]">
        Pick any phase. Each one builds on the last, but you can jump in wherever you&apos;re ready.
      </p>

      <div className="flex flex-col gap-4">
        {PHASES.map((phase) => (
          <Link
            key={phase.id}
            href={`/paths/${phase.id}`}
            className="group flex gap-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5 transition hover:border-emerald-300 hover:shadow-sm"
          >
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-xl font-bold"
              style={{ backgroundColor: `${phase.color}33`, color: "#171717" }}
            >
              {phase.id}
            </div>
            <div className="flex-1">
              <h2 className="mb-1 text-lg font-semibold text-[var(--color-text-primary)] group-hover:text-emerald-700">
                {phase.title}
              </h2>
              <p className="mb-2 text-sm text-[var(--color-text-secondary)] italic">
                {phase.tagline}
              </p>
              <p className="text-sm text-[var(--color-text-secondary)]">{phase.description}</p>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-[var(--color-text-muted)]">
                <span>{phase.moduleCount} modules</span>
                <span>{phase.lessonCount} lessons</span>
                <span>~{phase.estimatedHours} hours</span>
              </div>
            </div>
            <ArrowRight className="mt-2 h-5 w-5 shrink-0 text-neutral-300 transition group-hover:text-emerald-500" />
          </Link>
        ))}
      </div>
    </main>
  );
}
