#!/usr/bin/env node
/**
 * AINDGS-R3 — assert that every commit in the current PR (or push range)
 * that touches a CODEOWNERS-protected high-risk path carries an AI provenance
 * signal in its message.
 *
 * Accepted forms (any one is sufficient):
 *   - `AI-assisted: <agent> ~X%` body trailer (canonical, post-2026-05-21)
 *   - `Human-only: <one-line reason>` body trailer (explicit no-AI opt-out on
 *     high-risk diffs; only relevant when AI was not involved)
 *   - `[AI: <agent> ~X%]` legacy header prefix (pre-2026-05-21 commits;
 *     accepted indefinitely so historical commits don't fail the gate)
 *
 * Format defined in xDocs/decisions/0002-ai-provenance-format.md (Amendment
 * 2026-05-21) and mirrored in CLAUDE.md > Provenance Format. The commit-msg-
 * time enforcement counterpart lives in commitlint.config.mjs as the
 * `ai-provenance-required` custom rule.
 *
 * Range:
 *   - In a PR: GITHUB_BASE_REF..HEAD (the GitHub Action sets this)
 *   - On push to main: HEAD~1..HEAD
 *   - Locally: defaults to HEAD~10..HEAD; override with --since=<rev>
 *
 * Skips: commits whose message starts with `Merge `, `Revert `, or that are
 * authored by a known-bot pattern. Skips deleted-only commits (no add/mod
 * lines on the high-risk paths).
 */

import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const repoRoot = resolve(dirname(__filename), "..");

// ── Parse the high-risk path globs out of CODEOWNERS ────────────────────────
const codeowners = readFileSync(resolve(repoRoot, "CODEOWNERS"), "utf8");
const HIGH_RISK_PATHS = codeowners
  .split("\n")
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith("#"))
  .map((line) => line.split(/\s+/)[0])
  .filter(Boolean);

// ── Resolve the commit range ────────────────────────────────────────────────
function resolveRange() {
  const sinceArg = process.argv.find((a) => a.startsWith("--since="));
  if (sinceArg) return `${sinceArg.slice("--since=".length)}..HEAD`;

  // GitHub Actions PR: GITHUB_BASE_REF set
  if (process.env.GITHUB_BASE_REF) {
    try {
      execSync(`git fetch origin ${process.env.GITHUB_BASE_REF} --depth=50`, { stdio: "ignore" });
      return `origin/${process.env.GITHUB_BASE_REF}..HEAD`;
    } catch {
      // fall through
    }
  }

  // Push to main / local default
  return "HEAD~10..HEAD";
}

const range = resolveRange();

// ── Walk commits ────────────────────────────────────────────────────────────
let log;
try {
  log = execSync(`git log ${range} --pretty=format:%H%x00%s%x00%b%x1e`, {
    cwd: repoRoot,
    encoding: "utf8",
  });
} catch (err) {
  console.error(`✖ Could not read git log for range ${range}: ${err.message}`);
  process.exit(2);
}

const commits = log
  .split("\x1e")
  .map((rec) => rec.trim())
  .filter(Boolean)
  .map((rec) => {
    const [sha, subject, ...bodyParts] = rec.split("\x00");
    return { sha, subject, body: bodyParts.join("\x00") };
  });

// Canonical (post-2026-05-21): `AI-assisted: <agent> ~X%` as a body trailer line.
const AI_TRAILER_RE = /^AI-assisted:\s+[\w.-]+\s+~?\d+%\s*$/m;
// Explicit no-AI opt-out for high-risk diffs.
const HUMAN_TRAILER_RE = /^Human-only:\s+\S.*$/m;
// Legacy (pre-2026-05-21): `[AI: <agent> ~X%]` header prefix. Accepted indefinitely
// so historical commits still pass the gate.
const LEGACY_HEADER_RE = /\[AI:\s*[a-z0-9._-]+\s*~?\d{1,3}%\]/i;

const SKIP_PREFIXES = ["Merge ", "Revert "];

function commitTouchesHighRisk(sha) {
  const files = execSync(`git diff-tree --no-commit-id --name-only -r ${sha}`, {
    cwd: repoRoot,
    encoding: "utf8",
  })
    .split("\n")
    .filter(Boolean);
  return files.some((file) =>
    HIGH_RISK_PATHS.some((pattern) => {
      // CODEOWNERS uses gitignore-like patterns; we support directory prefix
      // (`src/lib/auth/`) and exact-file matches. Wildcards aren't used in
      // DURA's CODEOWNERS as of 2026-04-25 — extend if that changes.
      if (pattern.endsWith("/")) return file.startsWith(pattern);
      return file === pattern;
    })
  );
}

const violations = [];
for (const c of commits) {
  if (SKIP_PREFIXES.some((p) => c.subject.startsWith(p))) continue;
  if (!commitTouchesHighRisk(c.sha)) continue;
  const message = `${c.subject}\n${c.body}`;
  if (
    !AI_TRAILER_RE.test(message) &&
    !HUMAN_TRAILER_RE.test(message) &&
    !LEGACY_HEADER_RE.test(message)
  ) {
    violations.push(c);
  }
}

if (violations.length > 0) {
  console.error(
    `✖ ${violations.length} commit(s) touch CODEOWNERS-protected high-risk paths without an AI provenance tag:`
  );
  for (const v of violations) {
    console.error(`  - ${v.sha.slice(0, 7)} ${v.subject}`);
  }
  console.error(
    "\nExpected (any one):" +
      "\n  - Body trailer: `AI-assisted: <agent> ~X%`            (canonical, post-2026-05-21)" +
      "\n  - Body trailer: `Human-only: <one-line reason>`        (high-risk diff with no AI involvement)" +
      "\n  - Header prefix: `[AI: <agent> ~X%]`                  (legacy form, still accepted)"
  );
  console.error(
    "See CLAUDE.md > Provenance Format and xDocs/decisions/0002-ai-provenance-format.md"
  );
  process.exit(1);
}

const highRiskCount = commits.filter(
  (c) => !SKIP_PREFIXES.some((p) => c.subject.startsWith(p)) && commitTouchesHighRisk(c.sha)
).length;
console.log(
  `✓ Provenance check passed: ${commits.length} commit(s) in ${range}, ${highRiskCount} touched high-risk paths, all carry a provenance trailer or legacy header tag (or were skipped as merge/revert).`
);
