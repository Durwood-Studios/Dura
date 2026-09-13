/** Bounded character chunker: the final short chunk always terminates. */
export function chunkText(text, size = 500, overlap = 50) {
  if (
    typeof text !== "string" ||
    text.length > 100000 ||
    !Number.isInteger(size) ||
    size < 1 ||
    !Number.isInteger(overlap) ||
    overlap < 0 ||
    overlap >= size
  )
    throw new Error("Invalid document or chunk bounds");
  const chunks = [];
  for (let start = 0; start < text.length; ) {
    const end = Math.min(start + size, text.length);
    if (text.slice(start, end).trim()) chunks.push(text.slice(start, end));
    if (end === text.length) break;
    start = end - overlap;
  }
  return chunks;
}
const tokens = (text) => text.toLowerCase().match(/[a-z0-9]+/g) ?? [];
/** Exact vocabulary counts are an inspectable fixture, not semantic model embeddings. */
export function fixtureProvider(documents) {
  const vocabulary = [...new Set(documents.flatMap((doc) => tokens(doc.text)))];
  return {
    label: "Offline lexical retrieval with extractive answers (no LLM)",
    async embed(texts) {
      return texts.map((text) => {
        const words = tokens(text);
        return vocabulary.map((word) => words.filter((item) => item === word).length);
      });
    },
    async generate(question, hits) {
      return hits
        .map((hit, index) => `[Source ${index + 1}: ${hit.source}] ${hit.text}`)
        .join("\n\n");
    },
  };
}
/** Reject malformed provider vectors instead of silently ranking NaN scores. */
export function cosine(a, b) {
  if (
    !Array.isArray(a) ||
    !Array.isArray(b) ||
    !a.length ||
    a.length > 16384 ||
    a.length !== b.length ||
    [...a, ...b].some((value) => !Number.isFinite(value))
  )
    throw new Error("Invalid embedding vectors");
  const norm = Math.hypot(...a) * Math.hypot(...b);
  return norm === 0 ? 0 : a.reduce((sum, value, index) => sum + value * b[index], 0) / norm;
}
/** Build an immutable in-memory index with one provider for documents and queries. */
export async function createRag(documents, provider) {
  if (!Array.isArray(documents) || !documents.length || documents.length > 20)
    throw new Error("Supply 1–20 documents");
  const ids = new Set();
  const chunks = documents.flatMap((doc) => {
    if (!doc || typeof doc.id !== "string" || !/^[a-z0-9-]{1,60}$/.test(doc.id) || ids.has(doc.id))
      throw new Error("Invalid or duplicate source ID");
    ids.add(doc.id);
    return chunkText(doc.text).map((text, index) => ({
      source: doc.id,
      id: `${doc.id}#${index}`,
      text,
    }));
  });
  if (!chunks.length || chunks.length > 200) throw new Error("Supply 1–200 nonempty chunks");
  const embeddings = await provider.embed(chunks.map((chunk) => chunk.text));
  if (!Array.isArray(embeddings) || embeddings.length !== chunks.length)
    throw new Error("Embedding count mismatch");
  embeddings.forEach((vector) => cosine(vector, embeddings[0]));
  return {
    label: provider.label,
    async ask(question) {
      if (typeof question !== "string" || !question.trim() || question.length > 1000)
        throw new Error("Question must contain 1–1000 characters");
      const query = await provider.embed([question]);
      if (!Array.isArray(query) || query.length !== 1)
        throw new Error("Query embedding count mismatch");
      const hits = chunks
        .map((chunk, index) => ({ ...chunk, score: cosine(query[0], embeddings[index]) }))
        .filter((hit) => hit.score > 0.1)
        .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
        .slice(0, 3);
      if (!hits.length)
        return {
          answer: "No matching evidence found. Try a more specific question or add a source.",
          sources: [],
          mode: provider.label,
        };
      const answer = await provider.generate(question, hits);
      if (typeof answer !== "string" || !answer.trim() || answer.length > 20000)
        throw new Error("Invalid generated answer");
      return {
        answer,
        sources: hits.map(({ source, id, score, text }) => ({ source, id, score, text })),
        mode: provider.label,
      };
    },
  };
}
