/**
 * Keeps the marketing headline numbers honest: TOTAL_PHASES /
 * TOTAL_MODULES / TOTAL_LESSONS must match the actual content tree, and
 * README.md must not carry a stale lesson count. This exists because
 * "539 lessons" shipped on five surfaces while the tree held 660.
 */
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { TOTAL_LESSONS, TOTAL_MODULES, TOTAL_PHASES } from "@/lib/curriculum-stats";

const PHASES_DIR = path.resolve(process.cwd(), "src/content/phases");

function countTree(): { phases: number; modules: number; lessons: number } {
  let modules = 0;
  let lessons = 0;
  const phaseDirs = readdirSync(PHASES_DIR, { withFileTypes: true }).filter((entry) =>
    entry.isDirectory()
  );
  for (const phase of phaseDirs) {
    const phasePath = path.join(PHASES_DIR, phase.name);
    for (const entry of readdirSync(phasePath, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      modules += 1;
      lessons += readdirSync(path.join(phasePath, entry.name)).filter((f) =>
        f.endsWith(".mdx")
      ).length;
    }
  }
  return { phases: phaseDirs.length, modules, lessons };
}

describe("curriculum stats", () => {
  const actual = countTree();

  it("TOTAL_PHASES matches the content tree", () => {
    expect(TOTAL_PHASES).toBe(actual.phases);
  });

  it("TOTAL_MODULES matches the content tree", () => {
    expect(TOTAL_MODULES).toBe(actual.modules);
  });

  it("TOTAL_LESSONS matches the content tree", () => {
    expect(TOTAL_LESSONS).toBe(actual.lessons);
  });

  it("README.md carries the current lesson count and no stale one", () => {
    const readme = readFileSync(path.resolve(process.cwd(), "README.md"), "utf8");
    expect(readme).toContain(`${actual.lessons} lessons`);
    // A lone number followed by "lessons" that isn't the real count is stale.
    const counts = [...readme.matchAll(/(\d{3,}) lessons/g)].map((m) => Number(m[1]));
    for (const count of counts) {
      expect(count, "stale lesson count in README.md").toBe(actual.lessons);
    }
  });
});
