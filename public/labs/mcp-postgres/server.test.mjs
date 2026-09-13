import test from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { createRepository, QUERIES } from "./data.mjs";
import { createBudget } from "./server.mjs";
test(
  "actual MCP negotiation, validated tools, resources and unknown methods",
  { timeout: 15000 },
  async () => {
    const client = new Client({ name: "dura-test", version: "1.0.0" });
    try {
      await client.connect(
        new StdioClientTransport({
          command: process.execPath,
          args: [fileURLToPath(new URL("./server.mjs", import.meta.url))],
          env: { MCP_DATA_MODE: "fixture" },
        })
      );
      assert.equal((await client.listTools()).tools.length, 2);
      const result = await client.callTool({
        name: "search_products",
        arguments: { term: "notebook", limit: 1 },
      });
      assert.equal(JSON.parse(result.content[0].text)[0].id, 1);
      for (const arguments_ of [{ term: "" }, { term: "x", limit: 1000 }, { term: 5 }])
        assert.equal(
          (await client.callTool({ name: "search_products", arguments: arguments_ })).isError,
          true
        );
      assert.deepEqual(
        JSON.parse(
          (
            await client.callTool({
              name: "search_products",
              arguments: { term: "'; DROP TABLE lab_products;--" },
            })
          ).content[0].text
        ),
        []
      );
      assert.equal(
        JSON.parse(
          (await client.callTool({ name: "product_price_summary", arguments: {} })).content[0].text
        ).count,
        3
      );
      assert.equal((await client.listResources()).resources.length, 2);
      assert.equal(
        JSON.parse((await client.readResource({ uri: "products://preview" })).contents[0].text)
          .length,
        3
      );
      await assert.rejects(client.readResource({ uri: "products://private" }));
      assert.equal(
        (await client.callTool({ name: "insert_product", arguments: {} })).isError,
        true
      );
    } finally {
      await client.close();
    }
  }
);
test("repository forwards hostile text only as a bound parameter", async () => {
  const calls = [];
  const repository = createRepository(async (text, values) => {
    calls.push({ text, values });
    return { rows: [] };
  });
  await repository.search("' OR true --", 2);
  assert.equal(calls[0].text, QUERIES.search);
  assert.deepEqual(calls[0].values, ["' OR true --", 2]);
});
test("session budget limits count and concurrent work and resets at boundary", async () => {
  let now = 0;
  const run = createBudget(() => now, 1);
  assert.equal(await run(async () => 7), 7);
  await assert.rejects(
    run(async () => 8),
    /budget/
  );
  now = 60000;
  assert.equal(await run(async () => 9), 9);
  const parallel = createBudget(() => now, 5);
  let release;
  const pending = parallel(
    () =>
      new Promise((resolve) => {
        release = resolve;
      })
  );
  await assert.rejects(
    parallel(async () => 1),
    /busy/
  );
  release();
  await pending;
});
