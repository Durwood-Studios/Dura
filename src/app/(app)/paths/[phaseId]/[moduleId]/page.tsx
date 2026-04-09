import { notFound } from "next/navigation";
import { getPhase, getModule } from "@/content/phases";
import { listLessons } from "@/lib/content";
import { ModuleDetailClient } from "@/components/paths/ModuleDetailClient";

type Params = Promise<{ phaseId: string; moduleId: string }>;

export default async function ModulePage({
  params,
}: {
  params: Params;
}): Promise<React.ReactElement> {
  const { phaseId, moduleId } = await params;
  const phase = getPhase(phaseId);
  const mod = getModule(phaseId, moduleId);
  if (!phase || !mod) notFound();

  const lessons = await listLessons(phaseId, moduleId);

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <ModuleDetailClient
        phaseId={phaseId}
        moduleId={moduleId}
        moduleTitle={mod.title}
        lessons={lessons}
      />
    </main>
  );
}
