"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, Check } from "lucide-react";
import { MasteryGate } from "@/components/verify/MasteryGate";
import { getQuestionsByPhase } from "@/content/questions";
import { getProgressByModule } from "@/lib/db/progress";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatMinutes, cn } from "@/lib/utils";
import type { LessonMeta } from "@/types/curriculum";
import type { LessonProgress } from "@/types/curriculum";

interface ModuleDetailClientProps {
  phaseId: string;
  moduleId: string;
  moduleTitle: string;
  lessons: LessonMeta[];
}

export function ModuleDetailClient({
  phaseId,
  moduleId,
  moduleTitle,
  lessons,
}: ModuleDetailClientProps): React.ReactElement {
  const [progress, setProgress] = useState<Map<string, LessonProgress> | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const records = await getProgressByModule(moduleId);
      if (cancelled) return;
      setProgress(new Map(records.map((r) => [r.lessonId, r])));
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [moduleId]);

  const questionPool = getQuestionsByPhase(phaseId);
  const completedCount = progress
    ? Array.from(progress.values()).filter((p) => p.completedAt !== null).length
    : 0;
  const allComplete = lessons.length > 0 && completedCount >= lessons.length;

  return (
    <>
      <Link
        href={`/paths/${phaseId}`}
        className="mb-6 inline-flex items-center gap-1 text-sm text-[var(--color-text-secondary)] hover:text-emerald-700"
      >
        <ChevronLeft className="h-4 w-4" />
        Phase {phaseId}
      </Link>
      <header className="mb-6">
        <p className="font-mono text-xs tracking-widest text-[var(--color-text-muted)] uppercase">
          Module {moduleId}
        </p>
        <h1 className="mt-1 text-3xl font-semibold text-[var(--color-text-primary)]">
          {moduleTitle}
        </h1>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          {completedCount} of {lessons.length} lessons complete
        </p>
      </header>

      {!progress ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: lessons.length || 4 }, (_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {lessons.map((lesson) => {
            const record = progress.get(lesson.id);
            const done = record?.completedAt !== null && record?.completedAt !== undefined;
            return (
              <li key={lesson.id}>
                <Link
                  href={`/paths/${phaseId}/${moduleId}/${lesson.id}`}
                  className="group flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4 shadow-sm transition hover:shadow-md"
                >
                  <span
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border",
                      done
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : "border-[var(--color-border)] text-[var(--color-text-muted)]"
                    )}
                  >
                    {done ? <Check className="h-4 w-4" /> : lesson.order}
                  </span>
                  <div className="flex-1">
                    <h3 className="font-medium text-[var(--color-text-primary)]">{lesson.title}</h3>
                    {lesson.description && (
                      <p className="text-xs text-[var(--color-text-secondary)]">
                        {lesson.description}
                      </p>
                    )}
                  </div>
                  <span className="text-[10px] text-[var(--color-text-muted)]">
                    {formatMinutes(lesson.estimatedMinutes)}
                  </span>
                  <ArrowRight className="h-4 w-4 text-[var(--color-text-muted)] group-hover:text-emerald-600" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {questionPool.length > 0 && (
        <div className="mt-8">
          <MasteryGate moduleId={moduleId} moduleTitle={moduleTitle} questionPool={questionPool} />
          {!allComplete && (
            <p className="mt-2 text-center text-[10px] text-[var(--color-text-muted)]">
              Tip: complete every lesson before attempting the module assessment.
            </p>
          )}
        </div>
      )}
    </>
  );
}
