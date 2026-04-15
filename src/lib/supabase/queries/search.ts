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
  if (!query.trim()) {
    return [];
  }

  try {
    const supabase = createClient();
    const limit = options?.limit ?? 20;
    const pattern = `%${query}%`;

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
