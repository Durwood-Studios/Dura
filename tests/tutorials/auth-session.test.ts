// @vitest-environment node
import { readFileSync } from "node:fs";
import crypto from "node:crypto";
import { DatabaseSync } from "node:sqlite";
import ts from "typescript";
import { expect, it } from "vitest";

interface TutorialTokens {
  storeRefreshToken: (userId: number, token: string) => Promise<void>;
  verifyRefreshToken: (token: string) => unknown;
  revokeUserTokens: (userId: number) => Promise<void>;
}
const source = readFileSync("src/content/tutorials/11-auth-system.mdx", "utf8");
function loadTokens(db: DatabaseSync, secrets: Record<string, string | undefined>): TutorialTokens {
  const block = [...source.matchAll(/```typescript\n([\s\S]*?)```/g)]
    .map((match) => match[1])
    .find((text) => text.includes('import jwt from "jsonwebtoken"'));
  if (!block) throw new Error("Missing tutorial token module");
  const output = ts.transpileModule(block, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.CommonJS,
      esModuleInterop: true,
    },
  }).outputText;
  const exports = {};
  const dependencies: Record<string, unknown> = {
    crypto,
    "../db": { getDb: () => db },
    // This suite tests session persistence/authorization, not jsonwebtoken's cryptography.
    jsonwebtoken: {
      verify: (token: string): unknown => {
        if (token === "invalid-signature") throw new Error("Invalid signature");
        return { userId: 1, email: "learner@example.test" };
      },
    },
  };
  new Function("require", "exports", "process", output)(
    (name: string): unknown => {
      if (!(name in dependencies)) throw new Error(`Unexpected dependency ${name}`);
      return dependencies[name];
    },
    exports,
    { env: secrets }
  );
  return exports as TutorialTokens;
}
it("auth tutorial checks actual SQLite session hash, owner, revocation and expiry", async () => {
  const db = new DatabaseSync(":memory:");
  try {
    db.exec(
      "CREATE TABLE refresh_tokens (id INTEGER PRIMARY KEY, user_id INTEGER, token_hash TEXT UNIQUE, expires_at TEXT, revoked INTEGER DEFAULT 0)"
    );
    const tokens = loadTokens(db, {
      JWT_ACCESS_SECRET: "a".repeat(64),
      JWT_REFRESH_SECRET: "b".repeat(64),
    });
    const original = `${"x".repeat(100)}first`;
    await tokens.storeRefreshToken(1, original);
    expect(tokens.verifyRefreshToken(original)).toMatchObject({ userId: 1 });
    expect(() => tokens.verifyRefreshToken(`${"x".repeat(100)}different`)).toThrow(/unknown/);
    expect(() => tokens.verifyRefreshToken("invalid-signature")).toThrow(/signature/);
    db.exec("UPDATE refresh_tokens SET user_id = 2");
    expect(() => tokens.verifyRefreshToken(original)).toThrow();
    db.exec("UPDATE refresh_tokens SET user_id = 1, expires_at = '2000-01-01T00:00:00.000Z'");
    expect(() => tokens.verifyRefreshToken(original)).toThrow();
    db.exec("UPDATE refresh_tokens SET expires_at = '2999-01-01T00:00:00.000Z'");
    await tokens.revokeUserTokens(1);
    expect(() => tokens.verifyRefreshToken(original)).toThrow();
  } finally {
    db.close();
  }
});
it("auth tutorial refuses absent, short, or reused signing secrets", () => {
  const db = new DatabaseSync(":memory:");
  try {
    for (const secrets of [
      {},
      { JWT_ACCESS_SECRET: "short" },
      { JWT_ACCESS_SECRET: "x".repeat(64), JWT_REFRESH_SECRET: "x".repeat(64) },
    ]) {
      expect(() => loadTokens(db, secrets)).toThrow();
    }
  } finally {
    db.close();
  }
});
it("refresh cookie creation and clearing both cover logout and refresh routes", () => {
  const cookiePaths = [...source.matchAll(/path: "([^"]+)"/g)].map((match) => match[1]);
  expect(cookiePaths).toEqual(["/auth", "/auth", "/auth"]);
});
