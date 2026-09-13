import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";
import { compile } from "@mdx-js/mdx";
import { lessonActivities } from "@/lib/lesson-activities";
import { areActivitiesComplete } from "@/lib/activity-evidence";
import { addDailyStudyTime } from "@/lib/daily-study-time";

describe("source-versioned activity requirements", () => {
  it("requires both a quiz and a written task, and invalidates a changed prompt", async () => {
    const body =
      '<Quiz question="Recall?" options={["A","B"]} answer={0} />\n\n<WrittenExercise instructions="Explain a tradeoff" rubric={["Support the choice"]} modelAnswer="Evidence" />';
    const required: string[] = [];
    await compile(body, { remarkPlugins: [lessonActivities(body, "0/0-1/01", required)] });
    expect(required).toHaveLength(2);
    const evidence = {
      [required[0]]: { kind: "automatic" as const, updatedAt: 1, completedAt: 1 },
    };
    expect(areActivitiesComplete(required, evidence)).toBe(false);
    const revised: string[] = [];
    await compile(body.replace("Recall?", "Apply?"), {
      remarkPlugins: [lessonActivities(body.replace("Recall?", "Apply?"), "0/0-1/01", revised)],
    });
    expect(revised[0]).not.toBe(required[0]);
    expect(revised[1]).toBe(required[1]);
  });

  it("compiles every authored lesson with its real activity identity transform", async () => {
    const root = "src/content/phases";
    const files = readdirSync(root, { recursive: true }).filter(
      (file): file is string =>
        typeof file === "string" && file.endsWith(".mdx") && !file.includes(" 2.")
    );
    for (const file of files) {
      const body = matter(readFileSync(path.join(root, file), "utf8")).content;
      const required: string[] = [];
      await compile(body, { remarkPlugins: [lessonActivities(body, file, required)] });
      expect(new Set(required).size, file).toBe(required.length);
      expect(required.length, file).toBeGreaterThan(0);
    }
  }, 60000);

  it("splits a tracked interval at local midnight without reassigning lifetime time", () => {
    const midnight = new Date(2026, 8, 12, 0, 0, 0).getTime();
    expect(addDailyStudyTime({}, 2000, midnight + 1000)).toEqual({
      "2026-09-11": 1000,
      "2026-09-12": 1000,
    });
    expect(addDailyStudyTime({}, Number.NaN)).toEqual({});
  });
});
