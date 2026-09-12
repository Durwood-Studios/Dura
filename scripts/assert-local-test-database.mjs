#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";

/** Reject URL tricks that could send the destructive fixture harness to a remote host. */
export function isLocalTestDatabase(value) {
  try {
    const url = new URL(value);
    return (
      ["postgres:", "postgresql:"].includes(url.protocol) &&
      ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) &&
      Boolean(url.port) &&
      url.pathname.length > 1 &&
      !url.search &&
      !url.hash
    );
  } catch {
    return false;
  }
}
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url) &&
  !isLocalTestDatabase(process.env.DURA_TEST_DATABASE_URL)
) {
  console.error(
    "Refusing test database: use an explicit localhost URL, port and disposable database, without query overrides."
  );
  process.exitCode = 1;
}
