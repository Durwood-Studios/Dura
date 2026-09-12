import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { describe, expect, it } from "vitest";

function source(moduleId: string, number: string): string {
  const root = path.resolve("src/content/phases/7-advanced-systems");
  const directory = readdirSync(root).find((name) => name.startsWith(`${moduleId}-`));
  if (!directory) throw new Error("Missing module");
  const filename = readdirSync(path.join(root, directory)).find((name) =>
    name.startsWith(`${number}-`)
  );
  if (!filename) throw new Error("Missing lesson");
  const mdx = readFileSync(path.join(root, directory, filename), "utf8");
  const encoded = mdx.match(/solution=\{("(?:[^"\\]|\\.)*")\}/)?.[1];
  if (!encoded) throw new Error("Missing literal solution");
  return JSON.parse(encoded) as string;
}

async function run(moduleId: string, number: string, assertion: string): Promise<unknown> {
  return await vm.runInNewContext(
    `(async () => { ${source(moduleId, number)}\n${assertion}\n})()`,
    { console: { log: (): void => {} }, performance, setTimeout },
    { timeout: 2000 }
  );
}

describe("advanced curriculum worked examples", () => {
  it("rejects an ended scope without invalidating independent references", async () => {
    expect(
      await run(
        "7-3",
        "04",
        `
      const scope = new Scope("test"); const ref = new ScopedRef("value",scope);
      if (ref.read() !== "value") return false;
      scope.end(); try { ref.read(); return false; } catch { return ref1.read() === "long string"; }
    `
      )
    ).toBe(true);
  });

  it("dispatches both Result variants and rejects a missing branch", async () => {
    expect(
      await run(
        "7-3",
        "05",
        `
      const handlers = {Ok: value => value+1, Err: value => "error:"+value};
      if (Result.Ok(2).match(handlers)!==3 || Result.Err("x").match(handlers)!=="error:x") return false;
      try { Result.Ok(2).match({Ok: handlers.Ok}); return false; } catch { return true; }
    `
      )
    ).toBe(true);
  });

  it("short-circuits the Result chain after division fails", async () => {
    expect(
      await run(
        "7-3",
        "06",
        `
      let called = false;
      const result2 = divide(3,0).andThen(() => {called=true; return Result.Ok(0);});
      return !called && result2.isErr() && divide(6,2).value===3;
    `
      )
    ).toBe(true);
  });

  it("counts matches and treats inherited property names as absent files", async () => {
    expect(
      await run(
        "7-3",
        "08",
        `
      const stats = countLines("config.toml","host");
      return stats.isOk() && stats.value.total===4 && stats.value.matched===2 &&
        !countLines("missing.txt","x").isOk() && !countLines("toString","x").isOk();
    `
      )
    ).toBe(true);
  });

  it("counts a fixed-cluster majority and rejects impossible response counts", async () => {
    expect(
      await run(
        "7-2",
        "02",
        `
      let rejected = false;
      try { electionResult(3, [true,true,true]); } catch { rejected = true; }
      return rejected && electionResult(1, []) === "elected" &&
        electionResult(4, [true,false]) === "failed" && electionResult(4,[true,true]) === "elected";
    `
      )
    ).toBe(true);
  });

  it("calculates intersecting quorums for even and odd replica counts", async () => {
    expect(
      await run(
        "7-2",
        "08",
        `
      for (const n of [1,2,3,4,5,10]) {
        for (const level of ["strong","read-heavy","write-heavy"]) {
          const {w,r} = quorumConfig(n,level);
          if (w+r <= n || w > n || r > n) return false;
        }
      }
      try { quorumConfig(0,"strong"); return false; } catch { return true; }
    `
      )
    ).toBe(true);
  });

  it("profiling preserves receiver, result and error while recording both calls", async () => {
    expect(
      await run(
        "7-4",
        "01",
        `
      const before = profileLog.length;
      const receiver = {value: 7, call: profile("receiver", function (x) {return this.value+x;})};
      if (receiver.call(2) !== 9) return false;
      const error = new Error("expected"); let observed;
      try { profile("failure", () => {throw error;})(); } catch (caught) {observed = caught;}
      return observed === error && profileLog.length === before+2 && profileLog.slice(-2).every(e => e.duration >= 0);
    `
      )
    ).toBe(true);
  });

  it("pool releases rejected tasks and reserves queued slots under contention", async () => {
    expect(
      await run(
        "7-4",
        "05",
        `
      const pool2 = new ConcurrencyPool(2); let active=0; let peak=0;
      const results2 = await Promise.allSettled(Array.from({length:12}, (_,i) => pool2.execute(async () => {
        active++; peak=Math.max(peak,active);
        try { await new Promise(resolve => setTimeout(resolve,1)); if (i===1) throw new Error("expected"); return i; }
        finally { active--; }
      })));
      return peak===2 && active===0 && pool2.running===0 && pool2.queue.length===0 &&
        results2.filter(r => r.status==="rejected").length===1 && results2[11].value===11;
    `
      )
    ).toBe(true);
  });

  it("indexed search preserves first duplicate, repeated queries and absent IDs", async () => {
    expect(
      await run(
        "7-4",
        "06",
        `
      const first={id:"a",value:1}, duplicate={id:"a",value:2}, second={id:"b",value:3};
      const input=[first,duplicate,second], queries2=["b","a","missing","a"];
      const expected=slowSearch(input,queries2), actual=fastSearch(input,queries2);
      return actual.length===3 && actual.every((row,i)=>row===expected[i]) && input.length===3 && actual[1]===first;
    `
      )
    ).toBe(true);
  });
});
