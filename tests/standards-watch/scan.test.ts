import { describe, expect, it } from "vitest";
import { STANDARDS_REGISTRY, buildLookupIndex } from "@/lib/standards-watch/registry";
import { isStandardsRegistryClean, scanStandards } from "@/lib/standards-watch/scan";

describe("STANDARDS_REGISTRY", () => {
  it("contains the load-bearing families for Phase R and Phase M", () => {
    const families = new Set(STANDARDS_REGISTRY.map((e) => e.family));
    for (const required of [
      "ISO 10218 Part 1",
      "ISO 10218 Part 2",
      "ISO/TS 15066",
      "ANSI/RIA R15.06",
      "ISO 8373",
      "ISO 12100",
      "IEC 61508",
      "ISO 13849-1",
      "IEC 62061",
      "ISO 9001",
      "AS9100",
      "IATF 16949",
      "ASME Y14.5",
      "ASME Y14.41",
      "ISA-95",
      "ISA-88",
      "IPC-A-610",
      "OPC UA",
      "MTConnect",
      "IEC 62443",
    ]) {
      expect(families.has(required)).toBe(true);
    }
  });

  it("documents the ISO 10218 unification with ISO/TS 15066", () => {
    const ts15066 = STANDARDS_REGISTRY.find((e) => e.family === "ISO/TS 15066");
    expect(ts15066).toBeDefined();
    expect(ts15066?.current).toBe("ISO 10218-1:2025");
    expect(ts15066?.supersededRevisions).toContain("ISO/TS 15066:2016");
  });

  it("documents the WCAG 3.0 in-progress note", () => {
    const wcag = STANDARDS_REGISTRY.find((e) => e.family === "WCAG");
    expect(wcag?.inProgress?.targetRevision).toBe("WCAG 3.0");
  });
});

describe("buildLookupIndex", () => {
  it("indexes both current and superseded citation strings", () => {
    const index = buildLookupIndex();
    expect(index.has("ISO 10218-1:2025")).toBe(true);
    expect(index.has("ISO 10218-1:2011")).toBe(true);
    expect(index.has("ISO/TS 15066:2016")).toBe(true);
  });

  it("maps every superseded citation to the current revision entry", () => {
    const index = buildLookupIndex();
    const fromSuperseded = index.get("ISO 10218-1:2011");
    expect(fromSuperseded?.current).toBe("ISO 10218-1:2025");
  });

  it("returns undefined for citations not in the registry", () => {
    const index = buildLookupIndex();
    expect(index.get("MADE-UP-STANDARD-2099")).toBeUndefined();
  });
});

describe("scanStandards", () => {
  it("collects references from Phase R and Phase M", () => {
    const report = scanStandards();
    expect(report.totalReferences).toBeGreaterThan(0);
  });

  it("reports zero outdated references at HEAD (current registries are up to date)", () => {
    const report = scanStandards();
    expect(report.outdated).toHaveLength(0);
  });

  it("surfaces upcoming revisions for families with an in-progress entry", () => {
    const report = scanStandards();
    const upcomingFamilies = new Set(
      report.upcoming.map((u) => {
        // upcoming entries don't carry family directly — derive from current
        const entry = STANDARDS_REGISTRY.find((e) => e.current === u.currentRevision);
        return entry?.family;
      })
    );
    // ISO 9001 (in progress at the time of writing) appears in Phase M L1 + L2.
    expect(upcomingFamilies.has("ISO 9001")).toBe(true);
  });

  it("dedupes upcoming revisions by family", () => {
    const report = scanStandards();
    const families = report.upcoming.map((u) => {
      const entry = STANDARDS_REGISTRY.find((e) => e.current === u.currentRevision);
      return entry?.family;
    });
    expect(new Set(families).size).toBe(families.length);
  });
});

describe("isStandardsRegistryClean", () => {
  it("returns true while no lesson cites a superseded revision", () => {
    expect(isStandardsRegistryClean()).toBe(true);
  });
});
