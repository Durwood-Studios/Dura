import { fileURLToPath } from "node:url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ErrorCode, McpError } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { fixtureRepository, postgresRepository } from "./data.mjs";
/** One session budget shared by tool and resource calls, without an unbounded identity map. */
export function createBudget(now = Date.now, maximum = 60) {
  let count = 0,
    resetAt = now() + 60000,
    active = false;
  return async (operation) => {
    if (now() >= resetAt) {
      count = 0;
      resetAt = now() + 60000;
    }
    if (active || count >= maximum)
      throw new Error("Session busy or request budget exhausted; retry later");
    count++;
    active = true;
    try {
      return await operation();
    } finally {
      active = false;
    }
  };
}
/** Typed fixed-operation MCP server; no arbitrary SQL or write tool is exposed. */
export function createProductServer(repository) {
  const server = new McpServer({ name: "dura-products-postgres", version: "1.0.0" });
  const run = createBudget();
  const annotations = {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  };
  const tool = async (operation) => {
    try {
      return { content: [{ type: "text", text: JSON.stringify(await run(operation)) }] };
    } catch (error) {
      console.error("Product request failed:", error.message);
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: "Request failed or session budget exhausted. Check the server and retry.",
          },
        ],
      };
    }
  };
  server.registerTool(
    "search_products",
    {
      description: "Search approved public product names; at most 20 rows.",
      inputSchema: {
        term: z.string().trim().min(1).max(100),
        limit: z.number().int().min(1).max(20).default(5),
      },
      annotations,
    },
    ({ term, limit }) => tool(() => repository.search(term, limit))
  );
  server.registerTool(
    "product_price_summary",
    {
      description: "Count and min/max price in cents for the approved product fixture.",
      inputSchema: {},
      annotations,
    },
    () => tool(() => repository.stats())
  );
  server.registerResource(
    "product-schema",
    "products://schema",
    {
      mimeType: "application/json",
      description: "Only the four columns approved for this teaching server.",
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "application/json",
          text: JSON.stringify(
            await run(async () => ({
              table: "lab_products",
              columns: { id: "integer", name: "text", category: "text", price_cents: "integer" },
            }))
          ),
        },
      ],
    })
  );
  server.registerResource(
    "product-preview",
    "products://preview",
    { mimeType: "application/json", description: "At most five public product rows." },
    async (uri) => {
      try {
        return {
          contents: [
            {
              uri: uri.href,
              mimeType: "application/json",
              text: JSON.stringify(await run(() => repository.preview())),
            },
          ],
        };
      } catch (error) {
        console.error("Preview failed:", error.message);
        throw new McpError(ErrorCode.InternalError, "Preview unavailable; check server and retry");
      }
    }
  );
  return server;
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  let repository;
  try {
    const mode = process.env.MCP_DATA_MODE ?? "fixture";
    if (!["fixture", "postgres"].includes(mode)) throw new Error("Unknown MCP_DATA_MODE");
    repository =
      mode === "postgres"
        ? await postgresRepository(process.env.DATABASE_URL)
        : fixtureRepository();
    const server = createProductServer(repository);
    process.stdin.once("end", () => {
      void repository.close().catch((error) => console.error(error.message));
    });
    for (const signal of ["SIGINT", "SIGTERM"])
      process.once(signal, () => {
        void repository.close().finally(() => process.exit(0));
      });
    await server.connect(new StdioServerTransport());
    console.error(`Product MCP lab started in ${mode} mode`);
  } catch (error) {
    console.error("Startup failed:", error.message);
    await repository?.close();
    process.exitCode = 1;
  }
}
