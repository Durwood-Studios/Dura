import test from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { readFile } from "node:fs/promises";
import { chunkText, cosine, createRag, fixtureProvider } from "./rag.mjs";
import { openAIProvider } from "./provider.mjs";
import { createChatServer } from "./server.mjs";
const documents = JSON.parse(await readFile(new URL("./documents.json", import.meta.url)));
test("chunk bounds terminate for short tails, empty input and overlap", () => {
  assert.deepEqual(chunkText("short"), ["short"]);
  assert.deepEqual(chunkText("abcdefghijk", 5, 2), ["abcde", "defgh", "ghijk"]);
  assert.deepEqual(chunkText(""), []);
  assert.throws(() => chunkText("abc", 5, 5));
  assert.throws(() => cosine([1], [1, 2]));
  assert.equal(cosine([0, 0], [1, 2]), 0);
});
test("actual fixture index retrieves evidence and abstains with no vocabulary match", async () => {
  const rag = await createRag(documents, fixtureProvider(documents));
  const found = await rag.ask("returns receipt");
  assert.equal(found.sources[0].source, "returns");
  assert.match(found.answer, /30 days/);
  assert.deepEqual((await rag.ask("zzzzzzzz")).sources, []);
  await assert.rejects(rag.ask(""));
  await assert.rejects(createRag(documents, { embed: async () => [[1]] }), /count mismatch/);
});
test("provider adapter orders embeddings and supplies real retrieved evidence; errors propagate", async () => {
  const calls = [];
  const provider = openAIProvider({
    apiKey: "fixture-only",
    embeddingModel: "fixture-embedding",
    chatModel: "fixture-chat",
    fetchImpl: async (url, options) => {
      calls.push({ url, body: JSON.parse(options.body) });
      return Response.json(
        url.endsWith("embeddings")
          ? {
              data: [
                { index: 1, embedding: [0, 1] },
                { index: 0, embedding: [1, 0] },
              ],
            }
          : { choices: [{ message: { content: "Evidence says 30 days [Source 1]." } }] }
      );
    },
  });
  assert.deepEqual(await provider.embed(["a", "b"]), [
    [1, 0],
    [0, 1],
  ]);
  assert.match(
    await provider.generate("returns?", [{ source: "returns", text: "30 days" }]),
    /Source 1/
  );
  assert.match(calls[1].body.messages[1].content, /30 days/);
  const broken = openAIProvider({
    apiKey: "fixture",
    embeddingModel: "fixture",
    chatModel: "fixture",
    fetchImpl: async () => new Response("denied", { status: 429 }),
  });
  await assert.rejects(broken.embed(["a"]), /429/);
});
test("real HTTP chat uses retrieval and rejects malformed input and cross-origin calls", async () => {
  const server = createChatServer(await createRag(documents, fixtureProvider(documents)));
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const url = `http://127.0.0.1:${server.address().port}`;
  try {
    const response = await fetch(`${url}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: "returns receipt" }),
    });
    assert.equal(response.status, 200);
    assert.equal((await response.json()).sources[0].source, "returns");
    assert.match(await (await fetch(url)).text(), /client.js/);
    assert.equal(
      (
        await fetch(`${url}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: "{",
        })
      ).status,
      400
    );
    assert.equal(
      (
        await fetch(`${url}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Origin: "https://unrelated.example" },
          body: "{}",
        })
      ).status,
      403
    );
  } finally {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  }
});
