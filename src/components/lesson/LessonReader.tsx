import { evaluate } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import { mdxComponents } from "@/components/lesson/MDXComponents";
import { ScrollTracker } from "@/components/lesson/ScrollTracker";
import { CompletionGate } from "@/components/lesson/CompletionGate";
import { formatMinutes } from "@/lib/utils";
import { ShareButton } from "@/components/seo/ShareButton";
import type { LoadedLesson } from "@/lib/content";

interface LessonReaderProps {
  lesson: LoadedLesson;
  next?: { href: string; title: string };
  shareUrl: string;
}

export async function LessonReader({
  lesson,
  next,
  shareUrl,
}: LessonReaderProps): Promise<React.ReactElement> {
  const { meta, body } = lesson;

  // Compile and evaluate MDX using @mdx-js/mdx directly.
  // next-mdx-remote/rsc strips JSX expression props (arrays/objects)
  // from client components. evaluate() preserves them.
  const { default: MDXContent } = await evaluate(body, {
    ...runtime,
    development: false,
  });

  const hasQuiz = /<Quiz\b/.test(body);

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
        <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--color-text-muted)]">
          <span>{formatMinutes(meta.estimatedMinutes)}</span>
          <span aria-hidden>·</span>
          <span>Difficulty {meta.difficulty}/5</span>
          {meta.standards.cs2023?.[0] && (
            <>
              <span aria-hidden>·</span>
              <span>{meta.standards.cs2023[0]}</span>
            </>
          )}
          <span className="ml-auto">
            <ShareButton url={shareUrl} title={meta.title} text={meta.description} />
          </span>
        </div>
      </header>

      <div className="lesson-prose">
        <MDXContent components={mdxComponents} />
      </div>

      <CompletionGate
        estimatedMinutes={meta.estimatedMinutes}
        lessonTitle={meta.title}
        hasQuiz={hasQuiz}
        nextHref={next?.href}
        nextTitle={next?.title}
      />
    </article>
  );
}
