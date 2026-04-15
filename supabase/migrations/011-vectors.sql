-- 011-vectors.sql
-- pgvector extension + content embeddings table for semantic search.
--
-- This powers the unified search experience across lessons, dictionary
-- terms, tutorials, and how-to guides. Embeddings are generated offline
-- (or via a background job) using OpenAI text-embedding-3-small (1536d)
-- and stored here for fast cosine-similarity lookups.
--
-- The HNSW index provides approximate nearest-neighbor search that scales
-- well beyond the free-tier row counts DURA is likely to hit.

-- ---------------------------------------------------------------------------
-- Enable pgvector (available on all Supabase plans including free)
-- ---------------------------------------------------------------------------

create extension if not exists vector;

-- ---------------------------------------------------------------------------
-- Content embeddings table
-- ---------------------------------------------------------------------------

create table public.content_embeddings (
  -- Composite key like 'lesson:0-1-01', 'term:algorithm', 'tutorial:rest-api'
  id           text        primary key,
  content_type text        not null,       -- 'lesson' | 'term' | 'tutorial' | 'howto'
  title        text        not null,
  slug         text        not null,       -- URL-safe path segment for linking
  body_preview text,                       -- First ~500 chars for search result snippets
  embedding    vector(1536),               -- OpenAI text-embedding-3-small output dimension
  metadata     jsonb       default '{}',   -- phase_id, difficulty, tags, etc.
  updated_at   timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

-- HNSW index for fast approximate nearest-neighbor cosine similarity search
-- m = 16  (max connections per node — good balance of speed vs recall)
-- ef_construction = 64 (build-time search width — higher = better recall)
create index idx_content_embeddings_vector
  on public.content_embeddings
  using hnsw (embedding vector_cosine_ops)
  with (m = 16, ef_construction = 64);

-- B-tree index for filtering by content type before vector search
create index idx_content_embeddings_type
  on public.content_embeddings (content_type);

-- ---------------------------------------------------------------------------
-- RLS — public read, no write from client
-- ---------------------------------------------------------------------------

alter table public.content_embeddings enable row level security;

-- Search works for everyone, including unauthenticated visitors
create policy "Content embeddings are publicly readable"
  on public.content_embeddings
  for select to public
  using (true);

-- Writes happen via migrations, seed scripts, or admin tooling — never
-- from the client. No insert/update/delete policies needed.

-- ---------------------------------------------------------------------------
-- Semantic search function
-- ---------------------------------------------------------------------------
-- Usage from the client:
--   const { data } = await supabase.rpc('search_content', {
--     query_embedding: [...],   // 1536-float array from the embedding API
--     match_count: 10,
--     filter_type: 'lesson'     // optional — null returns all types
--   });

create or replace function public.search_content(
  query_embedding vector(1536),
  match_count     int  default 10,
  filter_type     text default null
)
returns table (
  id           text,
  content_type text,
  title        text,
  slug         text,
  body_preview text,
  metadata     jsonb,
  similarity   float
)
language plpgsql
as $$
begin
  return query
  select
    ce.id,
    ce.content_type,
    ce.title,
    ce.slug,
    ce.body_preview,
    ce.metadata,
    -- Cosine similarity = 1 - cosine distance
    1 - (ce.embedding <=> query_embedding) as similarity
  from public.content_embeddings ce
  where (filter_type is null or ce.content_type = filter_type)
  order by ce.embedding <=> query_embedding
  limit match_count;
end;
$$;
