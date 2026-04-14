import { getLatestResult } from "@/lib/db/assessments";
import { PHASES } from "@/content/phases";

/**
 * Check if a module is unlocked under strict gating rules.
 *
 * Rules:
 * - Phase 0, Module 0-1 is always unlocked (entry point)
 * - Each subsequent module requires the previous module's mastery gate passed
 * - First module of a new phase requires ALL modules in the previous phase passed
 * - If strict gating is OFF, everything is unlocked
 */
export async function isModuleUnlocked(
  phaseId: string,
  moduleId: string,
  strictGating: boolean
): Promise<boolean> {
  if (!strictGating) return true;

  // Phase 0, Module 0-1 is always unlocked
  if (phaseId === "0" && moduleId === "0-1") return true;

  const phase = PHASES.find((p) => p.id === phaseId);
  if (!phase) return false;

  const moduleIndex = phase.modules.findIndex((m) => m.id === moduleId);

  if (moduleIndex > 0) {
    // Not the first module — check if previous module's gate is passed
    const prevModule = phase.modules[moduleIndex - 1];
    const passed = await isGatePassed(prevModule.id);
    return passed;
  }

  // First module of a phase — check if ALL modules in previous phase are passed
  const phaseIndex = PHASES.findIndex((p) => p.id === phaseId);
  if (phaseIndex <= 0) return true;

  const prevPhase = PHASES[phaseIndex - 1];
  for (const mod of prevPhase.modules) {
    const passed = await isGatePassed(mod.id);
    if (!passed) return false;
  }
  return true;
}

/** Check if a mastery gate has been passed for a given module. */
export async function isGatePassed(moduleId: string): Promise<boolean> {
  const result = await getLatestResult(moduleId, "mastery-gate");
  return result?.passed === true;
}

/** Find the prerequisite module that needs to be completed to unlock a target module. */
export function getPrerequisiteModule(
  phaseId: string,
  moduleId: string
): { phaseId: string; moduleId: string; title: string } | null {
  const phase = PHASES.find((p) => p.id === phaseId);
  if (!phase) return null;

  const moduleIndex = phase.modules.findIndex((m) => m.id === moduleId);

  if (moduleIndex > 0) {
    const prev = phase.modules[moduleIndex - 1];
    return { phaseId, moduleId: prev.id, title: prev.title };
  }

  // First module of phase — prerequisite is last module of previous phase
  const phaseIndex = PHASES.findIndex((p) => p.id === phaseId);
  if (phaseIndex <= 0) return null;

  const prevPhase = PHASES[phaseIndex - 1];
  const lastMod = prevPhase.modules[prevPhase.modules.length - 1];
  return { phaseId: prevPhase.id, moduleId: lastMod.id, title: lastMod.title };
}
