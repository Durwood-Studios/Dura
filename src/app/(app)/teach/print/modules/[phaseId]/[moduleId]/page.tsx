import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getPhase, getModule } from "@/content/phases";
import { listLessons, loadLesson } from "@/lib/content";
import { mdxComponents } from "@/components/lesson/MDXComponents";
import { PrintChrome } from "@/components/teacher/PrintChrome";
import { formatMinutes } from "@/lib/utils";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

type Params = Promise<{ phaseId: string; moduleId: string }>;

export default async function ModuleWorkbookPage({
  params,
}: {
  params: Params;
}): Promise<React.ReactElement> {
  const { phaseId, moduleId } = await params;
  const phase = getPhase(phaseId);
  const mod = getModule(phaseId, moduleId);
  if (!phase || !mod) notFound();

  const lessonMetas = await listLessons(phaseId, moduleId);
  const loaded = await Promise.all(lessonMetas.map((m) => loadLesson(phaseId, moduleId, m.id)));
  const lessons = loaded.filter((l): l is NonNullable<typeof l> => l !== null);

  return (
    <main className="mx-auto max-w-[760px] px-8 py-10 text-neutral-900">
      <PrintChrome />

      <header className="mb-10 border-b-2 border-neutral-900 pb-4">
        <p className="font-mono text-xs tracking-widest text-neutral-500 uppercase">
          DURA · Module workbook · Phase {phase.id}
        </p>
        <h1 className="mt-1 text-4xl font-semibold">{mod.title}</h1>
        <p className="mt-2 text-sm text-neutral-600">{mod.description}</p>
        <p className="mt-2 font-mono text-[10px] text-neutral-500">
          {lessons.length} lessons · ~{mod.estimatedHours}h · {new Date().toLocaleDateString()}
        </p>
      </header>

      {lessons.map((lesson, i) => (
        <article
          key={lesson.meta.id}
          className="mb-14 break-inside-avoid"
          style={{ pageBreakInside: "avoid" }}
        >
          <header className="mb-4 border-b border-neutral-300 pb-3">
            <p className="font-mono text-[10px] text-neutral-500 uppercase">
              Lesson {i + 1} · {lesson.meta.id}
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-neutral-900">{lesson.meta.title}</h2>
            {lesson.meta.description && (
              <p className="mt-1 text-sm text-neutral-600 italic">{lesson.meta.description}</p>
            )}
            <p className="mt-1 font-mono text-[10px] text-neutral-500">
              {formatMinutes(lesson.meta.estimatedMinutes)} · Difficulty {lesson.meta.difficulty}/5
              · Bloom: {lesson.meta.bloom}
              {lesson.meta.standards.cs2023?.[0] && ` · ${lesson.meta.standards.cs2023[0]}`}
            </p>
          </header>
          <div className="lesson-print text-[14px] leading-[1.75] text-neutral-800">
            <MDXRemote source={lesson.body} components={mdxComponents} />
          </div>
        </article>
      ))}

      <footer className="mt-16 border-t border-neutral-300 pt-4 text-center text-[10px] text-neutral-500">
        DURA · {mod.title} · Durwood Studios LLC · AGPLv3
      </footer>
    </main>
  );
}
