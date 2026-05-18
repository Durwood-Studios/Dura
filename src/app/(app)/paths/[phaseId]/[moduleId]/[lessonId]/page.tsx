import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { loadLesson, resolveNextLesson } from "@/lib/content";
import { LessonReader } from "@/components/lesson/LessonReader";
import { GatingGuard } from "@/components/paths/GatingGuard";
import { getModule } from "@/content/phases";
import { lessonMetadata } from "@/lib/og";
import { SITE_URL } from "@/lib/og";

type Params = Promise<{ phaseId: string; moduleId: string; lessonId: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { phaseId, moduleId, lessonId } = await params;
  const lesson = await loadLesson(phaseId, moduleId, lessonId);
  if (!lesson) return { title: "Lesson not found — DURA" };
  return lessonMetadata({
    title: lesson.meta.title,
    description: lesson.meta.description,
    phaseId,
    moduleId,
    lessonId,
  });
}

export default async function LessonPage({
  params,
}: {
  params: Params;
}): Promise<React.ReactElement> {
  const { phaseId, moduleId, lessonId } = await params;
  const lesson = await loadLesson(phaseId, moduleId, lessonId);
  if (!lesson) notFound();

  // Walk the curriculum end-to-end: next lesson in module, then first lesson
  // of next module, then first lesson of next phase.
  const next = await resolveNextLesson(phaseId, moduleId, lessonId);

  const shareUrl = `${SITE_URL}/paths/${phaseId}/${moduleId}/${lessonId}`;

  const mod = getModule(phaseId, moduleId);
  const moduleTitle = mod?.title ?? `Module ${moduleId}`;

  return (
    <GatingGuard phaseId={phaseId} moduleId={moduleId} moduleTitle={moduleTitle}>
      <LessonReader lesson={lesson} next={next} shareUrl={shareUrl} />
    </GatingGuard>
  );
}
