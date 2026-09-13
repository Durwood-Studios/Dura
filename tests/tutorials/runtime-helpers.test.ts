import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import ts from "typescript";

function extractedFunction(path: string, name: string): (...args: unknown[]) => unknown {
  const source = readFileSync(path, "utf8");
  for (const block of source.matchAll(/```(?:typescript|javascript)\n([\s\S]*?)```/g)) {
    const parsed = ts.createSourceFile("snippet.ts", block[1], ts.ScriptTarget.Latest, true);
    const declaration = parsed.statements.find(
      (node): node is ts.FunctionDeclaration =>
        ts.isFunctionDeclaration(node) && node.name?.text === name
    );
    if (!declaration) continue;
    const output = ts.transpileModule(declaration.getText(parsed), {
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None },
    }).outputText;
    // Executing trusted repository teaching code is the purpose of this regression.
    return new Function(`${output}; return ${name};`)() as (...args: unknown[]) => unknown;
  }
  throw new Error(`Missing authored helper ${name}`);
}
it("embedding result highlighting preserves text without interpreting document HTML", () => {
  const highlight = extractedFunction(
    "src/content/tutorials/32-embeddings-search.mdx",
    "highlightQuery"
  );
  const element = document.createElement("div");
  const text = "<img src=x onerror=alert(1)> Query query";
  element.append(highlight(text, "query") as DocumentFragment);
  expect(element.textContent).toBe(text);
  expect(element.querySelector("img")).toBeNull();
  expect(element.querySelectorAll("mark")).toHaveLength(2);
});
it("monitoring charts keep zero/equal-time samples finite", () => {
  const render = extractedFunction(
    "src/content/tutorials/31-monitoring-dashboard.mdx",
    "renderChart"
  );
  const coordinates: number[] = [];
  const context = {
    clearRect: () => {},
    beginPath: () => {},
    stroke: () => {},
    setLineDash: () => {},
    moveTo: (x: number, y: number) => coordinates.push(x, y),
    lineTo: (x: number, y: number) => coordinates.push(x, y),
  };
  render(
    context,
    [
      { timestamp: 1, value: 0 },
      { timestamp: 1, value: 0 },
    ],
    { width: 600, height: 200, color: "blue" }
  );
  expect(coordinates.every(Number.isFinite)).toBe(true);
});
it("migration parsing refuses missing markers, wrong order and empty destructive instructions", () => {
  const parse = extractedFunction("src/content/tutorials/40-migration-tool.mdx", "parseMigration");
  expect(parse("-- Up\nSELECT 1;\n-- Down\nSELECT 2;")).toEqual({
    up: "SELECT 1;",
    down: "SELECT 2;",
  });
  for (const input of [
    "SELECT 1; -- Down SELECT 2;",
    "-- Down SELECT 1; -- Up SELECT 2;",
    "-- Up\n-- Down\n",
  ])
    expect(() => parse(input)).toThrow();
});
