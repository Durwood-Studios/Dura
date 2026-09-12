import { test } from "node:test";
import assert from "node:assert/strict";
import { inspectSchema } from "../../scripts/check-supabase-readiness.mjs";
import { isLocalTestDatabase } from "../../scripts/assert-local-test-database.mjs";

const empty = { formatVersion: 1, schema: "public", tables: [], functions: [], grants: [] };
test("missing live schema cannot be marked deployment-ready", () => {
  assert.throws(() => inspectSchema({}), /schema-inventory/);
  assert.equal(inspectSchema(empty).status, "schema-blocked");
});
test("flags dangerous grants, definer progress RPC and cross-tenant unique IDs", () => {
  const report = inspectSchema({
    ...empty,
    tables: [
      {
        name: "xp_events",
        rls: false,
        columns: [],
        policies: [],
        indexes: ["CREATE UNIQUE INDEX global_id ON public.xp_events USING btree (id)"],
      },
    ],
    functions: [
      {
        name: "sync_progress",
        securityDefiner: true,
        anonExecute: true,
        authenticatedExecute: true,
      },
    ],
    grants: [{ table: "feedback", role: "anon", privilege: "SELECT" }],
  });
  assert.ok(report.blockers.some((line) => line.includes("Global ID")));
  assert.ok(report.blockers.some((line) => line.includes("SECURITY INVOKER")));
  assert.ok(report.blockers.some((line) => line.includes("forbidden direct")));
});
test("local SQL harness rejects remote-host and connection-query bypasses", () => {
  assert.equal(isLocalTestDatabase("postgres://test:local@127.0.0.1:5432/dura_test"), true);
  assert.equal(
    isLocalTestDatabase("postgres://test:local@localhost:5432/dura_test?host=production.example"),
    false
  );
  assert.equal(
    isLocalTestDatabase("postgres://user@remote.example/database?x=@localhost:5432/foo"),
    false
  );
  assert.equal(isLocalTestDatabase("postgres://user@remote.example:5432/database"), false);
  assert.equal(isLocalTestDatabase("postgres://user@localhost:5432/"), false);
});
