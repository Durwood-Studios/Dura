import { createClient } from "@/lib/supabase/client";

interface SearchResult {
  id: string;
  contentType: "lesson" | "term" | "tutorial" | "howto";
  title: string;
  slug: string;
  bodyPreview: string | null;
  metadata: Record<string, unknown>;
  similarity: number;
}

/**
 * Search content using a text query via the search_content RPC.
 *
 * TODO(dustin): This requires an embedding generation Edge Function to convert
 * the query string into a vector before calling the RPC. Until that function
 * is deployed, this returns an empty array. Wire up once the
 * `generate_embedding` Edge Function is live and the `search_content` DB
 * function accepts a vector parameter.
 */
export async function searchContent(
  query: string,
  options?: {
    contentType?: "lesson" | "term" | "tutorial" | "howto";
    limit?: number;
  }
): Promise<SearchResult[]> {
  if (!query.trim()) {
    return [];
  }

  try {
    // Embedding generation not yet available — fall back to text search
    return await textSearchContent(query, {
      contentType: options?.contentType,
      limit: options?.limit,
    });
  } catch (err) {
    console.error("[searchContent] Failed:", err);
    return [];
  }
}

/**
 * Maximum search query length we accept. Longer inputs are truncated to
 * cap the abuse surface (PostgREST DoS via huge ilike patterns).
 */
const MAX_QUERY_LENGTH = 100;

/**
 * Strip PostgREST `.or()` metacharacters from a user-supplied search term so
 * the interpolated filter string cannot be broken out of.
 *
 * The reserved chars in PostgREST embedded filter syntax are:
 *   `,`  separates disjuncts inside `.or(...)`
 *   `(` `)`  group / nest filters
 *   `.`  separates column from operator from value
 *   `\`  escape character (also strip its variants)
 *   `"` `'`  string-quote PostgREST values
 *
 * The leftover input can still contain SQL's `%` and `_` wildcards because
 * the consumer wraps it in `%...%` for ilike — that's intentional (a user
 * typing `foo_bar` matches `foo_bar` and `fooxbar`, which is acceptable for
 * a text search; it does NOT enable injection).
 *
 * See `src/content/phases/6-ai-ml-engineering/6-4-mcp-development/07-mcp-security.mdx`
 * for the canonical pattern this implements.
 */
function sanitizeQuery(input: string): string {
  return input.replace(/[,()\\".'`]/g, "").slice(0, MAX_QUERY_LENGTH);
}

/**
 * Fallback text search when embeddings aren't available.
 * Uses ilike on title and body_preview columns for immediate value
 * without requiring pgvector or an embedding function.
 */
export async function textSearchContent(
  query: string,
  options?: {
    contentType?: string;
    limit?: number;
  }
): Promise<SearchResult[]> {
  const trimmed = query.trim();
  if (!trimmed) {
    return [];
  }
  const safe = sanitizeQuery(trimmed);
  if (!safe) {
    return [];
  }

  try {
    const supabase = createClient();
    const limit = Math.min(Math.max(options?.limit ?? 20, 1), 100);
    const pattern = `%${safe}%`;

    let builder = supabase
      .from("content_index")
      .select("id, content_type, title, slug, body_preview, metadata")
      .or(`title.ilike.${pattern},body_preview.ilike.${pattern}`)
      .limit(limit);

    if (options?.contentType) {
      builder = builder.eq("content_type", options.contentType);
    }

    const { data, error } = await builder;

    if (error) {
      console.error("[textSearchContent] Query error:", error.message);
      return [];
    }

    return (data ?? []).map((row) => ({
      id: row.id as string,
      contentType: row.content_type as SearchResult["contentType"],
      title: row.title as string,
      slug: row.slug as string,
      bodyPreview: row.body_preview as string | null,
      metadata: (row.metadata as Record<string, unknown>) ?? {},
      similarity: 0, // Text search doesn't produce a similarity score
    }));
  } catch (err) {
    console.error("[textSearchContent] Failed:", err);
    return [];
  }
}
