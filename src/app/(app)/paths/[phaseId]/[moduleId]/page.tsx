type Params = Promise<{ phaseId: string; moduleId: string }>;

export default async function ModulePage({
  params,
}: {
  params: Params;
}): Promise<React.ReactElement> {
  const { phaseId, moduleId } = await params;
  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <p className="font-mono text-sm text-neutral-500">
        Phase {phaseId} / Module {moduleId}
      </p>
      <h1 className="mt-2 text-3xl font-semibold">Lessons</h1>
    </main>
  );
}
