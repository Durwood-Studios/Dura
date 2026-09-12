import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import vm from "node:vm";
import matter from "gray-matter";
import { compile, createProcessor } from "@mdx-js/mdx";
import { describe, expect, it } from "vitest";
import { auditLesson } from "@/lib/lesson-conformance";

const ROOT = path.resolve("src/content/phases");
const LESSONS = ["14-manufacturing"].flatMap((phase: string): string[] =>
  readdirSync(path.join(ROOT, phase), { withFileTypes: true })
    .filter((entry): boolean => entry.isDirectory() && /^m-[1-6]-/.test(entry.name))
    .flatMap((entry): string[] =>
      readdirSync(path.join(ROOT, phase, entry.name))
        .filter((name: string): boolean => name.endsWith(".mdx"))
        .map((name: string): string => path.join(ROOT, phase, entry.name, name))
    )
);

describe("Manufacturing foundations lesson delivery", (): void => {
  for (const filename of LESSONS) {
    it(path.relative(ROOT, filename), async (): Promise<void> => {
      const { data, content } = matter(readFileSync(filename, "utf8"));
      expect(auditLesson({ frontmatter: data, body: content })).toEqual([]);
      // Manufacturing evidence is reviewed as writing, never misrepresented as machine validation.
      expect(content).not.toMatch(/<SandboxExercise\b/);
      expect(content).toMatch(/<WrittenExercise\b/);
      expect(content).not.toMatch(/<Quiz\s*>|\bcorrectIndex\s*:|\bblanks\s*=/);
      const tree = createProcessor().parse(content);
      const pending: unknown[] = [tree];
      while (pending.length) {
        const value = pending.pop();
        if (!value || typeof value !== "object") continue;
        const node = value as {
          name?: string;
          children?: unknown[];
          attributes?: { name: string; value?: { value?: string } }[];
        };
        pending.push(...(node.children ?? []));
        if (node.name !== "Quiz") continue;
        const expression = node.attributes?.find(
          (attribute): boolean => attribute.name === "questions"
        )?.value?.value;
        expect(expression).toBeTruthy();
        const questions: unknown = vm.runInNewContext(`(${expression})`, {}, { timeout: 100 });
        expect(Array.isArray(questions)).toBe(true);
        if (!Array.isArray(questions)) throw new Error("Invalid quiz array");
        for (const question of questions as {
          question: string;
          options: unknown[];
          correct: number;
          explanation: string;
        }[]) {
          expect(typeof question.question).toBe("string");
          expect(
            question.options.every((option: unknown): boolean => typeof option === "string")
          ).toBe(true);
          expect(question.correct).toBeGreaterThanOrEqual(0);
          expect(question.correct).toBeLessThan(question.options.length);
          expect(Number.isInteger(question.correct)).toBe(true);
          expect(typeof question.explanation).toBe("string");
        }
      }
      try {
        await compile(content);
      } catch (error: unknown) {
        throw new Error(`Lesson cannot render: ${filename}`, { cause: error });
      }
    });
  }
});
