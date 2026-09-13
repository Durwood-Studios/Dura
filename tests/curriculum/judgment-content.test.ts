import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import matter from "gray-matter";
import { JUDGMENT_CASES, JUDGMENT_SOURCES } from "@/lib/judgment/cases";

const routes = new Set<string>();
for (const relative of readdirSync("src/content/phases", { recursive: true })) {
  if (typeof relative !== "string" || !relative.endsWith(".mdx") || relative.includes(" 2."))
    continue;
  const [phaseFolder, moduleFolder, file] = relative.split("/");
  const phase = phaseFolder.split("-")[0];
  const unit = `${phase}-${moduleFolder.split("-")[1]}`;
  routes.add(`/paths/${phase}`);
  routes.add(`/paths/${phase}/${unit}`);
  routes.add(`/paths/${phase}/${unit}/${file.split("-")[0]}`);
}
for (const file of readdirSync("src/content/howto")) {
  if (file.endsWith(".mdx") && !file.includes(" 2.")) {
    const meta = matter(readFileSync(`src/content/howto/${file}`, "utf8")).data;
    routes.add(`/howto/${String(meta.slug)}`);
  }
}

describe("judgment instructional integrity", () => {
  it("resolves prerequisites and source references for every authored case", () => {
    const sources = new Set(JUDGMENT_SOURCES.map((source) => source.id));
    expect(new Set(JUDGMENT_CASES.map((item) => item.id)).size).toBe(JUDGMENT_CASES.length);
    for (const item of JUDGMENT_CASES) {
      for (const prerequisite of item.prerequisites)
        expect(routes.has(prerequisite.href), `${item.id}: ${prerequisite.href}`).toBe(true);
      for (const source of item.standards) expect(sources.has(source.sourceId)).toBe(true);
      expect(new Set(item.options.map((option) => option.id)).size).toBe(item.options.length);
      expect(item.options.length).toBeGreaterThanOrEqual(2);
      expect(item.workedExample.revised.length).toBeGreaterThan(100);
      expect(item.transferPrompt.length).toBeGreaterThan(30);
    }
  });
  it("preserves the lifecycle arithmetic and the physical-safety boundary", () => {
    const cost = JUDGMENT_CASES.find((item) => item.id === "maintenance-cost");
    expect(cost?.workedExample.initial).toContain("$31,200");
    expect(cost?.workedExample.revised).toContain("$43,200");
    expect(12 * (1800 + 8 * 100) + (80 + 40) * 100).toBe(43_200);
    const robot = JUDGMENT_CASES.find((item) => item.id === "robotics-escalation");
    expect(robot?.constraints.join(" ")).toContain("No physical motion");
  });
});
