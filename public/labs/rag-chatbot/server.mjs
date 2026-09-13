import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { createRag, fixtureProvider } from "./rag.mjs";
import { openAIProvider } from "./provider.mjs";
/** A loopback teaching server with one outstanding question and a bounded JSON body. */
export function createChatServer(rag) {
  let busy = false;
  return createServer(async (request, response) => {
    response.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'"
    );
    try {
      if (!/^(127\.0\.0\.1|localhost):\d+$/.test(request.headers.host ?? "")) {
        response.writeHead(403).end();
        return;
      }
      if (request.method === "GET" && ["/", "/client.js"].includes(request.url)) {
        response.setHeader(
          "Content-Type",
          request.url === "/" ? "text/html; charset=utf-8" : "text/javascript; charset=utf-8"
        );
        response.end(
          await readFile(
            new URL(request.url === "/" ? "./index.html" : "./client.js", import.meta.url)
          )
        );
        return;
      }
      if (request.method !== "POST" || request.url !== "/api/chat") {
        response.writeHead(404).end();
        return;
      }
      const origin = request.headers.origin;
      if (origin && origin !== `http://${request.headers.host}`) {
        response.writeHead(403).end();
        return;
      }
      if (!request.headers["content-type"]?.startsWith("application/json")) {
        response.writeHead(415).end();
        return;
      }
      if (busy) {
        response.writeHead(429).end();
        return;
      }
      busy = true;
      try {
        let raw = "";
        for await (const part of request) {
          raw += part;
          if (Buffer.byteLength(raw) > 4096) throw new Error("Request too large");
        }
        const input = JSON.parse(raw);
        const result = await rag.ask(input?.question);
        response
          .writeHead(200, { "Content-Type": "application/json", "Cache-Control": "no-store" })
          .end(JSON.stringify(result));
      } finally {
        busy = false;
      }
    } catch (error) {
      console.error("Chat request failed:", error.message);
      response.writeHead(400, { "Content-Type": "application/json" }).end(
        JSON.stringify({
          error: "Request failed. Check the question and server console, then retry.",
        })
      );
    }
  });
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const documents = JSON.parse(
      await readFile(new URL("./documents.json", import.meta.url), "utf8")
    );
    if (![undefined, "fixture", "openai"].includes(process.env.RAG_MODE))
      throw new Error("Unknown RAG_MODE");
    const provider =
      process.env.RAG_MODE === "openai"
        ? openAIProvider({
            apiKey: process.env.OPENAI_API_KEY,
            embeddingModel: process.env.EMBEDDING_MODEL,
            chatModel: process.env.CHAT_MODEL,
          })
        : fixtureProvider(documents);
    const rag = await createRag(documents, provider);
    const server = createChatServer(rag);
    server.requestTimeout = 30000;
    server.headersTimeout = 10000;
    server.on("error", (error) => {
      console.error("Server failed:", error.message);
      process.exitCode = 1;
    });
    server.listen(4310, "127.0.0.1", () =>
      console.log(`${provider.label}\nOpen http://127.0.0.1:4310`)
    );
  } catch (error) {
    console.error("Startup failed:", error.message);
    process.exitCode = 1;
  }
}
