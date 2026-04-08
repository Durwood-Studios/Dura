type Params = Promise<{ phaseId: string }>;

export default async function PhasePage({
  params,
}: {
  params: Params;
}): Promise<React.ReactElement> {
  const { phaseId } = await params;
  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <p className="font-mono text-sm text-neutral-500">Phase {phaseId}</p>
      <h1 className="mt-2 text-3xl font-semibold">Modules</h1>
    </main>
  );
}
