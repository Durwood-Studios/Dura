import { existsSync, readFileSync, readdirSync } from "node:fs";
import matter from "gray-matter";
import { describe, expect, it, vi } from "vitest";
import { PRACTICAL_LABS } from "@/lib/labs";
import { PATHS } from "@/lib/paths";

vi.mock("server-only", (): object => ({}));
import { listAllLessonParams } from "@/lib/content";

describe("practical project connections", (): void => {
  it("connects every downloadable project to existing paths and instruction", async (): Promise<void> => {
    const paths = new Set(PATHS.map((path) => path.id));
    const routes = new Set(
      (await listAllLessonParams()).map(
        (lesson) => `/paths/${lesson.phaseId}/${lesson.moduleId}/${lesson.lessonId}`
      )
    );
    for (const group of ["tutorials", "howto"]) {
      for (const name of readdirSync(`src/content/${group}`)) {
        if (!name.endsWith(".mdx")) continue;
        const metadata = matter(readFileSync(`src/content/${group}/${name}`, "utf8")).data;
        routes.add(`/${group}/${String(metadata.slug)}`);
      }
    }
    expect(new Set(PRACTICAL_LABS.map((lab) => lab.id)).size).toBe(PRACTICAL_LABS.length);
    for (const lab of PRACTICAL_LABS) {
      expect(lab.pathIds.length, lab.id).toBeGreaterThan(0);
      for (const pathId of lab.pathIds)
        expect(paths.has(pathId), `${lab.id}: ${pathId}`).toBe(true);
      expect(routes.has(lab.lessonHref), `${lab.id}: ${lab.lessonHref}`).toBe(true);
      expect(existsSync(`public/labs/${lab.id}/README.md`), lab.id).toBe(true);
    }
  });
});
