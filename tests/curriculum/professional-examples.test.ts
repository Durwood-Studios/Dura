import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import vm from "node:vm";
import ts from "typescript";
import { describe, expect, it } from "vitest";

const ROOT = path.resolve("src/content/phases/8-professional-practice");

function lesson(moduleId: string, number: string): string {
  const directory = readdirSync(ROOT).find((name: string): boolean =>
    name.startsWith(`${moduleId}-`)
  );
  if (!directory) throw new Error(`Missing moduleId ${moduleId}`);
  const filename = readdirSync(path.join(ROOT, directory)).find((name: string): boolean =>
    name.startsWith(`${number}-`)
  );
  if (!filename) throw new Error(`Missing lesson ${number}`);
  return readFileSync(path.join(ROOT, directory, filename), "utf8");
}

function solution(moduleId: string, number: string): string {
  const source = lesson(moduleId, number);
  const expression = source.match(/solution=\{((?:"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`))\}/)?.[1];
  if (!expression) throw new Error(`Missing literal solution ${moduleId}/${number}`);
  const file = ts.createSourceFile(
    "example.ts",
    `const value = ${expression}`,
    ts.ScriptTarget.Latest,
    true
  );
  const statement = file.statements[0];
  if (!ts.isVariableStatement(statement)) throw new Error("Expected a literal declaration");
  const initializer = statement.declarationList.declarations[0].initializer;
  if (
    !initializer ||
    (!ts.isStringLiteral(initializer) && !ts.isNoSubstitutionTemplateLiteral(initializer))
  )
    throw new Error("Expected literal source");
  return initializer.text;
}

async function run(moduleId: string, number: string, assertion: string): Promise<unknown> {
  const context = vm.createContext({
    console: { log: (): void => {}, error: (): void => {}, warn: (): void => {} },
  });
  return await vm.runInContext(
    `(async () => { ${solution(moduleId, number)}
;
${assertion}
 })()`,
    context,
    {
      timeout: 1_000,
    }
  );
}

describe("Professional curriculum worked examples", (): void => {
  for (const moduleId of ["8-2", "8-3"]) {
    const count = moduleId === "8-2" ? 7 : 6;
    for (let index = 1; index <= count; index++) {
      const number = String(index).padStart(2, "0");
      it(`${moduleId}/${number} has a completed, terminating solution`, async (): Promise<void> => {
        expect(solution(moduleId, number)).not.toMatch(/TODO|YOUR CODE HERE|Your code here/);
        await expect(run(moduleId, number, "return true;")).resolves.toBe(true);
      });
    }
  }

  it("forms a matrix product and handles an empty dimension", async (): Promise<void> => {
    expect(
      await run("8-2", "02", "return generateMatrix({ os: ['a', 'b'], version: [1, 2] });")
    ).toEqual([
      { os: "a", version: 1 },
      { os: "a", version: 2 },
      { os: "b", version: 1 },
      { os: "b", version: 2 },
    ]);
    expect(await run("8-2", "02", "return generateMatrix({ os: [] });")).toEqual([]);
    expect(await run("8-2", "02", "return generateMatrix({});")).toEqual([{}]);
  });

  it("terminates dependency planning and rejects unknown dependencies and cycles", async (): Promise<void> => {
    expect(
      await run("8-2", "07", "return planExecution({ a: { needs: [] }, b: { needs: ['a'] } });")
    ).toEqual([["a"], ["b"]]);
    await expect(
      run("8-2", "07", "return planExecution({ a: { needs: ['missing'] } });")
    ).rejects.toThrow("Unknown dependency");
    await expect(
      run("8-2", "07", "return planExecution({ a: { needs: ['b'] }, b: { needs: ['a'] } });")
    ).rejects.toThrow("Circular dependency");
  });

  it("does not mistake JSON object-key order for infrastructure drift", async (): Promise<void> => {
    expect(
      await run(
        "8-2",
        "04",
        "return resolveInfra({ db: { size: 2, engine: 'pg' } }, { db: { engine: 'pg', size: 2 } });"
      )
    ).toEqual([{ resource: "db", action: "none" }]);
  });

  it("holds a healthy canary until enough checks and rolls back a percentage breach", async (): Promise<void> => {
    expect(
      await run(
        "8-2",
        "03",
        "return canaryDecision({ errorRate: 0.5, p99Latency: 100 }, { p99Latency: 100 }, 4);"
      )
    ).toBe("hold");
    expect(
      await run(
        "8-2",
        "03",
        "return canaryDecision({ errorRate: 1.1, p99Latency: 100 }, { p99Latency: 100 }, 5);"
      )
    ).toBe("rollback");
  });

  it("rejects a missing transfer target before mutating the source", async (): Promise<void> => {
    expect(
      await run(
        "8-3",
        "01",
        `const source = new BankAccount("source", 100); accountRepository.save(source);
      try { transferFunds(accountRepository, "source", "missing", 50); } catch { return source.balance; }`
      )
    ).toBe(100);
  });

  it("keeps cart projections isolated and removes one matching item", async (): Promise<void> => {
    expect(
      await run(
        "8-3",
        "04",
        `addItem("one", "a", 1); addItem("one", "a", 1); addItem("two", "b", 2);
      removeItem("one", "a"); return [getCartContents("one"), getCartContents("two")];`
      )
    ).toEqual([[{ item: "a", price: 1 }], [{ item: "b", price: 2 }]]);
  });

  it("returns a client error for malformed route encoding", async (): Promise<void> => {
    expect(await run("8-3", "05", "return router.handle('GET', '/users/%ZZ').status;")).toBe(400);
  });

  it("prevents duplicate returns and preserves a loan's historical result", async (): Promise<void> => {
    await expect(run("8-3", "06", "loan.returnBook(new Date('2025-01-13'));")).rejects.toThrow(
      "Already returned"
    );
    expect(await run("8-3", "06", "return loan.isOverdue(new Date('2025-02-01'));")).toBe(false);
  });
});
