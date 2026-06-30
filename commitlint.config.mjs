import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

const PROVENANCE_TRAILER = /^AI-assisted:\s+[\w.-]+\s+~?\d+%\s*$/m;
const HUMAN_ONLY_TRAILER = /^Human-only:\s+\S.*$/m;

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function codeownersPatternToRegex(pattern) {
  if (pattern.endsWith("/")) return new RegExp("^" + escapeRegex(pattern));
  return new RegExp("^" + escapeRegex(pattern) + "$");
}

function highRiskPatterns() {
  try {
    return readFileSync("CODEOWNERS", "utf8")
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith("#"))
      .map((l) => l.split(/\s+/)[0])
      .filter(Boolean)
      .map(codeownersPatternToRegex);
  } catch {
    return [];
  }
}

function listStagedFiles() {
  try {
    return execSync("git diff --cached --name-only --diff-filter=ACMRT", {
      encoding: "utf8",
    })
      .split("\n")
      .filter(Boolean);
  } catch {
    return [];
  }
}

function diffTouchesHighRiskPath() {
  const files = listStagedFiles();
  if (files.length === 0) return false;
  const patterns = highRiskPatterns();
  return files.some((f) => patterns.some((re) => re.test(f)));
}

const config = {
  extends: ["@commitlint/config-conventional"],
  plugins: [
    {
      rules: {
        // Provenance gate (AINDGS-R3, ADR 0002):
        // If the staged diff touches any CODEOWNERS-listed high-risk path,
        // the commit message must carry an `AI-assisted: <agent> ~X%` trailer
        // OR an explicit `Human-only: <reason>` trailer. Commits that touch
        // only non-high-risk paths are unaffected.
        "ai-provenance-required": (parsed) => {
          if (!diffTouchesHighRiskPath()) return [true];
          const full = [parsed.header, parsed.body, parsed.footer].filter(Boolean).join("\n");
          if (PROVENANCE_TRAILER.test(full) || HUMAN_ONLY_TRAILER.test(full)) {
            return [true];
          }
          return [
            false,
            'diff touches a CODEOWNERS-listed high-risk path; add an "AI-assisted: <agent> ~X%" trailer (or "Human-only: <reason>" if no AI was involved). See xDocs/decisions/0002-ai-provenance-format.md.',
          ];
        },
      },
    },
  ],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "build",
        "chore",
        "ci",
        "docs",
        "feat",
        "fix",
        "governance",
        "perf",
        "refactor",
        "revert",
        "security",
        "style",
        "telem",
        "test",
      ],
    ],
    "ai-provenance-required": [2, "always"],
  },
};

export default config;
