import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { compile } from "@mdx-js/mdx";
import { describe, expect, it } from "vitest";
import { auditLesson } from "@/lib/lesson-conformance";

const ROOT = path.resolve("src/content/phases");
const LESSONS = ["10-embedded", "11-hardware-verification"].flatMap((phase: string): string[] =>
  readdirSync(path.join(ROOT, phase), { withFileTypes: true })
    .filter((entry): boolean => entry.isDirectory())
    .flatMap((entry): string[] =>
      readdirSync(path.join(ROOT, phase, entry.name))
        .filter((name: string): boolean => name.endsWith(".mdx"))
        .map((name: string): string => path.join(ROOT, phase, entry.name, name))
    )
);

describe("Embedded and hardware lesson delivery", (): void => {
  for (const filename of LESSONS) {
    it(path.relative(ROOT, filename), async (): Promise<void> => {
      const { data, content } = matter(readFileSync(filename, "utf8"));
      expect(auditLesson({ frontmatter: data, body: content })).toEqual([]);
      // These languages require target tools; the browser runner cannot grade them.
      expect(content).not.toMatch(/<SandboxExercise\b/);
      expect(content).toMatch(/<WrittenExercise\b/);
      expect(content).not.toMatch(/<Quiz\s*>|\bcorrectIndex\s*:|\bblanks\s*=/);
      try {
        await compile(content);
      } catch (error: unknown) {
        throw new Error(`Lesson cannot render: ${filename}`, { cause: error });
      }
    });
  }
});
