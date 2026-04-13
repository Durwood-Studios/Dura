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
];
