import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, copyFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync, spawnSync } from "node:child_process";

test("author-controlled Merge/Revert subjects and legacy headers cannot bypass provenance", () => {
  const dir = mkdtempSync(join(tmpdir(), "dura-provenance-"));
  const git = (...args) => execFileSync("git", args, { cwd: dir, encoding: "utf8" }).trim();
  try {
    mkdirSync(join(dir, "scripts"));
    for (const name of ["check-ai-provenance.mjs", "provenance-range.mjs"])
      copyFileSync(new URL(`../../scripts/${name}`, import.meta.url), join(dir, "scripts", name));
    writeFileSync(join(dir, "CODEOWNERS"), "protected.txt @owner\n");
    git("init", "-q");
    git("config", "user.name", "Test");
    git("config", "user.email", "test@example.invalid");
    git("add", ".");
    git("commit", "-qm", "fixture");
    const base = git("rev-parse", "HEAD");
    writeFileSync(join(dir, "protected.txt"), "canonical");
    git("add", ".");
    git("commit", "-qm", "fix: canonical\n\nAI-assisted: codex ~100%");
    const accepted = spawnSync(
      process.execPath,
      ["scripts/check-ai-provenance.mjs", `--since=${base}`],
      {
        cwd: dir,
        encoding: "utf8",
        env: { ...process.env, GITHUB_EVENT_NAME: "", GITHUB_EVENT_PATH: "" },
      }
    );
    assert.equal(accepted.status, 0, accepted.stderr);
    for (const subject of ["Merge pretend", "Revert pretend", "[AI: codex ~100%] legacy only"]) {
      writeFileSync(join(dir, "protected.txt"), subject);
      git("add", ".");
      git("commit", "-qm", subject);
      const result = spawnSync(
        process.execPath,
        ["scripts/check-ai-provenance.mjs", `--since=${base}`],
        {
          cwd: dir,
          encoding: "utf8",
          env: { ...process.env, GITHUB_EVENT_NAME: "", GITHUB_EVENT_PATH: "" },
        }
      );
      assert.equal(result.status, 1, `${subject}: ${result.stdout} ${result.stderr}`);
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
