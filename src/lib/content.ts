import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
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
