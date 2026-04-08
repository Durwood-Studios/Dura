import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { loadLesson, listLessons } from "@/lib/content";
import { LessonReader } from "@/components/lesson/LessonReader";
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

  // Resolve "next lesson" by listing the module's lessons in order.
  const siblings = await listLessons(phaseId, moduleId);
  const currentIndex = siblings.findIndex((l) => l.id === lessonId);
  const nextSibling = currentIndex >= 0 ? siblings[currentIndex + 1] : undefined;
  const next = nextSibling
    ? {
        href: `/paths/${phaseId}/${moduleId}/${nextSibling.id}`,
        title: nextSibling.title,
      }
    : undefined;

  const shareUrl = `${SITE_URL}/paths/${phaseId}/${moduleId}/${lessonId}`;

  return <LessonReader lesson={lesson} next={next} shareUrl={shareUrl} />;
}
