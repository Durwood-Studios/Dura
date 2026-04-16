import "server-only";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";

const PHASES_ROOT = join(process.cwd(), "src", "content", "phases");
const TUTORIALS_ROOT = join(process.cwd(), "src", "content", "tutorials");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface LessonFm {
  vocabulary?: string[];
}

interface TutorialFm {
  slug?: string;
  tags?: string[];
}

function safeReaddirSync(dir: string): string[] {
  try {
    return readdirSync(dir);
  } catch {
    return [];
  }
}

/** Walk all lesson MDX files and return their parsed frontmatter + computed lesson ID. */
function walkLessons(): { lessonId: string; fm: LessonFm }[] {
  const results: { lessonId: string; fm: LessonFm }[] = [];

  const phaseDirs = safeReaddirSync(PHASES_ROOT);
  for (const phaseDir of phaseDirs) {
    const phasePath = join(PHASES_ROOT, phaseDir);
    let moduleDirs: string[];
    try {
      moduleDirs = readdirSync(phasePath, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name);
    } catch {
      continue;
    }

    for (const modDir of moduleDirs) {
      const modPath = join(phasePath, modDir);
      const files = safeReaddirSync(modPath).filter((f) => f.endsWith(".mdx"));

      for (const file of files) {
        const lessonId = file.split("-")[0];
        const raw = readFileSync(join(modPath, file), "utf-8");
        const { data } = matter(raw);
        results.push({ lessonId, fm: data as LessonFm });
      }
    }
  }

  return results;
}

/** Walk all tutorial MDX files and return their parsed frontmatter. */
function walkTutorials(): TutorialFm[] {
  const files = safeReaddirSync(TUTORIALS_ROOT).filter((f) => f.endsWith(".mdx"));
  return files.map((file) => {
    const raw = readFileSync(join(TUTORIALS_ROOT, file), "utf-8");
    const { data } = matter(raw);
    const fm = data as TutorialFm;
    // Derive slug from filename if not in frontmatter
    if (!fm.slug) {
      fm.slug = file.replace(/^\d+-/, "").replace(/\.mdx$/, "");
    }
    return fm;
  });
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Build a map from dictionary term slug to all lessons and tutorials that
 * reference it (via the `vocabulary` frontmatter field in lessons, or `tags`
 * in tutorials).
 */
export function buildTermReferences(): Map<
  string,
  { lessonIds: string[]; tutorialSlugs: string[] }
> {
  const map = new Map<string, { lessonIds: string[]; tutorialSlugs: string[] }>();

  function ensureEntry(slug: string): { lessonIds: string[]; tutorialSlugs: string[] } {
    let entry = map.get(slug);
    if (!entry) {
      entry = { lessonIds: [], tutorialSlugs: [] };
      map.set(slug, entry);
    }
    return entry;
  }

  // Lessons reference terms via vocabulary[]
  for (const { lessonId, fm } of walkLessons()) {
    if (!fm.vocabulary) continue;
    for (const term of fm.vocabulary) {
      ensureEntry(term).lessonIds.push(lessonId);
    }
  }

  // Tutorials reference terms via tags[]
  for (const fm of walkTutorials()) {
    if (!fm.tags || !fm.slug) continue;
    for (const tag of fm.tags) {
      ensureEntry(tag).tutorialSlugs.push(fm.slug);
    }
  }

  return map;
}

/**
 * Build a map from lesson ID to all dictionary terms it teaches
 * (drawn from the lesson's `vocabulary` frontmatter array).
 */
export function buildLessonTerms(): Map<string, string[]> {
  const map = new Map<string, string[]>();

  for (const { lessonId, fm } of walkLessons()) {
    if (fm.vocabulary && fm.vocabulary.length > 0) {
      const existing = map.get(lessonId) ?? [];
      map.set(lessonId, [...existing, ...fm.vocabulary]);
    }
  }

  return map;
}

/**
 * Build a map from tutorial slug to skills (tags) it practices,
 * drawn from the tutorial's `tags` frontmatter array.
 */
export function buildTutorialSkills(): Map<string, string[]> {
  const map = new Map<string, string[]>();

  for (const fm of walkTutorials()) {
    if (fm.slug && fm.tags && fm.tags.length > 0) {
      map.set(fm.slug, fm.tags);
    }
  }

  return map;
}
