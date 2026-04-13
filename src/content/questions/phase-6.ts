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

  // ── Module 6-3: Agentic AI ───────────────────────────────────────────────
  q(
    "6-3-q1",
    "6-3",
    "multiple-choice",
    "What distinguishes an AI agent from a chatbot?",
    [
      "Agents are faster",
      "Agents can use tools, plan multi-step actions, and act on the world — chatbots only generate text",
      "Chatbots use LLMs but agents do not",
      "Agents require fine-tuning",
    ],
    1,
    "An agent = LLM + tools + action loop. It reasons about what to do next and takes actions, not just generates text.",
    "easy",
    ["agent", "tool-use"]
  ),
  q(
    "6-3-q2",
    "6-3",
    "multiple-choice",
    "What is the ReAct pattern?",
    [
      "A React.js design pattern",
      "Reason then Act — the model thinks step-by-step, decides on a tool call, observes the result, then reasons again",
      "A database query pattern",
      "A CSS animation technique",
    ],
    1,
    "ReAct interleaves reasoning and acting: think → act → observe → think → act... until the task is done.",
    "easy",
    ["react-pattern", "agent"]
  ),
  q(
    "6-3-q3",
    "6-3",
    "multiple-choice",
    "How do you define a tool for an LLM agent?",
    [
      "Write it in natural language in the system prompt only",
      "Provide a JSON schema with the tool name, description, and input parameters",
      "Upload a binary executable",
      "Hard-code the tool calls in the output",
    ],
    1,
    "Tools are defined as JSON schemas with name, description, and parameter types. The model decides when to call them.",
    "easy",
    ["tool-calling", "json-schema"]
  ),
  q(
    "6-3-q4",
    "6-3",
    "true-false",
    "True or false: in a multi-agent system, a supervisor agent coordinates which specialized agents handle which tasks.",
    ["True", "False"],
    0,
    "The supervisor pattern routes tasks to the right specialist agent and aggregates results.",
    "easy",
    ["multi-agent", "supervisor"]
  ),
  q(
    "6-3-q5",
    "6-3",
    "multiple-choice",
    "Why is human-in-the-loop important for agents?",
    [
      "It makes agents faster",
      "Agents can take destructive actions — human approval prevents irreversible mistakes",
      "LLMs require human input to function",
      "It reduces API costs",
    ],
    1,
    "Agents with tool access can delete data, send emails, or modify systems. Human approval gates prevent catastrophic errors.",
    "medium",
    ["human-in-the-loop", "safety"]
  ),
  q(
    "6-3-q6",
    "6-3",
    "multiple-choice",
    "What is the biggest challenge in evaluating AI agents?",
    [
      "Agents are too fast to observe",
      "Outputs are non-deterministic and multi-step, making traditional unit tests insufficient",
      "Agents don't produce any output",
      "Evaluation requires GPUs",
    ],
    1,
    "Agents take variable paths to solve tasks. Trajectory evaluation, task completion rate, and tool call accuracy are needed.",
    "medium",
    ["evaluation", "agent"]
  ),
  q(
    "6-3-q7",
    "6-3",
    "multiple-choice",
    "What type of memory allows an agent to recall past interactions across sessions?",
    [
      "Short-term memory (conversation context)",
      "Long-term memory (persistent store)",
      "CPU cache",
      "Browser localStorage",
    ],
    1,
    "Long-term memory persists across sessions — stored in a database, retrieved when relevant to the current task.",
    "medium",
    ["agent-memory", "long-term"]
  ),
  q(
    "6-3-q8",
    "6-3",
    "multiple-choice",
    "When should you use a framework like LangGraph vs building an agent from scratch?",
    [
      "Always use a framework",
      "Frameworks help with complex multi-step flows; simple tool-calling agents are easier built directly on the API",
      "Never use a framework",
      "Frameworks are only for Python",
    ],
    1,
    "Simple agents (1-2 tools, linear flow) are easy to build on raw APIs. Complex state machines and multi-agent flows benefit from framework abstractions.",
    "hard",
    ["framework", "langraph"]
  ),
  q(
    "6-3-q9",
    "6-3",
    "multiple-choice",
    "What is the 'confidence threshold' pattern in human-in-the-loop?",
    [
      "Only run the agent when the user is confident",
      "The agent auto-executes when confidence is high, escalates to a human when confidence is low",
      "A threshold for how many tokens to generate",
      "A limit on API costs",
    ],
    1,
    "The trust gradient: high-confidence actions run automatically, low-confidence actions pause for human approval.",
    "hard",
    ["confidence", "human-in-the-loop"]
  ),
  q(
    "6-3-q10",
    "6-3",
    "multiple-choice",
    "What is the main risk of an agent loop without a maximum iteration limit?",
    [
      "It will generate better answers",
      "It can run indefinitely, consuming tokens and costs without converging on a solution",
      "It will crash the browser",
      "It makes the agent faster",
    ],
    1,
    "Unbounded loops can burn through API budgets. Always set max iterations and a cost ceiling.",
    "hard",
    ["agent-loop", "safety", "cost"]
  ),

  // ── Module 6-4: MCP Development ──────────────────────────────────────────
  q(
    "6-4-q1",
    "6-4",
    "multiple-choice",
    "What does MCP stand for?",
    [
      "Model Compression Protocol",
      "Model Context Protocol",
      "Multi-Channel Processing",
      "Machine Control Program",
    ],
    1,
    "MCP is the Model Context Protocol — a standard for connecting AI models to external tools, data, and prompts.",
    "easy",
    ["mcp"]
  ),
  q(
    "6-4-q2",
    "6-4",
    "multiple-choice",
    "What transport protocol does MCP use at the message level?",
    ["REST", "GraphQL", "JSON-RPC 2.0", "gRPC"],
    2,
    "MCP uses JSON-RPC 2.0 as its message format, carried over stdio, SSE, or HTTP transports.",
    "easy",
    ["json-rpc", "mcp"]
  ),
  q(
    "6-4-q3",
    "6-4",
    "multiple-choice",
    "What are the three main primitives an MCP server can expose?",
    [
      "GET, POST, DELETE",
      "Tools, resources, and prompts",
      "Input, output, and error",
      "Read, write, and execute",
    ],
    1,
    "MCP servers expose tools (actions), resources (data), and prompts (templates).",
    "easy",
    ["mcp", "primitives"]
  ),
  q(
    "6-4-q4",
    "6-4",
    "true-false",
    "True or false: MCP tools are defined using JSON Schema for their input parameters.",
    ["True", "False"],
    0,
    "Tool definitions include a name, description, and inputSchema following JSON Schema for parameter validation.",
    "easy",
    ["tool", "json-schema", "mcp"]
  ),
  q(
    "6-4-q5",
    "6-4",
    "multiple-choice",
    "Which MCP transport is typically used by Claude Desktop for local servers?",
    ["HTTP", "WebSocket", "stdio", "gRPC"],
    2,
    "stdio (standard input/output) is used for local process communication — the client spawns the server and communicates via stdin/stdout.",
    "medium",
    ["stdio", "transport", "mcp"]
  ),
  q(
    "6-4-q6",
    "6-4",
    "multiple-choice",
    "What is a resource URI in MCP?",
    [
      "A URL that always points to a website",
      "A unique identifier for a piece of data the server exposes, which the model can read",
      "A database connection string",
      "An API authentication token",
    ],
    1,
    "Resource URIs identify data sources (files, database records, API responses) that the model can access through the server.",
    "medium",
    ["resource", "uri", "mcp"]
  ),
  q(
    "6-4-q7",
    "6-4",
    "multiple-choice",
    "Why is input validation critical for MCP tool handlers?",
    [
      "It makes tools faster",
      "The model generates the input — it can be malformed, out-of-range, or contain injection attempts",
      "JSON Schema handles all validation automatically",
      "It's optional for trusted clients",
    ],
    1,
    "LLM-generated inputs can be unexpected. Validate types, ranges, and patterns before executing any tool action.",
    "medium",
    ["validation", "security", "mcp"]
  ),
  q(
    "6-4-q8",
    "6-4",
    "multiple-choice",
    "What is capabilities negotiation in MCP?",
    [
      "A pricing negotiation between client and server",
      "Client and server exchange which features they support during the initialization handshake",
      "A way to reduce token usage",
      "An authentication mechanism",
    ],
    1,
    "During initialization, client and server declare their capabilities (tools, resources, prompts, sampling) so each knows what the other supports.",
    "hard",
    ["capabilities", "initialization", "mcp"]
  ),
  q(
    "6-4-q9",
    "6-4",
    "multiple-choice",
    "What is the principle of least privilege in the context of MCP tools?",
    [
      "Give the model access to everything for best results",
      "Only expose the minimum tools and permissions the model needs for its task",
      "Use the cheapest model available",
      "Limit the number of prompts",
    ],
    1,
    "Least privilege limits blast radius. A tool that only needs read access should never have write or delete permissions.",
    "hard",
    ["security", "least-privilege", "mcp"]
  ),
  q(
    "6-4-q10",
    "6-4",
    "multiple-choice",
    "When should you use SSE transport instead of stdio for an MCP server?",
    [
      "Always — SSE is always better",
      "When the server needs to be accessible over the network (remote/web deployment) rather than locally spawned",
      "When you need faster local communication",
      "Only for Python servers",
    ],
    1,
    "stdio is for local process communication. SSE and HTTP are for network-accessible servers (web deployments, shared infrastructure).",
    "hard",
    ["sse", "transport", "mcp"]
  ),

  // ── Module 6-5: Fine-Tuning ──────────────────────────────────────────────
  q(
    "6-5-q1",
    "6-5",
    "multiple-choice",
    "When should you fine-tune instead of using RAG?",
    [
      "When you need the model to access new facts",
      "When you need to change how the model responds (style, format, tone) rather than what it knows",
      "When you want faster inference",
      "Always — fine-tuning is always better",
    ],
    1,
    "Fine-tuning changes behavior/style. RAG adds knowledge. Use the decision tree: prompt engineering → RAG → fine-tuning.",
    "easy",
    ["fine-tuning", "rag"]
  ),
  q(
    "6-5-q2",
    "6-5",
    "multiple-choice",
    "What data format is standard for fine-tuning LLMs?",
    ["CSV", "JSONL (JSON Lines)", "XML", "YAML"],
    1,
    "JSONL — one JSON object per line, each containing system/user/assistant message arrays.",
    "easy",
    ["jsonl", "training-data"]
  ),
  q(
    "6-5-q3",
    "6-5",
    "multiple-choice",
    "What does LoRA stand for?",
    [
      "Large Output Routing Algorithm",
      "Low-Rank Adaptation",
      "Linear Optimization for Retrieval Augmentation",
      "Learned Output Response Architecture",
    ],
    1,
    "Low-Rank Adaptation freezes the original weights and trains small adapter matrices, making fine-tuning efficient.",
    "easy",
    ["lora"]
  ),
  q(
    "6-5-q4",
    "6-5",
    "true-false",
    "True or false: QLoRA combines quantization with LoRA to reduce memory usage during training.",
    ["True", "False"],
    0,
    "QLoRA quantizes the base model to 4-bit and trains LoRA adapters on top, dramatically reducing GPU memory requirements.",
    "easy",
    ["qlora", "quantization"]
  ),
  q(
    "6-5-q5",
    "6-5",
    "multiple-choice",
    "What is overfitting in the context of fine-tuning?",
    [
      "The model trains too slowly",
      "The model memorizes training examples instead of learning generalizable patterns",
      "The model runs out of memory",
      "The model generates longer responses",
    ],
    1,
    "Overfitting means great performance on training data but poor generalization. Mitigate with validation sets and early stopping.",
    "medium",
    ["overfitting", "training"]
  ),
  q(
    "6-5-q6",
    "6-5",
    "multiple-choice",
    "What does perplexity measure?",
    [
      "How fast the model generates tokens",
      "How surprised the model is by the test data — lower is better",
      "The number of parameters in the model",
      "The cost per token",
    ],
    1,
    "Perplexity measures how well the model predicts the next token. Lower perplexity = better language modeling.",
    "medium",
    ["perplexity", "evaluation"]
  ),
  q(
    "6-5-q7",
    "6-5",
    "multiple-choice",
    "Which tool is designed for high-throughput LLM serving?",
    ["webpack", "vLLM", "ESLint", "Docker Compose"],
    1,
    "vLLM uses PagedAttention for efficient memory management and high-throughput serving of LLMs.",
    "medium",
    ["vllm", "serving"]
  ),
  q(
    "6-5-q8",
    "6-5",
    "multiple-choice",
    "Why is data quality more important than data quantity for fine-tuning?",
    [
      "More data is always better",
      "A small set of high-quality examples teaches the pattern; noisy data teaches noise",
      "Quality data is cheaper",
      "Models can only accept small datasets",
    ],
    1,
    "100 perfect examples often beat 10,000 noisy ones. The model learns the patterns in your data — including the mistakes.",
    "hard",
    ["data-quality", "training"]
  ),
  q(
    "6-5-q9",
    "6-5",
    "multiple-choice",
    "What is the learning rate's role in training?",
    [
      "It determines how many epochs to run",
      "It controls how much the weights change per training step — too high overshoots, too low stalls",
      "It sets the batch size",
      "It determines the model architecture",
    ],
    1,
    "Learning rate is the most important hyperparameter. Too high = unstable training. Too low = slow convergence.",
    "hard",
    ["learning-rate", "optimizer"]
  ),
  q(
    "6-5-q10",
    "6-5",
    "multiple-choice",
    "What is model quantization?",
    [
      "Adding more parameters to the model",
      "Reducing the precision of model weights (e.g., 32-bit → 4-bit) to decrease size and memory usage",
      "Encrypting the model weights",
      "Splitting the model across GPUs",
    ],
    1,
    "Quantization trades precision for efficiency. A 4-bit quantized 7B model can run on consumer hardware with minimal quality loss.",
    "hard",
    ["quantization", "deployment"]
  ),

  // ── Module 6-6: AI in Production ─────────────────────────────────────────
  q(
    "6-6-q1",
    "6-6",
    "multiple-choice",
    "What is the recommended architecture pattern for a production AI service?",
    [
      "Direct client → model calls",
      "API gateway → queue → worker → model → cache",
      "Single monolithic function",
      "Client-side model execution only",
    ],
    1,
    "Separating the gateway, queue, worker, and cache allows independent scaling, retry handling, and cost control.",
    "easy",
    ["architecture", "production"]
  ),
  q(
    "6-6-q2",
    "6-6",
    "multiple-choice",
    "Which latency metric is most important for AI service monitoring?",
    ["Average latency", "p95 or p99 latency", "Minimum latency", "Maximum latency"],
    1,
    "p95/p99 show what the slowest 5%/1% of users experience. Average hides tail latency problems.",
    "easy",
    ["monitoring", "latency"]
  ),
  q(
    "6-6-q3",
    "6-6",
    "true-false",
    "True or false: semantic caching returns a cached response for prompts that are similar in meaning, not just identical.",
    ["True", "False"],
    0,
    "Semantic cache embeds the prompt, finds similar cached prompts by cosine similarity, and returns the cached response if above a threshold.",
    "easy",
    ["caching", "semantic-cache"]
  ),
  q(
    "6-6-q4",
    "6-6",
    "multiple-choice",
    "What is the cost-quality-latency triangle in AI systems?",
    [
      "You can optimize all three equally",
      "Improving one often trades off against the others — cheaper models are lower quality, cached responses are faster but may be stale",
      "It refers to three types of AI models",
      "It's a testing framework",
    ],
    1,
    "You can't optimize all three simultaneously. Model routing, caching, and batching help navigate the tradeoffs.",
    "medium",
    ["cost", "quality", "latency"]
  ),
  q(
    "6-6-q5",
    "6-6",
    "multiple-choice",
    "What is model routing?",
    [
      "Sending all requests to one model",
      "Using a classifier to send easy tasks to cheap models and hard tasks to expensive models",
      "Routing network traffic to GPUs",
      "A DNS technique for AI servers",
    ],
    1,
    "Model routing matches task difficulty to model capability — saving cost on simple tasks while maintaining quality on complex ones.",
    "medium",
    ["model-routing", "cost-optimization"]
  ),
  q(
    "6-6-q6",
    "6-6",
    "multiple-choice",
    "What should input guardrails check for?",
    [
      "Only prompt length",
      "PII, prompt injection patterns, content policy violations, and malformed input",
      "Only spelling errors",
      "The user's subscription status",
    ],
    1,
    "Input guardrails are defense in depth: filter PII, detect injection, enforce content policy, and validate format before the model sees it.",
    "medium",
    ["guardrails", "security"]
  ),
  q(
    "6-6-q7",
    "6-6",
    "multiple-choice",
    "What is regression testing for AI prompts?",
    [
      "Testing if the model gets slower over time",
      "Running a golden test set after every prompt change to verify existing behavior isn't broken",
      "Training the model on test data",
      "Deleting old test cases",
    ],
    1,
    "Prompt changes can break previously working test cases. A golden dataset catches regressions before deployment.",
    "medium",
    ["testing", "regression"]
  ),
  q(
    "6-6-q8",
    "6-6",
    "multiple-choice",
    "What is the token bucket algorithm used for in AI rate limiting?",
    [
      "Counting how many tokens a model generates",
      "Controlling the rate of API requests — tokens refill at a fixed rate, each request consumes tokens",
      "Tokenizing text into sub-words",
      "A pricing model for API access",
    ],
    1,
    "Token bucket allows bursts up to a bucket capacity while enforcing an average rate. Common for API rate limiting.",
    "hard",
    ["rate-limiting", "token-bucket"]
  ),
  q(
    "6-6-q9",
    "6-6",
    "multiple-choice",
    "Why should you NOT cache responses for personalized or time-sensitive queries?",
    [
      "Caching is always beneficial",
      "Cached responses may be stale or inappropriate for a different user's context",
      "Caching increases costs",
      "Time-sensitive queries are too short to cache",
    ],
    1,
    "Caching assumes the same input produces the same valid output. Personalized or time-sensitive data violates that assumption.",
    "hard",
    ["caching", "invalidation"]
  ),
  q(
    "6-6-q10",
    "6-6",
    "multiple-choice",
    "What is prompt compression?",
    [
      "Making prompts shorter by removing whitespace",
      "Reducing token count while preserving meaning — removing redundant context, using shorter instructions, summarizing long documents",
      "Compressing the model itself",
      "A file compression technique",
    ],
    1,
    "Prompt compression reduces input tokens (and cost) by tightening instructions, summarizing context, and removing redundancy.",
    "hard",
    ["prompt-compression", "cost-optimization"]
  ),
];
