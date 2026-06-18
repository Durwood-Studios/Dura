import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { PHASES } from "@/content/phases";
import type { BloomLevel, DreyfusStage, LessonMeta } from "@/types/curriculum";

const CONTENT_ROOT = path.join(process.cwd(), "src", "content", "phases");

export interface LessonFrontmatter {
  title: string;
  description?: string;
  phase: number | string;
  module: string;
  order: number;
  estimatedMinutes: number;
  difficulty?: "beginner" | "intermediate" | "advanced" | 1 | 2 | 3 | 4 | 5;
  standards?: {
    cs2023?: string[];
    swebok?: string[];
    bloom?: BloomLevel;
    sfia?: number;
    dreyfus?: DreyfusStage;
  };
  vocabulary?: string[];
  learningOutcomes?: string[];
  prerequisites?: string[];
}

export interface LoadedLesson {
  meta: LessonMeta;
  frontmatter: LessonFrontmatter;
  body: string;
  filePath: string;
}

function difficultyToNumber(d: LessonFrontmatter["difficulty"]): 1 | 2 | 3 | 4 | 5 {
  if (typeof d === "number") return d;
  if (d === "beginner") return 1;
  if (d === "intermediate") return 3;
  if (d === "advanced") return 5;
  // Unknown string slipped past TS (gray-matter parses MDX frontmatter as untyped).
  // Warn loudly in dev so this can't drift silently again — see the 2026-05 audit
  // that found "medium"/"hard" Phase 5 outliers all silently falling through to 1.
  if (d !== undefined) {
    console.warn(
      `[content] Unknown difficulty value "${String(d)}" — using fallback 1. Canonical values: beginner | intermediate | advanced.`
    );
  }
  return 1;
}

async function fileExists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

/** Find an MDX file matching `${order}-*.mdx` inside a module directory. */
async function findLessonFile(moduleDir: string, lessonId: string): Promise<string | null> {
  if (!(await fileExists(moduleDir))) return null;
  const entries = await fs.readdir(moduleDir);
  const match = entries.find((name) => name.endsWith(".mdx") && name.startsWith(`${lessonId}-`));
  return match ? path.join(moduleDir, match) : null;
}

async function findModuleDir(phaseDir: string, moduleId: string): Promise<string | null> {
  if (!(await fileExists(phaseDir))) return null;
  const entries = await fs.readdir(phaseDir, { withFileTypes: true });
  const match = entries.find(
    (e) => e.isDirectory() && (e.name === moduleId || e.name.startsWith(`${moduleId}-`))
  );
  return match ? path.join(phaseDir, match.name) : null;
}

async function findPhaseDir(phaseId: string): Promise<string | null> {
  if (!(await fileExists(CONTENT_ROOT))) return null;
  const entries = await fs.readdir(CONTENT_ROOT, { withFileTypes: true });
  const match = entries.find(
    (e) => e.isDirectory() && (e.name === phaseId || e.name.startsWith(`${phaseId}-`))
  );
  return match ? path.join(CONTENT_ROOT, match.name) : null;
}

export async function loadLesson(
  phaseId: string,
  moduleId: string,
  lessonId: string
): Promise<LoadedLesson | null> {
  try {
    const phaseDir = await findPhaseDir(phaseId);
    if (!phaseDir) return null;
    const moduleDir = await findModuleDir(phaseDir, moduleId);
    if (!moduleDir) return null;
    const filePath = await findLessonFile(moduleDir, lessonId);
    if (!filePath) return null;

    const raw = await fs.readFile(filePath, "utf-8");
    const { data, content } = matter(raw);
    const fm = data as LessonFrontmatter;

    const meta: LessonMeta = {
      id: lessonId,
      slug: path.basename(filePath, ".mdx"),
      moduleId,
      phaseId,
      title: fm.title,
      description: fm.description ?? "",
      estimatedMinutes: fm.estimatedMinutes ?? 8,
      difficulty: difficultyToNumber(fm.difficulty),
      bloom: fm.standards?.bloom ?? "understand",
      dreyfus: fm.standards?.dreyfus ?? "novice",
      standards: {
        cs2023: fm.standards?.cs2023,
        swebok: fm.standards?.swebok,
        sfia: fm.standards?.sfia ? `Level ${fm.standards.sfia}` : undefined,
      },
      vocabulary: fm.vocabulary ?? [],
      order: fm.order ?? 0,
      learningOutcomes: fm.learningOutcomes,
      prerequisites: fm.prerequisites,
    };

    return { meta, frontmatter: fm, body: content, filePath };
  } catch (error) {
    console.error("[content] loadLesson failed", error);
    return null;
  }
}

/** Enumerate all lesson params for generateStaticParams. */
export async function listAllLessonParams(): Promise<
  { phaseId: string; moduleId: string; lessonId: string }[]
> {
  const params: { phaseId: string; moduleId: string; lessonId: string }[] = [];
  try {
    if (!(await fileExists(CONTENT_ROOT))) return params;
    const phases = await fs.readdir(CONTENT_ROOT, { withFileTypes: true });
    for (const phaseEntry of phases) {
      if (!phaseEntry.isDirectory()) continue;
      const phaseId = phaseEntry.name.split("-")[0];
      const phaseDir = path.join(CONTENT_ROOT, phaseEntry.name);
      const modules = await fs.readdir(phaseDir, { withFileTypes: true });
      for (const modEntry of modules) {
        if (!modEntry.isDirectory()) continue;
        const moduleId = modEntry.name.match(/^(\d+-\d+)/)?.[1] ?? modEntry.name.split("-")[0];
        const modDir = path.join(phaseDir, modEntry.name);
        const files = await fs.readdir(modDir);
        for (const file of files) {
          if (!file.endsWith(".mdx")) continue;
          const lessonId = file.split("-")[0];
          params.push({ phaseId, moduleId, lessonId });
        }
      }
    }
  } catch (error) {
    console.error("[content] listAllLessonParams failed", error);
  }
  return params;
}

export type NextLessonScope = "lesson" | "module" | "phase";

export interface NextLessonRef {
  href: string;
  title: string;
  scope: NextLessonScope;
  /** When scope !== "lesson", the human label of the module/phase being entered. */
  contextLabel?: string;
}

/**
 * Resolve the next lesson in curriculum order, walking across module and phase
 * boundaries. Returns undefined only when the learner is on the final lesson
 * of the final module of the final phase.
 */
export async function resolveNextLesson(
  phaseId: string,
  moduleId: string,
  lessonId: string
): Promise<NextLessonRef | undefined> {
  // 1) Try the next lesson within the same module.
  const siblings = await listLessons(phaseId, moduleId);
  const idx = siblings.findIndex((l) => l.id === lessonId);
  if (idx >= 0 && idx + 1 < siblings.length) {
    const next = siblings[idx + 1];
    return {
      href: `/paths/${phaseId}/${moduleId}/${next.id}`,
      title: next.title,
      scope: "lesson",
    };
  }

  // 2) Try the first lesson of the next module in the same phase.
  const phase = PHASES.find((p) => p.id === phaseId);
  if (!phase) return undefined;
  const modules = [...phase.modules].sort((a, b) => a.order - b.order);
  const modIdx = modules.findIndex((m) => m.id === moduleId);
  if (modIdx >= 0 && modIdx + 1 < modules.length) {
    const nextMod = modules[modIdx + 1];
    const firstLesson = (await listLessons(phaseId, nextMod.id))[0];
    if (firstLesson) {
      return {
        href: `/paths/${phaseId}/${nextMod.id}/${firstLesson.id}`,
        title: firstLesson.title,
        scope: "module",
        contextLabel: nextMod.title,
      };
    }
  }

  // 3) Fall back to the first lesson of the first module of the next phase.
  const phases = [...PHASES].sort((a, b) => a.order - b.order);
  const phaseIdx = phases.findIndex((p) => p.id === phaseId);
  if (phaseIdx >= 0 && phaseIdx + 1 < phases.length) {
    const nextPhase = phases[phaseIdx + 1];
    const firstMod = [...nextPhase.modules].sort((a, b) => a.order - b.order)[0];
    if (firstMod) {
      const firstLesson = (await listLessons(nextPhase.id, firstMod.id))[0];
      if (firstLesson) {
        return {
          href: `/paths/${nextPhase.id}/${firstMod.id}/${firstLesson.id}`,
          title: firstLesson.title,
          scope: "phase",
          contextLabel: nextPhase.title,
        };
      }
    }
  }

  return undefined;
}

/**
 * Resolve the previous lesson in curriculum order, walking backward across
 * module and phase boundaries. Returns undefined when already at the very
 * first lesson of Phase 0.
 */
export async function resolvePreviousLesson(
  phaseId: string,
  moduleId: string,
  lessonId: string
): Promise<NextLessonRef | undefined> {
  // 1) Try the previous lesson within the same module.
  const siblings = await listLessons(phaseId, moduleId);
  const idx = siblings.findIndex((l) => l.id === lessonId);
  if (idx > 0) {
    const prev = siblings[idx - 1];
    return {
      href: `/paths/${phaseId}/${moduleId}/${prev.id}`,
      title: prev.title,
      scope: "lesson",
    };
  }

  // 2) Try the last lesson of the previous module in the same phase.
  const phase = PHASES.find((p) => p.id === phaseId);
  if (!phase) return undefined;
  const modules = [...phase.modules].sort((a, b) => a.order - b.order);
  const modIdx = modules.findIndex((m) => m.id === moduleId);
  if (modIdx > 0) {
    const prevMod = modules[modIdx - 1];
    const prevModLessons = await listLessons(phaseId, prevMod.id);
    const lastLesson = prevModLessons[prevModLessons.length - 1];
    if (lastLesson) {
      return {
        href: `/paths/${phaseId}/${prevMod.id}/${lastLesson.id}`,
        title: lastLesson.title,
        scope: "module",
        contextLabel: prevMod.title,
      };
    }
  }

  // 3) Fall back to the last lesson of the last module of the previous phase.
  const phases = [...PHASES].sort((a, b) => a.order - b.order);
  const phaseIdx = phases.findIndex((p) => p.id === phaseId);
  if (phaseIdx > 0) {
    const prevPhase = phases[phaseIdx - 1];
    const prevPhaseModules = [...prevPhase.modules].sort((a, b) => a.order - b.order);
    const lastMod = prevPhaseModules[prevPhaseModules.length - 1];
    if (lastMod) {
      const lastModLessons = await listLessons(prevPhase.id, lastMod.id);
      const lastLesson = lastModLessons[lastModLessons.length - 1];
      if (lastLesson) {
        return {
          href: `/paths/${prevPhase.id}/${lastMod.id}/${lastLesson.id}`,
          title: lastLesson.title,
          scope: "phase",
          contextLabel: prevPhase.title,
        };
      }
    }
  }

  // Already at the very first lesson.
  return undefined;
}

export async function listLessons(phaseId: string, moduleId: string): Promise<LessonMeta[]> {
  try {
    const phaseDir = await findPhaseDir(phaseId);
    if (!phaseDir) return [];
    const moduleDir = await findModuleDir(phaseDir, moduleId);
    if (!moduleDir) return [];
    const entries = await fs.readdir(moduleDir);
    const lessons: LessonMeta[] = [];
    for (const entry of entries) {
      if (!entry.endsWith(".mdx")) continue;
      const id = entry.split("-")[0];
      const loaded = await loadLesson(phaseId, moduleId, id);
      if (loaded) lessons.push(loaded.meta);
    }
    return lessons.sort((a, b) => a.order - b.order);
  } catch (error) {
    console.error("[content] listLessons failed", error);
    return [];
  }
}
