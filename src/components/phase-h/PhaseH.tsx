import { PHASE_H } from "@/lib/phase-h";
import type { PhaseHLesson } from "@/lib/phase-h/types";

/** Phase H · Hardware Verification overview (server component). */
export function PhaseH(): React.ReactElement {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-10">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-medium tracking-wide text-[var(--color-text-muted)] uppercase">
          Phase H · Hardware Verification
        </p>
        <h1 className="text-3xl font-semibold text-[var(--color-text-primary)]">
          {PHASE_H.tagline}
        </h1>
        <p className="text-base leading-relaxed text-[var(--color-text-secondary)]">
          {PHASE_H.description}
        </p>
      </header>

      <ol className="flex flex-col gap-3">
        {PHASE_H.lessons.map((lesson) => (
          <LessonRow key={lesson.id} lesson={lesson} />
        ))}
      </ol>
    </main>
  );
}

function LessonRow({ lesson }: { lesson: PhaseHLesson }): React.ReactElement {
  return (
    <li className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
          <span className="font-mono text-xs text-[var(--color-text-muted)]">H{lesson.order}</span>
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
        {lesson.standards.map((s) => (
          <span
            key={s}
            className="rounded-full bg-[var(--color-bg-subtle)] px-2 py-0.5 font-mono text-[10px] text-[var(--color-text-muted)]"
          >
            {s}
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
