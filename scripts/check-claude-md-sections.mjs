#!/usr/bin/env node
/**
 * AINDGS-R1 — assert that CLAUDE.md contains every required governance
 * section. Fails the CI gate (exit 1) if any section is missing.
 *
 * Required sections were defined in Phase 1-D
 * (xDocs/decisions/0002-ai-provenance-format.md and the AINDGS-1.0
 * reference). When any of them are added/renamed, update REQUIRED_SECTIONS
 * here and refresh standards/aindgs/capabilities.yaml in the same commit.
 */

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const REQUIRED_SECTIONS = [
  "## Capability Boundary",
  "## High-Risk Surfaces",
  "## Review Triggers",
  "## Provenance Format",
  "## Changelog",
];

const __filename = fileURLToPath(import.meta.url);
const repoRoot = resolve(dirname(__filename), "..");
const claudeMdPath = resolve(repoRoot, "CLAUDE.md");

let body;
try {
  body = readFileSync(claudeMdPath, "utf8");
} catch (err) {
  console.error(`✖ Could not read ${claudeMdPath}: ${err.message}`);
  process.exit(2);
}

const missing = REQUIRED_SECTIONS.filter((heading) => !body.includes(heading));

if (missing.length > 0) {
  console.error("✖ CLAUDE.md is missing required AINDGS-R1 sections:");
  for (const m of missing) console.error(`  - ${m}`);
  console.error(
    "\nAdd them, or update REQUIRED_SECTIONS in this script if a heading was renamed (must update standards/aindgs/capabilities.yaml in the same commit)."
  );
  process.exit(1);
}

console.log(`✓ CLAUDE.md contains all ${REQUIRED_SECTIONS.length} required AINDGS sections.`);
