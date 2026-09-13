# PostgreSQL MCP lab 1.0.0

Node.js 22+. Pinned SDK 1.30.0, Zod 4.3.6, pg 8.23.0. Install once; fixture tests need no database, model or external service.

```sh
npm ci
npm test
npm start
```

The running stdio process waits for a protocol client; it is not an HTTP server. Logs go to stderr. `server.test.mjs` uses the official SDK client to negotiate, discover and invoke actual tools/resources over stdio. Use an absolute path to `server.mjs` in your MCP client's command configuration (`node /absolute/path/server.mjs`). Client configuration locations differ; consult your chosen client's documentation. An incomplete JSON line piped to tools/list is not a complete MCP handshake.

## Actual PostgreSQL mode

Create a NEW disposable PostgreSQL database you own. Review and execute `setup.sql` there, then provision `lab_reader` credentials separately. Set DATABASE_URL in your process environment (never in the source) and start:

```sh
MCP_DATA_MODE=postgres npm start
```

The connection must authenticate as the narrowly granted `lab_reader`, not a superuser or application owner. For remote TLS use verified certificates through your connection configuration; do not disable certificate verification. The adapter sets read-only transaction defaults, bounds pool size, and sets statement/query timeouts. The SQL itself is fixed and schema-qualified; untrusted terms are parameter values, never SQL fragments. No arbitrary SQL, table names, inserts or private table previews are accepted.

Tools: `search_products(term, limit=5)` (1–20 results), `product_price_summary()`. Resources: `products://schema`, `products://preview` (at most five rows). A shared per-process budget allows at most 60 operations/minute and one operation at a time. This is a local session control, not a distributed or authenticated per-user rate limiter. Metadata discovery does not query the database.

Fixture integration and parameter-binding contracts are tested. A real PostgreSQL deployment, authentication, TLS, query plans, production permissions and distributed operations require separate environment tests. Regex keyword filtering is not a SQL permission boundary; this lab deliberately teaches fixed operations with narrow database privileges instead.
