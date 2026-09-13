import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { findSourceCopies } from "../../scripts/check-source-copies.mjs";

test("build guard detects duplicate MDX and SQL without deleting source or rejecting numbered canonical names", async () => {
  const root = await mkdtemp(join(tmpdir(), "dura-source-copies-"));
  try {
    await mkdir(join(root, "src/content/tutorials"), { recursive: true });
    await mkdir(join(root, "supabase/staged"), { recursive: true });
    const lesson = join(root, "src/content/tutorials/07-part-2.mdx");
    await writeFile(lesson, "canonical");
    assert.deepEqual(await findSourceCopies(root), []);
    const copy = join(root, "src/content/tutorials/07-part-2 2.mdx");
    const sql = join(root, "supabase/staged/021-contract 2.sql");
    await writeFile(copy, "older authored work");
    await writeFile(sql, "older SQL");
    assert.deepEqual(await findSourceCopies(root), [copy, sql].sort());
    assert.equal(await readFile(copy, "utf8"), "older authored work");
    assert.equal(await readFile(sql, "utf8"), "older SQL");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
