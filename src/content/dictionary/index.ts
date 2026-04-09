import type { DictionaryTerm } from "@/types/dictionary";

/**
 * Seed dictionary. Real content lives here as the curriculum is written.
 * Each term gets its own indexed URL: /dictionary/{slug}.
 */
export const DICTIONARY: DictionaryTerm[] = [
  {
    slug: "algorithm",
    term: "Algorithm",
    aliases: ["procedure", "recipe"],
    category: "fundamentals",
    phaseIds: ["1", "3"],
    lessonIds: [],
    definitions: {
      beginner:
        "A set of step-by-step instructions for solving a problem — like a recipe a computer can follow.",
      intermediate:
        "A finite, deterministic sequence of well-defined operations that takes an input and produces an output. Algorithms are evaluated by correctness, time complexity, and space complexity.",
      advanced:
        "A computable function expressed as a finite procedure over a defined model of computation. Properties of interest include termination, asymptotic behavior in time/space, and amenability to parallelization or distribution.",
    },
    examples: [
      {
        language: "javascript",
        code: "function sum(nums) {\n  let total = 0;\n  for (const n of nums) total += n;\n  return total;\n}",
      },
    ],
    seeAlso: ["data-structure", "complexity", "big-o"],
    standards: { cs2023: ["AL/Foundational"] },
  },
  {
    slug: "bit",
    term: "Bit",
    aliases: ["binary digit"],
    category: "fundamentals",
    phaseIds: ["0"],
    lessonIds: [],
    definitions: {
      beginner:
        "The smallest piece of data a computer stores — a single 0 or 1, like a switch that's off or on.",
      intermediate:
        "A binary digit. The fundamental unit of information, taking one of two values (0 or 1). Eight bits make a byte; groups of bits encode numbers, characters, and machine instructions.",
      advanced:
        "An information-theoretic unit equal to one shannon — the entropy of a uniformly distributed binary random variable. In hardware, realized as a two-state circuit (voltage high/low, magnetic polarity, charge present/absent).",
    },
    seeAlso: ["byte", "binary"],
  },
  {
    slug: "byte",
    term: "Byte",
    aliases: ["octet"],
    category: "fundamentals",
    phaseIds: ["0"],
    lessonIds: [],
    definitions: {
      beginner:
        "Eight bits grouped together. One byte can hold any number from 0 to 255 — enough for a single letter or symbol.",
      intermediate:
        "A group of 8 bits, capable of representing 256 distinct values. Bytes are the smallest addressable unit in most CPU architectures and the basis for character encodings like ASCII and UTF-8.",
      advanced:
        "Historically variable-width on early architectures; standardized to 8 bits (an octet) by IEEE 1541. Memory addresses index bytes; word size, alignment, and endianness determine how multi-byte values are laid out and accessed.",
    },
    seeAlso: ["bit", "binary"],
  },
  {
    slug: "binary",
    term: "Binary",
    aliases: ["base 2"],
    category: "fundamentals",
    phaseIds: ["0"],
    lessonIds: [],
    definitions: {
      beginner:
        "Counting using only two digits — 0 and 1. It's how computers represent everything internally.",
      intermediate:
        "A positional number system with base 2. Each column is a power of two, so 1010 = 8 + 2 = 10. All digital data, from numbers to images, ultimately reduces to binary.",
      advanced:
        "Base-2 positional notation. Closed under arithmetic with carry propagation. Direct correspondence to two-state digital logic makes it the natural representation for hardware. Two's complement extends it to signed integers without a separate sign bit.",
    },
    seeAlso: ["bit", "byte"],
  },
  {
    slug: "variable",
    term: "Variable",
    aliases: ["binding"],
    category: "fundamentals",
    phaseIds: ["1"],
    lessonIds: [],
    definitions: {
      beginner: "A named container that holds a value you can reference and change later.",
      intermediate:
        "A binding between an identifier and a memory location (or value, in immutable languages). Scope determines where it's visible; lifetime determines when it's reclaimed.",
      advanced:
        "An identifier bound to a storage location with a defined type, scope, lifetime, and mutability. In compiled languages, binding may be resolved at compile time (lexical) or runtime (dynamic).",
    },
    seeAlso: ["scope", "type", "constant"],
  },
  {
    slug: "function",
    term: "Function",
    aliases: ["procedure", "subroutine", "method"],
    category: "fundamentals",
    phaseIds: ["1"],
    lessonIds: [],
    definitions: {
      beginner:
        "A reusable block of code that takes input, does something, and gives back a result.",
      intermediate:
        "A named, parameterized unit of computation. Pure functions return outputs based only on inputs and have no side effects; impure functions may read or modify external state.",
      advanced:
        "A first-class abstraction in most languages, often supporting closures, higher-order use, and currying. In type systems, functions are values whose type encodes parameter and return types and effects.",
    },
    seeAlso: ["closure", "scope", "pure-function"],
  },
  {
    slug: "big-o",
    term: "Big O Notation",
    aliases: ["asymptotic notation"],
    category: "complexity",
    phaseIds: ["3"],
    lessonIds: [],
    definitions: {
      beginner: "A way to describe how slow or fast an algorithm gets as the amount of data grows.",
      intermediate:
        "An upper bound on the growth rate of a function. O(n) means the work scales linearly with input size; O(1) means it stays constant; O(log n) grows much slower than n.",
      advanced:
        "Formally: f(n) = O(g(n)) iff there exist positive constants c, n₀ such that |f(n)| ≤ c|g(n)| for all n ≥ n₀. Used to characterize worst-case time and space complexity in the asymptotic limit.",
    },
    seeAlso: ["complexity", "algorithm"],
  },
  // ── Phase 0: Digital Literacy ────────────────────────────────────────────
  {
    slug: "ascii",
    term: "ASCII",
    aliases: ["American Standard Code for Information Interchange"],
    category: "fundamentals",
    phaseIds: ["0"],
    lessonIds: [],
    definitions: {
      beginner: "A standard map from numbers to letters so computers can store text.",
      intermediate:
        "A 7-bit character encoding that maps 128 numeric codes to letters, digits, punctuation, and control characters. The capital letter 'A' is 65; '0' (the digit) is 48.",
      advanced:
        "ANSI X3.4 character set, defined in 1963. Each character occupies a 7-bit code point (extended to 8 bits for the high half in many vendor extensions). Superseded by Unicode/UTF-8 for modern text but remains the universal subset all encodings agree on for the first 128 code points.",
    },
    seeAlso: ["binary", "byte"],
  },
  {
    slug: "hexadecimal",
    term: "Hexadecimal",
    aliases: ["hex", "base 16"],
    category: "fundamentals",
    phaseIds: ["0"],
    lessonIds: [],
    definitions: {
      beginner: "Counting using 16 digits (0-9 and A-F). One hex digit packs four bits.",
      intermediate:
        "A base-16 number system where the digits A-F represent 10-15. Each hex digit corresponds to exactly 4 bits, so two hex digits represent one byte. Common in colors (#FF8800), memory addresses, and binary file dumps.",
      advanced:
        "Positional notation with radix 16. Native to systems programming because the byte boundary aligns cleanly with two hex digits, simplifying inspection of memory, opcodes, and register contents.",
    },
    seeAlso: ["binary", "byte"],
  },
  {
    slug: "ram",
    term: "RAM",
    aliases: ["random access memory", "memory"],
    category: "hardware",
    phaseIds: ["0"],
    lessonIds: [],
    definitions: {
      beginner: "Fast, temporary memory where running programs live. Lost when power is cut.",
      intermediate:
        "Volatile, byte-addressable working memory used by running processes. Orders of magnitude faster than disk but loses contents on power loss. Sized in gigabytes on modern machines.",
      advanced:
        "Dynamic random-access memory (DRAM) implemented as a grid of capacitor cells, requiring periodic refresh. Accessed through a memory controller with row/column addressing. Latency ~50-100 ns; bandwidth tens of GB/s on modern DDR5.",
    },
    seeAlso: ["cpu", "byte"],
  },
  {
    slug: "cpu",
    term: "CPU",
    aliases: ["central processing unit", "processor"],
    category: "hardware",
    phaseIds: ["0"],
    lessonIds: [],
    definitions: {
      beginner:
        "The chip that runs programs by repeating fetch-decode-execute billions of times per second.",
      intermediate:
        "The processor: fetches instructions from memory, decodes them, and executes them. Modern CPUs have multiple cores and pipeline many instructions in parallel. Clock speed (GHz) is only one factor in real performance.",
      advanced:
        "An out-of-order superscalar core with branch prediction, speculative execution, and multi-level caches. Instructions retire in program order but execute in any order the dependencies allow. IPC (instructions per cycle) varies wildly with workload locality.",
    },
    seeAlso: ["ram"],
  },
  {
    slug: "terminal",
    term: "Terminal",
    aliases: ["console", "tty"],
    category: "tools",
    phaseIds: ["0"],
    lessonIds: [],
    definitions: {
      beginner: "A text window where you type commands instead of clicking buttons.",
      intermediate:
        "A text-based interface to the operating system. The terminal application displays text and forwards your keystrokes to a shell program (bash, zsh, PowerShell), which interprets and runs commands.",
      advanced:
        "Originally a physical teletype device. Modern 'terminal emulators' speak the VT100/xterm escape sequences over a pseudo-tty (PTY) to the shell. They handle cursor positioning, colors, and resize events out of band from regular text I/O.",
    },
    seeAlso: ["shell"],
  },
  {
    slug: "shell",
    term: "Shell",
    aliases: ["bash", "zsh"],
    category: "tools",
    phaseIds: ["0"],
    lessonIds: [],
    definitions: {
      beginner: "The program inside a terminal that reads what you type and runs it.",
      intermediate:
        "A command interpreter. Reads input lines, parses them into commands and arguments, expands variables and globs, and invokes the requested programs. Bash and zsh are the dominant Unix shells; PowerShell on Windows.",
      advanced:
        "A scripting language with control flow, variables, functions, and IO redirection in addition to interactive command execution. Pipes connect process stdout to stdin, enabling Unix-style program composition. Job control manages foreground/background processes.",
    },
    seeAlso: ["terminal"],
  },
  {
    slug: "packet",
    term: "Packet",
    aliases: ["datagram"],
    category: "networking",
    phaseIds: ["0"],
    lessonIds: [],
    definitions: {
      beginner:
        "A small chunk of data with a destination address — what your computer actually sends across the internet.",
      intermediate:
        "A small unit of data with a header containing source and destination addresses, plus a payload. Internet data is broken into packets (typically ~1500 bytes) so individual losses can be retransmitted without resending the whole stream.",
      advanced:
        "An IP datagram. Encapsulates a transport-layer segment (TCP/UDP) and is routed independently across the network via best-effort delivery. Fragmentation occurs when a packet exceeds an interface MTU; reassembly is the receiver's job.",
    },
    seeAlso: ["protocol"],
  },
  {
    slug: "http",
    term: "HTTP",
    aliases: ["hypertext transfer protocol"],
    category: "networking",
    phaseIds: ["0"],
    lessonIds: [],
    definitions: {
      beginner:
        "The language browsers and servers use to talk: a request goes out, a response comes back.",
      intermediate:
        "A request-response protocol over TCP. Clients send requests with a method (GET, POST, PUT, DELETE), path, headers, and optional body; servers respond with a status code, headers, and body. Status 200 = OK, 404 = not found, 500 = server error.",
      advanced:
        "Stateless application-layer protocol defined by the IETF. HTTP/1.1 uses persistent connections and pipelining; HTTP/2 multiplexes streams over a single TCP connection with binary framing; HTTP/3 runs over QUIC for lower-latency setup and head-of-line-blocking-free streams.",
    },
    seeAlso: ["url", "dns"],
  },
  {
    slug: "dns",
    term: "DNS",
    aliases: ["domain name system"],
    category: "networking",
    phaseIds: ["0"],
    lessonIds: [],
    definitions: {
      beginner:
        "The internet's phone book — turns names like dura.dev into the numbers computers need.",
      intermediate:
        "A distributed system that translates domain names into IP addresses. Resolvers walk a hierarchy from root servers to TLD servers to authoritative servers. Results are cached for the TTL the authoritative server specifies.",
      advanced:
        "Defined in RFC 1034/1035. Hierarchical, eventually consistent, with cache TTLs that govern propagation. Records include A (IPv4), AAAA (IPv6), CNAME (alias), MX (mail), TXT, and SRV. DNSSEC adds cryptographic signatures over zone data.",
    },
    seeAlso: ["http", "url"],
  },
  {
    slug: "url",
    term: "URL",
    aliases: ["uniform resource locator", "link"],
    category: "networking",
    phaseIds: ["0"],
    lessonIds: [],
    definitions: {
      beginner:
        "A web address. It tells your browser exactly which server to ask and what to ask for.",
      intermediate:
        "A string that identifies a resource on the web. Composed of scheme (https), host (dura.dev), path (/lesson), optional query (?from=home), and optional fragment (#section). The fragment is client-only and never sent to the server.",
      advanced:
        "A subset of URI (RFC 3986). Defines a hierarchical naming scheme with authority, path, query, and fragment components. Browsers parse and normalize URLs through the WHATWG URL standard, which differs subtly from RFC 3986 in legacy edge cases.",
    },
    seeAlso: ["http", "dns"],
  },
  {
    slug: "git",
    term: "Git",
    aliases: ["version control"],
    category: "tools",
    phaseIds: ["0"],
    lessonIds: [],
    definitions: {
      beginner: "A tool that keeps a labeled history of every change you make to your code.",
      intermediate:
        "A distributed version control system. Each repository contains the full history; branches are cheap, merges are routine. The basic flow: edit files, stage changes with `git add`, snapshot with `git commit`, share with `git push`.",
      advanced:
        "A content-addressable filesystem with a directed acyclic graph of commits. Objects (blob, tree, commit, tag) are identified by SHA-1 (transitioning to SHA-256). The index is the staging area; refs (branches, tags) are pointers to commits. Designed by Linus Torvalds in 2005 for Linux kernel development.",
    },
    seeAlso: ["commit"],
  },
  {
    slug: "commit",
    term: "Commit",
    aliases: ["snapshot", "revision"],
    category: "tools",
    phaseIds: ["0"],
    lessonIds: [],
    definitions: {
      beginner: "A labeled snapshot of your code that you can return to later.",
      intermediate:
        "A point-in-time snapshot of a Git repository. Each commit references its parent, the tree of files at that moment, an author, a timestamp, and a message. The commit hash uniquely identifies it.",
      advanced:
        "A Git object that points to a tree (the project's contents) and one or more parents (its lineage). Cryptographically chained via parent SHAs, making history tamper-evident. Merge commits have multiple parents; rebases create new commits with new SHAs but copy the diffs.",
    },
    seeAlso: ["git"],
  },
  // ── Phase 1: Programming Fundamentals ────────────────────────────────────
  {
    slug: "string",
    term: "String",
    aliases: [],
    category: "fundamentals",
    phaseIds: ["1"],
    lessonIds: [],
    definitions: {
      beginner: "A piece of text — letters, numbers, or symbols wrapped in quotes.",
      intermediate:
        "A sequence of characters. Most languages treat strings as immutable values with operations like concat, slice, and split. Internally usually stored as UTF-8 or UTF-16 bytes.",
      advanced:
        "A sequence of code units in some character encoding. JavaScript strings are UTF-16 with surrogate pairs for code points above U+FFFF. Rust strings are guaranteed-valid UTF-8 byte sequences. String operations have surprising complexity once grapheme clusters and normalization enter the picture.",
    },
    seeAlso: ["variable"],
  },
  {
    slug: "array",
    term: "Array",
    aliases: ["list"],
    category: "fundamentals",
    phaseIds: ["1"],
    lessonIds: [],
    definitions: {
      beginner: "An ordered list of values, all stored under one name.",
      intermediate:
        "An ordered, indexable collection of values. Most languages provide methods to push, pop, slice, map, and filter. Access by index is O(1); insertion in the middle is O(n).",
      advanced:
        "A contiguous block of memory holding fixed-size elements (in compiled languages) or a dynamic resizable structure with amortized O(1) append (in dynamic languages). JavaScript arrays are sparse hashmaps that engines optimize into dense storage when access patterns allow.",
    },
    seeAlso: ["object", "loop"],
  },
  {
    slug: "object",
    term: "Object",
    aliases: ["map", "dictionary", "hash"],
    category: "fundamentals",
    phaseIds: ["1"],
    lessonIds: [],
    definitions: {
      beginner: "A bag of key-value pairs — like a record with named fields.",
      intermediate:
        "A collection of named properties. Each property has a key (string or symbol) and a value (any type). Used as records, configurations, and hash maps. Access by key is typically O(1) average.",
      advanced:
        "In JavaScript, an object is a hash table with prototype-based inheritance. Property access walks the prototype chain. V8 optimizes objects with stable shapes into 'hidden classes' that approximate struct performance until shape changes invalidate the optimization.",
    },
    seeAlso: ["array", "variable"],
  },
  {
    slug: "loop",
    term: "Loop",
    aliases: ["iteration"],
    category: "fundamentals",
    phaseIds: ["1"],
    lessonIds: [],
    definitions: {
      beginner: "A way to repeat the same code multiple times.",
      intermediate:
        "A control structure that repeats a block of code while a condition holds (while), a fixed number of times (for), or once per item in a collection (for-of, forEach). The condition is checked each iteration.",
      advanced:
        "A backward branch in the control-flow graph. Compilers optimize loops via unrolling, hoisting loop invariants, vectorization, and strength reduction. Tail recursion is the functional equivalent and is optimized to a loop in some languages.",
    },
    seeAlso: ["conditional"],
  },
  {
    slug: "conditional",
    term: "Conditional",
    aliases: ["if statement", "branch"],
    category: "fundamentals",
    phaseIds: ["1"],
    lessonIds: [],
    definitions: {
      beginner: "Code that runs only when something is true.",
      intermediate:
        "A control structure that chooses between code paths based on a boolean expression. `if/else` and `switch` are the common forms. Most languages also offer a ternary expression (`cond ? a : b`) for inline use.",
      advanced:
        "A forward branch in the control-flow graph. Branch prediction in modern CPUs makes correctly-predicted branches nearly free, while mispredicts can cost 10-20 cycles. Branchless code (using arithmetic or conditional moves) can be faster on critical loops.",
    },
    seeAlso: ["loop"],
  },
  {
    slug: "scope",
    term: "Scope",
    aliases: ["lexical scope"],
    category: "fundamentals",
    phaseIds: ["1"],
    lessonIds: [],
    definitions: {
      beginner: "The region of code where a variable can be seen and used.",
      intermediate:
        "The set of code locations where a variable is accessible. Block scope limits visibility to the nearest `{}` block; function scope limits it to the enclosing function; global scope makes it visible everywhere.",
      advanced:
        "Determined statically by lexical position in the source (lexical scope) in most modern languages, or by the call stack at runtime (dynamic scope) in a few. Each scope frame holds bindings; closures capture their enclosing scope's bindings even after the outer function returns.",
    },
    seeAlso: ["closure", "variable"],
  },
  {
    slug: "closure",
    term: "Closure",
    aliases: [],
    category: "fundamentals",
    phaseIds: ["1"],
    lessonIds: [],
    definitions: {
      beginner:
        "A function that remembers variables from where it was created, even after that place is gone.",
      intermediate:
        "A function bundled with its lexical environment. The inner function retains access to outer-scope variables after the outer function returns. Used for callbacks, factories, and module-style encapsulation.",
      advanced:
        "A first-class function value plus a captured environment of free variables. In JavaScript every function creates a closure; captured variables live on the heap via the function's [[Environment]] internal slot, not the call stack. Closures are how event handlers, setTimeout callbacks, and module patterns retain state.",
    },
    seeAlso: ["scope", "function"],
  },
  {
    slug: "callback",
    term: "Callback",
    aliases: [],
    category: "fundamentals",
    phaseIds: ["1"],
    lessonIds: [],
    definitions: {
      beginner: "A function you hand to another function to be called later.",
      intermediate:
        "A function passed as an argument to another function, to be invoked when some event happens or some work completes. Common in event handlers (onClick), array methods (map, filter), and async APIs.",
      advanced:
        "A higher-order function pattern for inversion of control. The callee owns when and how the callback runs. In Node.js the convention is `(err, result) => void` as the last argument; this 'callback hell' nesting motivated the move to promises and async/await.",
    },
    seeAlso: ["function", "promise"],
  },
  {
    slug: "promise",
    term: "Promise",
    aliases: ["future"],
    category: "fundamentals",
    phaseIds: ["1"],
    lessonIds: [],
    definitions: {
      beginner: "A placeholder for a value that will arrive later — like a delivery slip for code.",
      intermediate:
        "An object representing the eventual completion (or failure) of an asynchronous operation. Has three states: pending, fulfilled, rejected. `.then()` chains transformations; `.catch()` handles errors.",
      advanced:
        "Per the Promises/A+ spec, a thenable that runs handlers via a microtask queue. Once settled, state is immutable. `async`/`await` is syntactic sugar over the same machinery — an async function returns a promise; `await` schedules the continuation as a then-handler.",
    },
    seeAlso: ["async-await", "callback"],
  },
  {
    slug: "async-await",
    term: "Async/Await",
    aliases: ["async", "await"],
    category: "fundamentals",
    phaseIds: ["1"],
    lessonIds: [],
    definitions: {
      beginner:
        "A way to write code that waits for slow things (like network calls) without blocking everything else.",
      intermediate:
        "Syntax that lets you write asynchronous code that looks synchronous. `async` marks a function as returning a promise; `await` pauses execution until a promise resolves, yielding control to the event loop in the meantime.",
      advanced:
        "Sugar over generators and promises. Each `await` desugars into a `.then()` continuation; the function's local state is captured in a coroutine-like frame. Throws inside an async function become promise rejections; try/catch transparently handles awaited rejections.",
    },
    seeAlso: ["promise"],
  },
  {
    slug: "parameter",
    term: "Parameter",
    aliases: ["formal parameter"],
    category: "fundamentals",
    phaseIds: ["1"],
    lessonIds: [],
    definitions: {
      beginner: "A named slot in a function definition where the caller's value gets plugged in.",
      intermediate:
        "A local variable declared in a function's signature that receives the value the caller passes. The value passed in is called an 'argument'. Parameters can have defaults, rest spreads, and destructuring patterns.",
      advanced:
        "Distinguished from arguments: the parameter is the slot in the declaration; the argument is the value at the call site. Pass-by-value copies primitives; pass-by-reference (or pass-by-sharing in JS) shares the same object instance, so mutations are visible to the caller.",
    },
    seeAlso: ["function"],
  },
  // ── Phase 1 expansion ────────────────────────────────────────────────────
  {
    slug: "constant",
    term: "Constant",
    aliases: ["const"],
    category: "fundamentals",
    phaseIds: ["1"],
    lessonIds: [],
    definitions: {
      beginner: "A variable whose binding cannot be changed after it is set.",
      intermediate:
        "Declared with `const`. The binding is immutable — you cannot reassign it. But if the value is an object or array, its contents can still be mutated.",
      advanced:
        "A lexically scoped, non-reassignable binding. `const` prevents reassignment of the identifier; it does not freeze the value. `Object.freeze()` is needed for shallow immutability of the value itself.",
    },
    seeAlso: ["variable", "scope"],
  },
  {
    slug: "primitive",
    term: "Primitive",
    aliases: ["primitive type"],
    category: "fundamentals",
    phaseIds: ["1"],
    lessonIds: [],
    definitions: {
      beginner: "A simple value that is not an object — like a number, string, or boolean.",
      intermediate:
        "One of JavaScript's seven primitive types: string, number, bigint, boolean, undefined, null, symbol. Primitives are immutable and compared by value, not reference.",
      advanced:
        "Autoboxed to wrapper objects (String, Number, Boolean) when a method is called on them. The autoboxing is temporary — the primitive itself is never an object. Stored on the stack in optimized engines.",
    },
    seeAlso: ["variable", "string"],
  },
  {
    slug: "type-coercion",
    term: "Type Coercion",
    aliases: ["implicit conversion"],
    category: "fundamentals",
    phaseIds: ["1"],
    lessonIds: [],
    definitions: {
      beginner:
        "When JavaScript silently converts one type to another to make an operation work — like turning a number into a string during `+`.",
      intermediate:
        "Implicit type conversion applied by the Abstract Equality Comparison (==), arithmetic operators, and string concatenation. `2 + '3'` gives `'23'` because `+` prefers string concatenation when one operand is a string.",
      advanced:
        "Governed by the ToPrimitive, ToNumber, and ToString abstract operations in the ECMAScript spec. == follows a complex comparison algorithm (§7.2.14) that is the primary argument for always using ===.",
    },
    seeAlso: ["variable"],
  },
  {
    slug: "recursion",
    term: "Recursion",
    aliases: [],
    category: "fundamentals",
    phaseIds: ["1", "3"],
    lessonIds: [],
    definitions: {
      beginner:
        "When a function calls itself. It keeps going until it hits a base case that says 'stop.'",
      intermediate:
        "A technique where a function solves a problem by calling itself with a smaller input. Every recursive function needs a base case (when to stop) and a recursive case (when to call itself). Without a base case, you get infinite recursion and a stack overflow.",
      advanced:
        "Expressively equivalent to iteration but with different performance characteristics. Each call adds a frame to the call stack. Tail-call optimization (TCO) can reuse the frame, but only Safari implements it in JS. Prefer iteration for performance-critical paths.",
    },
    seeAlso: ["function", "loop"],
  },
  {
    slug: "pure-function",
    term: "Pure Function",
    aliases: [],
    category: "fundamentals",
    phaseIds: ["1"],
    lessonIds: [],
    definitions: {
      beginner:
        "A function with no surprises — same input always gives the same output, and it changes nothing outside itself.",
      intermediate:
        "A function that is deterministic (same arguments → same return value) and side-effect-free (no mutation of external state, no I/O, no logging). Pure functions are trivially testable and safe to memoize.",
      advanced:
        "Referentially transparent: the function call can be replaced with its return value without changing program behavior. Foundation of functional programming. React's render model assumes component functions are pure.",
    },
    seeAlso: ["function", "closure"],
  },
  {
    slug: "higher-order-function",
    term: "Higher-Order Function",
    aliases: ["HOF"],
    category: "fundamentals",
    phaseIds: ["1"],
    lessonIds: [],
    definitions: {
      beginner: "A function that takes another function as input or returns one as output.",
      intermediate:
        "A function that operates on other functions — either by taking them as arguments (map, filter, reduce) or by returning a new function (factory, decorator). Higher-order functions enable composition and abstraction.",
      advanced:
        "In type theory, a function of type (A → B) → C or A → (B → C). JavaScript's first-class functions make every function potentially higher-order. Currying transforms a multi-argument function into a chain of unary higher-order functions.",
    },
    seeAlso: ["function", "callback", "closure"],
  },
  {
    slug: "map-method",
    term: "Array.map()",
    aliases: ["map"],
    category: "fundamentals",
    phaseIds: ["1"],
    lessonIds: [],
    definitions: {
      beginner: "Runs a function on every element and returns a new array of the results.",
      intermediate:
        "Calls the provided callback once for each element, collects the return values into a new array of the same length. Does not mutate the original. The callback receives (element, index, array).",
      advanced:
        "A functor operation: maps a function over a container's values. In category theory terms, Array is a functor and .map is its fmap. Equivalent to a for-of loop with push, but declarative.",
    },
    seeAlso: ["array", "callback", "filter-method"],
  },
  {
    slug: "filter-method",
    term: "Array.filter()",
    aliases: ["filter"],
    category: "fundamentals",
    phaseIds: ["1"],
    lessonIds: [],
    definitions: {
      beginner:
        "Runs a test on every element and returns a new array of only the ones that passed.",
      intermediate:
        "Calls the callback for each element; if the callback returns truthy, the element is included in the new array. Does not mutate. The result may be shorter than the original (or empty).",
      advanced:
        "A selection operation over a collection. O(n) time, O(k) space where k is the number of matching elements. Often chained with .map() to select-then-transform.",
    },
    seeAlso: ["array", "callback", "map-method"],
  },
  {
    slug: "reduce",
    term: "Array.reduce()",
    aliases: ["reduce", "fold"],
    category: "fundamentals",
    phaseIds: ["1"],
    lessonIds: [],
    definitions: {
      beginner:
        "Collapses an entire array into a single value by running a function that accumulates as it goes.",
      intermediate:
        "Calls the callback with (accumulator, currentElement) for each item. The return value becomes the next accumulator. The second argument to reduce is the initial accumulator. Without it, the first element is used — which can be surprising on empty arrays.",
      advanced:
        "A catamorphism (fold) over a list. Universal: any operation expressible with a loop over an array can be expressed as a reduce. In practice, readability often favors a combination of map + filter over a single complex reduce.",
    },
    seeAlso: ["array", "callback"],
  },
  {
    slug: "set",
    term: "Set",
    aliases: [],
    category: "fundamentals",
    phaseIds: ["1"],
    lessonIds: [],
    definitions: {
      beginner: "A collection that only holds unique values. Adding a duplicate does nothing.",
      intermediate:
        "A built-in JavaScript collection that stores unique values of any type. Primary methods: add, has, delete, clear. Iterates in insertion order. `[...new Set(arr)]` is the standard deduplication idiom.",
      advanced:
        "Implemented as a hash set with O(1) average-case add/has/delete. Uses the SameValueZero comparison algorithm (like === but treats NaN as equal to NaN). No index access — convert to array if you need positions.",
    },
    seeAlso: ["array", "object"],
  },
  {
    slug: "hash-map",
    term: "Map",
    aliases: ["hash map", "dictionary"],
    category: "fundamentals",
    phaseIds: ["1"],
    lessonIds: [],
    definitions: {
      beginner:
        "A collection of key-value pairs where the key can be anything — not just a string.",
      intermediate:
        "A built-in key-value store with any-type keys, guaranteed insertion order, and a .size property. Methods: set, get, has, delete, clear. Preferred over plain objects when keys are dynamic, non-string, or when frequent addition/deletion is needed.",
      advanced:
        "Implemented as a hash table with O(1) average-case get/set. Keys are compared with SameValueZero. Iterates in insertion order (spec-guaranteed since ES2015). Weak variant (WeakMap) allows garbage collection of key objects.",
    },
    seeAlso: ["object", "set"],
  },
  {
    slug: "stack-trace",
    term: "Stack Trace",
    aliases: ["traceback", "backtrace"],
    category: "fundamentals",
    phaseIds: ["1"],
    lessonIds: [],
    definitions: {
      beginner:
        "A list of function calls that shows exactly where an error happened and who called whom.",
      intermediate:
        "Printed when an error is thrown, showing the call chain from the throw site to the entry point. Read top-to-bottom: the top line is where the error occurred; each subsequent line is the caller. File names and line numbers are included.",
      advanced:
        "Captured from the call stack at the point of Error construction (not throw). V8 lazily formats the trace via Error.prepareStackTrace. Stack depth is limited (~10K frames by default); deep recursion truncates. Source maps translate minified positions to original source.",
    },
    seeAlso: ["function"],
  },
  {
    slug: "breakpoint",
    term: "Breakpoint",
    aliases: [],
    category: "tools",
    phaseIds: ["1"],
    lessonIds: [],
    definitions: {
      beginner:
        "A marker that tells the debugger to pause the program at a specific line so you can inspect variables.",
      intermediate:
        "Set in the browser DevTools (click a line number) or in code with the `debugger` statement. Conditional breakpoints only pause when a specified expression is true. Logpoints log a message without pausing.",
      advanced:
        "Implemented by the engine inserting an interrupt instruction at the bytecode offset corresponding to the source position. Hardware breakpoints (used in native debuggers) use CPU debug registers. Web debuggers communicate via the Chrome DevTools Protocol (CDP).",
    },
    seeAlso: ["stack-trace"],
  },
  {
    slug: "linter",
    term: "Linter",
    aliases: ["ESLint"],
    category: "tools",
    phaseIds: ["1"],
    lessonIds: [],
    definitions: {
      beginner: "A tool that reads your code and flags potential bugs before you run it.",
      intermediate:
        "Static analysis tool that checks source code against a set of rules — catching unused variables, missing awaits, inconsistent equality operators, and other patterns. ESLint is the dominant JavaScript linter; rules are configurable per project.",
      advanced:
        "Operates on the AST (Abstract Syntax Tree) produced by the parser. Each rule is a visitor function that walks the tree and reports violations. Custom rules can be written as ESLint plugins. Can auto-fix many issues (--fix flag).",
    },
    seeAlso: ["variable"],
  },
  {
    slug: "unit-test",
    term: "Unit Test",
    aliases: ["test"],
    category: "fundamentals",
    phaseIds: ["1"],
    lessonIds: [],
    definitions: {
      beginner:
        "Code that automatically checks whether a small piece of your code works correctly.",
      intermediate:
        "A test that exercises a single function or module in isolation. Follows the Arrange/Act/Assert pattern: set up inputs, call the function, check the output. Frameworks like Vitest and Jest discover and run tests automatically.",
      advanced:
        "Unit tests verify behavior at the smallest granularity — typically one function per test case. They should be fast (no I/O), deterministic (same result every run), and independent (no shared state between tests). Test doubles (mocks, stubs, spies) isolate the unit from dependencies.",
    },
    seeAlso: ["function"],
  },
];

export const DICTIONARY_BY_SLUG: Map<string, DictionaryTerm> = new Map(
  DICTIONARY.map((t) => [t.slug, t])
);
