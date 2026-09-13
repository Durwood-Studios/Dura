import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
const routes = new Map([
  ["/", ["index.html", "text/html"]],
  ["/style.css", ["style.css", "text/css"]],
  ["/app.mjs", ["app.mjs", "text/javascript"]],
  ["/model.mjs", ["model.mjs", "text/javascript"]],
  ["/markdown.mjs", ["markdown.mjs", "text/javascript"]],
]);
/** Serve only the fixed static lab files on a loopback development origin. */
export function createLabServer() {
  return createServer(async (request, response) => {
    try {
      const entry = routes.get(request.url);
      if (request.method !== "GET" || !entry) {
        response.writeHead(404).end();
        return;
      }
      response.writeHead(200, {
        "Content-Type": `${entry[1]}; charset=utf-8`,
        "Cache-Control": "no-store",
        "Content-Security-Policy":
          "default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'none'",
      });
      response.end(await readFile(new URL(entry[0], import.meta.url)));
    } catch (error) {
      console.error("Static file failed:", error.message);
      response.writeHead(500).end("File unavailable");
    }
  });
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const server = createLabServer();
  server.on("error", (error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
  server.listen(4311, "127.0.0.1", () => console.log("Open http://127.0.0.1:4311"));
}
