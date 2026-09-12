import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { compile } from "@mdx-js/mdx";
import { describe, expect, it } from "vitest";
import { auditLesson } from "@/lib/lesson-conformance";
import baseline from "../../standards/pedagogy/lp-1.0-legacy-baseline.json";

const CONTENT_ROOT = path.resolve("src/content/phases");

function lessonFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry): string[] => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? lessonFiles(file) : entry.name.endsWith(".mdx") ? [file] : [];
  });
}

const legacy: Record<string, string[]> = baseline;

describe("LP-1.0 current structural conformance", (): void => {
  for (const file of lessonFiles(CONTENT_ROOT)) {
    const relative = path.relative(CONTENT_ROOT, file);
    it(relative, (): void => {
      const { data, content } = matter(readFileSync(file, "utf8"));
      const findings = auditLesson({ frontmatter: data, body: content });
      expect(findings, "Migrated lessons cannot regain historical LP debt.").toEqual([]);
    });
  }
  it("compiles every authored lesson", async (): Promise<void> => {
    try {
      for (const file of lessonFiles(CONTENT_ROOT)) {
        await compile(matter(readFileSync(file, "utf8")).content);
      }
    } catch (error: unknown) {
      throw new Error("An authored lesson cannot compile as MDX", { cause: error });
    }
  }, 20000);
  it("rejects missing contracts instead of silently defaulting them", (): void => {
    expect(auditLesson({ frontmatter: {}, body: "" })).toEqual(
      expect.arrayContaining([
        "metadata:prerequisites",
        "metadata:learningOutcomes",
        "metadata:thresholdConcept",
        "structure:practice",
        "assessment:bloom-shape",
      ])
    );
  });
  it("does not grandfather foundation lessons", (): void => {
    expect(Object.keys(legacy).filter((file: string): boolean => file.startsWith("0-"))).toEqual(
      []
    );
  });
  it("counts recap bullets only within the recap section", (): void => {
    const body = `## What you learned
- Explain ordering
- Trace the example
- Compare outcomes
## Connect forward
- Another topic
- A second topic
- A third topic
`;
    expect(auditLesson({ frontmatter: {}, body })).not.toContain("structure:recap-bullets");
    expect(
      auditLesson({ frontmatter: {}, body: body.replace("- Compare outcomes\n", "") })
    ).toContain("structure:recap-bullets");
  });
  it("accepts substantive written evaluation but rejects a content-free answer reveal", (): void => {
    const body = `## Check your understanding
<WrittenExercise instructions="Compare two recovery plans and justify your choice against the stated downtime criteria." rubric={["States a recovery order", "Compares downtime", "Justifies a recommendation"]} modelAnswer="Restore the known-good artifact first when its recovery time satisfies the stated downtime constraint." />
## What you learned`;
    const frontmatter = { standards: { bloom: "evaluate" } };
    expect(auditLesson({ frontmatter, body })).not.toContain("assessment:bloom-shape");
    expect(
      auditLesson({
        frontmatter,
        body: body.replace(
          "Compare two recovery plans and justify your choice against the stated downtime criteria.",
          "Read the answer shown below and continue."
        ),
      })
    ).toContain("assessment:bloom-shape");
    expect(
      auditLesson({
        frontmatter,
        body: body.replace(
          'rubric={["States a recovery order", "Compares downtime", "Justifies a recommendation"]}',
          "rubric={[]}"
        ),
      })
    ).toContain("assessment:bloom-shape");
  });
});
