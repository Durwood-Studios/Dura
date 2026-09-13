# RAG chatbot lab 1.0.0

Node.js 22+. No runtime packages, keys, account or network needed after download.

```sh
npm ci
npm test
npm start
```

Open http://127.0.0.1:4310 and ask `returns receipt` or `shipping weekdays`.
The UI calls the actual chunk → embed → cosine retrieval → answer pipeline.
Default mode uses exact word-count vectors and quotes the retrieved passages. It is a deterministic **extractive fixture**, not semantic AI or a simulated claim of generation. Unknown vocabulary produces an abstention. Answers are complete JSON responses; streaming is not implemented.

Edit `documents.json` with up to 20 public sample documents (100,000 characters each, 200 chunks total), restart, and compare source passages. The in-memory index is rebuilt on restart. Chunk size is characters, not model tokens. Similarity threshold 0.1 is a teaching parameter, not calibrated answer confidence. The vocabulary fixture does not understand synonyms or instructions.

## Optional real external generation

`provider.mjs` implements native HTTPS calls to the OpenAI embeddings and Chat Completions endpoints. Select model IDs available to your account from the provider documentation. With `RAG_MODE=openai`, documents and questions leave your machine and API billing applies. Supply `OPENAI_API_KEY`, `EMBEDDING_MODEL` and `CHAT_MODEL` in your process environment, then:

```sh
RAG_MODE=openai npm start
```

Keys stay on the Node server. Never put them in client.js, documents.json or source control. Use only public sample documents for this exercise. The adapter requires one embedding model for both indexing and questions; change it only by rebuilding the index. It has request timeouts and rejects malformed vectors/answers. Live model billing, quality and availability have **not** been tested by the offline suite. The test injects an explicit fetch fixture to verify request/response contracts.

Prompt text asks the model to cite evidence; it cannot enforce factual grounding. Inspect each source yourself, test unanswerable/contradictory/adversarial inputs, and evaluate a labeled question set before making quality claims. This local single-user teaching server has no authentication, persistent vector database, document ACLs, tenant separation, production rate limiter, streaming, or deployment claim.

API references checked for this adapter: [embeddings](https://developers.openai.com/api/reference/resources/embeddings/methods/create), [Chat Completions](https://developers.openai.com/api/reference/resources/chat/subresources/completions/methods/create).
