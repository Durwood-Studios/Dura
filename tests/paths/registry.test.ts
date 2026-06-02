import { describe, expect, it } from "vitest";
import { PHASES, getPhase } from "@/content/phases";
import {
  estimatedPathHours,
  getPath,
  getPathBySlug,
  orphanedPhases,
  PATHS,
  phasesReferencedByPaths,
  spinePhaseCount,
} from "@/lib/paths";
import { PATH_ARCHETYPES, PATH_STATUSES } from "@/lib/paths/types";

describe("PATHS registry", () => {
  it("registers at least eight paths", () => {
    expect(PATHS.length).toBeGreaterThanOrEqual(8);
  });

  it("has unique ids and slugs", () => {
    const ids = new Set(PATHS.map((p) => p.id));
    const slugs = new Set(PATHS.map((p) => p.slug));
    expect(ids.size).toBe(PATHS.length);
    expect(slugs.size).toBe(PATHS.length);
  });

  it("every path references at least one spine phase", () => {
    for (const path of PATHS) {
      const spine = path.phases.filter((p) => p.scope === "spine");
      expect(spine.length).toBeGreaterThan(0);
    }
  });

  it("every path has a non-empty outcome string", () => {
    for (const path of PATHS) {
      expect(path.outcome.length).toBeGreaterThan(20);
    }
  });

  it("every archetype label is in the canonical list", () => {
    const allowed = new Set<string>(PATH_ARCHETYPES);
    for (const path of PATHS) {
      expect(allowed.has(path.archetype)).toBe(true);
    }
  });

  it("every status value is in the canonical list", () => {
    const allowed = new Set<string>(PATH_STATUSES);
    for (const path of PATHS) {
      expect(allowed.has(path.status)).toBe(true);
    }
  });

  it("complete paths reference only phases that exist in PHASES", () => {
    for (const path of PATHS) {
      if (path.status !== "complete") continue;
      for (const ref of path.phases) {
        expect(getPhase(ref.phaseId)).toBeDefined();
      }
    }
  });

  it("scaffold paths reference only phases that exist in PHASES", () => {
    for (const path of PATHS) {
      if (path.status !== "scaffold") continue;
      for (const ref of path.phases) {
        expect(getPhase(ref.phaseId)).toBeDefined();
      }
    }
  });

  it("preview paths may reference unbuilt phases (forward-looking)", () => {
    // Confirm at least one preview path exists and references a phase
    // that is NOT in PHASES yet — this is what makes it a preview.
    const previews = PATHS.filter((p) => p.status === "preview");
    if (previews.length === 0) return;
    let foundForwardReference = false;
    for (const path of previews) {
      for (const ref of path.phases) {
        if (!getPhase(ref.phaseId)) {
          foundForwardReference = true;
        }
      }
    }
    expect(foundForwardReference).toBe(true);
  });

  it("every moduleId reference points at a real module in the referenced phase", () => {
    for (const path of PATHS) {
      for (const ref of path.phases) {
        if (!ref.moduleIds) continue;
        const phase = getPhase(ref.phaseId);
        if (!phase) continue;
        for (const moduleId of ref.moduleIds) {
          const mod = phase.modules.find((m) => m.id === moduleId);
          expect(mod, `Path ${path.id} references missing module ${moduleId}`).toBeDefined();
        }
      }
    }
  });
});

describe("getPath / getPathBySlug", () => {
  it("returns the path for a known id", () => {
    const path = getPath("full-stack-engineer");
    expect(path).toBeDefined();
    expect(path?.title).toBe("Full-Stack Web Engineer");
  });

  it("returns the path for a known slug", () => {
    const path = getPathBySlug("ml-engineer");
    expect(path).toBeDefined();
    expect(path?.archetype).toBe("AI/ML");
  });

  it("returns undefined for unknown ids and slugs", () => {
    expect(getPath("nonexistent")).toBeUndefined();
    expect(getPathBySlug("nonexistent")).toBeUndefined();
  });
});

describe("estimatedPathHours", () => {
  it("returns a positive number for complete paths", () => {
    for (const path of PATHS) {
      if (path.status !== "complete") continue;
      const hours = estimatedPathHours(path);
      expect(hours).toBeGreaterThan(0);
    }
  });

  it("the full-stack path sums to less than the all-phases total", () => {
    const path = getPath("full-stack-engineer");
    if (!path) throw new Error("full-stack-engineer path missing");
    const hours = estimatedPathHours(path);
    const allPhasesHours = PHASES.reduce((sum, p) => sum + p.estimatedHours, 0);
    expect(hours).toBeLessThan(allPhasesHours);
  });

  it("does NOT count elective phases", () => {
    // The backend-engineer path has Phase 7 modules as electives.
    // Estimated hours should NOT include them.
    const path = getPath("backend-engineer");
    if (!path) throw new Error("backend-engineer path missing");
    const hours = estimatedPathHours(path);
    const spineOnly = path.phases
      .filter((p) => p.scope === "spine")
      .reduce((sum, ref) => {
        const phase = getPhase(ref.phaseId);
        if (!phase) return sum;
        if (ref.moduleIds) {
          return (
            sum +
            ref.moduleIds.reduce((acc, id) => {
              const m = phase.modules.find((m) => m.id === id);
              return acc + (m?.estimatedHours ?? 0);
            }, 0)
          );
        }
        return sum + phase.estimatedHours;
      }, 0);
    expect(hours).toBe(spineOnly);
  });
});

describe("spinePhaseCount", () => {
  it("returns the count of spine references only", () => {
    const path = getPath("backend-engineer");
    if (!path) throw new Error("backend-engineer path missing");
    const count = spinePhaseCount(path);
    const expected = path.phases.filter((p) => p.scope === "spine").length;
    expect(count).toBe(expected);
  });
});

describe("phase discovery coverage", () => {
  it("at least 12 phases are referenced across all paths", () => {
    const referenced = phasesReferencedByPaths();
    expect(referenced.length).toBeGreaterThanOrEqual(12);
  });

  it("orphanedPhases returns only PHASES not on any path", () => {
    const orphans = orphanedPhases();
    const referenced = new Set(phasesReferencedByPaths());
    for (const orphanId of orphans) {
      expect(referenced.has(orphanId)).toBe(false);
      expect(getPhase(orphanId)).toBeDefined();
    }
  });

  it("every existing PHASES entry is on at least one path (no orphans)", () => {
    // This is a discoverability guarantee — adding a phase to PHASES
    // without referencing it from any Path leaves it discoverable only
    // via the legacy phase directory. The test fails to surface that.
    const orphans = orphanedPhases();
    expect(orphans, `Orphaned phases not on any path: ${orphans.join(", ")}`).toHaveLength(0);
  });
});
