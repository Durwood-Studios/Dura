import { listAllLessonMeta } from "@/lib/curriculum";
import type { Metadata } from "next";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

export const metadata: Metadata = { title: "Dashboard — DURA" };

export default async function DashboardPage(): Promise<React.ReactElement> {
  const lessons = await listAllLessonMeta();
  const lessonTitles = Object.fromEntries(
    lessons.map((lesson) => [
      `/paths/${lesson.phaseId}/${lesson.moduleId}/${lesson.id}`,
      lesson.title,
    ])
  );
  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="mb-2 text-3xl font-semibold">Dashboard</h1>
      <p className="mb-8 text-[var(--color-text-secondary)]">Your learning at a glance.</p>
      <DashboardClient lessonTitles={lessonTitles} />
    </main>
  );
}
