#!/usr/bin/env node
import { readFile, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = fileURLToPath(new URL("../", import.meta.url));
const REQUIRED_COLUMNS = {
  profiles: ["id", "email"],
  lesson_progress: ["user_id", "lesson_id", "quiz_passed", "quiz_score"],
  module_progress: ["user_id", "module_id"],
  phase_progress: ["user_id", "phase_id"],
  analytics_events: ["user_id", "id", "name", "timestamp"],
  xp_events: ["user_id", "id"],
  review_logs: ["user_id", "id"],
  certificates: ["user_id", "id", "server_credential"],
  tutorial_progress: ["user_id", "id", "slug", "checkpoints"],
  dojo_sessions: ["user_id", "id", "tier", "results"],
  concept_retention: ["user_id", "concept_id", "strength"],
  feedback: ["id", "message", "category", "page_url", "created_at"],
  annotations: ["status", "upvotes", "downvotes"],
};

/** Conservative contract triage; matching these checks is not deployment approval. */
export function inspectSchema(snapshot) {
  if (
    snapshot?.formatVersion !== 1 ||
    snapshot.schema !== "public" ||
    !Array.isArray(snapshot.tables) ||
    !Array.isArray(snapshot.functions) ||
    !Array.isArray(snapshot.grants)
  ) {
    throw new Error("Expected the public-schema JSON produced by schema-inventory.sql");
  }
  const blockers = [];
  const tables = new Map(snapshot.tables.map((table) => [table.name, table]));
  for (const [name, columns] of Object.entries(REQUIRED_COLUMNS)) {
    const table = tables.get(name);
    if (!table) {
      blockers.push(`Missing table: public.${name}`);
      continue;
    }
    if (table.rls !== true) blockers.push(`RLS disabled: public.${name}`);
    const present = new Set((table.columns ?? []).map((column) => column.name));
    for (const column of columns)
      if (!present.has(column)) blockers.push(`Missing column: public.${name}.${column}`);
    if (!Array.isArray(table.policies) || table.policies.length === 0)
      blockers.push(`No row policies: public.${name}`);
  }
  if (tables.has("analytics") && tables.has("analytics_events"))
    blockers.push("Both analytics tables exist: reconcile data before migration 014");
  for (const name of ["analytics_events", "xp_events", "review_logs", "certificates"]) {
    const indexes = tables.get(name)?.indexes ?? [];
    if (
      indexes.some((definition) => /UNIQUE INDEX/i.test(definition) && /\(id\)/.test(definition))
    ) {
      blockers.push(`Global ID uniqueness conflicts with tenant replay: public.${name}`);
    }
    if (
      !indexes.some(
        (definition) => /UNIQUE INDEX/i.test(definition) && /\(user_id, id\)/.test(definition)
      )
    ) {
      blockers.push(`Missing tenant conflict index: public.${name}(user_id,id)`);
    }
  }
  const feedback = snapshot.functions.find((fn) => fn.name === "submit_feedback");
  if (
    !feedback ||
    !feedback.securityDefiner ||
    !feedback.anonExecute ||
    !feedback.authenticatedExecute
  ) {
    blockers.push("Feedback RPC missing or caller/definer permissions differ");
  }
  const sync = snapshot.functions.find((fn) => fn.name === "sync_progress");
  if (!sync || sync.securityDefiner || sync.anonExecute || !sync.authenticatedExecute) {
    blockers.push("Progress RPC must be authenticated-only and SECURITY INVOKER");
  }
  if (
    snapshot.grants.some(
      (grant) =>
        grant.table === "feedback" &&
        (grant.role === "anon" || (grant.role === "authenticated" && grant.privilege !== "SELECT"))
    )
  ) {
    blockers.push("Feedback inbox has forbidden direct client grants");
  }
  return {
    status: blockers.length ? "schema-blocked" : "checked-contracts-match-human-review-required",
    capturedAt: snapshot.capturedAt ?? null,
    blockers,
    limits: [
      "No migration is applied by this tool",
      "Check column types, function bodies, every policy and column grant manually",
      "Reconcile live migration history and staged checksums before selecting changes",
      "A schema match does not test hosted JWT issuance, redirects, storage, realtime or deployment environment",
    ],
  };
}

async function main() {
  const files = (await readdir(path.join(ROOT, "supabase/staged")))
    .filter((file) => file.endsWith(".sql"))
    .sort();
  const proposals = await Promise.all(
    files.map(async (file) => ({
      file: `supabase/staged/${file}`,
      sha256: createHash("sha256")
        .update(await readFile(path.join(ROOT, "supabase/staged", file)))
        .digest("hex"),
    }))
  );
  const snapshotPath = process.argv[2];
  const result = snapshotPath
    ? inspectSchema(JSON.parse(await readFile(snapshotPath, "utf8")))
    : {
        status: "hosted-schema-unavailable",
        blockers: [
          "Supply an actual target's read-only schema snapshot; repository migrations do not establish live state",
        ],
      };
  console.log(JSON.stringify({ ...result, proposals, automaticApply: false }, null, 2));
  if (result.status !== "checked-contracts-match-human-review-required") process.exitCode = 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(`Preflight failed: ${error.message}`);
    process.exitCode = 1;
  });
}
