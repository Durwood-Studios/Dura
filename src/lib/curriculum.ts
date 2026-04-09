import "server-only";
import { PHASES, getPhase, getModule } from "@/content/phases";
import { listLessons, loadLesson, type LoadedLesson } from "@/lib/content";
import type { LessonMeta, Phase, Module } from "@/types/curriculum";
import type { AssessmentQuestion } from "@/types/assessment";
import { PHASE_0_QUESTIONS } from "@/content/questions/phase-0";

/**
 * Aggregate iteration helpers for curriculum data. Used by the teacher
 * dashboard, export hub, and any future indexer. Server-only so the
 * filesystem walk in listLessons() stays on the server.
 */

export interface LessonTreeNode {
  phase: Phase;
  modules: {
    module: Module;
    lessons: LessonMeta[];
  }[];
}

/** Walk every phase → module → lesson. */
export async function listAllLessons(): Promise<LessonTreeNode[]> {
  const tree: LessonTreeNode[] = [];
  for (const phase of PHASES) {
    const modules: LessonTreeNode["modules"] = [];
    for (const mod of phase.modules) {
      const lessons = await listLessons(phase.id, mod.id);
      modules.push({ module: mod, lessons });
    }
    tree.push({ phase, modules });
  }
  return tree;
}

/** Count authored lessons (those with actual MDX files on disk). */
export async function countAuthoredLessons(): Promise<number> {
  const tree = await listAllLessons();
  return tree.reduce(
    (sum, node) => sum + node.modules.reduce((m, x) => m + x.lessons.length, 0),
    0
  );
}

/** Load the full MDX record for every authored lesson. Heavy — use sparingly. */
export async function loadAllLessons(): Promise<LoadedLesson[]> {
  const tree = await listAllLessons();
  const out: LoadedLesson[] = [];
  for (const node of tree) {
    for (const modulePair of node.modules) {
      for (const lesson of modulePair.lessons) {
        const loaded = await loadLesson(lesson.phaseId, lesson.moduleId, lesson.id);
        if (loaded) out.push(loaded);
      }
    }
  }
  return out;
}

/** Flat list of all authored lesson metadata. */
export async function listAllLessonMeta(): Promise<LessonMeta[]> {
  const tree = await listAllLessons();
  return tree.flatMap((node) => node.modules.flatMap((m) => m.lessons));
}

// ─── Questions ──────────────────────────────────────────────────────────────

/**
 * Every authored question across every phase. Phase 0 is the only pool
 * today (40 questions); additional phases will register here as their
 * question banks are authored during the content sprint.
 */
export const ALL_QUESTIONS: AssessmentQuestion[] = [...PHASE_0_QUESTIONS];

export function getAllQuestions(): AssessmentQuestion[] {
  return ALL_QUESTIONS;
}

export function getQuestionsByPhase(phaseId: string): AssessmentQuestion[] {
  return ALL_QUESTIONS.filter((q) => q.phaseId === phaseId);
}

export function getQuestionsByModule(moduleId: string): AssessmentQuestion[] {
  return ALL_QUESTIONS.filter((q) => q.moduleId === moduleId);
}

// ─── Standards extraction ───────────────────────────────────────────────────

export interface StandardRef {
  framework: "cs2023" | "swebok" | "sfia" | "bloom" | "dreyfus";
  code: string;
  lessonIds: string[];
}

/**
 * Collect every standards tag that appears in any lesson frontmatter,
 * grouped by framework, with the list of lessons that reference it.
 * Used to power the standards filter in the teacher browser.
 */
export async function collectStandards(): Promise<StandardRef[]> {
  const metas = await listAllLessonMeta();
  const map = new Map<string, StandardRef>();

  const push = (framework: StandardRef["framework"], code: string, lessonId: string) => {
    if (!code) return;
    const key = `${framework}:${code}`;
    const existing = map.get(key);
    if (existing) {
      if (!existing.lessonIds.includes(lessonId)) existing.lessonIds.push(lessonId);
    } else {
      map.set(key, { framework, code, lessonIds: [lessonId] });
    }
  };

  for (const meta of metas) {
    for (const code of meta.standards.cs2023 ?? []) push("cs2023", code, meta.id);
    for (const code of meta.standards.swebok ?? []) push("swebok", code, meta.id);
    if (meta.standards.sfia) push("sfia", meta.standards.sfia, meta.id);
    push("bloom", meta.bloom, meta.id);
    push("dreyfus", meta.dreyfus, meta.id);
  }

  return Array.from(map.values()).sort((a, b) => {
    if (a.framework !== b.framework) return a.framework.localeCompare(b.framework);
    return a.code.localeCompare(b.code);
  });
}

/** Re-export phase-level helpers so the teacher dashboard has one import surface. */
export { PHASES, getPhase, getModule };
