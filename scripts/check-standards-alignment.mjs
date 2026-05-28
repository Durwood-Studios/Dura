#!/usr/bin/env node
/**
 * Standards-alignment audit — assert that every lesson MDX file declares
 * a complete `standards:` frontmatter block, and that every (phase, module)
 * pair in the lesson tree has a matching row in src/content/standards-map.ts.
 *
 * Why a script and not a runtime check: lesson frontmatter is consumed by
 * the MDX loader, which fails loudly when shape is wrong but silently when
 * a key is missing. SFIA levels and Bloom codes are easy to typo. This gate
 * catches drift before it ships and gives one consolidated report instead
 * of one error-per-page on dev.
 *
 * Per-lesson frontmatter contract:
 *   standards:
 *     cs2023:  string[]   non-empty, ACM CS2023 knowledge-area codes
 *     swebok:  string[]   non-empty, SWEBOK v4 KA labels
 *     bloom:   enum       remember | understand | apply | analyze | evaluate | create
 *     sfia:    integer    1..7
 *     dreyfus: enum       novice | advanced-beginner | competent | proficient | expert
 *
 * Module-level rows in PHASE_STANDARDS (standards-map.ts) provide the codes
 * that don't fit per-lesson (CSTA, AP CSP, AP CSA, ISTE).
 *
 * Exit code: 0 = clean, 1 = drift found, 2 = script error.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { resolve, dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYAML } from "yaml";

const __filename = fileURLToPath(import.meta.url);
const repoRoot = resolve(dirname(__filename), "..");
const phasesDir = resolve(repoRoot, "src/content/phases");
const mapPath = resolve(repoRoot, "src/content/standards-map.ts");

const BLOOM = new Set(["remember", "understand", "apply", "analyze", "evaluate", "create"]);
const DREYFUS = new Set(["novice", "advanced-beginner", "competent", "proficient", "expert"]);
const SFIA_MIN = 1;
const SFIA_MAX = 7;

// ── Walk lesson tree ────────────────────────────────────────────────────────
function walkMdx(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      out.push(...walkMdx(full));
    } else if (name.endsWith(".mdx")) {
      out.push(full);
    }
  }
  return out;
}

const lessonPaths = walkMdx(phasesDir);

// ── Extract module pairs covered by standards-map.ts ────────────────────────
// Cheap parse: each PHASE_STANDARDS row spells phaseId / moduleId as string
// literals. Pull the pairs without importing the TS module.
const mapSource = readFileSync(mapPath, "utf8");
const mappedPairs = new Set();
const PAIR_RE = /phaseId:\s*"([^"]+)"\s*,\s*moduleId:\s*"([^"]+)"/g;
for (const m of mapSource.matchAll(PAIR_RE)) {
  mappedPairs.add(`${m[1]}::${m[2]}`);
}

// ── Audit ───────────────────────────────────────────────────────────────────
const errors = [];
const lessonModulePairs = new Set();

for (const path of lessonPaths) {
  const rel = relative(repoRoot, path);
  const body = readFileSync(path, "utf8");
  const fmMatch = body.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) {
    errors.push({ path: rel, issue: "no frontmatter block" });
    continue;
  }

  let fm;
  try {
    fm = parseYAML(fmMatch[1]);
  } catch (err) {
    errors.push({ path: rel, issue: `frontmatter is not valid YAML: ${err.message}` });
    continue;
  }

  const phase = String(fm.phase ?? "");
  const moduleSlug = String(fm.module ?? "");
  if (!phase || !moduleSlug) {
    errors.push({ path: rel, issue: "missing phase or module key" });
    continue;
  }
  // standards-map.ts uses short module IDs like "0-1"; lesson frontmatter
  // uses the full directory slug like "0-1-how-computers-think". Normalize
  // by extracting the leading "N-N" prefix for the cross-check.
  const moduleShort = moduleSlug.match(/^\d+-\d+/)?.[0] ?? moduleSlug;
  lessonModulePairs.add(`${phase}::${moduleShort}`);

  const s = fm.standards;
  if (!s || typeof s !== "object") {
    errors.push({ path: rel, issue: "missing `standards` block" });
    continue;
  }

  if (!Array.isArray(s.cs2023) || s.cs2023.length === 0) {
    errors.push({ path: rel, issue: "standards.cs2023 must be a non-empty array" });
  }
  if (!Array.isArray(s.swebok) || s.swebok.length === 0) {
    errors.push({ path: rel, issue: "standards.swebok must be a non-empty array" });
  }
  if (typeof s.bloom !== "string" || !BLOOM.has(s.bloom)) {
    errors.push({
      path: rel,
      issue: `standards.bloom must be one of {${[...BLOOM].join(", ")}} (got ${JSON.stringify(s.bloom)})`,
    });
  }
  if (typeof s.dreyfus !== "string" || !DREYFUS.has(s.dreyfus)) {
    errors.push({
      path: rel,
      issue: `standards.dreyfus must be one of {${[...DREYFUS].join(", ")}} (got ${JSON.stringify(s.dreyfus)})`,
    });
  }
  if (!Number.isInteger(s.sfia) || s.sfia < SFIA_MIN || s.sfia > SFIA_MAX) {
    errors.push({
      path: rel,
      issue: `standards.sfia must be an integer ${SFIA_MIN}..${SFIA_MAX} (got ${JSON.stringify(s.sfia)})`,
    });
  }
}

// ── Module-pair coverage cross-check ────────────────────────────────────────
const lessonsWithoutMapRow = [...lessonModulePairs].filter((p) => !mappedPairs.has(p)).sort();
const mapRowsWithoutLessons = [...mappedPairs].filter((p) => !lessonModulePairs.has(p)).sort();

// ── Report ──────────────────────────────────────────────────────────────────
const lessonCount = lessonPaths.length;
const ok = errors.length === 0 && lessonsWithoutMapRow.length === 0;

if (errors.length > 0) {
  console.error(`✖ ${errors.length} lesson frontmatter issue(s):`);
  for (const e of errors.slice(0, 50)) {
    console.error(`  ${e.path}: ${e.issue}`);
  }
  if (errors.length > 50) {
    console.error(`  … and ${errors.length - 50} more`);
  }
  console.error("");
}

if (lessonsWithoutMapRow.length > 0) {
  console.error(
    `✖ ${lessonsWithoutMapRow.length} (phase, module) pair(s) used by lessons but missing from PHASE_STANDARDS in src/content/standards-map.ts:`
  );
  for (const p of lessonsWithoutMapRow) console.error(`  ${p.replace("::", " / ")}`);
  console.error("");
}

if (mapRowsWithoutLessons.length > 0) {
  // Warning only — modules can legitimately be pre-registered in the map
  // ahead of their first lesson, or kept around during a content rewrite.
  console.warn(
    `⚠ ${mapRowsWithoutLessons.length} PHASE_STANDARDS row(s) with no matching lesson directory (probably stale, but allowed):`
  );
  for (const p of mapRowsWithoutLessons) console.warn(`  ${p.replace("::", " / ")}`);
  console.warn("");
}

if (ok) {
  console.log(
    `✓ standards-alignment: ${lessonCount} lessons checked, ` +
      `${lessonModulePairs.size} unique modules covered, no drift.`
  );
  process.exit(0);
}

process.exit(1);
