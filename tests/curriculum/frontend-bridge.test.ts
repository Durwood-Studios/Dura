import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import matter from "gray-matter";
import { compile } from "@mdx-js/mdx";
import { getSkill } from "@/content/skills";
import { ALL_QUESTIONS } from "@/content/questions";
import { getPhase } from "@/content/phases";
import { auditLesson } from "@/lib/lesson-conformance";

vi.mock("server-only", (): object => ({}));
import { listLessons } from "@/lib/content";

const lessons = [
  ["css-architecture", "11-css-architecture.mdx", "11"],
  ["design-systems", "12-design-system-contracts.mdx", "12"],
] as const;

describe("frontend career bridges", () => {
  for (const [skill, file, id] of lessons) {
    it(`${skill} has actual applied teaching, a reachable mapping, and source-linked questions`, async () => {
      try {
        const { data, content } = matter(
          readFileSync(`src/content/phases/2-web-development/2-2-css-fundamentals/${file}`, "utf8")
        );
        expect(auditLesson({ frontmatter: data, body: content })).toEqual([]);
        await compile(content);
        expect(getSkill(skill)?.lessonIds).toContain(`2/2-2/${id}`);
        expect(content).toContain("<!doctype html>");
        expect(content).toContain("<WrittenExercise");
        expect(content).toContain("<details>");
        expect(
          ALL_QUESTIONS.filter((question) => question.sourceLesson === `2/2-2/${id}`).length
        ).toBe(3);
      } catch (error: unknown) {
        throw new Error(`Frontend bridge ${skill} failed its teaching contract`, { cause: error });
      }
    });
  }
  it("includes the reviewed bridges in the expanded module navigation inventory", async (): Promise<void> => {
    try {
      const registered = getPhase("2")?.modules.find((unit) => unit.id === "2-2");
      const navigation = await listLessons("2", "2-2");
      expect(registered?.lessonCount).toBe(14);
      expect(navigation).toHaveLength(registered?.lessonCount ?? 0);
      for (const [, , id] of lessons)
        expect(
          navigation.some((lesson) => lesson.id === id),
          id
        ).toBe(true);
      expect(getPhase("2")?.lessonCount).toBe(80);
    } catch (error: unknown) {
      throw new Error("Frontend bridges are missing from module navigation", { cause: error });
    }
  });
});
