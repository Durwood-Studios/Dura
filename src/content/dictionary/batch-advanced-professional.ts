import type { DictionaryTerm } from "@/types/dictionary";

/**
 * Advanced systems and professional practice dictionary terms.
 * Covers compilers, distributed systems, Rust, performance,
 * testing, CI/CD, architecture, security, and code quality.
 */
export const ADVANCED_PROFESSIONAL_TERMS: DictionaryTerm[] = [
  // ── Compilers (8) ──────────────────────────────────────────

  {
    slug: "recursive-descent",
    term: "Recursive Descent Parser",
    aliases: ["top-down parser"],
    category: "systems",
    phaseIds: ["7"],
    lessonIds: [],
    definitions: {
      beginner:
        "A way to read code by breaking it into smaller pieces — each grammar rule gets its own function that calls the others.",
      intermediate:
        "A top-down parsing technique where each non-terminal in the grammar maps to a function. The parser reads tokens left to right, calling functions recursively to match productions.",
      advanced:
        "An LL parser family implementation where mutually recursive procedures mirror the grammar's production rules. Requires left-recursion elimination and may need bounded look-ahead (LL(k)) or backtracking for ambiguous grammars.",
    },
    seeAlso: ["pratt-parser", "context-free-grammar"],
  },
  {
    slug: "pratt-parser",
    term: "Pratt Parser",
    aliases: ["top-down operator precedence parser", "TDOP"],
    category: "systems",
    phaseIds: ["7"],
    lessonIds: [],
    definitions: {
      beginner:
        "A clever way to handle math-like expressions so the parser knows that multiplication comes before addition without extra rules.",
      intermediate:
        "A parsing technique invented by Vaughan Pratt that assigns binding powers to tokens. It elegantly handles operator precedence and associativity without deeply nested grammar rules.",
      advanced:
        "A top-down operator-precedence parser that associates a null denotation (nud) and left denotation (led) function with each token, plus a binding power integer. Produces correct ASTs for arbitrary precedence levels in O(n) time with minimal code.",
    },
    seeAlso: ["recursive-descent", "context-free-grammar"],
  },
  {
    slug: "context-free-grammar",
    term: "Context-Free Grammar",
    aliases: ["CFG"],
    category: "systems",
    phaseIds: ["7"],
    lessonIds: [],
    definitions: {
      beginner:
        "A set of rules that describe how valid sentences in a language can be built — like the grammar rules for a programming language.",
      intermediate:
        "A formal grammar where every production rule has a single non-terminal on its left side. CFGs describe the syntax of most programming languages and are the basis for parser generators.",
      advanced:
        "A 4-tuple (V, Σ, R, S) in the Chomsky hierarchy (Type 2) where productions map single non-terminals to strings of terminals and non-terminals. Recognized by pushdown automata; subsets like LR(1) and LL(1) enable deterministic, linear-time parsing.",
    },
    seeAlso: ["recursive-descent", "pratt-parser"],
  },
  {
    slug: "intermediate-representation",
    term: "Intermediate Representation",
    aliases: ["IR"],
    category: "systems",
    phaseIds: ["7"],
    lessonIds: [],
    definitions: {
      beginner:
        "A simplified version of your code that the compiler creates internally — easier for the compiler to optimize before turning it into machine code.",
      intermediate:
        "A data structure or code format used between the front end (parsing) and back end (code generation) of a compiler. Common forms include three-address code, SSA, and tree-based IRs.",
      advanced:
        "A compiler-internal representation decoupling source language semantics from target architecture details. Modern compilers use multiple IR levels (e.g., LLVM's high-level IR → MIR → machine IR) to enable layered optimization passes and retargetability.",
    },
    seeAlso: ["constant-folding-opt", "dead-code-elimination"],
  },
  {
    slug: "constant-folding-opt",
    term: "Constant Folding",
    aliases: ["constant propagation"],
    category: "systems",
    phaseIds: ["7"],
    lessonIds: [],
    definitions: {
      beginner:
        "When the compiler pre-calculates math that uses only fixed numbers, so the program doesn't have to compute it at runtime — like replacing 3 * 4 with 12.",
      intermediate:
        "A compiler optimization that evaluates constant expressions at compile time. Often combined with constant propagation, which substitutes known constant values into subsequent expressions.",
      advanced:
        "A static analysis–driven optimization operating on the IR's def-use chains. Lattice-based data-flow analysis (constant propagation) determines which SSA values are provably constant, enabling the folder to replace instructions with literal operands.",
    },
    seeAlso: ["dead-code-elimination", "intermediate-representation"],
  },
  {
    slug: "dead-code-elimination",
    term: "Dead Code Elimination",
    aliases: ["DCE"],
    category: "systems",
    phaseIds: ["7"],
    lessonIds: [],
    definitions: {
      beginner:
        "When the compiler removes code that can never run or whose results are never used — making the final program smaller and faster.",
      intermediate:
        "A compiler optimization that removes instructions whose results are never consumed (dead stores) and code paths that are unreachable. Relies on liveness analysis and control-flow graph reachability.",
      advanced:
        "An IR-level optimization that marks live instructions via backward data-flow analysis from observable side effects and eliminates unmarked instructions. Aggressive DCE iterates to a fixed point, often synergizing with constant folding and inlining passes.",
    },
    seeAlso: ["constant-folding-opt", "intermediate-representation"],
  },
  {
    slug: "jit-compilation",
    term: "JIT Compilation",
    aliases: ["just-in-time compilation", "JIT"],
    category: "systems",
    phaseIds: ["7"],
    lessonIds: [],
    definitions: {
      beginner:
        "Instead of compiling all your code before running it, the computer compiles pieces on the fly while the program is already running — speeding up hot spots.",
      intermediate:
        "A technique where bytecode or an intermediate representation is compiled to native machine code at runtime. JIT compilers use profiling data to focus optimization on frequently executed paths (hot loops, hot methods).",
      advanced:
        "A dynamic compilation strategy that defers native code generation until execution, leveraging runtime profiling (type feedback, branch frequencies) to apply speculative optimizations. Tiered JITs (e.g., V8 Sparkplug → Maglev → Turbofan) balance startup latency against peak throughput.",
    },
    seeAlso: ["intermediate-representation", "tree-walker"],
  },
  {
    slug: "tree-walker",
    term: "Tree-Walker Interpreter",
    aliases: ["AST interpreter", "tree-walking interpreter"],
    category: "systems",
    phaseIds: ["7"],
    lessonIds: [],
    definitions: {
      beginner:
        "The simplest kind of interpreter — it walks through the tree of parsed code and executes each node one at a time, like following a flowchart.",
      intermediate:
        "An interpreter that directly traverses the abstract syntax tree (AST) produced by the parser, evaluating each node recursively. Simple to implement but slower than bytecode interpreters due to pointer chasing and lack of optimization.",
      advanced:
        "An execution model that recursively visits AST nodes via the visitor pattern, maintaining an environment chain for lexical scoping. Performance is bounded by tree traversal overhead and poor cache locality; typically 10–100x slower than bytecode VMs.",
    },
    seeAlso: ["recursive-descent", "jit-compilation"],
  },

  // ── Distributed Systems (8) ────────────────────────────────

  {
    slug: "leader-election",
    term: "Leader Election",
    aliases: [],
    category: "systems",
    phaseIds: ["7"],
    lessonIds: [],
    definitions: {
      beginner:
        "When a group of servers pick one to be in charge — like electing a class president — so decisions happen in one place.",
      intermediate:
        "A consensus sub-problem where distributed nodes agree on a single coordinator. Common algorithms include Raft's term-based election and ZAB's epoch-based approach. The leader serializes writes to maintain consistency.",
      advanced:
        "A distributed agreement protocol that selects a distinguished process to serialize state transitions. Safety requires at most one leader per logical term; liveness depends on failure detectors (Ω) or randomized timeouts. FLP impossibility bounds apply under asynchrony.",
    },
    seeAlso: ["log-replication", "state-machine-replication"],
  },
  {
    slug: "log-replication",
    term: "Log Replication",
    aliases: ["replicated log"],
    category: "systems",
    phaseIds: ["7"],
    lessonIds: [],
    definitions: {
      beginner:
        "The leader server keeps a journal of every change and sends copies to the other servers so everyone has the same information.",
      intermediate:
        "The mechanism by which a leader appends entries to its log and replicates them to followers. Once a majority acknowledges an entry, it is committed and safe from loss. Core to Raft, Paxos, and similar consensus protocols.",
      advanced:
        "An ordered, append-only sequence of state transitions replicated across a quorum. Consistency is maintained via monotonic log indices and term/epoch fencing. Committed entries are durable under f < n/2 failures. Log compaction (snapshotting) bounds storage growth.",
    },
    seeAlso: ["leader-election", "state-machine-replication"],
  },
  {
    slug: "state-machine-replication",
    term: "State Machine Replication",
    aliases: ["SMR"],
    category: "systems",
    phaseIds: ["7"],
    lessonIds: [],
    definitions: {
      beginner:
        "If every server starts the same and applies the same commands in the same order, they all end up in the same state — that's the core idea behind keeping servers in sync.",
      intermediate:
        "A technique where deterministic state machines on multiple nodes apply the same ordered sequence of commands, producing identical states. Built on top of consensus-based log replication to ensure command ordering.",
      advanced:
        "A linearizable replication strategy based on the state machine approach (Schneider, 1990): given identical initial states and a totally ordered, deterministic command log, all replicas converge. The consensus layer (Paxos, Raft, Viewstamped Replication) provides the total order.",
    },
    seeAlso: ["leader-election", "log-replication"],
  },
  {
    slug: "two-phase-commit",
    term: "Two-Phase Commit",
    aliases: ["2PC"],
    category: "systems",
    phaseIds: ["7"],
    lessonIds: [],
    definitions: {
      beginner:
        "A protocol where a coordinator asks all participants 'Are you ready?' and only commits the transaction if everyone says yes — like making sure all friends can come before booking the restaurant.",
      intermediate:
        "An atomic commitment protocol with a prepare phase (participants vote yes/no) and a commit phase (coordinator decides commit or abort based on unanimous vote). Guarantees all-or-nothing across distributed nodes but blocks if the coordinator fails.",
      advanced:
        "A blocking atomic commitment protocol (Gray, 1978) providing atomicity across heterogeneous resource managers. Vulnerable to coordinator failure during the commit phase (participants hold locks indefinitely). Three-phase commit or Paxos Commit address the blocking problem at the cost of additional message rounds.",
    },
    seeAlso: ["exactly-once-delivery", "leader-election"],
  },
  {
    slug: "exactly-once-delivery",
    term: "Exactly-Once Delivery",
    aliases: ["exactly-once semantics"],
    category: "systems",
    phaseIds: ["7"],
    lessonIds: [],
    definitions: {
      beginner:
        "Making sure a message is processed one time — not zero, not twice — even if the network hiccups. It's harder than it sounds.",
      intermediate:
        "A messaging guarantee where each message is processed exactly once by the consumer, despite retries or failures. Typically achieved via idempotent processing combined with at-least-once delivery and deduplication.",
      advanced:
        "Strictly impossible in the general case (Two Generals' Problem); practical systems approximate it via idempotent consumers with deduplication keys, transactional outbox patterns, or Kafka-style transactional produce-consume with offset commits within the same transaction boundary.",
    },
    seeAlso: ["dead-letter-queue", "two-phase-commit"],
  },
  {
    slug: "dead-letter-queue",
    term: "Dead Letter Queue",
    aliases: ["DLQ", "poison queue"],
    category: "systems",
    phaseIds: ["7"],
    lessonIds: [],
    definitions: {
      beginner:
        "A special holding area for messages that couldn't be delivered or processed — like a 'return to sender' pile at the post office.",
      intermediate:
        "A secondary queue where messages are routed after exceeding a maximum retry count. DLQs prevent poison messages from blocking the main queue and allow operators to inspect, fix, and replay failed messages.",
      advanced:
        "An error-handling mechanism in message brokers (SQS, RabbitMQ, Kafka via error topics) that isolates unprocessable messages after configurable retry exhaustion. Operational best practices include alerting on DLQ depth, preserving original headers for root-cause analysis, and automated replay pipelines.",
    },
    seeAlso: ["exactly-once-delivery"],
  },
  {
    slug: "lamport-clock",
    term: "Lamport Clock",
    aliases: ["logical clock", "Lamport timestamp"],
    category: "systems",
    phaseIds: ["7"],
    lessonIds: [],
    definitions: {
      beginner:
        "A simple counter that helps distributed computers agree on the order of events — even without synchronized real-world clocks.",
      intermediate:
        "A logical clock where each process increments a counter on local events and on message sends, and receivers advance their counter to max(local, received) + 1. Captures the happens-before relation but cannot detect concurrent events.",
      advanced:
        "A scalar logical clock (Lamport, 1978) providing a partial order consistent with causality: if a → b then L(a) < L(b), but not the converse. Insufficient for detecting concurrency — vector clocks are needed for that. Foundational to virtually all distributed ordering schemes.",
    },
    seeAlso: ["vector-clock-ds"],
  },
  {
    slug: "vector-clock-ds",
    term: "Vector Clock",
    aliases: ["version vector"],
    category: "systems",
    phaseIds: ["7"],
    lessonIds: [],
    definitions: {
      beginner:
        "Like Lamport clocks but each server tracks everyone's counter, so you can tell whether two events happened one after another or at the same time.",
      intermediate:
        "A logical clock that maintains a vector of counters, one per process. By comparing vectors, you can determine if events are causally related or concurrent — something Lamport clocks cannot do.",
      advanced:
        "An array of N logical clocks (Fidge/Mattern, 1988) where V[i] at process i is incremented on local events. On message receipt, element-wise max is taken. a → b iff V(a) < V(b) component-wise; incomparable vectors indicate concurrency. Space cost is O(N) per event; interval tree clocks reduce this for dynamic process sets.",
    },
    seeAlso: ["lamport-clock"],
  },

  // ── Rust (8) ───────────────────────────────────────────────

  {
    slug: "borrow-checker",
    term: "Borrow Checker",
    aliases: [],
    category: "languages",
    phaseIds: ["7"],
    lessonIds: [],
    definitions: {
      beginner:
        "Rust's built-in rule enforcer that makes sure two parts of your code don't try to change the same data at the same time — preventing bugs before the program even runs.",
      intermediate:
        "A compile-time analysis in the Rust compiler that enforces ownership rules: each value has one owner, references must not outlive the owner, and you can have either one mutable reference or many immutable references — never both.",
      advanced:
        "A static analysis pass (now based on Non-Lexical Lifetimes / NLL using MIR control-flow graphs) that verifies the borrowing discipline: exclusive (&mut) and shared (&) references are never aliased unsoundly. Ensures memory safety and data-race freedom without a garbage collector.",
    },
    seeAlso: ["move-semantics", "lifetime-elision"],
  },
  {
    slug: "move-semantics",
    term: "Move Semantics",
    aliases: ["ownership transfer"],
    category: "languages",
    phaseIds: ["7"],
    lessonIds: [],
    definitions: {
      beginner:
        "When you give a value to another variable in Rust, the original variable can't use it anymore — the value has 'moved' to its new home.",
      intermediate:
        "Rust's default for non-Copy types: assigning a value to a new binding transfers ownership and invalidates the original. This eliminates double-free bugs and makes resource management deterministic without a garbage collector.",
      advanced:
        "A compile-time ownership transfer that is semantically a memcpy of the representation plus invalidation of the source binding. The destructor (Drop) runs exactly once for the new owner. Move semantics interact with the affine type system — values are used at most once unless they implement Copy.",
    },
    seeAlso: ["borrow-checker", "copy-trait"],
  },
  {
    slug: "copy-trait",
    term: "Copy Trait",
    aliases: ["Copy"],
    category: "languages",
    phaseIds: ["7"],
    lessonIds: [],
    definitions: {
      beginner:
        "A marker in Rust that says 'this type is simple enough to just duplicate' — like numbers and booleans, which are cheap to copy.",
      intermediate:
        "A trait that opts a type into bitwise copy on assignment instead of move. Only types whose data is entirely on the stack (no heap allocation, no Drop impl) can implement Copy. Requires Clone as a supertrait.",
      advanced:
        "A marker trait (lang item) signaling the compiler that assignment performs an implicit memcpy rather than a move. Copy is incompatible with Drop — a type cannot have custom destruction logic and implicit duplication. The orphan rule and coherence ensure Copy is implemented only where semantically sound.",
    },
    seeAlso: ["move-semantics"],
  },
  {
    slug: "option-type",
    term: "Option Type",
    aliases: ["Option<T>", "Maybe"],
    category: "languages",
    phaseIds: ["7"],
    lessonIds: [],
    definitions: {
      beginner:
        "Rust's way of saying 'this value might not exist.' Instead of null, you get either Some(value) or None, and you must handle both cases.",
      intermediate:
        "An enum with two variants: Some(T) and None. Forces explicit handling of absent values at compile time, eliminating null pointer exceptions. Provides combinators like map, and_then, and unwrap_or for ergonomic chaining.",
      advanced:
        "A sum type (tagged union) isomorphic to Haskell's Maybe functor. The compiler applies niche optimization — Option<&T> is pointer-sized since null is an unused bit pattern for references. Monadic interface via and_then enables railway-oriented error handling.",
    },
    seeAlso: ["result-type", "pattern-matching-rust"],
  },
  {
    slug: "result-type",
    term: "Result Type",
    aliases: ["Result<T, E>"],
    category: "languages",
    phaseIds: ["7"],
    lessonIds: [],
    definitions: {
      beginner:
        "Rust's way of handling errors — a function returns either Ok(value) if it worked or Err(error) if something went wrong, and you have to deal with both.",
      intermediate:
        "An enum with variants Ok(T) and Err(E) that represents a computation that may fail. The ? operator provides syntactic sugar for early-return on error, and combinators like map_err and and_then enable chaining.",
      advanced:
        "A sum type encoding fallible computation, forming a monad over the success type. The ? operator desugars to a From-converting early return, enabling ergonomic error propagation across abstraction boundaries. Error trait objects (Box<dyn Error>) or crates like thiserror/anyhow provide flexible error hierarchies.",
    },
    seeAlso: ["option-type", "pattern-matching-rust"],
  },
  {
    slug: "pattern-matching-rust",
    term: "Pattern Matching (Rust)",
    aliases: ["match expression"],
    category: "languages",
    phaseIds: ["7"],
    lessonIds: [],
    definitions: {
      beginner:
        "A powerful 'switch' that can look inside data structures — you write patterns for each possible shape of data, and Rust checks that you covered every case.",
      intermediate:
        "Rust's match expression destructures enums, tuples, structs, and references. The compiler enforces exhaustiveness — every possible variant must be handled. Supports guards, bindings, and nested patterns.",
      advanced:
        "Compiled to efficient decision trees or jump tables. Exhaustiveness checking is a type-level guarantee derived from the algebraic structure of the matched type. Integrates with the borrow checker: match arms can bind by-value, by-ref, or by-mut-ref, each with distinct ownership implications.",
    },
    seeAlso: ["option-type", "result-type"],
  },
  {
    slug: "lifetime-elision",
    term: "Lifetime Elision",
    aliases: ["elided lifetimes"],
    category: "languages",
    phaseIds: ["7"],
    lessonIds: [],
    definitions: {
      beginner:
        "Rust's shortcut that lets you skip writing lifetime markers in common cases — the compiler figures out the right lifetimes for you based on simple rules.",
      intermediate:
        "A set of compiler rules that automatically assign lifetime parameters to function signatures when they follow common patterns: single input lifetime flows to output, &self lifetime flows to output, etc. Reduces annotation noise without sacrificing safety.",
      advanced:
        "Three deterministic rules applied during HIR lowering: (1) each input reference gets a distinct lifetime, (2) if exactly one input lifetime exists it applies to all outputs, (3) if &self or &mut self exists its lifetime applies to all outputs. Failure to resolve triggers an explicit-annotation requirement.",
    },
    seeAlso: ["borrow-checker"],
  },
  {
    slug: "zero-cost-abstraction",
    term: "Zero-Cost Abstraction",
    aliases: [],
    category: "languages",
    phaseIds: ["7"],
    lessonIds: [],
    definitions: {
      beginner:
        "Rust's promise that high-level features like iterators and generics don't slow your program down — they compile to code just as fast as writing everything by hand.",
      intermediate:
        "The principle that abstractions (generics, traits, iterators) compile down to the same machine code you'd write manually. Achieved through monomorphization (generating specialized code for each concrete type) and aggressive inlining.",
      advanced:
        "Bjarne Stroustrup's principle realized via LLVM's optimization pipeline: monomorphized generic instantiations undergo inlining, SROA, and loop vectorization, producing code equivalent to hand-specialized implementations. Trait objects (dyn Trait) are the explicit opt-in to runtime dispatch when dynamic polymorphism is needed.",
    },
    seeAlso: ["copy-trait", "borrow-checker"],
  },

  // ── Performance (6) ────────────────────────────────────────

  {
    slug: "cpu-profiling",
    term: "CPU Profiling",
    aliases: ["profiling", "performance profiling"],
    category: "performance",
    phaseIds: ["6"],
    lessonIds: [],
    definitions: {
      beginner:
        "A technique for finding out which parts of your program are using the most processing time — like timing every step of a recipe to find the bottleneck.",
      intermediate:
        "Measuring where a program spends CPU time using sampling (periodic stack snapshots) or instrumentation (injecting timing code). Tools include Chrome DevTools, perf, and flamegraph visualizations.",
      advanced:
        "Statistical sampling profilers interrupt at fixed intervals to capture instruction pointers and unwind call stacks, yielding asymptotically accurate hot-path identification with low overhead (~2-5%). Instrumentation profilers provide exact counts but introduce observer effects. Hardware performance counters (PMU) enable cycle-accurate attribution.",
    },
    seeAlso: ["heap-snapshot", "memory-leak"],
  },
  {
    slug: "heap-snapshot",
    term: "Heap Snapshot",
    aliases: ["memory snapshot"],
    category: "performance",
    phaseIds: ["6"],
    lessonIds: [],
    definitions: {
      beginner:
        "A photograph of everything stored in your program's memory at one moment — used to find objects that are hanging around when they shouldn't be.",
      intermediate:
        "A serialized dump of all objects on the heap, including their sizes, types, and reference chains. Comparing two snapshots reveals retained objects and potential memory leaks. Available in Chrome DevTools and Node.js --inspect.",
      advanced:
        "A complete graph serialization of managed-heap objects including retainer paths from GC roots. Dominator tree analysis identifies objects whose removal would free the most memory. Allocation timeline sampling correlates heap growth with specific call sites.",
    },
    seeAlso: ["memory-leak", "cpu-profiling"],
  },
  {
    slug: "memory-leak",
    term: "Memory Leak",
    aliases: [],
    category: "performance",
    phaseIds: ["6"],
    lessonIds: [],
    definitions: {
      beginner:
        "When a program holds onto memory it no longer needs, slowly using more and more until things get sluggish or crash — like never throwing away old papers on your desk.",
      intermediate:
        "A condition where allocated memory is never freed because references to it still exist even though the data is no longer needed. Common causes include forgotten event listeners, closures capturing large scopes, and detached DOM nodes.",
      advanced:
        "Unreachable-from-application-logic but reachable-from-GC-roots memory, preventing garbage collection. In JavaScript: common sources are Map/Set entries with object keys, uncleared setInterval callbacks, and closure-captured outer scopes. WeakRef and FinalizationRegistry provide leak-mitigation primitives.",
    },
    seeAlso: ["heap-snapshot", "cpu-profiling"],
  },
  {
    slug: "request-animation-frame",
    term: "requestAnimationFrame",
    aliases: ["rAF"],
    category: "performance",
    phaseIds: ["6"],
    lessonIds: [],
    definitions: {
      beginner:
        "A browser function that says 'run this code right before the next screen repaint' — the best way to make smooth, 60fps animations.",
      intermediate:
        "A browser API that schedules a callback before the next repaint, syncing visual updates with the display's refresh rate (typically 60Hz). More efficient than setTimeout for animations because it pauses when the tab is hidden and batches with layout/paint.",
      advanced:
        "Hooks into the browser's rendering pipeline after microtask draining and before style recalculation/layout/paint. Callbacks receive a high-resolution DOMHighResTimeStamp. Multiple rAF callbacks within one frame execute sequentially. Critical for jank-free animation: amortizes work across frames and avoids forced synchronous layouts.",
    },
    seeAlso: ["data-locality"],
  },
  {
    slug: "data-locality",
    term: "Data Locality",
    aliases: ["cache-friendly layout", "data-oriented design"],
    category: "performance",
    phaseIds: ["7"],
    lessonIds: [],
    definitions: {
      beginner:
        "Arranging your data so the things you use together are stored next to each other in memory — like keeping all your cooking ingredients on the same shelf.",
      intermediate:
        "A design principle that organizes data in memory to maximize CPU cache hits. Arrays of structs (AoS) vs. structs of arrays (SoA) is a classic trade-off. Poor locality causes cache misses that can slow code by 10–100x.",
      advanced:
        "Optimizing spatial and temporal cache locality by aligning access patterns with cache-line granularity (typically 64 bytes). SoA layouts improve SIMD vectorization; ECS architectures in game engines exploit this. Prefetch instructions and cache-oblivious algorithms further reduce stalls.",
    },
    seeAlso: ["cpu-profiling"],
  },
  {
    slug: "work-stealing",
    term: "Work Stealing",
    aliases: ["work-stealing scheduler"],
    category: "performance",
    phaseIds: ["7"],
    lessonIds: [],
    definitions: {
      beginner:
        "A way for computer threads to share work fairly — when one thread runs out of tasks, it 'steals' a task from a busy thread's queue.",
      intermediate:
        "A scheduling strategy where each worker thread has its own task deque. Idle workers steal tasks from the tail of busy workers' deques. Used by Tokio, Rayon, Go's goroutine scheduler, and Java's ForkJoinPool.",
      advanced:
        "A randomized load-balancing algorithm (Blumofe & Leiserson, 1999) with provably O(T₁/P + T∞) expected completion time for P processors. Local access is LIFO (cache-warm), steals are FIFO (coarse-grained). Chase-Lev deques provide lock-free local push/pop with CAS-based steal.",
    },
    seeAlso: ["data-locality"],
  },

  // ── Testing (8) ────────────────────────────────────────────

  {
    slug: "test-pyramid",
    term: "Test Pyramid",
    aliases: ["testing pyramid"],
    category: "testing",
    phaseIds: ["5"],
    lessonIds: [],
    definitions: {
      beginner:
        "A guideline saying you should have lots of small unit tests, fewer integration tests, and even fewer end-to-end tests — shaped like a pyramid.",
      intermediate:
        "A testing strategy model where unit tests form the wide base (fast, cheap, numerous), integration tests the middle layer, and E2E tests the narrow top (slow, expensive, few). Promotes fast feedback and maintainable test suites.",
      advanced:
        "Mike Cohn's heuristic for test portfolio allocation, balancing defect detection probability against execution cost and maintenance burden. Modern refinements include the testing trophy (Kent C. Dodds) emphasizing integration tests, and the testing honeycomb for microservices.",
    },
    seeAlso: ["integration-test-deep", "e2e-test-deep"],
  },
  {
    slug: "integration-test-deep",
    term: "Integration Test",
    aliases: ["integration testing"],
    category: "testing",
    phaseIds: ["5"],
    lessonIds: [],
    definitions: {
      beginner:
        "A test that checks whether multiple parts of your application work correctly together — like testing that a form submission actually saves to the database.",
      intermediate:
        "Tests that verify the interaction between two or more modules, services, or layers (e.g., API route + database, component + state store). Typically use real dependencies or realistic fakes rather than mocks.",
      advanced:
        "Tests operating at module boundaries that validate contract adherence between collaborating components. Strategies range from narrow (one integration point with fakes) to broad (full subsystem with real I/O). Contract testing (Pact) formalizes inter-service integration verification.",
    },
    seeAlso: ["test-pyramid", "e2e-test-deep", "test-double"],
  },
  {
    slug: "e2e-test-deep",
    term: "End-to-End Test",
    aliases: ["E2E test", "system test"],
    category: "testing",
    phaseIds: ["5"],
    lessonIds: [],
    definitions: {
      beginner:
        "A test that uses your application the way a real user would — clicking buttons, filling out forms, and checking what shows up on screen.",
      intermediate:
        "Tests that exercise the full application stack through the UI, verifying complete user workflows. Tools like Playwright and Cypress automate browser interactions. Slower and more brittle than unit tests but catch integration gaps.",
      advanced:
        "Full-stack functional tests executing against a deployed or containerized environment. Best practices include deterministic test data (factory/seed), parallel execution with isolated state, and visual regression via screenshot comparison. Flakiness mitigation: retry strategies, network-idle waits, and hermetic environments.",
    },
    seeAlso: ["test-pyramid", "integration-test-deep"],
  },
  {
    slug: "test-double",
    term: "Test Double",
    aliases: ["fake", "stub", "dummy"],
    category: "testing",
    phaseIds: ["5"],
    lessonIds: [],
    definitions: {
      beginner:
        "A stand-in for a real piece of code during testing — like using a cardboard cutout instead of the real actor for blocking a scene.",
      intermediate:
        "An umbrella term (from Gerard Meszaros) for objects that replace real dependencies in tests. Subtypes: dummies (unused placeholders), stubs (canned answers), spies (record calls), mocks (verify behavior), and fakes (working simplified implementations).",
      advanced:
        "Categorized by verification style: state-based (stubs/fakes inspected after exercise) vs. interaction-based (mocks/spies asserting on collaborator calls). Over-mocking couples tests to implementation; prefer fakes and contract tests for stable, refactor-resilient test suites.",
    },
    seeAlso: ["mock-object", "test-fixture"],
  },
  {
    slug: "mock-object",
    term: "Mock Object",
    aliases: ["mock", "spy"],
    category: "testing",
    phaseIds: ["5"],
    lessonIds: [],
    definitions: {
      beginner:
        "A pretend version of a real object that records how it was used — so your test can check 'did we call the payment service exactly once?'",
      intermediate:
        "A test double that is pre-programmed with expectations. After the test runs, the mock verifies that expected methods were called with expected arguments. Frameworks like Jest, Vitest, and Mockito provide automatic mock generation.",
      advanced:
        "Interaction-testing instruments that assert on method invocation sequences, arguments, and cardinality. Mockist (London school) TDD uses mocks extensively to drive design via outside-in development. Critics (classicist/Detroit school) argue mocks over-specify, preferring stubs with state verification.",
    },
    seeAlso: ["test-double", "test-fixture"],
  },
  {
    slug: "test-fixture",
    term: "Test Fixture",
    aliases: ["setup", "test context"],
    category: "testing",
    phaseIds: ["5"],
    lessonIds: [],
    definitions: {
      beginner:
        "The setup work that gets your test environment ready — like putting the right ingredients on the counter before you start cooking.",
      intermediate:
        "The fixed state or data that a test runs against. Includes database seeds, configuration, and object initialization performed in beforeEach/setUp methods. Good fixtures are minimal, self-contained, and readable.",
      advanced:
        "Precondition state established via the Arrange phase of Arrange-Act-Assert. Shared fixtures (beforeAll) improve speed but introduce coupling and ordering risks. Object Mother and Builder patterns generate complex fixtures declaratively. Fixture pollution is a common source of flaky tests.",
    },
    seeAlso: ["test-double", "mock-object"],
  },
  {
    slug: "snapshot-testing",
    term: "Snapshot Testing",
    aliases: ["snapshot test"],
    category: "testing",
    phaseIds: ["5"],
    lessonIds: [],
    definitions: {
      beginner:
        "A test that saves what your code's output looks like and alerts you if it changes — like taking a photo and comparing it later to spot differences.",
      intermediate:
        "A testing technique that serializes component output (HTML, JSON, or rendered pixels) and compares against a stored reference file. Useful for detecting unexpected UI regressions. Tests are updated with a single command when changes are intentional.",
      advanced:
        "Serialization-based regression detection with trade-offs: low authoring cost but high noise when snapshots are large or volatile. Best practices include inline snapshots for small outputs, focused component snapshots, and mandatory human review of snapshot updates in PRs to prevent rubber-stamping.",
    },
    seeAlso: ["e2e-test-deep", "test-pyramid"],
  },
  {
    slug: "property-based-testing",
    term: "Property-Based Testing",
    aliases: ["PBT", "generative testing", "QuickCheck"],
    category: "testing",
    phaseIds: ["5"],
    lessonIds: [],
    definitions: {
      beginner:
        "Instead of testing specific examples, you describe rules your code should always follow, and the tool generates hundreds of random inputs to try to break those rules.",
      intermediate:
        "A testing approach where you define invariants (properties) that must hold for all valid inputs, and a framework generates random inputs to find counterexamples. Automatically shrinks failing cases to minimal reproductions. Libraries include fast-check (JS), Hypothesis (Python), and QuickCheck (Haskell).",
      advanced:
        "Derived from Claessen & Hughes' QuickCheck (2000). Generators produce values from a type's domain; shrinkers minimize counterexamples via binary search on the input space. Stateful property testing models system transitions as a state machine and verifies postconditions across random command sequences.",
    },
    seeAlso: ["test-pyramid", "integration-test-deep"],
  },

  // ── CI/CD (8) ──────────────────────────────────────────────

  {
    slug: "github-actions",
    term: "GitHub Actions",
    aliases: ["GHA"],
    category: "devops",
    phaseIds: ["6"],
    lessonIds: [],
    definitions: {
      beginner:
        "GitHub's built-in tool for automating tasks — it can run your tests, check your code, and deploy your app every time you push changes.",
      intermediate:
        "A CI/CD platform integrated into GitHub that executes workflows defined in YAML files under .github/workflows/. Workflows are triggered by events (push, PR, schedule) and run jobs on hosted or self-hosted runners.",
      advanced:
        "An event-driven workflow orchestration platform with a marketplace of reusable actions. Jobs run in isolated VMs or containers; matrix strategies enable parallel testing across OS/runtime combinations. Caching (actions/cache), artifacts, and composite actions reduce execution time and duplication.",
    },
    seeAlso: ["workflow-yaml", "matrix-build"],
  },
  {
    slug: "workflow-yaml",
    term: "Workflow YAML",
    aliases: ["CI config", "pipeline config"],
    category: "devops",
    phaseIds: ["6"],
    lessonIds: [],
    definitions: {
      beginner:
        "A text file that tells your CI system what to do — like a to-do list for the automated build: install, test, deploy.",
      intermediate:
        "A declarative YAML file defining CI/CD pipeline steps. In GitHub Actions, it specifies triggers (on), jobs, steps, environment variables, and matrix configurations. Lives in .github/workflows/ and is version-controlled alongside code.",
      advanced:
        "A directed acyclic graph of jobs with dependency edges (needs), each job comprising ordered steps running in a shared workspace. Advanced features include reusable workflows (workflow_call), dynamic matrices via fromJSON, concurrency groups for deployment serialization, and OIDC-based keyless authentication to cloud providers.",
    },
    seeAlso: ["github-actions", "matrix-build"],
  },
  {
    slug: "matrix-build",
    term: "Matrix Build",
    aliases: ["build matrix", "matrix strategy"],
    category: "devops",
    phaseIds: ["6"],
    lessonIds: [],
    definitions: {
      beginner:
        "Running the same tests on multiple configurations at once — like checking your website works in Chrome, Firefox, and Safari all in parallel.",
      intermediate:
        "A CI feature that generates multiple job instances from combinations of variables (OS, language version, dependency set). Catches compatibility issues early. Supports include/exclude rules to customize the matrix.",
      advanced:
        "Cartesian product expansion of parameterized job definitions, enabling combinatorial coverage. Fail-fast (default in GHA) aborts remaining jobs on first failure; fail-slow captures all failures. Dynamic matrices generated from prior job outputs enable data-driven pipeline topology.",
    },
    seeAlso: ["github-actions", "workflow-yaml"],
  },
  {
    slug: "rolling-deployment",
    term: "Rolling Deployment",
    aliases: ["rolling update"],
    category: "devops",
    phaseIds: ["6"],
    lessonIds: [],
    definitions: {
      beginner:
        "Updating your application one server at a time instead of all at once — so users always have some working servers available during the update.",
      intermediate:
        "A deployment strategy that incrementally replaces instances of the old version with the new one. Combined with health checks and readiness probes, it ensures zero-downtime deployments. Kubernetes uses this as the default deployment strategy.",
      advanced:
        "A progressive rollout strategy governed by maxUnavailable and maxSurge parameters. Requires backward-compatible changes (database migrations, API contracts) since old and new versions coexist during the rollout window. Rollback is triggered by failed readiness/liveness probes or external health checks.",
    },
    seeAlso: ["feature-flag-deep", "infrastructure-as-code-deep"],
  },
  {
    slug: "feature-flag-deep",
    term: "Feature Flag",
    aliases: ["feature toggle", "feature switch"],
    category: "devops",
    phaseIds: ["6"],
    lessonIds: [],
    definitions: {
      beginner:
        "An on/off switch in your code that lets you show new features to some users but not others — without deploying new code.",
      intermediate:
        "A runtime configuration mechanism that decouples deployment from release. Flags can target user segments, enable gradual rollouts (canary), and serve as kill switches. Managed via services like LaunchDarkly, Unleash, or simple environment variables.",
      advanced:
        "Categorized by longevity: release flags (short-lived), experiment flags (A/B tests), ops flags (circuit breakers), and permission flags (entitlements). Technical debt accumulates from stale flags; hygiene requires expiry dates and automated cleanup. Evaluation must be fast (cached, edge-computed) and consistent (sticky bucketing).",
    },
    seeAlso: ["rolling-deployment"],
  },
  {
    slug: "infrastructure-as-code-deep",
    term: "Infrastructure as Code",
    aliases: ["IaC"],
    category: "devops",
    phaseIds: ["6"],
    lessonIds: [],
    definitions: {
      beginner:
        "Defining your servers, databases, and networks in code files instead of clicking through dashboards — so infrastructure is repeatable and version-controlled.",
      intermediate:
        "Managing infrastructure through declarative configuration files (Terraform, Pulumi, CloudFormation) rather than manual processes. Enables version control, code review, and automated provisioning of cloud resources.",
      advanced:
        "Declarative (Terraform HCL, CloudFormation) or imperative (Pulumi, CDK) specification of infrastructure state, reconciled by a control plane. State management, drift detection, and plan/apply workflows ensure convergence. GitOps extends IaC by using Git as the single source of truth with reconciliation loops (ArgoCD, Flux).",
    },
    seeAlso: ["github-actions", "container-registry"],
  },
  {
    slug: "container-registry",
    term: "Container Registry",
    aliases: ["Docker registry", "OCI registry"],
    category: "devops",
    phaseIds: ["6"],
    lessonIds: [],
    definitions: {
      beginner:
        "A storage service for container images — like an app store for Docker images, where you push your built images and pull them for deployment.",
      intermediate:
        "A service that stores and distributes container (Docker/OCI) images. Examples include Docker Hub, GitHub Container Registry (ghcr.io), and cloud-native registries (ECR, GCR, ACR). Images are tagged and pulled by deployment pipelines.",
      advanced:
        "An OCI Distribution Spec–compliant service storing image manifests and content-addressable blob layers. Features include vulnerability scanning, image signing (cosign/Notary), immutable tags, and geo-replication. Multi-architecture manifests (manifest lists) support cross-platform images.",
    },
    seeAlso: ["artifact-repository", "infrastructure-as-code-deep"],
  },
  {
    slug: "artifact-repository",
    term: "Artifact Repository",
    aliases: ["artifact store", "binary repository"],
    category: "devops",
    phaseIds: ["6"],
    lessonIds: [],
    definitions: {
      beginner:
        "A central storage for all the files your build process creates — compiled code, packages, and documentation — so teams can reliably share and deploy them.",
      intermediate:
        "A versioned store for build outputs (JARs, npm packages, binaries, Docker images). Tools include Artifactory, Nexus, and GitHub Packages. Provides dependency caching, access control, and promotion workflows between environments.",
      advanced:
        "A universal binary management system supporting multiple package formats (Maven, npm, PyPI, OCI). Immutable releases with cryptographic checksums ensure supply chain integrity. Promotion pipelines (dev → staging → prod) model the artifact lifecycle with metadata-driven policies.",
    },
    seeAlso: ["container-registry", "github-actions"],
  },

  // ── Architecture (8) ───────────────────────────────────────

  {
    slug: "dependency-inversion",
    term: "Dependency Inversion Principle",
    aliases: ["DIP"],
    category: "architecture",
    phaseIds: ["6"],
    lessonIds: [],
    definitions: {
      beginner:
        "High-level code shouldn't depend on low-level details — instead, both should depend on shared agreements (interfaces). This makes swapping parts easy.",
      intermediate:
        "The D in SOLID: high-level modules should not depend on low-level modules; both should depend on abstractions. Abstractions should not depend on details; details should depend on abstractions. Enables testability and flexibility.",
      advanced:
        "A design principle (Martin, 1996) inverting the traditional source-code dependency direction so that compile-time dependencies point toward domain policy rather than infrastructure. Realized via interface segregation, constructor injection, and composition roots. Foundation of hexagonal/ports-and-adapters architecture.",
    },
    seeAlso: ["factory-pattern", "strategy-pattern", "single-responsibility"],
  },
  {
    slug: "factory-pattern",
    term: "Factory Pattern",
    aliases: ["factory method", "abstract factory"],
    category: "architecture",
    phaseIds: ["6"],
    lessonIds: [],
    definitions: {
      beginner:
        "A pattern where instead of creating objects directly with 'new', you ask a special function to create them for you — letting you change what gets created without changing the code that asks for it.",
      intermediate:
        "A creational design pattern that encapsulates object construction behind an interface. Factory Method lets subclasses override creation; Abstract Factory groups related factories. Decouples client code from concrete implementations.",
      advanced:
        "GoF creational patterns (Factory Method, Abstract Factory) that apply the dependency inversion principle to object instantiation. In modern TypeScript/functional code, often simplified to factory functions or provider patterns. Enables runtime polymorphism of product families without conditional logic in clients.",
    },
    seeAlso: ["dependency-inversion", "strategy-pattern"],
  },
  {
    slug: "strategy-pattern",
    term: "Strategy Pattern",
    aliases: ["policy pattern"],
    category: "architecture",
    phaseIds: ["6"],
    lessonIds: [],
    definitions: {
      beginner:
        "A way to let code choose between different approaches at runtime — like picking between different shipping methods when placing an order.",
      intermediate:
        "A behavioral design pattern that defines a family of interchangeable algorithms behind a common interface. The client selects the strategy at runtime without conditional branching. In functional languages, a strategy is simply a higher-order function parameter.",
      advanced:
        "GoF behavioral pattern encapsulating algorithm variants as first-class objects. Eliminates conditional complexity (replace switch with polymorphism). In TypeScript, often expressed as discriminated unions or function records. Composable with decorator for layered behaviors.",
    },
    seeAlso: ["observer-pattern", "decorator-pattern"],
  },
  {
    slug: "observer-pattern",
    term: "Observer Pattern",
    aliases: ["pub-sub", "publish-subscribe"],
    category: "architecture",
    phaseIds: ["6"],
    lessonIds: [],
    definitions: {
      beginner:
        "A setup where one object announces changes and other objects automatically hear about them — like subscribing to a YouTube channel and getting notified of new videos.",
      intermediate:
        "A behavioral pattern where a subject maintains a list of observers and notifies them of state changes. Decouples the event source from its consumers. DOM events, EventEmitter, and React state subscriptions are all observer implementations.",
      advanced:
        "GoF behavioral pattern formalizing the inversion of control for event propagation. Push vs. pull variants trade bandwidth against coupling. Reactive extensions (RxJS, Signals) generalize the pattern into composable, backpressure-aware observable streams. Memory management requires explicit unsubscription to prevent leaks.",
    },
    seeAlso: ["strategy-pattern", "decorator-pattern"],
  },
  {
    slug: "decorator-pattern",
    term: "Decorator Pattern",
    aliases: ["wrapper pattern"],
    category: "architecture",
    phaseIds: ["6"],
    lessonIds: [],
    definitions: {
      beginner:
        "Wrapping an object with extra behavior — like adding sprinkles to ice cream. The original object stays the same; the wrapper adds something on top.",
      intermediate:
        "A structural design pattern that attaches new behavior to an object by placing it inside a wrapper that implements the same interface. Enables composition over inheritance and is stackable (logging + caching + retry).",
      advanced:
        "GoF structural pattern providing open-closed extension via object composition. Each decorator holds a reference to the component interface, forwarding calls and adding cross-cutting concerns. In TypeScript/JS, higher-order functions and middleware chains (Express, Koa) are the idiomatic realization.",
    },
    seeAlso: ["strategy-pattern", "observer-pattern"],
  },
  {
    slug: "bounded-context",
    term: "Bounded Context",
    aliases: [],
    category: "architecture",
    phaseIds: ["8"],
    lessonIds: [],
    definitions: {
      beginner:
        "A clear boundary around a part of your system where specific terms and rules apply — like how 'account' means something different in banking vs. social media.",
      intermediate:
        "A Domain-Driven Design concept that defines the boundary within which a particular domain model is consistent and applicable. Different bounded contexts can use the same terms with different meanings. Context maps define relationships between them.",
      advanced:
        "The central DDD strategic pattern (Evans, 2003) delineating linguistic and model boundaries. Integration patterns between contexts include shared kernel, anticorruption layer, open host service, and published language. Aligns naturally with microservice boundaries and team topologies (Conway's Law).",
    },
    seeAlso: ["aggregate-root", "ubiquitous-language"],
  },
  {
    slug: "aggregate-root",
    term: "Aggregate Root",
    aliases: ["aggregate"],
    category: "architecture",
    phaseIds: ["8"],
    lessonIds: [],
    definitions: {
      beginner:
        "The main object in a group of related objects that controls all access — like a team captain who speaks for the whole team.",
      intermediate:
        "A DDD tactical pattern where a cluster of related entities and value objects is treated as a single unit for data changes. External code can only reference the root entity, which enforces all invariants for the group.",
      advanced:
        "A consistency boundary within a bounded context: all mutations go through the root, which enforces domain invariants transactionally. Aggregates are the unit of persistence and concurrency (optimistic locking on aggregate version). Inter-aggregate communication uses domain events for eventual consistency.",
    },
    seeAlso: ["bounded-context", "ubiquitous-language"],
  },
  {
    slug: "ubiquitous-language",
    term: "Ubiquitous Language",
    aliases: [],
    category: "architecture",
    phaseIds: ["8"],
    lessonIds: [],
    definitions: {
      beginner:
        "A shared vocabulary between developers and business people — everyone uses the same words for the same things, so nothing gets lost in translation.",
      intermediate:
        "A DDD practice where the team develops a common language rooted in the domain model, used consistently in code, documentation, and conversation. If a term is ambiguous, the model needs refining.",
      advanced:
        "The linguistic foundation of DDD: a rigorous, evolving glossary binding model, code, and discourse within a bounded context. Terms must be precise enough to generate unambiguous code. Language divergence between contexts is expected and healthy — anticorruption layers translate at boundaries.",
    },
    seeAlso: ["bounded-context", "aggregate-root"],
  },

  // ── Security (8) ───────────────────────────────────────────

  {
    slug: "content-security-policy",
    term: "Content Security Policy",
    aliases: ["CSP"],
    category: "security",
    phaseIds: ["6"],
    lessonIds: [],
    definitions: {
      beginner:
        "A set of rules you give the browser that say which scripts, images, and styles are allowed to load on your page — blocking anything suspicious.",
      intermediate:
        "An HTTP header (Content-Security-Policy) that whitelists allowed sources for scripts, styles, images, fonts, and other resources. Mitigates XSS by preventing inline scripts and unauthorized external resources. Supports report-uri for violation monitoring.",
      advanced:
        "A defense-in-depth mechanism against injection attacks. Strict CSP uses nonce-based or hash-based script-src directives rather than domain allowlists. Trusted Types extend CSP to prevent DOM XSS by requiring typed objects for dangerous sinks. Report-only mode enables gradual rollout without breaking functionality.",
    },
    seeAlso: ["same-origin-policy", "cors-deep"],
  },
  {
    slug: "same-origin-policy",
    term: "Same-Origin Policy",
    aliases: ["SOP"],
    category: "security",
    phaseIds: ["6"],
    lessonIds: [],
    definitions: {
      beginner:
        "A browser rule that says a web page can only read data from the same website it came from — preventing one site from snooping on another.",
      intermediate:
        "A fundamental browser security mechanism that restricts how scripts from one origin (scheme + host + port) can interact with resources from another. Prevents malicious sites from reading sensitive data via fetch or DOM access.",
      advanced:
        "The cornerstone web security policy isolating origins at the process level (Site Isolation). Governs DOM access, XMLHttpRequest/fetch, cookies (with path/domain scoping), and storage APIs. Relaxation mechanisms include CORS, postMessage, document.domain (deprecated), and JSONP (legacy). Spectre mitigations add cross-origin read blocking (CORB) and cross-origin isolation (COOP/COEP).",
    },
    seeAlso: ["content-security-policy", "cors-deep"],
  },
  {
    slug: "cors-deep",
    term: "Cross-Origin Resource Sharing",
    aliases: ["CORS"],
    category: "security",
    phaseIds: ["6"],
    lessonIds: [],
    definitions: {
      beginner:
        "A system that lets websites ask permission to use data from other websites — the server says 'yes, this origin is allowed' via special headers.",
      intermediate:
        "An HTTP header-based mechanism that relaxes the same-origin policy for specific origins. The server sets Access-Control-Allow-Origin and related headers. Preflight OPTIONS requests are sent for non-simple requests to check permissions first.",
      advanced:
        "A protocol layered on HTTP where preflight (OPTIONS) requests negotiate cross-origin access for non-simple methods/headers. Access-Control-Allow-Credentials enables cookie/auth forwarding but prohibits wildcard origins. Misconfigured CORS (reflecting arbitrary origins, exposing sensitive headers) is a common vulnerability vector.",
    },
    seeAlso: ["same-origin-policy", "content-security-policy"],
  },
  {
    slug: "session-management",
    term: "Session Management",
    aliases: ["session handling"],
    category: "security",
    phaseIds: ["6"],
    lessonIds: [],
    definitions: {
      beginner:
        "How a website remembers who you are between page loads — usually with a small token stored in your browser that says 'this is user #42.'",
      intermediate:
        "The practice of creating, maintaining, and destroying user sessions. Involves generating cryptographically random session IDs, storing them in secure HttpOnly cookies, setting expiration policies, and invalidating on logout.",
      advanced:
        "Encompasses token generation (CSPRNG, minimum 128-bit entropy), storage (server-side sessions vs. signed JWTs), transport (Secure; HttpOnly; SameSite cookie attributes), lifecycle (idle timeout, absolute timeout, rotation after privilege escalation), and revocation (token blacklists, short-lived tokens + refresh rotation).",
    },
    seeAlso: ["api-key-management"],
  },
  {
    slug: "api-key-management",
    term: "API Key Management",
    aliases: ["secret management"],
    category: "security",
    phaseIds: ["6"],
    lessonIds: [],
    definitions: {
      beginner:
        "Keeping your API passwords safe — storing them in secure places, rotating them regularly, and never putting them in your code.",
      intermediate:
        "Practices for securely generating, storing, rotating, and revoking API keys and secrets. Keys should be stored in environment variables or secret managers (Vault, AWS Secrets Manager), never in source code or logs.",
      advanced:
        "A lifecycle encompassing generation (CSPRNG, sufficient entropy), scoping (least privilege, per-service), storage (HSMs, sealed secret managers with audit logs), rotation (zero-downtime dual-key periods), transmission (TLS-only, never in URLs/query strings), and revocation (immediate propagation, grace periods for distributed caches).",
    },
    seeAlso: ["session-management"],
  },
  {
    slug: "dependency-scanning",
    term: "Dependency Scanning",
    aliases: ["SCA", "software composition analysis"],
    category: "security",
    phaseIds: ["6"],
    lessonIds: [],
    definitions: {
      beginner:
        "Automatically checking the libraries your project uses for known security problems — like recalling a car part that's found to be defective.",
      intermediate:
        "Automated analysis of project dependencies against vulnerability databases (CVE, GitHub Advisory). Tools like Dependabot, Snyk, and npm audit flag insecure versions and can auto-generate update PRs.",
      advanced:
        "Software Composition Analysis correlating dependency graphs (including transitive) against NVD/OSV/GHSA databases. Advanced tools perform reachability analysis to suppress false positives (vulnerable code path not actually invoked). SBOM generation (CycloneDX, SPDX) enables supply chain transparency and regulatory compliance.",
    },
    seeAlso: ["sast-tool", "penetration-testing"],
  },
  {
    slug: "sast-tool",
    term: "SAST Tool",
    aliases: ["static application security testing", "static analysis security"],
    category: "security",
    phaseIds: ["6"],
    lessonIds: [],
    definitions: {
      beginner:
        "A tool that reads your source code and looks for security mistakes before the program even runs — like a spell-checker for security bugs.",
      intermediate:
        "Static Application Security Testing analyzes source code or compiled artifacts for vulnerability patterns (SQL injection, XSS, path traversal) without executing the program. Tools include Semgrep, CodeQL, and SonarQube. Integrated into CI pipelines for shift-left security.",
      advanced:
        "Taint-tracking and data-flow analysis engines that model sources (user input), sinks (dangerous APIs), and sanitizers to identify injection vulnerabilities. CodeQL treats code as a database queryable via Datalog-like QL. False-positive rates require tuning; layering with DAST provides coverage completeness.",
    },
    seeAlso: ["dependency-scanning", "penetration-testing"],
  },
  {
    slug: "penetration-testing",
    term: "Penetration Testing",
    aliases: ["pen test", "pentesting", "ethical hacking"],
    category: "security",
    phaseIds: ["6"],
    lessonIds: [],
    definitions: {
      beginner:
        "Hiring someone to try to hack your application on purpose — to find and fix security holes before real attackers do.",
      intermediate:
        "A simulated attack on a system to identify exploitable vulnerabilities. Pen testers use techniques like reconnaissance, fuzzing, privilege escalation, and social engineering. Results are documented with severity ratings and remediation guidance.",
      advanced:
        "Methodological frameworks (OWASP Testing Guide, PTES, OSSTMM) guide scope definition, threat modeling, exploitation, post-exploitation, and reporting. Black-box, gray-box, and white-box engagements trade realism against coverage. Bug bounty programs provide continuous crowd-sourced pen testing with defined safe harbors.",
    },
    seeAlso: ["sast-tool", "dependency-scanning"],
  },

  // ── Code Quality (8) ───────────────────────────────────────

  {
    slug: "code-smell",
    term: "Code Smell",
    aliases: ["smell"],
    category: "quality",
    phaseIds: ["5"],
    lessonIds: [],
    definitions: {
      beginner:
        "A sign that something in your code might be wrong — not a bug exactly, but a pattern that usually leads to problems later, like a function that's way too long.",
      intermediate:
        "A surface indication of a deeper design problem. Common smells include long methods, large classes, feature envy, primitive obsession, and shotgun surgery. Identified by Martin Fowler's refactoring catalog as triggers for specific refactorings.",
      advanced:
        "Heuristic indicators (Fowler, 1999) of violated design principles that increase coupling, reduce cohesion, or impede comprehension. Automated detection via linters (SonarQube cognitive complexity, ESLint complexity rules) provides objective thresholds. Smells are symptoms, not diagnoses — the appropriate refactoring depends on domain context.",
    },
    seeAlso: ["extract-method", "single-responsibility"],
  },
  {
    slug: "extract-method",
    term: "Extract Method",
    aliases: ["extract function"],
    category: "quality",
    phaseIds: ["5"],
    lessonIds: [],
    definitions: {
      beginner:
        "Taking a chunk of code from a big function and putting it in its own smaller function with a clear name — making both easier to understand.",
      intermediate:
        "A refactoring technique that moves a code fragment into a new method whose name explains its purpose. Reduces method length, improves readability, and enables reuse. The most frequently applied refactoring in practice.",
      advanced:
        "Fowler's foundational refactoring, mechanically safe when preserving data flow (parameters for inputs, return for outputs) and side effects. Modern IDEs automate extraction with flow analysis. Tension with inlining: extract until each method operates at a single abstraction level (composed method pattern).",
    },
    seeAlso: ["code-smell", "single-responsibility"],
  },
  {
    slug: "single-responsibility",
    term: "Single Responsibility Principle",
    aliases: ["SRP"],
    category: "quality",
    phaseIds: ["5"],
    lessonIds: [],
    definitions: {
      beginner:
        "Every piece of code should do one thing and do it well — a function that validates AND saves AND sends an email is doing too much.",
      intermediate:
        "The S in SOLID: a module should have one, and only one, reason to change. 'Reason to change' maps to a stakeholder or business capability. Violations manifest as shotgun surgery and divergent change smells.",
      advanced:
        "Martin's formulation: 'A module should be responsible to one, and only one, actor.' This is about axis of change, not size. A class with multiple responsibilities couples unrelated change vectors, increasing fragility. Decomposition granularity is guided by the Common Closure Principle at the package level.",
    },
    seeAlso: ["dependency-inversion", "dry-principle", "code-smell"],
  },
  {
    slug: "dry-principle",
    term: "DRY Principle",
    aliases: ["Don't Repeat Yourself", "DRY"],
    category: "quality",
    phaseIds: ["5"],
    lessonIds: [],
    definitions: {
      beginner:
        "Don't write the same code in multiple places — if you need the same logic twice, put it in a shared function so changes only need to happen once.",
      intermediate:
        "Every piece of knowledge should have a single, authoritative representation in the system (Hunt & Thomas, 1999). Applies to code, data schemas, configuration, and documentation. Over-application leads to premature abstraction — duplication is better than the wrong abstraction.",
      advanced:
        "A knowledge-management principle, not merely code deduplication. Sandi Metz's corollary: 'duplication is far cheaper than the wrong abstraction.' The Rule of Three delays extraction until a pattern proves stable. WET (Write Everything Twice) is a pragmatic counterbalance in early development.",
    },
    seeAlso: ["yagni-principle", "single-responsibility", "extract-method"],
  },
  {
    slug: "yagni-principle",
    term: "YAGNI Principle",
    aliases: ["You Aren't Gonna Need It", "YAGNI"],
    category: "quality",
    phaseIds: ["5"],
    lessonIds: [],
    definitions: {
      beginner:
        "Don't build features you think you might need someday — build only what you need right now. You can always add more later.",
      intermediate:
        "An Extreme Programming principle that advises against implementing functionality until it's actually needed. Prevents speculative complexity that may never be used and increases maintenance burden.",
      advanced:
        "A cost-benefit heuristic: the expected value of premature implementation is negative because the cost of carrying unused code (complexity, maintenance, opportunity cost) exceeds the savings from having it ready when (if) needed. Complements SOLID's open-closed principle — design for extension, but implement only what's required.",
    },
    seeAlso: ["dry-principle", "technical-debt-deep"],
  },
  {
    slug: "technical-debt-deep",
    term: "Technical Debt",
    aliases: ["tech debt"],
    category: "quality",
    phaseIds: ["5"],
    lessonIds: [],
    definitions: {
      beginner:
        "Shortcuts in your code that save time now but create more work later — like not cleaning your room: it's fine today, but eventually you can't find anything.",
      intermediate:
        "The implied cost of future rework caused by choosing a quick-and-easy solution over a better but more time-consuming approach. Managed by tracking debt items, paying them down in regular refactoring cycles, and preventing new debt via code review and standards.",
      advanced:
        "Cunningham's metaphor (1992) for the delta between the current codebase and the ideal state relative to current understanding. The technical debt quadrant (Fowler) classifies debt as reckless/prudent × deliberate/inadvertent. Interest compounds via increased change cost and defect rate; principal is the refactoring effort to resolve it.",
    },
    seeAlso: ["code-smell", "yagni-principle"],
  },
  {
    slug: "pull-request",
    term: "Pull Request",
    aliases: ["PR", "merge request", "MR"],
    category: "quality",
    phaseIds: ["5"],
    lessonIds: [],
    definitions: {
      beginner:
        "A way to propose code changes to a project — you submit your changes for others to review, discuss, and approve before they become part of the main codebase.",
      intermediate:
        "A collaboration mechanism in Git platforms (GitHub, GitLab) where a developer requests that changes from one branch be merged into another. Enables code review, CI checks, and discussion. Small, focused PRs merge faster and produce better feedback.",
      advanced:
        "A code review and integration workflow artifact. Best practices: atomic PRs (single concern), descriptive summaries with context, linked issues, CI gatekeeping (status checks), CODEOWNERS for routing, and stacked PRs for large features. Review quality correlates with defect reduction (Microsoft Research studies).",
    },
    seeAlso: ["conventional-commits"],
  },
  {
    slug: "conventional-commits",
    term: "Conventional Commits",
    aliases: ["commit convention", "semantic commits"],
    category: "quality",
    phaseIds: ["5"],
    lessonIds: [],
    definitions: {
      beginner:
        "A simple format for commit messages — like 'feat: add login page' or 'fix: correct typo' — that makes it easy to understand what each change does.",
      intermediate:
        "A commit message specification (type(scope): description) that enables automated changelog generation and semantic versioning. Common types: feat, fix, docs, refactor, test, chore. Breaking changes are signaled with '!' or a BREAKING CHANGE footer.",
      advanced:
        "A lightweight structured metadata format compatible with SemVer automation: feat → minor bump, fix → patch bump, BREAKING CHANGE → major bump. Enforced via commitlint + Husky pre-commit hooks. Enables tools like semantic-release, release-please, and conventional-changelog to fully automate release workflows.",
    },
    seeAlso: ["pull-request"],
  },
];
