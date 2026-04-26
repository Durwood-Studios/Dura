#!/usr/bin/env node
/**
 * PPLAS-R5 — assert that every `track("...")` call site in src/ matches a
 * raw_events.id in standards/pplas/event-catalog.yaml.
 *
 * Greps source for `track("…")` invocations, extracts the event name, and
 * fails the gate if any name is not in the catalog. Also flags catalog
 * entries that have NO matching call site (probably-dead catalog entries),
 * but those are warnings only — code can legitimately pre-register an
 * event ahead of its first call site.
 */

import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYAML } from "yaml";

const __filename = fileURLToPath(import.meta.url);
const repoRoot = resolve(dirname(__filename), "..");

// ── Load catalog ────────────────────────────────────────────────────────────
const catalogPath = resolve(repoRoot, "standards/pplas/event-catalog.yaml");
const catalog = parseYAML(readFileSync(catalogPath, "utf8"));
const cataloguedRawIds = new Set((catalog.raw_events ?? []).map((e) => e.id));

// ── Grep source for track("…") calls ────────────────────────────────────────
let grepOut = "";
try {
  grepOut = execSync(
    'grep -rEho \'track\\(\\s*["\\x27][a-z_][a-z0-9_]*["\\x27]\' src --include="*.ts" --include="*.tsx" || true',
    { cwd: repoRoot, encoding: "utf8" }
  );
} catch (err) {
  console.error(`✖ Failed to grep src/: ${err.message}`);
  process.exit(2);
}

const TRACK_NAME_RE = /track\(\s*["']([a-z_][a-z0-9_]*)["']/g;
const usedIds = new Set();
for (const line of grepOut.split("\n")) {
  if (!line.trim()) continue;
  const matches = line.matchAll(TRACK_NAME_RE);
  for (const m of matches) usedIds.add(m[1]);
}

// ── Compare ─────────────────────────────────────────────────────────────────
const undocumented = [...usedIds].filter((id) => !cataloguedRawIds.has(id));
const unused = [...cataloguedRawIds].filter((id) => !usedIds.has(id));

if (undocumented.length > 0) {
  console.error("✖ track() call sites reference event names NOT in the PPLAS catalog:");
  for (const id of undocumented) console.error(`  - ${id}`);
  console.error(
    `\nAdd these to standards/pplas/event-catalog.yaml under \`raw_events\` (every event needs id, fields with pii flags, transmitted_remotely, consent_required, learner_benefit) before merging.`
  );
  process.exit(1);
}

if (unused.length > 0) {
  console.warn(`⚠ ${unused.length} catalog event(s) have no track() call site (probably-dead):`);
  for (const id of unused) console.warn(`  - ${id}`);
  console.warn("Either remove from catalog or add the call site. Not blocking.");
}

console.log(
  `✓ ${usedIds.size} track() call site(s) all match ${cataloguedRawIds.size} catalog entries.`
);
