import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import ts from "typescript";
import manifest from "../../xDocs/active/promise-closure-2026-09/adjacent-career-closure.json";
import historicalIds from "../../xDocs/active/promise-closure-2026-09/career-unlinked-requirements.json";
import { getSkill } from "@/content/skills";
import { ALL_QUESTIONS } from "@/content/questions";
import { PHASES, TOTAL_LESSONS, TOTAL_MODULES } from "@/content/phases";

/** These fixtures establish local contracts, never execution on external/native platforms. */
describe("adjacent career foundation evidence", (): void => {
  it("preserves the reviewed inventory and exact specific topic links", (): void => {
    expect(TOTAL_LESSONS).toBe(749);
    expect(TOTAL_MODULES).toBe(120);
    expect(ALL_QUESTIONS).toHaveLength(1806);
    expect(manifest.files).toHaveLength(48);
    expect(Object.keys(manifest.mappings)).toHaveLength(64);
    expect(historicalIds).toHaveLength(106);
    for (const id of historicalIds) expect(getSkill(id)?.lessonIds.length, id).toBeGreaterThan(0);
    for (const [id, lessons] of Object.entries(manifest.mappings))
      expect(getSkill(id)?.lessonIds, id).toEqual(lessons);
    for (const phase of PHASES)
      for (const entry of phase.modules)
        expect(
          ALL_QUESTIONS.filter((question) => question.moduleId === entry.id).length,
          entry.id
        ).toBeGreaterThanOrEqual(12);
    expect(new Set(ALL_QUESTIONS.map((question) => question.id)).size).toBe(ALL_QUESTIONS.length);
  });

  it("executes authored standard-library Python fixtures and syntax-checks engine-specific examples", (): void => {
    let executed = 0;
    let engineOnly = 0;
    for (const file of manifest.files) {
      const source = readFileSync(file, "utf8");
      const blocks = [...source.matchAll(/```python\n([\s\S]*?)```/g)].map((match) => match[1]);
      if (!blocks.length) continue;
      const code = blocks.join("\n");
      if (/from (airflow|pyspark)/.test(code)) {
        execFileSync("python3", ["-c", "import ast,sys; ast.parse(sys.stdin.read())"], {
          input: code,
          timeout: 5000,
        });
        engineOnly += 1;
      } else {
        execFileSync("python3", ["-c", code], { timeout: 5000 });
        executed += 1;
      }
    }
    expect(executed).toBeGreaterThanOrEqual(15);
    expect(engineOnly).toBe(2);
  });

  it("executes the hostile-link parser and checks native component syntax without claiming a native run", (): void => {
    const linkFile = manifest.files.find((file) => file.endsWith("18-deep-link-contract.mdx"));
    const nativeFile = manifest.files.find((file) => file.endsWith("19-cross-platform-native.mdx"));
    if (!linkFile || !nativeFile) throw new Error("Reviewed bridge source missing");
    const link = readFileSync(linkFile, "utf8").match(/```javascript\n([\s\S]*?)```/)?.[1];
    const native = readFileSync(nativeFile, "utf8").match(/```tsx\n([\s\S]*?)```/)?.[1];
    if (!link || !native) throw new Error("Reviewed fixture missing");
    expect(
      execFileSync(process.execPath, ["--input-type=module", "-e", link], {
        encoding: "utf8",
        timeout: 5000,
      })
    ).toContain("deep-link parser checks passed");
    const result = ts.transpileModule(native, {
      fileName: "PracticeCounter.tsx",
      compilerOptions: { jsx: ts.JsxEmit.ReactJSX },
      reportDiagnostics: true,
    });
    expect(result.diagnostics ?? []).toEqual([]);
    expect(readFileSync(nativeFile, "utf8")).toContain(
      "not executable in Dura’s browser JavaScript sandbox"
    );
  });
});
