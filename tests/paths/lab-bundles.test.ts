import { execFileSync } from "node:child_process";
import { cpSync, mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import JSZip from "jszip";
import { expect, it } from "vitest";

it("downloads every lab source file, including ROS installation metadata, without local build output", async (): Promise<void> => {
  const directory = mkdtempSync(path.join(tmpdir(), "dura-lab-archives-"));
  const excluded = new Set([
    "node_modules",
    ".pio",
    "__pycache__",
    ".venv",
    ".git",
    "work",
    "dist",
  ]);
  try {
    const root = path.join(directory, "public/labs");
    cpSync(path.resolve("public/labs"), root, {
      recursive: true,
      filter: (source) => !excluded.has(path.basename(source)) && !source.endsWith(".zip"),
    });
    execFileSync(process.execPath, [path.resolve("scripts/build-lab-bundles.mjs")], {
      cwd: directory,
      stdio: "pipe",
    });
    for (const lab of readdirSync(root, { withFileTypes: true })) {
      if (!lab.isDirectory()) continue;
      const sourceRoot = path.join(root, lab.name);
      const zip = await JSZip.loadAsync(readFileSync(path.join(root, `${lab.name}.zip`)));
      const sourceFiles = readdirSync(sourceRoot, { recursive: true, withFileTypes: true })
        .filter((entry) => entry.isFile())
        .map((entry) => path.join(entry.parentPath, entry.name));
      expect(sourceFiles.length, lab.name).toBeGreaterThan(0);
      for (const source of sourceFiles) {
        const relative = path.relative(sourceRoot, source).split(path.sep).join("/");
        const archived = zip.file(`${lab.name}/${relative}`);
        expect(archived, `${lab.name}/${relative} must be in the download`).not.toBeNull();
        expect(await archived!.async("nodebuffer"), relative).toEqual(readFileSync(source));
      }
      expect(Object.values(zip.files).filter((entry) => !entry.dir)).toHaveLength(
        sourceFiles.length
      );
    }
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}, 30000);
