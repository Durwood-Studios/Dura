import { ROLES } from "@/content/roles";
import { getSkill } from "@/content/skills";

/** Authored study coverage for a role, never a certificate or job-competence inference. */
export function getRoleLessonIds(roleId: string): string[] {
  const role = ROLES.find((entry) => entry.id === roleId);
  if (!role) return [];
  const required = Object.values(role.levels).flatMap((level) => level.required);
  return [...new Set(required.flatMap((id) => getSkill(id)?.lessonIds ?? []))];
}

/** Requirements without linked lessons remain visible so a coverage gap cannot look complete. */
export function getRoleCoverageGaps(roleId: string): string[] {
  const role = ROLES.find((entry) => entry.id === roleId);
  if (!role) return [];
  return [...new Set(Object.values(role.levels).flatMap((level) => level.required))].filter(
    (id) => !getSkill(id)?.lessonIds.length
  );
}

export interface CareerRequirement {
  id: string;
  name: string;
  skillId: string | null;
  lessonIds: string[];
  tutorialSlugs: string[];
  coverage: "study-linked" | "not-yet-covered";
}

/** Resolve every declared role requirement, preserving uncovered topics as explicit curriculum work. */
export function getCareerRequirement(id: string): CareerRequirement | undefined {
  const isDeclared = ROLES.some((role) =>
    Object.values(role.levels).some((level) => [...level.required, ...level.valuable].includes(id))
  );
  if (!isDeclared) return undefined;
  const skill = getSkill(id);
  const label = ROLES.flatMap((role) => role.skills.flatMap((group) => group.items)).find(
    (item) => item.skillId === id
  )?.skill;
  return {
    id,
    name: skill?.name ?? label ?? id.replaceAll("-", " "),
    skillId: skill?.id ?? null,
    lessonIds: skill?.lessonIds ?? [],
    tutorialSlugs: skill?.tutorialSlugs ?? [],
    coverage:
      skill?.lessonIds.length || skill?.tutorialSlugs.length ? "study-linked" : "not-yet-covered",
  };
}
