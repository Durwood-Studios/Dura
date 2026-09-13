import { describe, expect, it } from "vitest";
import {
  buildPrerequisiteGraph,
  getPrerequisitesFor,
  getUnlockedBy,
} from "@/lib/prerequisite-graph";

describe("curriculum prerequisite identity", (): void => {
  it("keeps identically numbered lessons in separate modules and specialty phases", (): void => {
    const graph = buildPrerequisiteGraph();
    expect(graph.size).toBe(749);
    expect(graph.get("0/0-1/01")?.title).toBe("Binary: The Language of Machines");
    expect(graph.get("0/0-5/01")?.title).toBeDefined();
    expect(graph.get("10/10-1/01")?.moduleId).toBe("10-1");
    expect(graph.has("01")).toBe(false);
  });

  it("resolves canonical prerequisites and inverse links without cross-module collisions", (): void => {
    const prerequisites = getPrerequisitesFor("0/0-5/02");
    expect(prerequisites.map((node): string => node.id)).toContain("0/0-5/01");
    expect(getUnlockedBy("0/0-5/01").map((node): string => node.id)).toContain("0/0-5/02");
  });

  it("keeps authored lesson prerequisites resolvable and free of cycles", (): void => {
    const graph = buildPrerequisiteGraph();
    const finished = new Set<string>();
    const active = new Set<string>();
    const visit = (id: string): void => {
      expect(active.has(id), `Prerequisite cycle at ${id}`).toBe(false);
      if (finished.has(id)) return;
      active.add(id);
      for (const prerequisite of graph.get(id)?.prerequisites ?? []) {
        // Vocabulary/background requirements are not lesson route references.
        if (!/^\d+\/\d+-\d+\/\d+$/.test(prerequisite)) continue;
        expect(graph.has(prerequisite), `${id} requires absent ${prerequisite}`).toBe(true);
        visit(prerequisite);
      }
      active.delete(id);
      finished.add(id);
    };
    for (const id of graph.keys()) visit(id);
  });
});
