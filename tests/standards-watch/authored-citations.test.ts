import { describe, expect, it } from "vitest";
import {
  reviewCitationDocuments,
  scanAuthoredCitations,
} from "@/lib/standards-watch/content-references";
import { TOTAL_LESSONS } from "@/lib/curriculum-stats";
import { ALL_QUESTIONS } from "@/content/questions";

describe("authored standards review", (): void => {
  it("surfaces unknown explicit anchors instead of asserting they are current", (): void => {
    const findings = reviewCitationDocuments([
      {
        source: "lesson.mdx",
        ownerId: "lesson",
        primaryAnchor: "Unregistered Guide 2026",
        text: "Study the guide.",
      },
    ]);
    expect(findings).toEqual([
      {
        source: "lesson.mdx",
        ownerId: "lesson",
        citedAs: "Unregistered Guide 2026",
        reason: "untracked-anchor",
      },
    ]);
  });

  it("retains historical and scored-bank mentions for review without calling them incorrect", (): void => {
    const findings = reviewCitationDocuments([
      {
        source: "assessment-bank/phase-2",
        ownerId: "accessibility-example",
        text: "Compare WCAG 2.1 and WCAG 2.2. Not the unrelated token WCAG 2.10.",
      },
    ]);
    expect(findings).toEqual([
      {
        source: "assessment-bank/phase-2",
        ownerId: "accessibility-example",
        citedAs: "WCAG 2.1",
        reason: "older-revision-mention",
        registryRevision: "WCAG 2.2",
      },
    ]);
    expect(
      reviewCitationDocuments([{ source: "boundary", ownerId: "example", text: "WCAG 2.10" }])
    ).toHaveLength(0);
  });

  it("scans every phase lesson, tutorial, how-to and assessment question", (): void => {
    const report = scanAuthoredCitations();
    expect(report.documents).toBe(TOTAL_LESSONS + 135 + ALL_QUESTIONS.length);
    expect(
      report.findings.some((finding) => finding.source.startsWith("src/content/phases/"))
    ).toBe(true);
  });
});
