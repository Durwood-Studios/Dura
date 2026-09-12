import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
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

describe("LP-1.0 incremental conformance", (): void => {
  for (const file of lessonFiles(CONTENT_ROOT)) {
    const relative = path.relative(CONTENT_ROOT, file);
    it(relative, (): void => {
      const { data, content } = matter(readFileSync(file, "utf8"));
      const findings = auditLesson({ frontmatter: data, body: content });
      const newFindings = findings.filter(
        (finding: string): boolean => !(legacy[relative] ?? []).includes(finding)
      );
      expect(
        newFindings,
        "New lessons require conformance; legacy findings may shrink but must not grow."
      ).toEqual([]);
    });
  }
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
});
