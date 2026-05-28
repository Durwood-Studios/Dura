#!/usr/bin/env node
/**
 * Dictionary category migration — collapses 31 source categories into 12
 * coherent buckets per the universality audit (xDocs/active/universality-
 * and-dictionary-audit-2026-05.md §3).
 *
 * Run once: `node scripts/migrate-dictionary-categories.mjs`. The script
 * rewrites the 5 batch files + index.ts in place, replacing the
 * `category: "old"` literals with `category: "new"`.
 *
 * Deliberately a one-shot migration script, not a runtime translation
 * layer. The data model gains nothing from carrying both old and new
 * names; cleaner to commit the snapshot.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DICT_DIR = resolve(repoRoot, "src/content/dictionary");

const FILES = [
  "batch-advanced-professional.ts",
  "batch-cto-gaps.ts",
  "batch-expansion.ts",
  "batch-systems-ai.ts",
  "batch-web-backend.ts",
  "index.ts",
];

/** Mapping: source category → canonical bucket. */
const MAP = {
  // Fundamentals (76)
  fundamentals: "fundamentals",
  "cs-fundamentals": "fundamentals",
  complexity: "fundamentals",
  // Programming languages (8)
  languages: "languages",
  // Web & frontend (60)
  web: "web",
  react: "web",
  nextjs: "web",
  // Backend (48)
  backend: "backend",
  // Databases (25)
  databases: "databases",
  database: "databases",
  "database-internals": "databases",
  // Networking (21)
  networking: "networking",
  // Systems (58)
  systems: "systems",
  hardware: "systems",
  // AI & ML (65)
  ai: "ai",
  "ai-ml": "ai",
  // Security (8)
  security: "security",
  // DevOps & infrastructure (31)
  devops: "devops",
  infrastructure: "devops",
  cloud: "devops",
  // Quality (16)
  testing: "quality",
  quality: "quality",
  // Professional (50)
  professional: "professional",
  leadership: "professional",
  business: "professional",
  product: "professional",
  "org-design": "professional",
  strategy: "professional",
  architecture: "professional",
  performance: "professional",
  tools: "professional",
};

const stats = {};

for (const filename of FILES) {
  const path = resolve(DICT_DIR, filename);
  let src;
  try {
    src = readFileSync(path, "utf8");
  } catch {
    continue;
  }
  let modified = src;
  const RE = /category:\s*"([^"]+)"/g;
  modified = modified.replace(RE, (match, oldCategory) => {
    const newCategory = MAP[oldCategory] ?? oldCategory;
    stats[`${oldCategory} → ${newCategory}`] = (stats[`${oldCategory} → ${newCategory}`] ?? 0) + 1;
    return `category: "${newCategory}"`;
  });
  if (modified !== src) {
    writeFileSync(path, modified);
    console.log(`✔ ${filename}`);
  }
}

console.log("\nMigration map applied:");
for (const [transition, count] of Object.entries(stats).sort()) {
  console.log(`  ${count.toString().padStart(3)}  ${transition}`);
}
