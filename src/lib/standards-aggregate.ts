import "server-only";
import { listAllLessonParams, loadLesson } from "@/lib/content";
import { PHASE_STANDARDS } from "@/content/standards-map";
import { PHASES, getModule } from "@/content/phases";
import { STANDARDS_BODIES, type StandardsBody, type StandardsBodyId } from "@/lib/standards";

export interface ModuleRef {
  phaseId: string;
  moduleId: string;
  phaseTitle: string;
  phaseColor: string;
  moduleTitle: string;
}

export interface CodeCoverage {
  code: string;
  /** Modules that surface this code, sorted by phase + module order. */
  modules: ModuleRef[];
}

export interface BodyCoverage {
  body: StandardsBody;
  /** Total distinct modules that touch any code in this body. */
  moduleCount: number;
  /** Total distinct codes covered. */
  codeCount: number;
  /** All codes covered, sorted alphabetically, each with the modules that surface it. */
  codes: CodeCoverage[];
}

interface Accumulator {
  // body → code → set of "phaseId/moduleId"
  byBody: Map<StandardsBodyId, Map<string, Set<string>>>;
}

function moduleKey(phaseId: string, moduleId: string): string {
  return `${phaseId}/${moduleId}`;
}

function addCode(
  acc: Accumulator,
  body: StandardsBodyId,
  code: string,
  phaseId: string,
  moduleId: string
): void {
  const trimmed = code.trim();
  if (!trimmed) return;
  let byCode = acc.byBody.get(body);
  if (!byCode) {
    byCode = new Map();
    acc.byBody.set(body, byCode);
  }
  let mods = byCode.get(trimmed);
  if (!mods) {
    mods = new Set();
    byCode.set(trimmed, mods);
  }
  mods.add(moduleKey(phaseId, moduleId));
}

function capitalize(s: string): string {
  return s.length === 0 ? s : s[0].toUpperCase() + s.slice(1);
}

function formatDreyfus(s: string): string {
  return s.split("-").map(capitalize).join(" ");
}

function resolveModuleRefs(keys: Set<string>): ModuleRef[] {
  const refs: ModuleRef[] = [];
  for (const key of keys) {
    const [phaseId, moduleId] = key.split("/");
    const phase = PHASES.find((p) => p.id === phaseId);
    const mod = getModule(phaseId, moduleId);
    if (!phase || !mod) continue;
    refs.push({
      phaseId,
      moduleId,
      phaseTitle: phase.title,
      phaseColor: phase.color,
      moduleTitle: mod.title,
    });
  }
  return refs.sort(
    (a, b) =>
      a.phaseId.localeCompare(b.phaseId, undefined, { numeric: true }) ||
      a.moduleId.localeCompare(b.moduleId, undefined, { numeric: true })
  );
}

/**
 * Walk every lesson + PHASE_STANDARDS entry and produce a body-by-body
 * map of every standards code DURA's curriculum touches, with the
 * modules that surface each code. Server-only — reads MDX files.
 */
export async function aggregateStandards(): Promise<BodyCoverage[]> {
  const acc: Accumulator = { byBody: new Map() };

  // 1. Lesson-level frontmatter: cs2023, swebok, sfia, bloom, dreyfus
  const params = await listAllLessonParams();
  for (const { phaseId, moduleId, lessonId } of params) {
    const lesson = await loadLesson(phaseId, moduleId, lessonId);
    if (!lesson) continue;
    const std = lesson.meta.standards;
    if (std.cs2023) for (const c of std.cs2023) addCode(acc, "cs2023", c, phaseId, moduleId);
    if (std.swebok) for (const c of std.swebok) addCode(acc, "swebok", c, phaseId, moduleId);
    if (std.sfia) addCode(acc, "sfia", std.sfia, phaseId, moduleId);
    if (lesson.meta.bloom) addCode(acc, "bloom", capitalize(lesson.meta.bloom), phaseId, moduleId);
    if (lesson.meta.dreyfus)
      addCode(acc, "dreyfus", formatDreyfus(lesson.meta.dreyfus), phaseId, moduleId);
  }

  // 2. Module-level PHASE_STANDARDS: csta, apCSP, apCSA, iste, sfia, owasp, ieee7000, nice
  for (const ps of PHASE_STANDARDS) {
    for (const c of ps.csta) addCode(acc, "csta", c, ps.phaseId, ps.moduleId);
    for (const c of ps.apCSP) addCode(acc, "apcsp", c, ps.phaseId, ps.moduleId);
    for (const c of ps.apCSA) addCode(acc, "apcsa", c, ps.phaseId, ps.moduleId);
    for (const c of ps.iste) addCode(acc, "iste", c, ps.phaseId, ps.moduleId);
    if (ps.sfia) addCode(acc, "sfia", ps.sfia, ps.phaseId, ps.moduleId);
    if (ps.owasp) for (const c of ps.owasp) addCode(acc, "owasp", c, ps.phaseId, ps.moduleId);
    if (ps.ieee7000)
      for (const c of ps.ieee7000) addCode(acc, "ieee7000", c, ps.phaseId, ps.moduleId);
    if (ps.nice) for (const c of ps.nice) addCode(acc, "nice", c, ps.phaseId, ps.moduleId);
  }

  // 3. Build body-by-body coverage in STANDARDS_BODIES insertion order.
  const result: BodyCoverage[] = [];
  for (const id of Object.keys(STANDARDS_BODIES) as StandardsBodyId[]) {
    const byCode = acc.byBody.get(id);
    if (!byCode || byCode.size === 0) continue;
    const codes: CodeCoverage[] = Array.from(byCode.entries())
      .map(([code, keys]) => ({ code, modules: resolveModuleRefs(keys) }))
      .sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));
    const moduleKeys = new Set<string>();
    for (const keys of byCode.values()) for (const k of keys) moduleKeys.add(k);
    result.push({
      body: STANDARDS_BODIES[id],
      moduleCount: moduleKeys.size,
      codeCount: codes.length,
      codes,
    });
  }
  return result;
}
