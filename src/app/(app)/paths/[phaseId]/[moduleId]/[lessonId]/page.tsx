type Params = Promise<{ phaseId: string; moduleId: string; lessonId: string }>;

export default async function LessonPage({
  params,
}: {
  params: Params;
}): Promise<React.ReactElement> {
  const { phaseId, moduleId, lessonId } = await params;
  return (
    <article className="mx-auto max-w-[700px] px-6 py-12">
      <p className="font-mono text-sm text-neutral-500">
        {phaseId} / {moduleId} / {lessonId}
      </p>
      <h1 className="mt-2 text-3xl font-semibold">Lesson</h1>
    </article>
  );
}
