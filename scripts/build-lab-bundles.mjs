import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import JSZip from "jszip";

const root = path.resolve("public/labs");
const excluded = new Set(["node_modules", "__pycache__", ".venv", ".pio", ".git", "work", "dist"]);
const extensions = new Set([
  ".md",
  ".html",
  ".css",
  ".sql",
  ".mjs",
  ".js",
  ".ts",
  ".json",
  ".py",
  ".txt",
  ".xml",
  ".yaml",
  ".yml",
  ".c",
  ".h",
  ".cpp",
  ".hpp",
  ".sv",
  ".sh",
  ".ini",
  ".cfg",
  ".csv",
  ".toml",
  ".repos",
]);
for (const directory of (await readdir(root, { withFileTypes: true })).sort((a, b) =>
  a.name.localeCompare(b.name)
)) {
  if (!directory.isDirectory() || excluded.has(directory.name) || directory.name.startsWith("."))
    continue;
  const zip = new JSZip();
  async function add(relative = "") {
    for (const entry of (
      await readdir(path.join(root, directory.name, relative), { withFileTypes: true })
    ).sort((a, b) => a.name.localeCompare(b.name))) {
      if (excluded.has(entry.name) || entry.name.startsWith(".")) continue;
      const file = path.join(relative, entry.name);
      if (entry.isDirectory()) await add(file);
      else if (
        entry.isFile() &&
        (extensions.has(path.extname(file)) ||
          relative === "resource" ||
          ["Makefile", "Dockerfile", "LICENSE"].includes(entry.name))
      ) {
        zip.file(
          `${directory.name}/${file.split(path.sep).join("/")}`,
          await readFile(path.join(root, directory.name, file)),
          { date: new Date("2026-01-01T00:00:00Z") }
        );
      }
    }
  }
  await add();
  if (!zip.file(`${directory.name}/README.md`))
    throw new Error(`Missing guide for ${directory.name}`);
  await writeFile(
    path.join(root, `${directory.name}.zip`),
    await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" })
  );
  console.log(`Bundled ${directory.name}: ${Object.keys(zip.files).length} entries`);
}
