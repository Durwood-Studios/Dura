import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";

/** Source literals can reveal local-only paths even when reads are split across variables. */
function localReportPaths(source: string, fileName: string): string[] {
  const file = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true);
  const paths: string[] = [];
  const visit = (node: ts.Node): void => {
    if (
      (ts.isStringLiteralLike(node) ||
        ts.isTemplateHead(node) ||
        ts.isTemplateMiddle(node) ||
        ts.isTemplateTail(node)) &&
      /(?:^|\/)xDocs(?:\/|$)/i.test(node.text.replaceAll("\\", "/"))
    )
      paths.push(node.text);
    ts.forEachChild(node, visit);
  };
  visit(file);
  return paths;
}

describe("portable source inputs", (): void => {
  it("detects ignored paths in imports and indirect file reads without treating comments as inputs", (): void => {
    const ignoredPath = ["..", "..", "x" + "Docs", "fixture.json"].join("/");
    const literal = JSON.stringify(ignoredPath);
    expect(localReportPaths(`import fixture from ${literal};`, "import.ts")).toEqual([ignoredPath]);
    expect(
      localReportPaths(`const fixturePath = ${literal}; readFileSync(fixturePath);`, "read.ts")
    ).toEqual([ignoredPath]);
    expect(
      localReportPaths(
        `// Review notes: ${ignoredPath}\nconst fixture = "./fixtures/example.json";`,
        "comment.ts"
      )
    ).toEqual([]);
  });
  it("keeps runtime and test path literals independent of ignored local reports", (): void => {
    const failures: string[] = [];
    for (const root of ["src", "tests", "scripts"]) {
      for (const entry of readdirSync(root, { recursive: true, withFileTypes: true })) {
        if (!entry.isFile() || !/\.[cm]?[jt]sx?$/.test(entry.name)) continue;
        const file = path.join(entry.parentPath, entry.name);
        for (const literal of localReportPaths(readFileSync(file, "utf8"), file))
          failures.push(`${file}: ${literal}`);
      }
    }
    expect(failures).toEqual([]);
  });
});
