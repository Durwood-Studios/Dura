import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { PathDetail } from "@/components/paths/PathDetail";
import classification from "../../xDocs/active/promise-closure-2026-09/career-gap-classification.json";
import { describe, expect, it } from "vitest";
import { PATHS } from "@/lib/paths";
import { getRoleBySlug } from "@/content/roles";

const AI_FOLDER = "src/content/phases/6-ai-ml-engineering/6-1-ai-fundamentals/";

describe("semantic career relationships and teaching evidence", () => {
  it("declares valid, nonoverlapping destination and adjacent careers for every path", () => {
    expect(PATHS).toHaveLength(12);
    for (const path of PATHS) {
      const all = [...path.destinationRoleSlugs, ...path.relatedRoleSlugs];
      expect(new Set(all).size, path.id).toBe(all.length);
      for (const slug of all) expect(getRoleBySlug(slug), `${path.id}/${slug}`).toBeDefined();
    }
    expect(PATHS.find((path) => path.id === "ml-engineer")?.destinationRoleSlugs).toEqual([
      "ai-ml-engineer",
    ]);
    expect(PATHS.find((path) => path.id === "agent-engineer")?.destinationRoleSlugs).toEqual([
      "ai-ml-engineer",
    ]);
    expect(PATHS.find((path) => path.id === "engineering-leader")?.destinationRoleSlugs).toEqual([
      "engineering-manager",
    ]);
    for (const id of ["systems-engineer", "hardware-verification-engineer", "quant-hft-engineer"])
      expect(PATHS.find((path) => path.id === id)?.destinationRoleSlugs).toEqual([]);
  });
  it("renders semantic destination links and keeps the archived classification consistent", () => {
    const aiPath = PATHS.find((path) => path.id === "ml-engineer");
    if (!aiPath) throw new Error("AI path missing");
    const markup = renderToStaticMarkup(createElement(PathDetail, { path: aiPath }));
    expect(markup).toContain('href="/tracks/ai-ml-engineer"');
    expect(markup).not.toContain('href="/tracks/ml-engineer"');
    for (const entry of classification) {
      for (const use of entry.uses) {
        expect(use.publishedPathIds, `${entry.id}/${use.roleSlug}`).toEqual(
          PATHS.filter((path) => path.destinationRoleSlugs.includes(use.roleSlug)).map(
            (path) => path.id
          )
        );
      }
    }
  });
  it("executes the authored causal attention and discounted-return fixtures", () => {
    for (const file of ["09-masked-attention.mdx", "11-reinforcement-learning-return.mdx"]) {
      const source = readFileSync(AI_FOLDER + file, "utf8");
      const blocks = [...source.matchAll(/```python\n([\s\S]*?)```/g)];
      expect(blocks).toHaveLength(1);
      expect(
        execFileSync("python3", ["-c", blocks[0][1]], { encoding: "utf8", timeout: 5000 })
      ).toContain("checks passed");
    }
  });
  it("renders hostile tutorial note text literally and retains delete behavior", () => {
    const source = readFileSync("src/content/tutorials/44-pwa-push.mdx", "utf8");
    const block = [...source.matchAll(/```javascript\n([\s\S]*?)```/g)].find((match) =>
      match[1].includes("function renderNotes()")
    );
    expect(block).toBeDefined();
    const code = block![1].split('document.getElementById("note-form")')[0];
    const hostile = '<img src=x onerror="window.pwned=true"><script>bad()</script>';
    document.body.innerHTML = '<div id="notes"></div>';
    const removed: number[] = [];
    vm.runInNewContext(code + "\nrenderNotes();", {
      document,
      localStorage: {
        getItem: (): string =>
          JSON.stringify([{ text: hostile, createdAt: "2026-09-13T00:00:00Z" }]),
      },
      NOTES_KEY: "notes",
      window: {
        deleteNote: (index: number): void => {
          removed.push(index);
        },
      },
    });
    expect(document.querySelector("#notes p")?.textContent).toBe(hostile);
    expect(document.querySelector("#notes img, #notes script")).toBeNull();
    document.querySelector("button")?.click();
    expect(removed).toEqual([0]);
    document.body.replaceChildren();
  });
});
