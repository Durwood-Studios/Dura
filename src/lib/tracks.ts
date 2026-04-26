import { readdirSync, readFileSync } from "fs";
import { join } from "path";
import matter from "gray-matter";
import { ROLES } from "@/content/roles";
import { GOALS } from "@/content/goals";
import type { Role } from "@/types/career-track";

interface ContentMeta {
  slug: string;
  title: string;
  description: string;
  difficulty: string;
  tracks?: string[];
}

function scanContent(dir: string): ContentMeta[] {
  try {
    const files = readdirSync(dir).filter((f) => f.endsWith(".mdx"));
    return files.map((file) => {
      const raw = readFileSync(join(dir, file), "utf-8");
      const { data } = matter(raw);
      return data as ContentMeta;
    });
  } catch {
    return [];
  }
}

/** Get all tutorials tagged for a given role ID. */
export function getTutorialsForRole(roleId: string): ContentMeta[] {
  const dir = join(process.cwd(), "src/content/tutorials");
  return scanContent(dir).filter((t) => t.tracks?.includes(roleId));
}

/** Get all how-to guides tagged for a given role ID. */
export function getGuidesForRole(roleId: string): ContentMeta[] {
  const dir = join(process.cwd(), "src/content/howto");
  return scanContent(dir).filter((g) => g.tracks?.includes(roleId));
}

/** Get all roles that a tutorial belongs to (by slug). */
export function getRolesForTutorial(slug: string): Role[] {
  const dir = join(process.cwd(), "src/content/tutorials");
  const all = scanContent(dir);
  const tutorial = all.find((t) => t.slug === slug);
  if (!tutorial?.tracks) return [];
  return ROLES.filter((r) => tutorial.tracks!.includes(r.id));
}

/** Get roles recommended for a goal. */
export function getRolesForGoal(goalId: string): Role[] {
  const goal = GOALS.find((g) => g.id === goalId);
  if (!goal) return [];
  return ROLES.filter((r) => goal.roleIds.includes(r.id));
}

/** Validate that every tutorial has at least one track and every role has tutorials. */
export function validateTrackCoverage(): {
  orphanedTutorials: string[];
  emptyRoles: string[];
} {
  const dir = join(process.cwd(), "src/content/tutorials");
  const tutorials = scanContent(dir);
  const orphaned = tutorials.filter((t) => !t.tracks || t.tracks.length === 0).map((t) => t.slug);

  const empty = ROLES.filter((r) => {
    const count = tutorials.filter((t) => t.tracks?.includes(r.id)).length;
    return count < 3;
  }).map((r) => r.id);

  return { orphanedTutorials: orphaned, emptyRoles: empty };
}
