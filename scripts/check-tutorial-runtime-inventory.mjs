import { format, resolveConfig } from "prettier";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import ts from "typescript";

// Static evidence is intentionally separate from execution evidence.
const paths = execFileSync("git", ["ls-files", "src/content/howto", "src/content/tutorials"], {
  encoding: "utf8",
})
  .trim()
  .split("\n")
  .filter((p) => p.endsWith(".mdx"))
  .sort();
const inventory = paths.map((path) => {
  const text = readFileSync(path, "utf8");
  const blocks = [...text.matchAll(/^(`{3,})([^\n]*)\n([\s\S]*?)^\1\s*$/gm)].map((match) => {
    const language = match[2].trim();
    const code = match[3];
    const line = text.slice(0, match.index).split("\n").length;
    const explicitImports = [
      ...code.matchAll(/(?:from\s*|import\s*\(|require\s*\()["']([^"']+)["']/g),
    ]
      .map((m) => m[1])
      .filter((p) => !p.startsWith("."));
    const placeholders = code
      .split("\n")
      .flatMap((s, i) =>
        /\b(?:TODO|YOUR_[A-Z_]+|your-api-key|implement here|implementation omitted)\b|^\s*\.\.\.\s*;?\s*$/.test(
          s
        )
          ? [line + i + 1]
          : []
      );
    const syntax = [];
    if (["typescript", "ts", "javascript", "js", "tsx", "jsx"].includes(language)) {
      const parsed = ts.createSourceFile(
        `snippet.${["tsx", "jsx"].includes(language) ? "tsx" : "ts"}`,
        code,
        ts.ScriptTarget.Latest,
        true
      );
      for (const diagnostic of parsed.parseDiagnostics)
        syntax.push({
          line: line + 1 + parsed.getLineAndCharacterOfPosition(diagnostic.start ?? 0).line,
          message: ts.flattenDiagnosticMessageText(diagnostic.messageText, " "),
        });
    }

    return {
      line,
      language,
      context: /(?:add to|replace|inside|in the switch|illustrat|example|demo|pseudocode)/i.test(
        text.slice(Math.max(0, match.index - 250), match.index) + code.slice(0, 80)
      )
        ? "contextual-or-illustrative-candidate"
        : "requires-assembly-review",
      lines: code.split("\n").length - 1,
      imports: [...new Set(explicitImports)],
      placeholderLines: placeholders,
      syntaxDiagnostics: syntax,
    };
  });
  const contextTags = [];
  for (const [tag, regex] of Object.entries({
    node: /\b(?:npm|npx|node|pnpm|yarn)\b/,
    python: /\b(?:python|pip|venv)\b/,
    docker: /\b(?:Docker|docker|container)\b/,
    database: /\b(?:PostgreSQL|postgres|MongoDB|Redis|SQLite|supabase)\b/i,
    browser: /\b(?:document\.|window\.|React|browser)\b/,
    externalService:
      /\b(?:API key|api_key|API_KEY|credentials|AWS|Azure|OpenAI|Anthropic|Vercel|Cloudflare|Stripe)\b/i,
  }))
    if (regex.test(text)) contextTags.push(tag);
  return {
    path,
    sha256: createHash("sha256").update(text).digest("hex"),
    execution: path.endsWith("/11-auth-system.mdx")
      ? "extracted-session-sql-and-secret-policy-tested-jwt-mocked"
      : path.endsWith("/33-rate-limiter.mdx")
        ? "extracted-store-clock-and-bounded-load-test-helpers-tested"
        : path.endsWith("/91-password-manager.mdx")
          ? "separate-lab-crypto-storage-and-real-terminal-workflow-tested"
          : path.endsWith("/07-markdown-notes.mdx")
            ? "separate-lab-model-and-real-browser-workflow-tested"
            : path.endsWith("/04-rag-chatbot.mdx")
              ? "separate-lab-retrieval-http-and-provider-fixtures-tested"
              : path.endsWith("/18-mcp-server-tutorial.mdx")
                ? "separate-lab-stdio-and-disposable-sql-tested"
                : path.endsWith("/32-mcp-server.mdx")
                  ? "separate-lab-stdio-tested"
                  : path.endsWith("/17-ai-agent.mdx")
                    ? "separate-lab-offline-and-provider-fixtures-tested"
                    : path.endsWith("/39-static-site-gen.mdx")
                      ? "assembled-typescript-and-cli-build-tested"
                      : /\/(31-monitoring-dashboard|32-embeddings-search|40-migration-tool)\.mdx$/.test(
                            path
                          )
                        ? "selected-helper-regressions-tested-not-full-project"
                        : "not-executed",
    contextTags,
    blocks,
  };
});
const report = {
  method:
    "Static fenced-code inventory only. Syntax diagnostics identify candidates, not proven defects: excerpts may intentionally omit context. No inference that a tutorial was executed.",
  tutorials: inventory.length,
  files: inventory,
};
const path = "standards/pedagogy/tutorial-runtime-inventory.json";
const output = await format(JSON.stringify(report), {
  ...(await resolveConfig(path)),
  parser: "json",
});
if (process.argv.includes("--write")) writeFileSync(path, output);
else if (readFileSync(path, "utf8") !== output) {
  console.error(
    "Tutorial inventory is stale. Review changed tutorials and run node scripts/check-tutorial-runtime-inventory.mjs --write."
  );
  process.exitCode = 1;
}
console.log(
  `${inventory.length} tutorials inventoried; ${inventory.reduce((n, f) => n + f.blocks.length, 0)} fenced blocks; ${inventory.filter((f) => f.blocks.some((b) => b.syntaxDiagnostics.length)).length} files have syntax-review candidates. Only explicitly recorded separate labs have execution evidence.`
);
