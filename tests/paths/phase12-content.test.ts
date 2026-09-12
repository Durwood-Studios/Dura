import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import ts from "typescript";
import { compile, createProcessor } from "@mdx-js/mdx";
import { describe, expect, it } from "vitest";
import { auditLesson } from "@/lib/lesson-conformance";
import { canonicalModuleId } from "@/lib/curriculum-ids";

interface MdxNode {
  type: string;
  name?: string | null;
  children?: MdxNode[];
  attributes?: { name?: string; value?: string | { value: string } | null }[];
}
function flatten(node: MdxNode): MdxNode[] {
  return [node, ...(node.children ?? []).flatMap(flatten)];
}
const root = path.resolve("src/content/phases/12-quant-hft");
const files = readdirSync(root).flatMap((directory: string): string[] =>
  readdirSync(path.join(root, directory))
    .filter((name: string): boolean => name.endsWith(".mdx"))
    .map((name: string): string => path.join(root, directory, name))
);

describe("Phase 12 authored contracts", (): void => {
  it("resolves every explicit prerequisite to an authored lesson", (): void => {
    const contentRoot = path.dirname(root);
    const known = new Set<string>();
    for (const phaseDirectory of readdirSync(contentRoot)) {
      const phasePath = path.join(contentRoot, phaseDirectory);
      for (const moduleDirectory of readdirSync(phasePath)) {
        const moduleId = canonicalModuleId(moduleDirectory);
        for (const name of readdirSync(path.join(phasePath, moduleDirectory))) {
          if (name.endsWith(".mdx"))
            known.add(`${Number(phaseDirectory.split("-")[0])}/${moduleId}/${name.split("-")[0]}`);
        }
      }
    }
    for (const file of files) {
      const { data } = matter(readFileSync(file, "utf8"));
      expect(data.prerequisites.length, file).toBeGreaterThan(0);
      for (const prerequisite of data.prerequisites as string[]) {
        expect(known.has(prerequisite), `${file}: ${prerequisite}`).toBe(true);
      }
    }
  });
  it("keeps all 30 migrated lessons free of current structural findings", (): void => {
    expect(files).toHaveLength(30);
    for (const file of files) {
      const { data, content } = matter(readFileSync(file, "utf8"));
      expect(auditLesson({ frontmatter: data, body: content }), file).toEqual([]);
    }
  });

  it("compiles every lesson including its mathematical notation", async (): Promise<void> => {
    try {
      for (const file of files) await compile(matter(readFileSync(file, "utf8")).content);
    } catch (error) {
      console.error(error);
      throw error;
    }
  });

  it("passes string options and an explicit valid answer to every repaired quiz", (): void => {
    for (const file of files) {
      const { content } = matter(readFileSync(file, "utf8"));
      const tree: MdxNode = createProcessor().parse(content);
      const quizzes = flatten(tree).filter((node: MdxNode): boolean => node.name === "Quiz");
      expect(quizzes.length, file).toBeGreaterThan(0);
      for (const quiz of quizzes) {
        const value = quiz.attributes?.find(
          (attribute): boolean => attribute.name === "options"
        )?.value;
        if (!value || typeof value === "string")
          throw new Error(`Missing literal options: ${file}`);
        const source = ts.createSourceFile(
          "options.ts",
          `const options = ${value.value}`,
          ts.ScriptTarget.Latest,
          true
        );
        const statement = source.statements[0];
        const expression =
          statement && ts.isVariableStatement(statement)
            ? statement.declarationList.declarations[0]?.initializer
            : undefined;
        if (!expression || !ts.isArrayLiteralExpression(expression))
          throw new Error(`Expected option array: ${file}`);
        expect(
          expression.elements.every((element: ts.Expression): boolean =>
            ts.isStringLiteral(element)
          ),
          file
        ).toBe(true);
        const answer = quiz.attributes?.find(
          (attribute): boolean => attribute.name === "answer"
        )?.value;
        if (!answer || typeof answer === "string") throw new Error(`Missing answer index: ${file}`);
        expect(Number(answer.value), file).toBeGreaterThanOrEqual(0);
        expect(Number(answer.value), file).toBeLessThan(expression.elements.length);
      }
    }
  });
});
