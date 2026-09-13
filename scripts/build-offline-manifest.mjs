import { readdir, stat, writeFile, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
const base = join(process.cwd(), ".next", "static");
async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(path)));
    else if (entry.isFile() && !entry.name.endsWith(".map") && !/ 2\./.test(entry.name)) {
      files.push({
        url: "/_next/static/" + relative(base, path).split("\\").join("/"),
        bytes: (await stat(path)).size,
      });
    }
  }
  return files;
}
try {
  const assets = await walk(base);
  if (!assets.length) throw new Error("No production assets found");
  const version = (await readFile(".next/BUILD_ID", "utf8")).trim();
  await writeFile("public/offline-assets.json", JSON.stringify({ version, assets }));
  console.log(
    `Offline asset manifest: ${assets.length} files, ${assets.reduce((n, a) => n + a.bytes, 0)} bytes`
  );
} catch (error) {
  console.error("Offline asset manifest failed", error);
  process.exitCode = 1;
}
