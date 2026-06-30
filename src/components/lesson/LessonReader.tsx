import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { evaluate } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import { mdxComponents } from "@/components/lesson/MDXComponents";
import { ScrollTracker } from "@/components/lesson/ScrollTracker";
import { CompletionGate } from "@/components/lesson/CompletionGate";
import { BiteMode } from "@/components/lesson/BiteMode";
import { StandardsBadges } from "@/components/lesson/StandardsBadges";
import { AITutorMount } from "@/components/lesson/AITutor/AITutorMount";
import { AnnotationsPanel } from "@/components/lesson/AnnotationsPanel";
import { AddFlashcardButton } from "@/components/lesson/AddFlashcardButton";
import { formatMinutes } from "@/lib/utils";
import { ShareButton } from "@/components/seo/ShareButton";
import { buildBadges } from "@/lib/standards";
import { getStandardsForModule } from "@/content/standards-map";
import type { LoadedLesson, NextLessonRef } from "@/lib/content";

interface LessonReaderProps {
  lesson: LoadedLesson;
  next?: NextLessonRef;
  prev?: NextLessonRef;
  shareUrl: string;
}

function nextLabel(next: NextLessonRef): string {
  if (next.scope === "module") return `Next module: ${next.contextLabel ?? next.title}`;
  if (next.scope === "phase") return `Next phase: ${next.contextLabel ?? next.title}`;
  return `Next: ${next.title}`;
}

function prevLabel(prev: NextLessonRef): string {
  if (prev.scope === "module") return `Prev module: ${prev.contextLabel ?? prev.title}`;
  if (prev.scope === "phase") return `Prev phase: ${prev.contextLabel ?? prev.title}`;
  return `Prev: ${prev.title}`;
}

export async function LessonReader({
  lesson,
  next,
  prev,
  shareUrl,
}: LessonReaderProps): Promise<React.ReactElement> {
  const { meta, body } = lesson;

  // Compile and evaluate MDX using @mdx-js/mdx directly.
  // next-mdx-remote/rsc strips JSX expression props (arrays/objects)
  // from client components. evaluate() preserves them.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type MDXComponentType = React.ComponentType<{ components?: Record<string, any> }>;
  let MDXContent: MDXComponentType;
  try {
    const result = await evaluate(body, { ...runtime, development: false });
    MDXContent = result.default as MDXComponentType;
  } catch (err) {
    console.error(`[LessonReader] MDX compile error in ${meta.id}:`, err);
    function MDXFallback(): React.ReactElement {
      return (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-6 text-center">
          <p className="font-mono text-sm text-rose-400">Content unavailable</p>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            This lesson has a formatting issue. Your progress is safe.
          </p>
        </div>
      );
    }
    MDXContent = MDXFallback;
  }

  const hasQuiz = /<Quiz\b/.test(body) || /<FillBlank\b/.test(body) || /<ParsonsPanel\b/.test(body);

  // Merge lesson-level standards (from frontmatter) with module-level
  // K-12 alignment (CSTA / AP / ISTE) from PHASE_STANDARDS, so every
  // lesson surfaces its full pedagogical provenance.
  const moduleStandards = getStandardsForModule(meta.phaseId, meta.moduleId);
  const badges = buildBadges({
    cs2023: meta.standards.cs2023,
    swebok: meta.standards.swebok,
    sfia: meta.standards.sfia,
    sfiaModule: moduleStandards?.sfia,
    bloom: meta.bloom,
    dreyfus: meta.dreyfus,
    csta: moduleStandards?.csta,
    apcsp: moduleStandards?.apCSP,
    apcsa: moduleStandards?.apCSA,
    iste: moduleStandards?.iste,
    owasp: moduleStandards?.owasp,
    ieee7000: moduleStandards?.ieee7000,
    nice: moduleStandards?.nice,
  });

  return (
    <article className="mx-auto max-w-[700px] px-6 py-12">
      <ScrollTracker lessonId={meta.id} phaseId={meta.phaseId} moduleId={meta.moduleId} />

      <header className="mb-8 border-b border-[var(--color-border)] pb-6">
        <p className="mb-2 font-mono text-xs tracking-wide text-[var(--color-text-muted)] uppercase">
          Phase {meta.phaseId} · Module {meta.moduleId}
        </p>
        <h1 className="mb-3 text-4xl font-semibold text-[var(--color-text-primary)]">
          {meta.title}
        </h1>
        {meta.description && (
          <p className="mb-4 text-lg text-[var(--color-text-secondary)]">{meta.description}</p>
        )}
        <StandardsBadges badges={badges} />
        <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--color-text-muted)]">
          <span>{formatMinutes(meta.estimatedMinutes)}</span>
          <span aria-hidden>·</span>
          <span>Difficulty {meta.difficulty}/5</span>
          <span className="ml-auto">
            <ShareButton url={shareUrl} title={meta.title} text={meta.description} />
          </span>
        </div>
      </header>

      <BiteMode>
        <div className="lesson-prose">
          <MDXContent components={mdxComponents} />
        </div>
      </BiteMode>

      <CompletionGate
        estimatedMinutes={meta.estimatedMinutes}
        lessonTitle={meta.title}
        hasQuiz={hasQuiz}
        nextHref={next?.href}
        nextTitle={next ? nextLabel(next) : undefined}
        vocabulary={meta.vocabulary}
      />

      <AnnotationsPanel lessonId={meta.id} />

      {(prev || next) && (
        <nav
          aria-label="Lesson navigation"
          className="mt-8 flex items-center justify-between border-t border-[var(--color-border)] pt-6"
        >
          {prev ? (
            <Link
              href={prev.href}
              className="group inline-flex items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)] transition hover:text-[var(--color-accent)]"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
              {prevLabel(prev)}
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link
              href={next.href}
              className="group inline-flex items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)] transition hover:text-[var(--color-accent)]"
            >
              {nextLabel(next)}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          )}
        </nav>
      )}

      <AITutorMount meta={meta} lessonBody={body} />
      <AddFlashcardButton lessonId={meta.id} lessonTitle={meta.title} />
    </article>
  );
}
