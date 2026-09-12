import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import vm from "node:vm";
import matter from "gray-matter";
import ts from "typescript";
import { createProcessor } from "@mdx-js/mdx";
import { describe, expect, it } from "vitest";

interface MdxNode {
  type: string;
  name?: string | null;
  children?: MdxNode[];
  attributes?: { name?: string; value?: string | { value: string } | null }[];
}

function flatten(node: MdxNode): MdxNode[] {
  return [node, ...(node.children ?? []).flatMap(flatten)];
}

function solutionFor(phase: number, moduleId: string, lessonId: string): string {
  const root = path.resolve("src/content/phases");
  const phaseDirectory = readdirSync(root).find((name: string): boolean =>
    name.startsWith(`${phase}-`)
  );
  if (!phaseDirectory) throw new Error(`Missing phase ${phase}`);
  const phasePath = path.join(root, phaseDirectory);
  const moduleDirectory = readdirSync(phasePath).find((name: string): boolean =>
    name.startsWith(`${moduleId}-`)
  );
  if (!moduleDirectory) throw new Error(`Missing module ${moduleId}`);
  const modulePath = path.join(phasePath, moduleDirectory);
  const lessonFile = readdirSync(modulePath).find((name: string): boolean =>
    name.startsWith(`${lessonId}-`)
  );
  if (!lessonFile) throw new Error(`Missing lesson ${lessonId}`);
  const { content } = matter(readFileSync(path.join(modulePath, lessonFile), "utf8"));
  const tree: MdxNode = createProcessor().parse(content);
  const exercise = flatten(tree).find((node: MdxNode): boolean => node.name === "SandboxExercise");
  const value = exercise?.attributes?.find(
    (attribute): boolean => attribute.name === "solution"
  )?.value;
  if (typeof value === "string") return value;
  if (!value) throw new Error("Missing reference solution");
  const source = ts.createSourceFile(
    "solution.ts",
    `const value = ${value.value}`,
    ts.ScriptTarget.Latest,
    true
  );
  const statement = source.statements[0];
  const expression =
    statement && ts.isVariableStatement(statement)
      ? statement.declarationList.declarations[0]?.initializer
      : undefined;
  if (
    expression &&
    (ts.isStringLiteral(expression) || ts.isNoSubstitutionTemplateLiteral(expression))
  )
    return expression.text;
  throw new Error("Expected literal reference solution");
}

function execute(source: string): unknown[][] {
  const output: unknown[][] = [];
  vm.runInNewContext(
    source,
    {
      console: {
        log: (...values: unknown[]): void => {
          output.push(values);
        },
      },
    },
    { timeout: 1000 }
  );
  return output;
}

describe("Authored exercise reference regressions", (): void => {
  for (const [moduleId, lessonId] of [
    ["2-2", "01"],
    ["2-2", "02"],
    ["2-2", "03"],
    ["2-3", "01"],
    ["2-3", "03"],
    ["2-3", "04"],
    ["2-3", "06"],
    ["2-3", "07"],
    ["2-3", "08"],
    ["2-7", "03"],
    ["2-7", "04"],
  ]) {
    it(`${moduleId}/${lessonId} satisfies its supplied behavioral checks`, (): void => {
      const output = execute(solutionFor(2, moduleId, lessonId));
      expect(output.length).toBeGreaterThan(0);
      expect(output.every((row: unknown[]): boolean => row[0] === true)).toBe(true);
    });
  }
  it("calculator reference uses a valid multiplication operator", (): void => {
    expect(
      execute(`${solutionFor(1, "1-6", "39")}\nconsole.log(calculate(6, "*", 7));`).at(-1)
    ).toEqual([42]);
  });
  it("heap operations terminate and extract sorted values", (): void => {
    const output = execute(solutionFor(3, "3-3", "06"));
    expect(output.at(-1)).toEqual(["Is sorted:", true]);
  });
  it("dependency build order puts dependencies before their consumers", (): void => {
    const output = execute(solutionFor(3, "3-4", "08"));
    expect(output.at(-1)).toEqual(["Build order:", ["D", "B", "C", "A"]]);
  });
  it("RPN examples contain complete expressions and truncate negative division", (): void => {
    const output = execute(solutionFor(3, "3-3", "08"));
    expect(output).toHaveLength(5);
    expect(output.every((row: unknown[]): boolean => String(row[0]).endsWith("PASS"))).toBe(true);
  });
});
