import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ErrorCode, McpError } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

// A bounded, read-only fixture makes the complete exercise reproducible offline.
const documents = new Map([
  ["welcome", { title: "Welcome", text: "DURA is an offline-first learning platform." }],
  ["privacy", { title: "Privacy", text: "Analytics requires explicit consent." }],
]);
const server = new McpServer({ name: "dura-document-lab", version: "1.0.0" });
server.registerTool(
  "search_documents",
  {
    description: "Search the two public lab documents. Returns at most two matches.",
    inputSchema: { query: z.string().trim().min(1).max(200) },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  async ({ query }) => ({
    content: [
      {
        type: "text",
        text: JSON.stringify(
          [...documents]
            .filter(([, doc]) =>
              `${doc.title} ${doc.text}`.toLowerCase().includes(query.toLowerCase())
            )
            .map(([id, doc]) => ({ id, title: doc.title, uri: `docs://document/${id}` }))
        ),
      },
    ],
  })
);
server.registerResource(
  "document",
  new ResourceTemplate("docs://document/{id}", {
    list: async () => ({
      resources: [...documents].map(([id, doc]) => ({
        uri: `docs://document/${id}`,
        name: doc.title,
        mimeType: "text/plain",
      })),
    }),
  }),
  { description: "One public fixture document", mimeType: "text/plain" },
  async (uri, { id }) => {
    const document = typeof id === "string" ? documents.get(id) : undefined;
    if (!document) throw new McpError(ErrorCode.InvalidParams, "Unknown document ID");
    return { contents: [{ uri: uri.href, mimeType: "text/plain", text: document.text }] };
  }
);
server.registerPrompt(
  "summarize-document",
  {
    description: "Ask the client model to summarize a public fixture document.",
    argsSchema: { id: z.string() },
  },
  async ({ id }) => {
    const document = documents.get(id);
    if (!document) throw new McpError(ErrorCode.InvalidParams, "Unknown document ID");
    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Summarize this document in one sentence:\n${document.text}`,
          },
        },
      ],
    };
  }
);
try {
  await server.connect(new StdioServerTransport());
} catch (error) {
  console.error("MCP server startup failed:", error);
  process.exitCode = 1;
}
