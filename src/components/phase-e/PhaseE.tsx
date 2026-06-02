import { PHASE_E } from "@/lib/phase-e";
import type { PhaseELesson } from "@/lib/phase-e/types";

/**
 * Phase E · Embedded / Firmware — server-component overview.
 *
 * Static render of the phase's 8-lesson sequence with per-lesson target
 * and languages exposed. Phase E is the first code-first discipline
 * phase — no standards-cost line because the only standard referenced
 * (MISRA-C) is treated as code style rather than credential prep.
 *
 * V1 is read-only — navigation flows to individual lesson MDX files.
 * Per FM-1.0 the Client / Skeleton layers are omitted (no client
 * interactivity required).
 */
export function PhaseE(): React.ReactElement {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-10">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-medium tracking-wide text-[var(--color-text-muted)] uppercase">
          Phase E · Embedded / Firmware
        </p>
        <h1 className="text-3xl font-semibold text-[var(--color-text-primary)]">
          {PHASE_E.tagline}
        </h1>
        <p className="text-base leading-relaxed text-[var(--color-text-secondary)]">
          {PHASE_E.description}
        </p>
      </header>

      <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5">
        <h2 className="mb-2 text-sm font-semibold text-[var(--color-text-primary)]">
          Where this sits in the curriculum
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)]">
          After Phase {PHASE_E.slotsAfterPhase} (systems — OS internals, networking foundations).
          Parallel to Phase R (Robotics). Code-first: every lesson teaches code against a concrete
          ARM Cortex-M target.
        </p>
      </section>

      <ol className="flex flex-col gap-3">
        {PHASE_E.lessons.map((lesson) => (
          <LessonRow key={lesson.id} lesson={lesson} />
        ))}
      </ol>

      <footer className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4">
        <p className="text-xs leading-relaxed text-[var(--color-text-muted)]">
          Phase E is code-first — the only standard referenced (MISRA-C:2023, lesson 7) is taught as
          code style with practical examples, not certification prep. Target hardware is inexpensive
          (STM32F4 Discovery boards run ~$30); QEMU works for lessons that don&apos;t require
          board-specific peripherals.
        </p>
      </footer>
    </main>
  );
}

function LessonRow({ lesson }: { lesson: PhaseELesson }): React.ReactElement {
  return (
    <li className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
          <span className="font-mono text-xs text-[var(--color-text-muted)]">E{lesson.order}</span>
          {" — "}
          {lesson.title}
        </h3>
        <span className="font-mono text-xs whitespace-nowrap text-[var(--color-text-muted)]">
          ~{lesson.estimatedMinutes}m
        </span>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
        {lesson.description}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-[var(--color-bg-subtle)] px-2 py-0.5 font-mono text-[10px] text-[var(--color-text-muted)]">
          target: {lesson.target}
        </span>
        {lesson.languages.map((lang) => (
          <span
            key={lang}
            className="rounded-full bg-[var(--color-bg-subtle)] px-2 py-0.5 font-mono text-[10px] text-[var(--color-text-muted)]"
          >
            {lang}
          </span>
        ))}
        {lesson.standards.map((std) => (
          <span
            key={std}
            className="rounded-full bg-[var(--color-bg-subtle)] px-2 py-0.5 font-mono text-[10px] text-[var(--color-text-muted)]"
          >
            {std}
          </span>
        ))}
        {lesson.hasVerifyArtifact && (
          <span className="rounded-full bg-[var(--color-accent)]/10 px-2 py-0.5 font-mono text-[10px] text-[var(--color-accent)]">
            /verify artifact
          </span>
        )}
      </div>
    </li>
  );
}
