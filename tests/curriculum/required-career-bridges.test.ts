import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import path from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";
import { getSkill } from "@/content/skills";
import { ALL_QUESTIONS } from "@/content/questions";
import classification from "../../xDocs/active/promise-closure-2026-09/career-gap-classification.json";

const pythonFile =
  "src/content/phases/1-programming-fundamentals/1-6-first-projects/46-python-data-bridge.mdx";
const tfFile = "src/content/phases/13-robotics/r-6-ros-industrial/07-tf2-coordinate-contracts.mdx";

describe("required career foundations", () => {
  it("links all fourteen reviewed required destination gaps to real entry teaching and question evidence", () => {
    const required = classification.filter((entry) =>
      entry.uses.some((use) => use.kind === "required" && use.publishedPathIds.length)
    );
    expect(required).toHaveLength(14);
    for (const entry of required) {
      const skill = getSkill(entry.id);
      expect(skill?.lessonIds.length, entry.id).toBeGreaterThan(0);
      expect(
        ALL_QUESTIONS.some(
          (question) => question.sourceLesson && skill?.lessonIds.includes(question.sourceLesson)
        ),
        entry.id
      ).toBe(true);
    }
  });
  it("gives all 42 originally missing destination topics source-linked introductory assessment coverage", () => {
    const destination = classification.filter((entry) =>
      entry.uses.some((use) => use.publishedPathIds.length > 0)
    );
    expect(destination).toHaveLength(42);
    const adjacentOnly = classification.filter((entry) =>
      entry.uses.every((use) => use.publishedPathIds.length === 0)
    );
    // The original destination subset is still 42; later work linked the 64 adjacent topics too.
    expect(adjacentOnly).toHaveLength(64);
    expect(classification.filter((entry) => !entry.isNowStudyLinked)).toHaveLength(0);
    for (const entry of destination) {
      const skill = getSkill(entry.id);
      expect(entry.isNowStudyLinked, entry.id).toBe(true);
      expect(
        ALL_QUESTIONS.some(
          (question) => question.sourceLesson && skill?.lessonIds.includes(question.sourceLesson)
        ),
        entry.id
      ).toBe(true);
    }
  });
  it("executes the actual Python bridge and tf2 translation examples", () => {
    for (const file of [pythonFile, tfFile]) {
      const body = matter(readFileSync(file, "utf8")).content;
      const blocks = [...body.matchAll(/```python\n([\s\S]*?)```/g)];
      expect(blocks).toHaveLength(1);
      for (const block of blocks)
        expect(
          execFileSync("python3", ["-c", block[1]], { encoding: "utf8", timeout: 5000 })
        ).toContain("passed");
    }
    const body = readFileSync(pythonFile, "utf8");
    const encoded = body.match(/modelAnswer=\{'((?:\\.|[^'\\])*)'\}/)?.[1];
    expect(encoded).toBeDefined();
    // The authored JSX string contains only normal JSON-compatible backslash escapes.
    const code = JSON.parse('"' + encoded?.replaceAll('"', '\\"') + '"') as string;
    execFileSync("python3", ["-c", code], { encoding: "utf8", timeout: 5000 });
  });
  it("evaluates the actual webpack config with a safely scoped output directory", () => {
    const body = readFileSync(
      "src/content/phases/2-web-development/2-6-typescript/07-bundler-contract.mdx",
      "utf8"
    );
    const blocks = [...body.matchAll(/```javascript\n([\s\S]*?)```/g)];
    const config = { exports: {} as { entry?: string; output?: { path: string; clean: boolean } } };
    vm.runInNewContext(
      blocks[2][1],
      {
        require: (name: string): unknown => {
          if (name !== "node:path") throw new Error("Unexpected dependency");
          return path;
        },
        module: config,
        __dirname: "/practice",
      },
      { timeout: 1000 }
    );
    expect(config.exports.entry).toBe("./src/index.js");
    expect(config.exports.output).toMatchObject({ path: "/practice/dist", clean: true });
  });
});
