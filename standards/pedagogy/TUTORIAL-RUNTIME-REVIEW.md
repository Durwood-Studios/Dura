# Tutorial runtime review

## Scope and evidence

`node scripts/check-tutorial-runtime-inventory.mjs` checks the committed inventory against every tracked MDX file under `src/content/howto` and `src/content/tutorials`. There are 135 guides. The JSON inventory records each file's SHA-256, every fenced block's line/language, explicit imports, placeholder markers, runtime context hints, syntax-review candidates and execution status. Run with `--write` only after reviewing changed guides.

This is a complete static fence inventory, not 135 runtime executions or a semantic review of every dependency. Context labels are heuristic candidates. A standalone class method, switch case, JSX example tagged as TypeScript, or deliberately partial API example can produce syntax diagnostics without being a lesson defect. Conversely, syntax-valid code can still depend on undefined helpers or missing setup. No passing MDX compile is presented as runtime evidence.

## Substantive completed repairs

- `tutorials/91-password-manager.mdx`: complete fictional-credential teaching project with authenticated encryption, bounded envelope/record validation, cooperative locking and stale-write detection, atomic replacement, hidden input cleanup and explicit encrypted-backup recovery. Eight Node tests and an actual macOS terminal initialize/add/search/backup/separate-directory recovery/delete/reload workflow pass. Prompt/output failure cleanup and terminal control-character rejection received independent regression review. This is not an audited daily-use password manager; real clipboard adapters, other terminal platforms, power-loss durability and hostile local filesystem actors remain outside the demonstrated acceptance.
- `tutorials/07-markdown-notes.mdx`: complete downloadable editor with wired creation, selection, deletion, search, tag filtering, bounded import/export and a documented DOM-rendered Markdown subset. The original raw-HTML/script-link injection, delayed wrong-note save and swallowed quota failures are repaired. Four model tests and an actual Chromium workflow pass after a clean pinned install, including rapid switching, reload, hostile import, storage failure, draft export and deletion. Web Locks prevent stale tabs from overwriting newer storage. The project does not claim cloud sync, encryption or full CommonMark conformance.
- `howto/32-mcp-server.mdx`: complete downloadable stdio project, official SDK 1.30.0, registered URI template, bounded search, resource/prompt discovery and missing-ID/input errors. Real SDK client/server process tests pass. The former ad hoc HTTP lifecycle and undefined storage helpers are removed.
- `tutorials/17-ai-agent.mdx`: complete downloadable JavaScript project with a validated registry, bounded tool loop, concrete provider adapter, matched tool-use/result blocks, in-process conversation memory, CLI and two real read-only tools. Four tests pass using the offline fixture and explicit provider responses. The former missing format/parse/stream methods, incorrect provider schema, Python flag and silently altered calculator expressions are removed from the runnable path. No live paid provider request was made.

Additional bounded runtime repairs:

- `tutorials/31-monitoring-dashboard.mdx`: supplied missing canvas/badge/config helpers and panels; zero/equal-time samples stay finite. Extracted chart regression passes.
- `tutorials/32-embeddings-search.mdx`: supplied safe text-node highlighting instead of missing helper/raw document HTML, and replaced misleading percentage-match language. DOM regression preserves hostile-looking text without creating elements.
- `tutorials/39-static-site-gen.mdx`: repaired module exports/imports, compiler setup, pagination type/zero-size loop, complete navigation, and loopback dev-server path containment. `node scripts/check-ssg-tutorial.mjs` assembles and strictly compiles all ten named modules, executes the actual CLI against two source documents, and verifies complete output/navigation. HTTP/watch integration remains unexecuted.
- `tutorials/40-migration-tool.mdx`: added pinned pg setup, missing filesystem/tracking/runner functions, safe filename validation, ordered nonempty markers, transactional tracking and write locking. Extracted helpers pass tests; a disposable PGlite DDL/tracking round trip passed. Hosted PostgreSQL CLI use remains an external integration requirement.

These lab fixtures are deliberately honest about what they implement. Model-directed shell execution, broad filesystem access, persistent memory, native token streaming and production HTTP hosting require separate implementations, authorization boundaries and tests.

## Reviewed syntax candidates that are contextual excerpts

- `tutorials/01-cli-tool.mdx`, Step 4: the `case "add"` fragment explicitly belongs inside the earlier switch. It is not a standalone source file.
- `tutorials/06-algorithm-visualizer.mdx`, Step 9: `render()` is explicitly a replacement method on the earlier Visualizer class.
- React/JSX fences in capstone, dashboard and UI guides need TSX context; the raw TypeScript parser's syntax candidates are not proof their component source is wrong.

## Remaining runtime work

Guides without a named execution check retain `not-executed` status in the inventory; helper-only checks do not imply a complete project was executed. Their per-block imports and per-file runtime hints identify the environment to provision; they are not an exhaustive dependency manifest. Some examples require Node/package installation, Python, a browser/DOM, Docker, a database, provider credentials, or hosted services. Exact versions, full project assembly, migrations/seed data, provider availability and end-to-end assertions still require guide-by-guide verification before claiming those projects execute from a clean checkout.

Acceptance for promoting a guide's status: a complete downloadable project or deterministic assembler; declared/pinned dependencies and runtime; documented inputs and expected outputs; automated success and failure cases; actual command logs; external integration checks explicitly separated from local fixtures. Placeholder or unavailable credentials must remain documented external requirements, never silently replaced by a fabricated success result.

## RAG and PostgreSQL MCP follow-up

- Tutorial 04 now uses `public/labs/rag-chatbot` 1.0.0: a real local HTTP chat UI calls bounded chunking, validated vectors, retrieval and source-carrying answers. Fixed the nonterminating short-tail chunker and removed the fabricated web-route answer/source. Four Node tests execute the actual HTTP pipeline and deterministic retrieval plus mock external-provider contracts. Default lexical/extractive mode is explicitly not an LLM; optional OpenAI embeddings/Chat Completions require explicit credentials and model choices. No paid provider calls or quality claims were made.
- Tutorial 18 now uses `public/labs/mcp-postgres` 1.0.0 with pinned SDK/Zod/pg and lockfile. Three Node tests execute official-client stdio negotiation, tools/resources, validation, parameter binding and shared operation budget. Arbitrary SQL regex filtering, unwired limits and nonexistent insert/build promises were replaced with fixed typed public-product operations. The exact `setup.sql` and query templates were also executed against disposable PGlite, including reader-role INSERT denial; this does not establish remote PostgreSQL TLS/auth/deployment behavior.
- Both complete projects have downloadable bundles and distinguish offline fixture evidence from optional external integrations. Tutorial 44's hostile-note DOM regression is covered separately by the curriculum reviewer. The inventory still does not imply execution of all 135 guides.

## Follow-up: authentication and rate-limiter teaching defects

Tutorial11 now requires distinct signing secrets, checks actual stored refresh-token ownership/hash/revocation/expiry, and scopes its cookie to reach logout. Three extracted-module tests use real SQLite while explicitly mocking JWT verification; they do not certify the complete Express app or cryptographic implementation. Remaining rotation, email verification, enumeration and production deployment work is explicitly bounded in the guide.

Tutorial33 wires both algorithm stores into TTL cleanup, injects the refill clock, reserves load-test attempts before awaiting requests, bounds network waits and accounts for failures. Extracted-source regressions verify expiration, refill, exact attempt budgets and error accounting. This is helper/algorithm evidence, not complete Express deployment evidence. Cleanup remains linear and does not impose a hard memory cap under unique-client floods.
