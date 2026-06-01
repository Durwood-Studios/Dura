import Link from "next/link";
import { PHASE_M, phaseMStandardsCostUSD } from "@/lib/phase-m";
import type { PhaseMLesson } from "@/lib/phase-m/types";

/**
 * Phase M · Manufacturing — server-component overview.
 *
 * Static render of the 12-lesson sequence + standards-cost footer. Same
 * shape as PhaseR.tsx; V1 has no client interactivity so the FM-1.0
 * Client / Skeleton layers are intentionally omitted.
 */
export function PhaseM(): React.ReactElement {
  const totalCost = phaseMStandardsCostUSD();

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-10">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-medium tracking-wide text-[var(--color-text-muted)] uppercase">
          Phase M · Manufacturing
        </p>
        <h1 className="text-3xl font-semibold text-[var(--color-text-primary)]">
          {PHASE_M.tagline}
        </h1>
        <p className="text-base leading-relaxed text-[var(--color-text-secondary)]">
          {PHASE_M.description}
        </p>
      </header>

      <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5">
        <h2 className="mb-2 text-sm font-semibold text-[var(--color-text-primary)]">
          Prerequisites
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Through Phase {PHASE_M.prereqsThroughPhase} — basic systems thinking, stats and data
          literacy (for SPC/MSA), networking fundamentals (for TSN/OPC UA), security fundamentals
          (for IEC 62443). No software-engineering prerequisites beyond Phase 5, which makes Phase M
          viable for non-CS-degreed manufacturing engineers as a direct path through DURA.
        </p>
      </section>

      <ol className="flex flex-col gap-3">
        {PHASE_M.lessons.map((lesson) => (
          <LessonRow key={lesson.id} lesson={lesson} />
        ))}
      </ol>

      <footer className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5">
        <h2 className="mb-2 text-sm font-semibold text-[var(--color-text-primary)]">
          Owned-standards library
        </h2>
        <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
          Phase M authors against the real spec text. Total acquisition cost for the standards used
          across all 12 lessons: <strong>~${totalCost.toLocaleString()}</strong>. The public
          standards in the curriculum (MTConnect, OPC UA base parts, Lean/TPS, Six Sigma DMAIC, RAMI
          4.0, IIRA) are zero cost; the rest are paywalled industry specs DURA&apos;s organization
          owns for content-fidelity capstone artifacts.
        </p>
      </footer>
    </main>
  );
}

function LessonRow({ lesson }: { lesson: PhaseMLesson }): React.ReactElement {
  const primaryStandard = lesson.standards[0];
  return (
    <li className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4">
      <div className="flex items-start gap-3">
        <span className="mt-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-bg-subtle)] font-mono text-xs text-[var(--color-text-secondary)]">
          {lesson.order}
        </span>
        <div className="flex flex-1 flex-col gap-1.5">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
              {lesson.title}
            </h3>
            <span className="font-mono text-xs text-[var(--color-text-muted)]">
              {lesson.estimatedMinutes} min
            </span>
          </div>
          <p className="text-sm text-[var(--color-text-secondary)]">{lesson.description}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-2 py-0.5 font-mono text-[10px] text-[var(--color-text-muted)]">
              {primaryStandard.id}
            </span>
            {lesson.hasVerifyArtifact && (
              <span className="rounded-full border border-[var(--color-accent-emerald)]/30 bg-[var(--color-accent-emerald)]/10 px-2 py-0.5 text-[10px] text-[var(--color-accent-emerald)]">
                /verify artifact
              </span>
            )}
            {lesson.misconceptions.length > 0 && (
              <span className="text-[10px] text-[var(--color-text-muted)]">
                Diagnoses: {lesson.misconceptions.length} misconception
                {lesson.misconceptions.length === 1 ? "" : "s"}
              </span>
            )}
          </div>
          <Link
            href={`/paths/m/${lesson.id}`}
            className="mt-1 text-xs font-medium text-[var(--color-accent)] underline underline-offset-2"
          >
            Start →
          </Link>
        </div>
      </div>
    </li>
  );
}
