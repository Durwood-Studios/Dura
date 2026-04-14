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
    phaseId: "7",
    moduleId,
    type,
    question,
    options,
    correct,
    explanation,
    difficulty,
    tags,
    standards: { bloom: "analyze" },
  };
}

export const PHASE_7_QUESTIONS: AssessmentQuestion[] = [
  // ── Module 7-1: Compilers and Interpreters ───────────────────────────────
  q(
    "7-1-q1",
    "7-1",
    "multiple-choice",
    "What is the first stage of a compiler pipeline?",
    ["Parsing", "Lexing (tokenization)", "Code generation", "Optimization"],
    1,
    "Lexing converts the raw character stream into a sequence of tokens — the first step in language processing.",
    "easy",
    ["compiler", "lexer"]
  ),
  q(
    "7-1-q2",
    "7-1",
    "multiple-choice",
    "What does a parser produce?",
    ["Machine code", "An Abstract Syntax Tree (AST)", "Bytecode", "A list of tokens"],
    1,
    "The parser takes tokens and builds a tree structure (AST) that represents the program's structure.",
    "easy",
    ["parser", "ast"]
  ),
  q(
    "7-1-q3",
    "7-1",
    "multiple-choice",
    "What is an AST?",
    [
      "A type of database",
      "A tree representing the grammatical structure of source code",
      "An encryption algorithm",
      "A networking protocol",
    ],
    1,
    "Abstract Syntax Trees represent program structure. Linters, formatters, and transpilers all operate on ASTs.",
    "easy",
    ["ast"]
  ),
  q(
    "7-1-q4",
    "7-1",
    "true-false",
    "True or false: JIT compilation compiles code at runtime rather than ahead of time.",
    ["True", "False"],
    0,
    "Just-In-Time compilation compiles frequently-executed code paths during program execution for better performance.",
    "easy",
    ["jit", "compiler"]
  ),
  q(
    "7-1-q5",
    "7-1",
    "multiple-choice",
    "What is constant folding?",
    [
      "Removing unused variables",
      "Evaluating constant expressions at compile time (e.g., 2+3 → 5)",
      "Inlining function calls",
      "Loop unrolling",
    ],
    1,
    "Constant folding replaces compile-time-computable expressions with their results, reducing runtime work.",
    "medium",
    ["optimization"]
  ),
  q(
    "7-1-q6",
    "7-1",
    "multiple-choice",
    "What does semantic analysis check that parsing cannot?",
    [
      "Syntax errors",
      "Type mismatches and undeclared variables",
      "Missing semicolons",
      "Indentation",
    ],
    1,
    "Semantic analysis catches errors like using an undeclared variable or passing the wrong type — issues that are syntactically valid but logically wrong.",
    "medium",
    ["semantic-analysis"]
  ),
  q(
    "7-1-q7",
    "7-1",
    "multiple-choice",
    "What is a recursive descent parser?",
    [
      "A parser that uses loops",
      "A parser where each grammar rule becomes a function that can call itself",
      "A parser that reads backwards",
      "A parser that uses regular expressions",
    ],
    1,
    "Recursive descent maps each grammar production to a function. Nested rules naturally become recursive calls.",
    "medium",
    ["parser", "recursive-descent"]
  ),
  q(
    "7-1-q8",
    "7-1",
    "multiple-choice",
    "What is bytecode?",
    [
      "Machine code for a specific CPU",
      "An intermediate representation executed by a virtual machine",
      "Encrypted source code",
      "Compressed binary data",
    ],
    1,
    "Bytecode is a platform-independent intermediate format. The JVM, Python VM, and V8 all use bytecode internally.",
    "medium",
    ["bytecode", "vm"]
  ),
  q(
    "7-1-q9",
    "7-1",
    "multiple-choice",
    "Why is dead code elimination useful?",
    [
      "It makes source files smaller",
      "It removes code that can never execute, reducing binary size and improving performance",
      "It formats code",
      "It catches bugs",
    ],
    1,
    "Dead code elimination removes unreachable code paths, reducing the size and improving the speed of compiled output.",
    "hard",
    ["optimization", "dead-code"]
  ),
  q(
    "7-1-q10",
    "7-1",
    "multiple-choice",
    "What is the visitor pattern used for with ASTs?",
    [
      "Parsing tokens",
      "Traversing and operating on each node type without modifying the tree structure",
      "Generating random trees",
      "Compressing trees",
    ],
    1,
    "The visitor pattern separates the operation (what to do at each node) from the traversal (how to walk the tree).",
    "hard",
    ["ast", "visitor-pattern"]
  ),

  // ── Module 7-2: Distributed Systems ──────────────────────────────────────
  q(
    "7-2-q1",
    "7-2",
    "multiple-choice",
    "What does the CAP theorem state?",
    [
      "You can have all three: consistency, availability, partition tolerance",
      "A distributed system can provide at most two of: consistency, availability, partition tolerance",
      "CAP stands for Cache, API, Performance",
      "Distributed systems are always consistent",
    ],
    1,
    "CAP: in a network partition, you must choose between consistency (all nodes see the same data) and availability (every request gets a response).",
    "easy",
    ["cap-theorem"]
  ),
  q(
    "7-2-q2",
    "7-2",
    "multiple-choice",
    "What problem does the Raft algorithm solve?",
    [
      "Load balancing",
      "Consensus — getting distributed nodes to agree on a value",
      "Data compression",
      "DNS resolution",
    ],
    1,
    "Raft is a consensus algorithm: leader election + log replication, ensuring all nodes agree on the state.",
    "easy",
    ["raft", "consensus"]
  ),
  q(
    "7-2-q3",
    "7-2",
    "true-false",
    "True or false: eventual consistency means all nodes will eventually agree, but may temporarily return different values.",
    ["True", "False"],
    0,
    "Eventual consistency trades immediate consistency for availability — writes propagate asynchronously.",
    "easy",
    ["eventual-consistency"]
  ),
  q(
    "7-2-q4",
    "7-2",
    "multiple-choice",
    "What is consistent hashing used for?",
    [
      "Encrypting data",
      "Distributing data across nodes so that adding/removing a node only moves a fraction of keys",
      "Sorting data",
      "Compressing data",
    ],
    1,
    "Consistent hashing minimizes data movement when the cluster changes — only K/n keys move on average.",
    "easy",
    ["consistent-hashing"]
  ),
  q(
    "7-2-q5",
    "7-2",
    "multiple-choice",
    "What is 'exactly-once' delivery in message queues?",
    [
      "Messages are always delivered once",
      "A guarantee that each message is processed exactly once — achieved through idempotency and deduplication",
      "Messages are never lost",
      "Messages arrive in order",
    ],
    1,
    "True exactly-once is nearly impossible. In practice it's achieved via at-least-once delivery + idempotent consumers.",
    "medium",
    ["message-queue", "exactly-once"]
  ),
  q(
    "7-2-q6",
    "7-2",
    "multiple-choice",
    "What is a saga pattern?",
    [
      "A single distributed transaction",
      "A sequence of local transactions with compensating actions for rollback",
      "A type of database index",
      "A consensus algorithm",
    ],
    1,
    "Sagas break a distributed transaction into local steps, each with a compensating action if a later step fails.",
    "medium",
    ["saga", "distributed-transaction"]
  ),
  q(
    "7-2-q7",
    "7-2",
    "multiple-choice",
    "What do Lamport clocks provide?",
    [
      "Exact wall-clock time across nodes",
      "A logical ordering of events — if A happened before B, Clock(A) < Clock(B)",
      "GPS synchronization",
      "Network latency measurement",
    ],
    1,
    "Lamport clocks give a partial causal ordering. If A→B then L(A)<L(B), but L(A)<L(B) does not imply A→B.",
    "medium",
    ["lamport-clock", "ordering"]
  ),
  q(
    "7-2-q8",
    "7-2",
    "multiple-choice",
    "What is a CRDT?",
    [
      "A type of database",
      "A data structure that can be replicated across nodes and merged without conflicts",
      "A consensus protocol",
      "A compression algorithm",
    ],
    1,
    "Conflict-free Replicated Data Types (CRDTs) guarantee convergence — all replicas reach the same state regardless of merge order.",
    "hard",
    ["crdt"]
  ),
  q(
    "7-2-q9",
    "7-2",
    "multiple-choice",
    "Why does two-phase commit (2PC) have a blocking problem?",
    [
      "It uses too much network bandwidth",
      "If the coordinator crashes after sending 'prepare' but before 'commit', participants are stuck waiting",
      "It's too slow",
      "It doesn't support multiple nodes",
    ],
    1,
    "2PC participants that voted 'yes' cannot proceed or abort until they hear from the coordinator — a single point of failure.",
    "hard",
    ["2pc", "distributed-transaction"]
  ),
  q(
    "7-2-q10",
    "7-2",
    "multiple-choice",
    "What advantage do vector clocks have over Lamport clocks?",
    [
      "They're simpler",
      "They can detect whether two events are concurrent (neither caused the other)",
      "They're faster",
      "They use less memory",
    ],
    1,
    "Vector clocks track causality per node, allowing detection of concurrent events — Lamport clocks cannot distinguish concurrency from ordering.",
    "hard",
    ["vector-clock", "lamport-clock"]
  ),

  // ── Module 7-3: Rust Fundamentals ────────────────────────────────────────
  q(
    "7-3-q1",
    "7-3",
    "multiple-choice",
    "What is Rust's primary innovation over C/C++?",
    [
      "Garbage collection",
      "Memory safety guaranteed at compile time without a garbage collector",
      "Dynamic typing",
      "Interpreted execution",
    ],
    1,
    "Rust's ownership system prevents use-after-free, double-free, and data races at compile time — no GC overhead.",
    "easy",
    ["rust", "ownership"]
  ),
  q(
    "7-3-q2",
    "7-3",
    "multiple-choice",
    "What happens when you assign a value to a new variable in Rust (non-Copy type)?",
    [
      "The value is copied",
      "The value is moved — the original variable is invalidated",
      "Both variables share the value",
      "A reference is created",
    ],
    1,
    "Move semantics: ownership transfers. The original binding becomes invalid, preventing double-free.",
    "easy",
    ["ownership", "move"]
  ),
  q(
    "7-3-q3",
    "7-3",
    "true-false",
    "True or false: in Rust, you can have one mutable reference OR many immutable references to a value, but never both simultaneously.",
    ["True", "False"],
    0,
    "This rule prevents data races at compile time. The borrow checker enforces it.",
    "easy",
    ["borrowing", "borrow-checker"]
  ),
  q(
    "7-3-q4",
    "7-3",
    "multiple-choice",
    "What does Option<T> represent in Rust?",
    [
      "An optional function parameter",
      "A value that might be present (Some(T)) or absent (None) — replacing null",
      "A configuration option",
      "An optimization hint",
    ],
    1,
    "Option<T> eliminates null pointer errors. You must explicitly handle the None case — the compiler enforces it.",
    "easy",
    ["option", "rust"]
  ),
  q(
    "7-3-q5",
    "7-3",
    "multiple-choice",
    "What does the ? operator do in Rust?",
    [
      "Checks if a value is null",
      "Propagates errors — returns early with the Err if the Result is Err, unwraps the Ok otherwise",
      "Creates a new variable",
      "Converts types",
    ],
    1,
    "The ? operator is syntactic sugar for match { Ok(v) => v, Err(e) => return Err(e) }.",
    "medium",
    ["error-handling", "result"]
  ),
  q(
    "7-3-q6",
    "7-3",
    "multiple-choice",
    "What is a lifetime annotation in Rust?",
    [
      "How long a program runs",
      "A label that tells the compiler how long a reference is valid relative to other references",
      "A performance metric",
      "A type of loop",
    ],
    1,
    "Lifetimes prevent dangling references. 'a means 'this reference is valid for at least lifetime a.'",
    "medium",
    ["lifetime", "rust"]
  ),
  q(
    "7-3-q7",
    "7-3",
    "multiple-choice",
    "What is a trait in Rust?",
    [
      "A class",
      "A shared set of method signatures that types can implement — like an interface",
      "A module",
      "A macro",
    ],
    1,
    "Traits define shared behavior. impl Display for MyType lets MyType be printed. Generic bounds use traits: fn foo<T: Display>(x: T).",
    "medium",
    ["trait", "rust"]
  ),
  q(
    "7-3-q8",
    "7-3",
    "multiple-choice",
    "What is 'zero-cost abstraction' in Rust?",
    [
      "Rust is free to use",
      "High-level abstractions compile to the same machine code as hand-written low-level code",
      "Abstractions have no runtime cost because they're removed",
      "Rust doesn't support abstractions",
    ],
    1,
    "Iterators, generics, and traits in Rust compile to code as efficient as manual loops — no overhead for the abstraction.",
    "hard",
    ["zero-cost", "rust"]
  ),
  q(
    "7-3-q9",
    "7-3",
    "multiple-choice",
    "Why does Rust distinguish between panic! and Result<T, E>?",
    [
      "They are the same thing",
      "panic! is for unrecoverable errors (bugs); Result is for expected, recoverable errors",
      "Result is faster",
      "panic! is deprecated",
    ],
    1,
    "Recoverable errors (file not found, network timeout) use Result. Unrecoverable errors (index out of bounds in a bug) use panic!.",
    "hard",
    ["error-handling", "panic", "result"]
  ),
  q(
    "7-3-q10",
    "7-3",
    "multiple-choice",
    "What is the 'static lifetime?",
    [
      "A lifetime that lasts one function call",
      "A lifetime that lasts for the entire program — string literals and owned data moved into threads have 'static",
      "A compile-time constant",
      "A static method",
    ],
    1,
    "'static means the data is valid for the entire program duration. String literals are &'static str.",
    "hard",
    ["lifetime", "static"]
  ),

  // ── Module 7-4: Performance Engineering ──────────────────────────────────
  q(
    "7-4-q1",
    "7-4",
    "multiple-choice",
    "What does a flame graph show?",
    [
      "Memory usage over time",
      "CPU time spent in each function — width = time, stack depth = call chain",
      "Network traffic",
      "Disk I/O",
    ],
    1,
    "Flame graphs visualize profiling data: the wider a bar, the more time spent in that function (or its children).",
    "easy",
    ["profiling", "flame-graph"]
  ),
  q(
    "7-4-q2",
    "7-4",
    "multiple-choice",
    "Why do microbenchmarks often lie?",
    [
      "They're too fast to measure",
      "JIT warmup, GC pauses, branch prediction, and CPU caching make isolated measurements unrepresentative of real workloads",
      "They use too much memory",
      "They only work on Linux",
    ],
    1,
    "Microbenchmarks measure in isolation. Real performance depends on the surrounding system — cache state, GC pressure, concurrent load.",
    "easy",
    ["benchmarking"]
  ),
  q(
    "7-4-q3",
    "7-4",
    "true-false",
    "True or false: cache invalidation is considered one of the hardest problems in computer science.",
    ["True", "False"],
    0,
    "The two hard problems: naming things, cache invalidation, and off-by-one errors. Knowing when cached data is stale is genuinely hard.",
    "easy",
    ["cache-invalidation"]
  ),
  q(
    "7-4-q4",
    "7-4",
    "multiple-choice",
    "What is back-pressure in a concurrent system?",
    [
      "A compression technique",
      "A mechanism where a slow consumer signals the fast producer to slow down, preventing memory overflow",
      "A type of load balancer",
      "A network protocol",
    ],
    1,
    "Without back-pressure, a fast producer overwhelms a slow consumer, filling queues until memory runs out.",
    "easy",
    ["back-pressure", "concurrency"]
  ),
  q(
    "7-4-q5",
    "7-4",
    "multiple-choice",
    "What is the most common cause of memory leaks in JavaScript?",
    [
      "Too many variables",
      "Forgotten references: closures capturing objects, detached DOM nodes, growing arrays that are never trimmed",
      "Using const",
      "Too many function calls",
    ],
    1,
    "The GC can't collect objects that are still reachable. Closures and global references are the usual culprits.",
    "medium",
    ["memory-leak", "profiling"]
  ),
  q(
    "7-4-q6",
    "7-4",
    "multiple-choice",
    "Why does CPU cache locality matter for performance?",
    [
      "It doesn't — CPUs are fast enough",
      "Accessing data already in L1 cache is ~100x faster than fetching from main memory",
      "Cache only affects GPU code",
      "Only matters for embedded systems",
    ],
    1,
    "L1 cache: ~1ns. Main memory: ~100ns. Sequential array access is fast because the CPU prefetches contiguous memory into cache.",
    "medium",
    ["cache", "performance"]
  ),
  q(
    "7-4-q7",
    "7-4",
    "multiple-choice",
    "What is sampling-based profiling?",
    [
      "Running code once and measuring",
      "Periodically recording which function is executing, then building a statistical picture of where time is spent",
      "Measuring memory allocation",
      "Counting function calls",
    ],
    1,
    "Sampling interrupts at intervals (e.g., 1ms) and records the call stack. Low overhead, statistical accuracy.",
    "medium",
    ["profiling", "sampling"]
  ),
  q(
    "7-4-q8",
    "7-4",
    "multiple-choice",
    "What is the correct order for the performance optimization loop?",
    [
      "Optimize → measure → guess",
      "Measure (profile) → identify bottleneck → fix → measure again",
      "Rewrite everything → hope it's faster",
      "Add more servers → measure",
    ],
    1,
    "Never optimize without profiling first. Measure, find the actual bottleneck, fix it, then verify with measurement.",
    "medium",
    ["optimization", "workflow"]
  ),
  q(
    "7-4-q9",
    "7-4",
    "multiple-choice",
    "What is work stealing in a thread pool?",
    [
      "Threads delete each other's work",
      "Idle threads take tasks from busy threads' queues to balance load dynamically",
      "A security vulnerability",
      "A scheduling algorithm for disk I/O",
    ],
    1,
    "Work stealing balances load without central coordination — idle threads 'steal' from the back of other threads' deques.",
    "hard",
    ["concurrency", "work-stealing"]
  ),
  q(
    "7-4-q10",
    "7-4",
    "multiple-choice",
    "When should you reach for Web Workers in a browser application?",
    [
      "For every function call",
      "For CPU-intensive work that would block the main thread (parsing, encryption, image processing)",
      "For network requests",
      "For DOM manipulation",
    ],
    1,
    "Web Workers run on separate threads. Use them for heavy computation; DOM access must stay on the main thread.",
    "hard",
    ["web-workers", "concurrency"]
  ),
];
