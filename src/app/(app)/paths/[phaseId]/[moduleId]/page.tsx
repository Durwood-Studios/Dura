import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPhase, getModule } from "@/content/phases";
import { listLessons } from "@/lib/content";
import { ModuleDetailClient } from "@/components/paths/ModuleDetailClient";
import { GatingGuard } from "@/components/paths/GatingGuard";

type Params = Promise<{ phaseId: string; moduleId: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { phaseId, moduleId } = await params;
  const mod = getModule(phaseId, moduleId);
  if (!mod) return { title: "Module Not Found" };
  return { title: mod.title };
}

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
      <GatingGuard phaseId={phaseId} moduleId={moduleId} moduleTitle={mod.title}>
        <ModuleDetailClient
          phaseId={phaseId}
          moduleId={moduleId}
          moduleTitle={mod.title}
          lessons={lessons}
        />
      </GatingGuard>
    </main>
  );
}
