import type { AssessmentQuestion } from "@/types/assessment";

function q(
  id: string,
  moduleId: string,
  type: AssessmentQuestion["type"],
  question: string,
  options: string[],
  correct: number | number[],
  explanation: string,
  difficulty: AssessmentQuestion["difficulty"],
  tags: string[]
): AssessmentQuestion {
  return {
    id,
    phaseId: "6",
    moduleId,
    type,
    question,
    options,
    correct,
    explanation,
    difficulty,
    tags,
    standards: { bloom: "understand" },
  };
}

export const PHASE_6_QUESTIONS: AssessmentQuestion[] = [
  // ── Module 6-1: AI Fundamentals ──────────────────────────────────────────
  q(
    "6-1-q1",
    "6-1",
    "multiple-choice",
    "What is the primary difference between AI, ML, and deep learning?",
    [
      "They are different names for the same thing",
      "DL ⊂ ML ⊂ AI — deep learning is a subset of machine learning, which is a subset of artificial intelligence",
      "AI is older and no longer used",
      "ML requires GPUs but AI does not",
    ],
    1,
    "AI is the broadest field; ML is a subset that learns from data; DL is a subset of ML using neural networks with many layers.",
    "easy",
    ["ai", "ml", "deep-learning"]
  ),
  q(
    "6-1-q2",
    "6-1",
    "multiple-choice",
    "Why do LLMs hallucinate?",
    [
      "They have opinions",
      "They predict statistically likely next tokens, not factual truth",
      "Their training data is always wrong",
      "They are designed to lie",
    ],
    1,
    "LLMs are token prediction machines. They generate plausible continuations, which may be factually incorrect because probability ≠ truth.",
    "easy",
    ["hallucination", "llm"]
  ),
  q(
    "6-1-q3",
    "6-1",
    "multiple-choice",
    "What is a token in the context of LLMs?",
    [
      "A cryptocurrency unit",
      "A sub-word piece that the model processes as one unit",
      "A complete sentence",
      "An API authentication credential",
    ],
    1,
    "Tokens are sub-word chunks (roughly 4 chars in English) produced by BPE tokenization. Models process tokens, not words.",
    "easy",
    ["token", "tokenization"]
  ),
  q(
    "6-1-q4",
    "6-1",
    "true-false",
    "True or false: prompt engineering is just writing clear instructions — no engineering required.",
    ["True", "False"],
    1,
    "Prompt engineering involves systematic design, testing, versioning, and evaluation — it is real engineering, not just writing.",
    "easy",
    ["prompt-engineering"]
  ),
  q(
    "6-1-q5",
    "6-1",
    "multiple-choice",
    "What does the temperature parameter control in LLM generation?",
    [
      "The speed of response",
      "The randomness/creativity of the output — higher = more random",
      "The maximum response length",
      "The model's memory",
    ],
    1,
    "Temperature scales the probability distribution: 0 = deterministic (always pick most likely), 1+ = more random/creative.",
    "medium",
    ["temperature", "sampling"]
  ),
  q(
    "6-1-q6",
    "6-1",
    "multiple-choice",
    "Why does streaming matter for AI UX?",
    [
      "It reduces API costs",
      "Users see tokens appear immediately instead of waiting for the full response",
      "It prevents hallucination",
      "It's required by all AI APIs",
    ],
    1,
    "Streaming reduces perceived latency by showing output as it's generated. Time-to-first-token matters more than total generation time for UX.",
    "medium",
    ["streaming", "sse", "ux"]
  ),
  q(
    "6-1-q7",
    "6-1",
    "multiple-choice",
    "What is the best way to get reliable JSON from an LLM?",
    [
      "Hope the model returns valid JSON",
      "Use tool use / function calling with a schema, then validate the response",
      "Set temperature to 0",
      "Ask nicely in the prompt",
    ],
    1,
    "Tool use provides a schema the model must follow. Always validate the response — models can still produce invalid output.",
    "medium",
    ["structured-output", "tool-use", "json"]
  ),
  q(
    "6-1-q8",
    "6-1",
    "multiple-choice",
    "What is prompt injection?",
    [
      "A technique for faster API calls",
      "An attack where malicious input overrides the system prompt's instructions",
      "A way to inject Python into prompts",
      "A debugging technique",
    ],
    1,
    "Prompt injection tricks the model into ignoring its system prompt by embedding instructions in user input. It's the #1 AI security concern.",
    "medium",
    ["prompt-injection", "security"]
  ),
  q(
    "6-1-q9",
    "6-1",
    "multiple-choice",
    "Input tokens are typically cheaper than output tokens. Why?",
    [
      "Input requires less electricity",
      "Input is processed in parallel (one forward pass) while output is generated sequentially (one token at a time)",
      "Input tokens are smaller",
      "They are the same price",
    ],
    1,
    "Input tokens are processed in a single batched forward pass. Output tokens require sequential generation — each new token needs its own forward pass.",
    "hard",
    ["tokens", "pricing", "inference"]
  ),
  q(
    "6-1-q10",
    "6-1",
    "multiple-choice",
    "Which is the most effective mitigation for hallucination in production?",
    [
      "Setting temperature to 0",
      "Using RAG to ground responses in retrieved source documents",
      "Making the prompt longer",
      "Using a larger model",
    ],
    1,
    "RAG provides real source documents in context, giving the model factual grounding. Temperature 0 reduces randomness but doesn't prevent fabrication.",
    "hard",
    ["hallucination", "rag", "mitigation"]
  ),

  // ── Module 6-2: RAG Pipelines ────────────────────────────────────────────
  q(
    "6-2-q1",
    "6-2",
    "multiple-choice",
    "What does RAG stand for?",
    [
      "Randomized Attention Generation",
      "Retrieval-Augmented Generation",
      "Recursive Algorithm for Graphs",
      "Real-time Automated Grading",
    ],
    1,
    "RAG retrieves relevant documents, augments the prompt with them, and generates a grounded response.",
    "easy",
    ["rag"]
  ),
  q(
    "6-2-q2",
    "6-2",
    "multiple-choice",
    "What is the purpose of chunking documents in a RAG pipeline?",
    [
      "To reduce storage costs",
      "To split documents into pieces that fit the embedding model and provide focused context",
      "To encrypt the documents",
      "To convert documents to a different format",
    ],
    1,
    "Chunks must be small enough to embed and retrieve meaningfully, but large enough to preserve context.",
    "easy",
    ["chunking", "rag"]
  ),
  q(
    "6-2-q3",
    "6-2",
    "multiple-choice",
    "What is an embedding in the context of RAG?",
    [
      "A compressed file format",
      "A high-dimensional vector that captures the semantic meaning of text",
      "A type of database index",
      "An encryption key",
    ],
    1,
    "Embeddings are dense vectors where similar meanings produce similar vectors, enabling semantic search.",
    "easy",
    ["embedding", "vector"]
  ),
  q(
    "6-2-q4",
    "6-2",
    "true-false",
    "True or false: cosine similarity measures how close two embedding vectors are in meaning.",
    ["True", "False"],
    0,
    "Cosine similarity compares the angle between vectors. Closer to 1 = more similar in meaning.",
    "easy",
    ["cosine-similarity", "embedding"]
  ),
  q(
    "6-2-q5",
    "6-2",
    "multiple-choice",
    "What is the main advantage of hybrid search (keyword + semantic) over pure semantic search?",
    [
      "It's faster",
      "It catches exact matches that semantic search misses and vice versa",
      "It uses less storage",
      "It eliminates the need for embeddings",
    ],
    1,
    "Hybrid search combines keyword matching (exact terms) with semantic matching (meaning), improving recall.",
    "medium",
    ["hybrid-search", "retrieval"]
  ),
  q(
    "6-2-q6",
    "6-2",
    "multiple-choice",
    "What does a reranker do in a RAG pipeline?",
    [
      "Re-sorts the initial retrieval results by relevance using a more expensive model",
      "Removes duplicate results",
      "Translates results to a different language",
      "Compresses the retrieved text",
    ],
    0,
    "Rerankers (like Cohere Rerank or cross-encoders) score each result with higher accuracy than the initial embedding search.",
    "medium",
    ["reranker", "retrieval"]
  ),
  q(
    "6-2-q7",
    "6-2",
    "multiple-choice",
    "What is the RAGAS metric 'faithfulness'?",
    [
      "Whether the model follows instructions",
      "Whether the generated answer is factually supported by the retrieved context",
      "Whether the user is satisfied",
      "Whether the system is fast",
    ],
    1,
    "Faithfulness checks if claims in the answer can be traced back to the provided context documents.",
    "medium",
    ["ragas", "evaluation", "faithfulness"]
  ),
  q(
    "6-2-q8",
    "6-2",
    "multiple-choice",
    "What is HyDE (Hypothetical Document Embeddings)?",
    [
      "A type of database",
      "Generate a hypothetical answer first, embed that, then search — matching answers to answers",
      "A way to hide documents from retrieval",
      "An encryption technique for embeddings",
    ],
    1,
    "HyDE generates a hypothetical answer to the query, embeds it, and uses that embedding for retrieval — often improving recall.",
    "hard",
    ["hyde", "advanced-rag"]
  ),
  q(
    "6-2-q9",
    "6-2",
    "multiple-choice",
    "Why is chunk overlap used in text splitting?",
    [
      "To increase storage usage",
      "To ensure context at chunk boundaries isn't lost — information split across chunks stays accessible",
      "To create duplicate entries for backup",
      "To speed up embedding generation",
    ],
    1,
    "Overlap ensures that sentences split at boundaries are present in at least one chunk, preventing context loss.",
    "hard",
    ["chunking", "overlap"]
  ),
  q(
    "6-2-q10",
    "6-2",
    "multiple-choice",
    "In a RAG pipeline, what is the most common reason for poor answer quality?",
    [
      "The LLM is too small",
      "The retrieval step returns irrelevant documents",
      "The system prompt is too long",
      "The temperature is too high",
    ],
    1,
    "Garbage in, garbage out. If retrieval returns wrong documents, even the best LLM produces wrong answers.",
    "hard",
    ["retrieval", "quality"]
  ),
];
