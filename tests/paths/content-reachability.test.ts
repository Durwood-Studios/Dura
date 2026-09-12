import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import vm from "node:vm";
import matter from "gray-matter";
import { compile } from "@mdx-js/mdx";
import { describe, expect, it, vi } from "vitest";
import { PHASES, CONTENT_COUNTS } from "@/content/phases";
import { ALL_QUESTIONS, getQuestionsByModule } from "@/content/questions";
import { PHASE_STANDARDS, getStandardsForModule } from "@/content/standards-map";
import { canonicalModuleId } from "@/lib/curriculum-ids";
import { TOTAL_LESSONS } from "@/lib/curriculum-stats";

vi.mock("server-only", (): object => ({}));
import { listAllLessonParams, listLessons, loadLesson, resolveNextLesson } from "@/lib/content";

const ROOT = path.resolve("src/content/phases");

describe("curriculum reachability", (): void => {
  it("maps legacy specialty prefixes to numeric public curriculumModule IDs", (): void => {
    expect(canonicalModuleId("e-1-c-toolchain")).toBe("10-1");
    expect(canonicalModuleId("h-2-digital-logic")).toBe("11-2");
    expect(canonicalModuleId("q-3-cache")).toBe("12-3");
    expect(canonicalModuleId("r-4-collaboration")).toBe("13-4");
    expect(canonicalModuleId("m-5-quality")).toBe("14-5");
    expect(canonicalModuleId("0-5-reading-and-testing-code")).toBe("0-5");
    expect(canonicalModuleId("unknown-folder")).toBeUndefined();
  });

  it("loads every authored lesson through its registered curriculumModule without collisions", async (): Promise<void> => {
    try {
      const params = await listAllLessonParams();
      expect(params).toHaveLength(TOTAL_LESSONS);
      expect(
        new Set(
          params.map((entry): string => `${entry.phaseId}/${entry.moduleId}/${entry.lessonId}`)
        ).size
      ).toBe(TOTAL_LESSONS);
      let loadedCount = 0;
      for (const phase of PHASES) {
        let phaseCount = 0;
        expect(phase.modules).toHaveLength(phase.moduleCount);
        for (const curriculumModule of phase.modules) {
          const lessons = await listLessons(phase.id, curriculumModule.id);
          expect(lessons.length, curriculumModule.id).toBe(curriculumModule.lessonCount);
          expect(lessons.length, curriculumModule.id).toBeGreaterThan(0);
          phaseCount += lessons.length;
        }
        expect(phaseCount, phase.id).toBe(phase.lessonCount);
        loadedCount += phaseCount;
      }
      expect(loadedCount).toBe(TOTAL_LESSONS);
    } catch (error) {
      console.error(error);
      throw error;
    }
  });

  it("registers assessment questions against existing numeric modules", (): void => {
    expect(CONTENT_COUNTS.assessmentQuestions).toBe(ALL_QUESTIONS.length);
    const modules = new Set(
      PHASES.flatMap((phase): string[] =>
        phase.modules.map((curriculumModule): string => curriculumModule.id)
      )
    );
    for (const question of ALL_QUESTIONS)
      expect(modules.has(question.moduleId), question.id).toBe(true);
    expect(getQuestionsByModule("10-1").length).toBeGreaterThan(0);
    const bridge = getQuestionsByModule("0-5");
    expect(bridge).toHaveLength(16);
    for (const question of bridge) {
      expect(question.options.length).toBeGreaterThan(1);
      expect(question.correct).toBeGreaterThanOrEqual(0);
      expect(question.correct).toBeLessThan(question.options.length);
    }
  });

  it("covers every module without presenting pending standards claims as reviewed", (): void => {
    for (const phase of PHASES) {
      for (const curriculumModule of phase.modules) {
        const mapping = PHASE_STANDARDS.find(
          (entry): boolean => entry.phaseId === phase.id && entry.moduleId === curriculumModule.id
        );
        expect(mapping, curriculumModule.id).toBeDefined();
        if (mapping?.alignmentStatus === "pending-review")
          expect(getStandardsForModule(phase.id, curriculumModule.id)).toBeUndefined();
      }
    }
    expect(getStandardsForModule("0", "0-5")?.alignmentStatus).toBe("lesson-metadata-only");
  });

  it("connects the bridge and preserves threshold metadata", async (): Promise<void> => {
    try {
      expect((await resolveNextLesson("0", "0-4", "16"))?.href).toBe("/paths/0/0-5/01");
      expect((await resolveNextLesson("0", "0-5", "08"))?.href).toBe("/paths/1/1-1/01");
      expect((await loadLesson("0", "0-3", "11"))?.meta.thresholdConcept).toBe(true);
    } catch (error) {
      console.error(error);
      throw error;
    }
  });

  it("resolves every foundation prerequisite and lesson link", async (): Promise<void> => {
    try {
      const params = await listAllLessonParams();
      const known = new Set(
        params.map((entry): string => `${entry.phaseId}/${entry.moduleId}/${entry.lessonId}`)
      );
      for (const curriculumModule of PHASES[0].modules) {
        for (const lesson of await listLessons("0", curriculumModule.id)) {
          for (const prerequisite of lesson.prerequisites ?? [])
            expect(known.has(prerequisite), prerequisite).toBe(true);
        }
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  });

  it("compiles all foundation MDX and runs the bridge code without a network or installation", async (): Promise<void> => {
    try {
      const foundation = path.join(ROOT, "0-digital-literacy");
      for (const curriculumModule of readdirSync(foundation)) {
        for (const file of readdirSync(path.join(foundation, curriculumModule))) {
          if (!file.endsWith(".mdx")) continue;
          const { content } = matter(
            readFileSync(path.join(foundation, curriculumModule, file), "utf8")
          );
          await compile(content);
          if (!curriculumModule.startsWith("0-5")) continue;
          for (const match of content.matchAll(/```javascript\n([\s\S]*?)```/g)) {
            const output: unknown[] = [];
            vm.runInNewContext(
              match[1],
              {
                console: {
                  log: (value: unknown): void => {
                    output.push(value);
                  },
                },
              },
              { timeout: 1000 }
            );
            const expected: Record<string, unknown[]> = {
              "01": ["Fill cup", "Add tea", "Serve"],
              "02": [5, "ticketCount"],
              "03": ["Enter"],
              "04": [1, 2, 3],
              "05": [10],
              "06": [8],
              "07": [8],
              "08": ["Wait", "Wait", "Enter"],
            };
            expect(output, file).toEqual(expected[file.slice(0, 2)]);
          }
        }
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  });
});
