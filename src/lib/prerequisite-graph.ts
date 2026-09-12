import "server-only";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import { canonicalModuleId } from "@/lib/curriculum-ids";

interface LessonNode {
  /** Canonical route identity, e.g. "4/4-3/05" */
  id: string;
  phaseId: string;
  moduleId: string;
  title: string;
  /** Lesson IDs this lesson depends on. */
  prerequisites: string[];
  /** Computed inverse — lessons that list this one as a prerequisite. */
  unlocks: string[];
}

const CONTENT_ROOT = join(process.cwd(), "src", "content", "phases");

/** Singleton cache so the graph is built at most once per server lifecycle. */
let cachedGraph: Map<string, LessonNode> | null = null;

/**
 * Build the full prerequisite graph from lesson frontmatter.
 * Server-side only — scans every MDX file in `src/content/phases/`.
 */
export function buildPrerequisiteGraph(): Map<string, LessonNode> {
  if (cachedGraph) return cachedGraph;

  const graph = new Map<string, LessonNode>();

  let phaseDirs: string[];
  try {
    phaseDirs = readdirSync(CONTENT_ROOT, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);
  } catch {
    // Content directory may not exist yet during CI or early dev
    return graph;
  }

  for (const phaseDir of phaseDirs) {
    const phaseId = phaseDir.split("-")[0];
    const phasePath = join(CONTENT_ROOT, phaseDir);

    const moduleDirs = readdirSync(phasePath, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);

    for (const modDir of moduleDirs) {
      const moduleId = canonicalModuleId(modDir);
      if (!moduleId) continue;
      const modPath = join(phasePath, modDir);

      const files = readdirSync(modPath).filter((f) => f.endsWith(".mdx"));

      for (const file of files) {
        const lessonId = file.split("-")[0];
        const raw = readFileSync(join(modPath, file), "utf-8");
        const { data } = matter(raw);

        const node: LessonNode = {
          id: `${phaseId}/${moduleId}/${lessonId}`,
          phaseId,
          moduleId,
          title: (data.title as string) ?? file,
          prerequisites: Array.isArray(data.prerequisites) ? (data.prerequisites as string[]) : [],
          unlocks: [], // computed below
        };

        graph.set(node.id, node);
      }
    }
  }

  // Resolve historical composite IDs without guessing ambiguous bare lesson numbers.
  for (const node of graph.values()) {
    node.prerequisites = node.prerequisites.map((id: string): string => {
      if (graph.has(id)) return id;
      const composite = /^(\d+|[ehqrm])-(\d+)-(\d+)$/.exec(id);
      if (!composite) return id; // Vocabulary slugs are valid prerequisites, not graph nodes.
      const moduleId = canonicalModuleId(`${composite[1]}-${composite[2]}`);
      if (!moduleId) return id;
      const candidate = `${moduleId.split("-")[0]}/${moduleId}/${composite[3]}`;
      return graph.has(candidate) ? candidate : id;
    });
  }

  // Invert: for each prerequisite edge A → B, add B to A.unlocks
  for (const node of graph.values()) {
    for (const prereqId of node.prerequisites) {
      const prereqNode = graph.get(prereqId);
      if (prereqNode) {
        prereqNode.unlocks.push(node.id);
      }
    }
  }

  cachedGraph = graph;
  return graph;
}

/** Get lessons that depend on the given lesson (what it "unlocks"). */
export function getUnlockedBy(lessonId: string): LessonNode[] {
  const graph = buildPrerequisiteGraph();
  const node = graph.get(lessonId);
  if (!node) return [];
  return node.unlocks.map((id) => graph.get(id)).filter((n): n is LessonNode => n !== undefined);
}

/** Get the prerequisite lessons for a given lesson. */
export function getPrerequisitesFor(lessonId: string): LessonNode[] {
  const graph = buildPrerequisiteGraph();
  const node = graph.get(lessonId);
  if (!node) return [];
  return node.prerequisites
    .map((id) => graph.get(id))
    .filter((n): n is LessonNode => n !== undefined);
}

/**
 * Find prerequisite gaps — lessons a user hasn't completed that block
 * a target lesson. Walks the full transitive prerequisite chain.
 */
export function findGaps(targetLessonId: string, completedLessonIds: string[]): string[] {
  const graph = buildPrerequisiteGraph();
  const completed = new Set(completedLessonIds);
  const gaps: string[] = [];
  const visited = new Set<string>();

  function walk(id: string): void {
    if (visited.has(id)) return;
    visited.add(id);

    const node = graph.get(id);
    if (!node) return;

    for (const prereqId of node.prerequisites) {
      if (graph.has(prereqId) && !completed.has(prereqId)) {
        gaps.push(prereqId);
      }
      walk(prereqId);
    }
  }

  walk(targetLessonId);
  return [...new Set(gaps)];
}
