import type { Metadata } from "next";
import { listAllLessons } from "@/lib/curriculum";
import { PrintChrome } from "@/components/teacher/PrintChrome";
import { formatMinutes } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Curriculum map — DURA",
  robots: { index: false, follow: false },
};

export default async function CurriculumMapPage(): Promise<React.ReactElement> {
  const tree = await listAllLessons();
  const authoredTotal = tree.reduce(
    (sum, node) => sum + node.modules.reduce((m, x) => m + x.lessons.length, 0),
    0
  );

  return (
    <main className="mx-auto max-w-[780px] px-8 py-10 text-[var(--color-text-primary)]">
      <PrintChrome />

      <header className="mb-10 border-b-2 border-neutral-900 pb-4">
        <p className="font-mono text-xs tracking-widest text-[var(--color-text-secondary)] uppercase">
          DURA · Curriculum map
        </p>
        <h1 className="mt-1 text-4xl font-semibold">Engineering education, hardened by design</h1>
        <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
          10 phases · 52 modules · ~406 lessons · ~2,850 hours · Free forever
        </p>
        <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
          Currently {authoredTotal} lessons authored. Generated{" "}
          {new Date().toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
          .
        </p>
      </header>

      {tree.map((node) => {
        const authoredInPhase = node.modules.reduce((s, m) => s + m.lessons.length, 0);
        return (
          <section key={node.phase.id} className="mb-10 break-inside-avoid">
            <header className="mb-3 flex items-baseline gap-3">
              <span
                className="h-4 w-4 shrink-0 rounded-full"
                style={{ backgroundColor: node.phase.color }}
              />
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-[var(--color-text-primary)]">
                  {node.phase.title}
                </h2>
                <p className="text-sm text-[var(--color-text-secondary)] italic">
                  {node.phase.tagline}
                </p>
              </div>
              <span className="font-mono text-xs text-[var(--color-text-secondary)]">
                {authoredInPhase}/{node.phase.lessonCount} · {node.phase.estimatedHours}h
              </span>
            </header>
            <p className="mb-3 text-sm text-neutral-700">{node.phase.description}</p>
            <ul className="flex flex-col gap-3 pl-7">
              {node.modules.map((modulePair) => (
                <li key={modulePair.module.id}>
                  <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                    {modulePair.module.title}{" "}
                    <span className="font-mono text-[10px] font-normal text-[var(--color-text-secondary)]">
                      · {modulePair.lessons.length}/{modulePair.module.lessonCount} ·{" "}
                      {modulePair.module.estimatedHours}h
                    </span>
                  </p>
                  {modulePair.module.description && (
                    <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
                      {modulePair.module.description}
                    </p>
                  )}
                  {modulePair.lessons.length > 0 && (
                    <ol className="mt-1.5 ml-4 flex flex-col gap-0.5 text-xs text-neutral-700">
                      {modulePair.lessons.map((lesson) => (
                        <li key={lesson.id}>
                          <span className="font-mono text-[10px] text-[var(--color-text-secondary)]">
                            {lesson.id}.
                          </span>{" "}
                          {lesson.title}{" "}
                          <span className="text-[var(--color-text-muted)]">
                            ({formatMinutes(lesson.estimatedMinutes)})
                          </span>
                        </li>
                      ))}
                    </ol>
                  )}
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <footer className="mt-16 border-t border-neutral-300 pt-4 text-center text-[10px] text-[var(--color-text-secondary)]">
        DURA · Durwood Studios LLC · AGPLv3 · github.com/Durwood-Studios/Dura
      </footer>
    </main>
  );
}
