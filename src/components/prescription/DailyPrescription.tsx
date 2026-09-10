import Link from "next/link";
import type { DailyPlan } from "@/lib/prescription/types";

interface DailyPrescriptionProps {
  plan: DailyPlan;
  lessonTitles?: Record<string, string>;
}

/** Present a local learning plan as concrete, approachable next steps. */
export function DailyPrescription({
  plan,
  lessonTitles = {},
}: DailyPrescriptionProps): React.ReactElement {
  return (
    <section className="flex flex-col gap-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6">
      <header className="flex flex-col gap-2">
        <p className="text-sm text-[var(--color-text-secondary)]">
          Today · {plan.totalMinutes} minutes set aside
        </p>
        <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">Your next step</h2>
        <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">{plan.summary}</p>
      </header>
      <ol className="flex flex-col gap-3">
        {plan.blocks.map((block, i) => (
          <li
            key={`${block.kind}-${i}`}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-5"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-sm text-[var(--color-text-secondary)]">{block.title}</p>
              <span className="text-sm text-[var(--color-text-secondary)]">
                {block.minutes} min
              </span>
            </div>
            <h3 className="mt-2 text-lg font-semibold text-[var(--color-text-primary)]">
              {lessonTitles[block.href] ?? block.target}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
              {block.rationale}
            </p>
            <Link
              href={block.href}
              className="mt-4 inline-flex min-h-12 items-center justify-center rounded-lg bg-[var(--color-accent)] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
            >
              {block.kind === "lesson" || block.kind === "fresh-start"
                ? "Open lesson"
                : "Begin practice"}
              <span aria-hidden className="ml-2">
                →
              </span>
            </Link>
          </li>
        ))}
      </ol>
      <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
        Your plan stays on this device and adapts as you learn.
      </p>
    </section>
  );
}
