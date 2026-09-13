import test from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

test(
  "real stdio negotiation, discovery, bounded search, resources, prompts and failures",
  { timeout: 15000 },
  async () => {
    const client = new Client({ name: "dura-lab-test", version: "1.0.0" });
    const transport = new StdioClientTransport({
      command: process.execPath,
      args: [fileURLToPath(new URL("./server.mjs", import.meta.url))],
    });
    try {
      await client.connect(transport);
      assert.equal((await client.listTools()).tools[0].name, "search_documents");
      const found = await client.callTool({
        name: "search_documents",
        arguments: { query: "offline" },
      });
      assert.deepEqual(JSON.parse(found.content[0].text), [
        { id: "welcome", title: "Welcome", uri: "docs://document/welcome" },
      ]);
      const empty = await client.callTool({
        name: "search_documents",
        arguments: { query: "absent" },
      });
      assert.deepEqual(JSON.parse(empty.content[0].text), []);
      for (const query of ["", " ".repeat(3), "x".repeat(201), 7]) {
        assert.equal(
          (await client.callTool({ name: "search_documents", arguments: { query } })).isError,
          true
        );
      }
      assert.equal((await client.listResources()).resources.length, 2);
      assert.equal(
        (await client.listResourceTemplates()).resourceTemplates[0].uriTemplate,
        "docs://document/{id}"
      );
      assert.match(
        (await client.readResource({ uri: "docs://document/privacy" })).contents[0].text,
        /explicit consent/
      );
      await assert.rejects(
        client.readResource({ uri: "docs://document/missing" }),
        /Unknown document ID/
      );
      assert.match(
        (await client.getPrompt({ name: "summarize-document", arguments: { id: "welcome" } }))
          .messages[0].content.text,
        /offline-first/
      );
      await assert.rejects(
        client.getPrompt({ name: "summarize-document", arguments: { id: "missing" } }),
        /Unknown document ID/
      );
    } finally {
      await client.close();
    }
  }
);
