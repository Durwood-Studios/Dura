import { notFound } from "next/navigation";
import { getPhase } from "@/content/phases";
import { PhaseDetailClient } from "@/components/paths/PhaseDetailClient";

type Params = Promise<{ phaseId: string }>;

export default async function PhasePage({
  params,
}: {
  params: Params;
}): Promise<React.ReactElement> {
  const { phaseId } = await params;
  const phase = getPhase(phaseId);
  if (!phase) notFound();

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <PhaseDetailClient phase={phase} />
    </main>
  );
}
