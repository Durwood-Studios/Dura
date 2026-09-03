/**
 * Contract test: the EPOCH_MS_COLUMNS manifest in row-contracts.ts must
 * match the migration DDL exactly. This is the tripwire for the bug
 * class where an ISO string is written to a bigint epoch-ms column
 * ("invalid input syntax for type bigint" — sync silently drops data):
 * the manifest keeps the schema truth in code, the row-contract
 * interfaces pin those fields to `number` at compile time, and this
 * test keeps the manifest honest against supabase/migrations.
 */
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { EPOCH_MS_COLUMNS } from "@/lib/supabase/row-contracts";

const MIGRATIONS_DIR = path.resolve(process.cwd(), "supabase/migrations");

/**
 * Parses every `create table public.<name> (...)` block and collects
 * columns declared `bigint` with an `-- epoch ms` comment — the
 * migrations' own convention for epoch-ms date columns (plain bigint
 * counters like time_spent_ms carry no such comment).
 */
function epochMsColumnsFromDDL(): Record<string, string[]> {
  const tables: Record<string, string[]> = {};
  // Recursive: migrations live in "Already Ran/" and "Need To Run/" subfolders,
  // and DDL must stay contract-checked before it is applied, not after.
  const files = readdirSync(MIGRATIONS_DIR, { recursive: true, encoding: "utf8" }).filter((f) =>
    f.endsWith(".sql")
  );
  expect(files.length).toBeGreaterThan(0);

  for (const file of files) {
    const sql = readFileSync(path.join(MIGRATIONS_DIR, file), "utf8");
    let currentTable: string | null = null;
    for (const line of sql.split("\n")) {
      const tableMatch = line.match(/^create table (?:if not exists )?public\.(\w+)/);
      if (tableMatch) {
        currentTable = tableMatch[1];
        continue;
      }
      if (currentTable && line.trim().startsWith(");")) {
        currentTable = null;
        continue;
      }
      if (!currentTable) continue;
      const colMatch = line.match(/^\s+(\w+)\s+bigint\b.*--\s*epoch ms/i);
      if (colMatch) {
        // Dedupe: a table can be declared `if not exists` in more than one
        // migration (tutorial_progress is in both 014 and 20260629000004),
        // and the manifest lists each column once.
        const columns = (tables[currentTable] ??= []);
        if (!columns.includes(colMatch[1])) columns.push(colMatch[1]);
      }
    }
  }
  return tables;
}

describe("supabase row contracts", () => {
  const ddl = epochMsColumnsFromDDL();

  it("manifest covers every epoch-ms bigint column in the DDL", () => {
    for (const [table, columns] of Object.entries(ddl)) {
      expect(EPOCH_MS_COLUMNS, `table ${table} missing from EPOCH_MS_COLUMNS`).toHaveProperty(
        table
      );
      expect([...EPOCH_MS_COLUMNS[table]].sort(), `columns for ${table}`).toEqual(
        [...columns].sort()
      );
    }
  });

  it("manifest lists no table or column absent from the DDL", () => {
    for (const [table, columns] of Object.entries(EPOCH_MS_COLUMNS)) {
      expect(ddl, `manifest table ${table} not found in migrations`).toHaveProperty(table);
      expect([...columns].sort()).toEqual([...ddl[table]].sort());
    }
  });

  it("no query file writes toISOString into a manifest column", () => {
    // Static tripwire: scan the sync/query layer for `<column>:` keys
    // assigned a toISOString() call. The row-contract interfaces catch
    // annotated payloads at compile time; this catches unannotated ones.
    const queriesDir = path.resolve(process.cwd(), "src/lib/supabase");
    const offenders: string[] = [];
    const epochColumns = new Set(Object.values(EPOCH_MS_COLUMNS).flat());

    const walk = (dir: string): void => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          walk(full);
          continue;
        }
        if (!entry.name.endsWith(".ts")) continue;
        const source = readFileSync(full, "utf8");
        for (const column of epochColumns) {
          const assignment = new RegExp(`\\b${column}:[^,\\n]*toISOString`, "g");
          if (assignment.test(source)) {
            offenders.push(`${entry.name} → ${column}`);
          }
        }
      }
    };
    walk(queriesDir);

    expect(offenders, "ISO strings written to bigint epoch-ms columns").toEqual([]);
  });
});
