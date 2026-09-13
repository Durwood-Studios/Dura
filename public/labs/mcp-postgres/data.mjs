/** Public teaching fixtures; never populated from a learner's application database. */
export const PRODUCTS = [
  { id: 1, name: "Blue notebook", category: "stationery", price_cents: 500 },
  { id: 2, name: "Green pencil", category: "stationery", price_cents: 100 },
  { id: 3, name: "Travel mug", category: "kitchen", price_cents: 1500 },
];
export const QUERIES = Object.freeze({
  search:
    "SELECT id, name, category, price_cents FROM public.lab_products WHERE strpos(lower(name), lower($1)) > 0 ORDER BY id LIMIT $2",
  preview: "SELECT id, name, category, price_cents FROM public.lab_products ORDER BY id LIMIT 5",
  stats:
    "SELECT count(*)::int AS count, min(price_cents)::int AS min_price_cents, max(price_cents)::int AS max_price_cents FROM public.lab_products",
});
/** Fixed SQL templates are the authority boundary; callers cannot supply SQL or table names. */
export function createRepository(query) {
  return {
    async search(term, limit) {
      return (await query(QUERIES.search, [term, limit])).rows;
    },
    async preview() {
      return (await query(QUERIES.preview, [])).rows;
    },
    async stats() {
      return (await query(QUERIES.stats, [])).rows[0];
    },
    async close() {},
  };
}
/** Deterministic adapter for protocol tests and first-run learning. */
export function fixtureRepository() {
  return {
    async search(term, limit) {
      return PRODUCTS.filter((row) => row.name.toLowerCase().includes(term.toLowerCase())).slice(
        0,
        limit
      );
    },
    async preview() {
      return PRODUCTS.map((row) => ({ ...row }));
    },
    async stats() {
      return { count: 3, min_price_cents: 100, max_price_cents: 1500 };
    },
    async close() {},
  };
}
/** Optional PostgreSQL connection; requires the separately provisioned lab_reader role. */
export async function postgresRepository(connectionString) {
  if (!connectionString) throw new Error("DATABASE_URL is required in postgres mode");
  const { default: pg } = await import("pg");
  const pool = new pg.Pool({
    connectionString,
    max: 1,
    connectionTimeoutMillis: 5000,
    statement_timeout: 2000,
    query_timeout: 3000,
    options: "-c default_transaction_read_only=on -c search_path=pg_catalog",
  });
  pool.on("error", (error) => console.error("PostgreSQL pool error:", error.message));
  const repository = createRepository((text, params) => pool.query(text, params));
  repository.close = () => pool.end();
  return repository;
}
