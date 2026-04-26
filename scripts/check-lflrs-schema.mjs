#!/usr/bin/env node
/**
 * LFLRS-R2 — assert that the LFLRS-1.0 JSON Schema in
 * standards/lflrs/schema.json is itself valid and that a sample-record
 * fixture validates against it.
 *
 * Two checks:
 *   1. Schema self-validity — Ajv must accept the schema.
 *   2. Round-trip fixture conformance — fixtures/lflrs-sample.json
 *      validates as a CanonicalLearnerRecord.
 *
 * The fixture is intentionally minimal (one card, one review, one mastery
 * record); the comprehensive shape coverage lives in
 * tests/learner-record/schema.test.ts (Vitest, run separately by `npm test`).
 */

import { readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const __filename = fileURLToPath(import.meta.url);
const repoRoot = resolve(dirname(__filename), "..");
const schemaPath = resolve(repoRoot, "standards/lflrs/schema.json");
const fixturePath = resolve(repoRoot, "fixtures/lflrs-sample.json");

const SAMPLE_FIXTURE = {
  schema_version: "lflrs-1.0",
  learner_id: "11111111-2222-4333-8444-555555555555",
  exported_at: "2026-04-25T00:00:00.000Z",
  cards: [
    {
      id: "9f8a4ab2-7d8e-4e7a-9b1c-1a2b3c4d5e6f",
      stability: 12.5,
      difficulty: 4.2,
      due: "2026-05-06T13:33:20.000Z",
      reps: 3,
      lapses: 0,
      state: "Review",
      last_modified: "2026-04-25T00:00:00.000Z",
    },
  ],
  review_log: [
    {
      id: "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
      card_id: "9f8a4ab2-7d8e-4e7a-9b1c-1a2b3c4d5e6f",
      rating: 3,
      elapsed_days: 0.5,
      scheduled_days: 11.5,
      review: "2026-04-25T00:00:00.000Z",
      state: "Review",
    },
  ],
  mastery_records: [
    {
      module_id: "phase-0/intro",
      mastery_score: 0.85,
      unlocked_at: "2026-04-25T00:00:00.000Z",
      last_modified: "2026-04-25T00:00:00.000Z",
    },
  ],
};

// ── Ensure fixture exists ───────────────────────────────────────────────────
if (!existsSync(fixturePath)) {
  mkdirSync(dirname(fixturePath), { recursive: true });
  writeFileSync(fixturePath, JSON.stringify(SAMPLE_FIXTURE, null, 2) + "\n");
  console.log(`✓ Wrote ${fixturePath}`);
}

// ── Load and validate ──────────────────────────────────────────────────────
const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats.default(ajv);

let schema;
try {
  schema = JSON.parse(readFileSync(schemaPath, "utf8"));
} catch (err) {
  console.error(`✖ Could not read ${schemaPath}: ${err.message}`);
  process.exit(2);
}

let validate;
try {
  validate = ajv.compile(schema);
} catch (err) {
  console.error(`✖ schema.json is itself invalid: ${err.message}`);
  process.exit(1);
}

const fixture = JSON.parse(readFileSync(fixturePath, "utf8"));
const ok = validate(fixture);

if (!ok) {
  console.error("✖ fixtures/lflrs-sample.json does NOT conform to standards/lflrs/schema.json:");
  for (const e of validate.errors ?? []) {
    console.error(`  - ${e.instancePath || "<root>"} ${e.message}`);
  }
  process.exit(1);
}

console.log("✓ standards/lflrs/schema.json is valid; fixtures/lflrs-sample.json conforms.");
