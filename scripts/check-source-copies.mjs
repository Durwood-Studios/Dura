import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

/** Finder/sync duplicate names must never become extra lessons or replayed SQL. */
export async function findSourceCopies(root = process.cwd()) {
  const copies = [];
  for (const directory of ["src/content", "supabase"]) {
    for (const entry of await readdir(join(root, directory), {
      recursive: true,
      withFileTypes: true,
    })) {
      if (entry.isFile() && / \d+\.(?:mdx|sql)$/i.test(entry.name))
        copies.push(join(entry.parentPath, entry.name));
    }
  }
  return copies.sort();
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const copies = await findSourceCopies();
  if (copies.length) {
    console.error(
      "Build stopped: preserve these duplicate copies outside the active content/SQL roots before continuing:\n" +
        copies.join("\n")
    );
    process.exitCode = 1;
  }
}
