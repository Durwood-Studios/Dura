import { ROLES } from "@/content/roles";
import { readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { SKILLS, getSkill } from "@/content/skills";
import { SKILL_ALIASES } from "@/content/skill-aliases";
import { getRoleLessonIds, getRoleCoverageGaps, getCareerRequirement } from "@/lib/career-coverage";

const files = readdirSync("src/content/phases", { recursive: true }).filter(
  (file): file is string =>
    typeof file === "string" && file.endsWith(".mdx") && !file.includes(" 2.")
);
const ids = new Set(
  files.map((file) => {
    const [phaseFolder, moduleFolder, lesson] = file.split(path.sep);
    const phase = phaseFolder.split("-")[0];
    const moduleNumber = moduleFolder.split("-")[1];
    return `${phase}/${phase}-${moduleNumber}/${lesson.split("-")[0]}`;
  })
);

describe("career study coverage", () => {
  it("gives every catalog skill reachable authored entry lessons", () => {
    for (const skill of SKILLS) {
      expect(skill.lessonIds.length, skill.id).toBeGreaterThan(0);
      for (const id of skill.lessonIds) expect(ids.has(id), `${skill.id}: ${id}`).toBe(true);
    }
    for (const alias of Object.keys(SKILL_ALIASES)) expect(getSkill(alias), alias).toBeDefined();
  });
  it("resolves every declared role requirement without disguising curriculum gaps", () => {
    for (const role of ROLES)
      for (const level of Object.values(role.levels))
        for (const id of [...level.required, ...level.valuable]) {
          const requirement = getCareerRequirement(id);
          expect(requirement, id).toBeDefined();
          if (requirement?.coverage === "study-linked")
            expect(requirement.lessonIds.length + requirement.tutorialSlugs.length).toBeGreaterThan(
              0
            );
          else expect(requirement?.skillId).toBeNull();
        }
  });

  it("distinguishes covered study from unsupported role requirements", () => {
    expect(getRoleLessonIds("frontend").length).toBeGreaterThan(0);
    expect(getRoleLessonIds("missing")).toEqual([]);
    expect(getRoleCoverageGaps("missing")).toEqual([]);
  });
});
