import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import vm from "node:vm";
import matter from "gray-matter";
import { createProcessor } from "@mdx-js/mdx";
import { describe, expect, it } from "vitest";

interface Node {
  type: string;
  name?: string | null;
  children?: Node[];
  attributes?: { name?: string; value?: string | { value: string } | null }[];
}
function nodes(node: Node): Node[] {
  return [node, ...(node.children ?? []).flatMap(nodes)];
}
function props(node: Node): Record<string, unknown> {
  return Object.fromEntries(
    (node.attributes ?? [])
      .filter((attribute) => attribute.name)
      .map((attribute) => [
        attribute.name,
        typeof attribute.value === "object" && attribute.value !== null
          ? (vm.runInNewContext(`(${attribute.value.value})`, {}, { timeout: 100 }) as unknown)
          : attribute.value,
      ])
  );
}
function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Expected question object");
  return value as Record<string, unknown>;
}
const root = path.resolve("src/content/phases");
const files = readdirSync(root, { recursive: true }).filter(
  (name): name is string => typeof name === "string" && name.endsWith(".mdx")
);

describe("authored assessment component contracts", () => {
  it("provides renderable quiz options, valid answer indices, and reachable blanks", () => {
    const failures: string[] = [];
    for (const file of files) {
      const content = matter(readFileSync(path.join(root, file), "utf8")).content;
      const tree: Node = createProcessor().parse(content);
      for (const node of nodes(tree).filter(
        (entry) => entry.name === "Quiz" || entry.name === "FillBlank"
      )) {
        try {
          const attributes = props(node);
          if (node.name === "Quiz") {
            const questions = attributes.questions ?? [
              { ...attributes, correct: attributes.answer ?? attributes.correct },
            ];
            expect(Array.isArray(questions)).toBe(true);
            expect((questions as unknown[]).length).toBeGreaterThan(0);
            for (const value of questions as unknown[]) {
              const question = record(value);
              expect(typeof question.question).toBe("string");
              expect(Array.isArray(question.options)).toBe(true);
              const options = question.options as unknown[];
              expect(options.length).toBeGreaterThan(1);
              expect(
                options.every((option) => typeof option === "string" && option.trim().length > 0)
              ).toBe(true);
              const correct = Array.isArray(question.correct)
                ? question.correct
                : [question.correct];
              expect(correct.length).toBeGreaterThan(0);
              for (const index of correct) {
                expect(Number.isInteger(index)).toBe(true);
                expect(index).toBeGreaterThanOrEqual(0);
                expect(index).toBeLessThan(options.length);
              }
            }
          } else {
            const prompt = attributes.prompt ?? attributes.question;
            const answers = attributes.answers ?? [attributes.answer];
            expect(typeof prompt).toBe("string");
            expect(Array.isArray(answers)).toBe(true);
            expect(
              (answers as unknown[]).every(
                (answer) => typeof answer === "string" && answer.trim().length > 0
              )
            ).toBe(true);
            const count = (String(prompt).match(/_{3,}/g) ?? []).length;
            // The legacy single-question API appends one blank if none is authored.
            expect(count || (attributes.question ? 1 : 0)).toBe((answers as unknown[]).length);
          }
        } catch (error: unknown) {
          failures.push(
            `${file} <${node.name}>: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      }
    }
    expect(failures).toEqual([]);
  }, 20000);
});
