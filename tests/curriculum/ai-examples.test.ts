import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import vm from "node:vm";
import ts from "typescript";
import matter from "gray-matter";
import { auditLesson } from "@/lib/lesson-conformance";
import { describe, expect, it } from "vitest";

const ROOT = path.resolve("src/content/phases/6-ai-ml-engineering");

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

describe("AI curriculum worked examples", (): void => {
  it("accepts JSON-encoded Python written answers without losing indentation", (): void => {
    const raw = lesson("6-8", "02");
    const { data, content } = matter(raw);
    expect(auditLesson({ frontmatter: data, body: content })).toEqual([]);
    const encoded = content.match(/modelAnswer=\{("(?:\\.|[^"\\])*")\}/)?.[1];
    if (!encoded)
      throw new Error("Python answer must use a JSON string to preserve MDX indentation");
    const code: unknown = JSON.parse(encoded);
    expect(code).toEqual(expect.stringMatching(/def sigmoid\(z\):\n +return/));
  });

  for (const moduleId of ["6-5", "6-6"]) {
    for (let index = 1; index <= 8; index++) {
      const number = String(index).padStart(2, "0");
      it(`${moduleId}/${number} supplies an executable completed solution`, async (): Promise<void> => {
        expect(solution(moduleId, number)).not.toMatch(/TODO|Implement the .* above/);
        await expect(run(moduleId, number, "return true;")).resolves.toBe(true);
      });
    }
  }

  it("cleans, deduplicates, and serializes training examples", async (): Promise<void> => {
    const value = await run(
      "6-5",
      "02",
      `return prepareFinetuningData([
      { question: "q", answer: "short" },
      { question: "q", answer: "A sufficiently long answer for a valid training example." },
      { question: "q", answer: "Another sufficiently long but duplicate answer." }
    ]).split("\\n").map(JSON.parse);`
    );
    expect(value).toHaveLength(1);
    expect(await run("6-5", "02", "return prepareFinetuningData([]);")).toBe("");
  });

  it("does not recommend training without usable examples", async (): Promise<void> => {
    expect(
      await run(
        "6-5",
        "01",
        "return recommendApproach({ hasTrainingData: false, examplesCount: 0, needsStyleChange: true, monthlyVolume: 100000 });"
      )
    ).toBe("prompt-engineering");
  });

  it("records a failed queued job and safely handles an empty queue", async (): Promise<void> => {
    const value = await run(
      "6-6",
      "01",
      `const q = new JobQueue(); const id = q.enqueue("x");
      await q.processNext(async () => { throw new Error("Offline"); });
      await q.processNext(async () => "unused"); return q.getResult(id);`
    );
    expect(value).toEqual({ status: "failed", error: "Offline" });
  });

  it("calculates monitoring percentiles and preserves a prototype-like feature key", async (): Promise<void> => {
    const value = await run(
      "6-6",
      "02",
      `const m = new AIMonitor();
      m.recordRequest({ latencyMs: 10, inputTokens: 1000, outputTokens: 0, feature: "__proto__" });
      return { empty: new AIMonitor().getReport().p95, p95: m.getReport().p95, cost: m.getCostByFeature()["__proto__"] };`
    );
    expect(value).toEqual({ empty: 0, p95: 10, cost: 0.002 });
  });

  it("evicts least recently used entries and expires zero-TTL entries", async (): Promise<void> => {
    const value = await run(
      "6-6",
      "04",
      `const c = new AICache(2); c.set("a", 1); c.set("b", 2);
      c.get("a"); c.set("c", 3); c.set("expired", 4, 0);
      return [c.get("b"), c.get("expired"), c.get("c")];`
    );
    expect(value).toEqual([null, null, 3]);
  });

  it("scores empty and throwing model evaluations without a false pass", async (): Promise<void> => {
    const value = await run(
      "6-6",
      "06",
      `return [evaluate(() => "x", []).accuracy,
      evaluate(() => { throw new Error("failed"); }, [{ id: "1", input: "x", expected: "x" }]).failed];`
    );
    expect(value).toEqual([0, 1]);
  });

  it("isolates cache results and reserves concurrent gateway budgets", async (): Promise<void> => {
    const value = await run(
      "6-6",
      "08",
      `const gateway = new MiniGateway(); gateway.maxRequestsPerUser = 1;
      let finish; const first = gateway.handle("a", "same", () => new Promise((resolve) => { finish = resolve; }));
      const blocked = await gateway.handle("a", "other", async () => "bypassed"); finish("private-a"); await first;
      const other = await gateway.handle("b", "same", async () => "private-b");
      return { blocked: blocked.status, other: other.result, cached: other.cached, logsContainPrompt: gateway.log.some((entry) => "prompt" in entry) };`
    );
    expect(value).toEqual({
      blocked: "error",
      other: "private-b",
      cached: false,
      logsContainPrompt: false,
    });
  });

  it("preserves split UTF-8 and SSE frames and rejects incomplete streams", async (): Promise<void> => {
    const example = lesson("6-1", "06")
      .match(/async function streamResponse[\s\S]*?\n```/)?.[0]
      .slice(0, -4);
    if (!example) throw new Error("Missing streaming example");
    const bytes = new TextEncoder().encode(
      'data: {"type":"content_block_delta","delta":{"type":"text_delta","text":"café"}}\n\ndata: {"type":"message_stop"}\n\n'
    );
    const fetchFixture = async (): Promise<Response> =>
      new Response(
        new ReadableStream<Uint8Array>({
          start(controller): void {
            for (const byte of bytes) controller.enqueue(new Uint8Array([byte]));
            controller.close();
          },
        })
      );
    const context = vm.createContext({ fetch: fetchFixture, TextDecoder, AbortSignal });
    const value = await vm.runInContext(
      `(async () => { ${example}; return await streamResponse("fixture", {}, "test", () => {}); })()`,
      context
    );
    expect(value).toBe("café");
    context.fetch = async (): Promise<Response> =>
      new Response('data: {"type":"content_block_delta"');
    await expect(
      vm.runInContext(
        `(async () => { ${example}; return await streamResponse("fixture", {}, "test", () => {}); })()`,
        context
      )
    ).rejects.toThrow("before completion");
  });
});
