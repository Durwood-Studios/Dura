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

  // ── Phase 2: Web Development ─────────────────────────────────────────────
  {
    slug: "html",
    term: "HTML",
    aliases: ["hypertext markup language"],
    category: "web",
    phaseIds: ["2"],
    lessonIds: [],
    definitions: {
      beginner:
        "The language that gives web pages their structure — headings, paragraphs, links, images, and forms.",
      intermediate:
        "A markup language of nested elements. Each element is an opening tag, content, and a closing tag. Browsers parse HTML into the DOM tree. Semantic elements (<article>, <nav>, <main>) convey meaning beyond visual appearance.",
      advanced:
        "Defined by the WHATWG HTML Living Standard. Parsed by a tokenizer that handles malformed markup with a prescribed error-recovery algorithm. The resulting DOM is an interface between the document and JavaScript via the Web IDL specification.",
    },
    examples: [
      {
        language: "html",
        code: '<!DOCTYPE html>\n<html lang="en">\n  <head><title>Page</title></head>\n  <body><h1>Hello</h1></body>\n</html>',
      },
    ],
    seeAlso: ["dom", "css"],
  },
  {
    slug: "css",
    term: "CSS",
    aliases: ["cascading style sheets"],
    category: "web",
    phaseIds: ["2"],
    lessonIds: [],
    definitions: {
      beginner: "The language that controls how HTML looks — colors, fonts, sizes, and layout.",
      intermediate:
        "A stylesheet language that selects DOM elements and applies visual properties. Rules cascade: when multiple rules match, specificity and source order determine which wins. The box model defines how elements take up space.",
      advanced:
        "A declarative language evaluated by the browser's style system. The cascade is a deterministic algorithm combining specificity (inline > ID > class > element), importance (!important), and document order. Computed values resolve relative units; used values apply layout constraints.",
    },
    examples: [
      {
        language: "css",
        code: ".button {\n  background: #10b981;\n  padding: 8px 16px;\n  border-radius: 8px;\n}",
      },
    ],
    seeAlso: ["html", "selector", "flexbox"],
  },
  {
    slug: "selector",
    term: "CSS Selector",
    aliases: ["selector"],
    category: "web",
    phaseIds: ["2"],
    lessonIds: [],
    definitions: {
      beginner:
        "The part of a CSS rule that picks which elements to style — like `.button` or `h1`.",
      intermediate:
        "A pattern that matches elements in the DOM. Types: element (`p`), class (`.card`), ID (`#header`), attribute (`[type='text']`), pseudo-class (`:hover`), pseudo-element (`::before`), and combinators (` `, `>`, `+`, `~`) for relationships.",
      advanced:
        "Evaluated right-to-left by the style engine for efficiency. Specificity is calculated as a three-number tuple (ID, class/attr/pseudo-class, element/pseudo-element). `!important` overrides specificity; the specificity of `:is()` and `:not()` comes from their most specific argument.",
    },
    seeAlso: ["css"],
  },
  {
    slug: "flexbox",
    term: "Flexbox",
    aliases: ["flex", "flexible box"],
    category: "web",
    phaseIds: ["2"],
    lessonIds: [],
    definitions: {
      beginner:
        "A CSS layout mode that lines items up in a row or column and handles spacing and alignment automatically.",
      intermediate:
        "A one-dimensional layout model. `display: flex` on a container makes its children flex items. `justify-content` distributes items along the main axis; `align-items` aligns them on the cross axis. `gap` adds space between items.",
      advanced:
        "Items are sized by the flex algorithm: each item starts at its flex-basis, then flex-grow distributes remaining space proportionally, and flex-shrink absorbs overflow. The `flex` shorthand is `grow shrink basis`.",
    },
    seeAlso: ["css", "grid", "responsive"],
  },
  {
    slug: "grid",
    term: "CSS Grid",
    aliases: ["css grid", "grid layout"],
    category: "web",
    phaseIds: ["2"],
    lessonIds: [],
    definitions: {
      beginner:
        "A CSS layout system that lets you place items in rows AND columns at the same time.",
      intermediate:
        "A two-dimensional layout model. `display: grid` with `grid-template-columns` defines columns. The `fr` unit distributes remaining space proportionally. Items can span multiple cells with `grid-column` and `grid-row`.",
      advanced:
        "Grid creates a formatting context with explicit and implicit tracks. `auto-fill` and `auto-fit` with `minmax()` enable responsive layouts without media queries. Subgrid (now widely supported) lets nested grids align to parent tracks.",
    },
    seeAlso: ["css", "flexbox", "responsive"],
  },
  {
    slug: "responsive",
    term: "Responsive Design",
    aliases: ["responsive web design", "RWD"],
    category: "web",
    phaseIds: ["2"],
    lessonIds: [],
    definitions: {
      beginner: "Building websites that look good on any screen size — phone, tablet, and desktop.",
      intermediate:
        "Designing UIs that adapt to viewport size using fluid layouts, flexible images, and media queries. The mobile-first approach writes base styles for small screens and adds complexity with min-width breakpoints.",
      advanced:
        "Beyond media queries: CSS Grid's `auto-fill/auto-fit + minmax()` creates intrinsically responsive layouts. Container queries (`@container`) scope breakpoints to the component's own size. `clamp()` smoothly interpolates values between minimum and maximum viewport widths.",
    },
    seeAlso: ["media-query", "flexbox", "grid"],
  },
  {
    slug: "media-query",
    term: "Media Query",
    aliases: ["@media"],
    category: "web",
    phaseIds: ["2"],
    lessonIds: [],
    definitions: {
      beginner:
        "A CSS rule that only applies when the screen matches certain conditions — like 'only on screens wider than 768px'.",
      intermediate:
        "An `@media` block with conditions. `@media (min-width: 768px)` matches tablets and above. Conditions include width, height, orientation, hover capability, color scheme (prefers-color-scheme: dark), and reduced motion.",
      advanced:
        "Part of the CSS Media Queries Level 4 spec. The 'range' syntax (`@media (width >= 768px)`) is now widely supported and more readable than legacy min/max forms. Container queries (`@container`) are often preferable to media queries for component-level responsiveness.",
    },
    seeAlso: ["responsive", "css"],
  },
  {
    slug: "dom",
    term: "DOM",
    aliases: ["document object model"],
    category: "web",
    phaseIds: ["2"],
    lessonIds: [],
    definitions: {
      beginner:
        "The browser's live map of your webpage — a tree of objects JavaScript can read and change.",
      intermediate:
        "A language-neutral API that represents an HTML document as a tree of nodes. JavaScript can query (`querySelector`), create (`createElement`), update (`textContent`, `classList`), and delete (`removeChild`) nodes. Changes to the DOM are immediately reflected in what the browser renders.",
      advanced:
        "Defined by the WHATWG DOM Living Standard. The DOM is a tree of `Node` objects — `Element`, `Text`, `Comment`, `DocumentFragment`, etc. Mutations queue microtasks (MutationObserver) and may trigger layout (reflow) and paint (repaint) passes in the browser rendering pipeline.",
    },
    examples: [
      {
        language: "javascript",
        code: "const btn = document.querySelector('#save');\nbtn.textContent = 'Saved!';\nbtn.classList.add('success');",
      },
    ],
    seeAlso: ["html", "event", "reflow"],
  },
  {
    slug: "event",
    term: "DOM Event",
    aliases: ["event", "browser event"],
    category: "web",
    phaseIds: ["2"],
    lessonIds: [],
    definitions: {
      beginner:
        "A signal the browser sends when something happens — a click, a keypress, a form submission — so your JavaScript can respond.",
      intermediate:
        "An object representing a user action or browser occurrence. Attached with `addEventListener(type, handler)`. The event object carries `.target` (element that fired it), `.type`, and type-specific properties. Events bubble up the DOM tree by default.",
      advanced:
        "Events propagate in three phases: capture (root → target), at-target, and bubble (target → root). `addEventListener(type, fn, {capture: true})` fires during capture. `stopPropagation()` halts traversal; `stopImmediatePropagation()` also prevents other listeners on the same node.",
    },
    seeAlso: ["dom", "bubbling"],
  },
  {
    slug: "bubbling",
    term: "Event Bubbling",
    aliases: ["bubbling"],
    category: "web",
    phaseIds: ["2"],
    lessonIds: [],
    definitions: {
      beginner:
        "When a click (or other event) fires on an element and then travels upward through its parent elements too.",
      intermediate:
        "After an event fires at the target element, it propagates up through all ancestor elements — each ancestor's listeners for that event type also fire. This enables event delegation: one listener on the parent handles events from all its children.",
      advanced:
        "Part of the W3C DOM Events specification. Bubbling follows the ancestor chain to the document root. `event.stopPropagation()` halts the chain. Not all events bubble (e.g., `focus`, `blur` — use `focusin`/`focusout` instead). Custom events default to non-bubbling; pass `{bubbles: true}` to CustomEvent.",
    },
    seeAlso: ["event", "dom"],
  },
  {
    slug: "fetch",
    term: "Fetch API",
    aliases: ["fetch"],
    category: "web",
    phaseIds: ["2"],
    lessonIds: [],
    definitions: {
      beginner:
        "A built-in browser function for making HTTP requests — like asking a server for data.",
      intermediate:
        "A modern alternative to XMLHttpRequest. `fetch(url)` returns a Promise resolving to a Response. Call `.json()` to parse JSON (also a Promise). Check `response.ok` before using the body — fetch only rejects on network failure, not 4xx/5xx status codes.",
      advanced:
        "Extended by Next.js to add caching semantics (`cache`, `next.revalidate`). Supports streaming responses via `response.body` (a ReadableStream). Can be cancelled with AbortController/AbortSignal. In Node.js 18+, fetch is available globally without a polyfill.",
    },
    examples: [
      {
        language: "javascript",
        code: "const res = await fetch('/api/data');\nif (!res.ok) throw new Error(res.statusText);\nconst data = await res.json();",
      },
    ],
    seeAlso: ["promise", "async-await", "http"],
  },
  {
    slug: "jsx",
    term: "JSX",
    aliases: ["javascript xml"],
    category: "web",
    phaseIds: ["2"],
    lessonIds: [],
    definitions: {
      beginner:
        "An HTML-like syntax you write inside JavaScript to describe what a React component should display.",
      intermediate:
        "A syntax extension compiled by build tools into `React.createElement()` calls. Allows HTML-like markup in JS files. Differences from HTML: `className` instead of `class`, `htmlFor` instead of `for`, camelCase event names (`onClick`), and all tags must be closed.",
      advanced:
        "Transpiled by Babel/SWC using the JSX transform. The modern transform (React 17+) imports `jsx` from 'react/jsx-runtime' automatically without requiring `import React`. JSX can represent any component — not just HTML elements. TSX is JSX in TypeScript files.",
    },
    examples: [
      {
        language: "jsx",
        code: 'function Greeting({ name }) {\n  return <h1 className="title">Hello, {name}!</h1>;\n}',
      },
    ],
    seeAlso: ["component", "props", "virtual-dom"],
  },
  {
    slug: "component",
    term: "React Component",
    aliases: ["component"],
    category: "web",
    phaseIds: ["2"],
    lessonIds: [],
    definitions: {
      beginner:
        "A reusable piece of UI written as a function — takes in data and returns what to display.",
      intermediate:
        "A function that accepts props and returns JSX. Components compose: use them like HTML tags inside other components. React calls the function each time state or props change, producing a new virtual DOM tree to diff against the previous one.",
      advanced:
        "In Next.js App Router, components are Server Components by default (rendered on the server, zero client JS). Adding 'use client' marks a component as a Client Component (rendered on both server and client, hydrated in the browser). The two types have different capabilities and import rules.",
    },
    seeAlso: ["jsx", "props", "state", "server-component"],
  },
  {
    slug: "props",
    term: "Props",
    aliases: ["properties"],
    category: "web",
    phaseIds: ["2"],
    lessonIds: [],
    definitions: {
      beginner:
        "Data passed into a React component from its parent — like arguments to a function.",
      intermediate:
        "An object of named values passed to a component via JSX attributes. Props are read-only inside the component — only the parent that passes them can change them. The `children` prop holds any JSX nested between the component's opening and closing tags.",
      advanced:
        "Immutable from the component's perspective. React compares old and new props during reconciliation to decide if a component needs re-rendering. `React.memo()` wraps a component to skip re-renders when props are shallowly equal. Prop types can be enforced with TypeScript generics or PropTypes at runtime.",
    },
    seeAlso: ["component", "state", "jsx"],
  },
  {
    slug: "state",
    term: "State (React)",
    aliases: ["component state"],
    category: "web",
    phaseIds: ["2"],
    lessonIds: [],
    definitions: {
      beginner:
        "Data that a component owns and can change over time, causing the UI to update when it does.",
      intermediate:
        "Managed with `useState` or `useReducer`. Each state update schedules a re-render. State is local to the component instance. To share state between sibling components, lift it to their common ancestor.",
      advanced:
        "React state updates are batched (React 18+ batches across all event handlers, not just synthetic events). Updater functions (`setCount(n => n + 1)`) avoid stale closure bugs. State lives in the fiber tree; it persists across renders but is destroyed when the component unmounts.",
    },
    seeAlso: ["useState", "component", "props"],
  },
  {
    slug: "hook",
    term: "React Hook",
    aliases: ["hook"],
    category: "web",
    phaseIds: ["2"],
    lessonIds: [],
    definitions: {
      beginner:
        "A special React function (starting with 'use') that lets you tap into React features like state or side effects inside a function component.",
      intermediate:
        "Functions like `useState`, `useEffect`, `useContext`, `useRef`, and `useReducer`. Must be called at the top level of a component or custom hook — not inside conditions or loops. Custom hooks are plain functions that call other hooks.",
      advanced:
        "Hooks store their state in a linked list on the fiber. The call order determines which fiber slot each hook reads from — hence the no-conditional-calls rule. The React DevTools highlight stale closures and missing dependencies.",
    },
    seeAlso: ["useState", "useEffect", "component"],
  },
  {
    slug: "useState",
    term: "useState",
    aliases: ["use-state"],
    category: "web",
    phaseIds: ["2"],
    lessonIds: [],
    definitions: {
      beginner:
        "The React hook for adding a changeable value to a component. Returns the current value and a function to update it.",
      intermediate:
        "Returns `[value, setValue]`. Calling `setValue(next)` queues a re-render with the new value. For objects and arrays, always pass a new reference — mutating the existing one won't trigger a render. Use the functional form (`setValue(prev => ...)`) to avoid stale state bugs.",
      advanced:
        "Backed by a fiber slot. React compares old and new values with `Object.is`. If equal, the render is bailed out. React 18 batches multiple `setState` calls in the same event handler into one re-render.",
    },
    seeAlso: ["hook", "state", "useEffect"],
  },
  {
    slug: "useEffect",
    term: "useEffect",
    aliases: ["use-effect"],
    category: "web",
    phaseIds: ["2"],
    lessonIds: [],
    definitions: {
      beginner:
        "A React hook for running code after the component renders — used for fetching data, timers, and subscriptions.",
      intermediate:
        "Runs after every render by default. A dependency array limits re-runs. The optional cleanup function (returned from the effect) runs before the next effect and on unmount — use it to clear timers, cancel requests, and unsubscribe.",
      advanced:
        "Fires asynchronously after paint (non-blocking). `useLayoutEffect` fires synchronously after DOM mutation but before paint — use it only when you need to read layout. Strict Mode runs effects twice in development to surface cleanup bugs.",
    },
    seeAlso: ["hook", "state", "useState"],
  },
  {
    slug: "virtual-dom",
    term: "Virtual DOM",
    aliases: ["vdom"],
    category: "web",
    phaseIds: ["2"],
    lessonIds: [],
    definitions: {
      beginner:
        "React's in-memory copy of the webpage structure — React compares it to the real DOM and only updates what changed.",
      intermediate:
        "A lightweight JavaScript object tree mirroring the DOM. On each render, React diffs the new virtual DOM against the previous one (reconciliation) and applies only the necessary real DOM mutations. This batching makes updates efficient.",
      advanced:
        "React 18's Fiber architecture replaces the synchronous vdom diff with an interruptible work loop. Rendering is split into two phases: the render phase (pure, can be interrupted) and the commit phase (applies mutations, synchronous). Concurrent features like `useTransition` mark lower-priority updates that Fiber can deprioritize.",
    },
    seeAlso: ["dom", "component", "reconciliation"],
  },
  {
    slug: "reconciliation",
    term: "Reconciliation",
    aliases: ["diffing"],
    category: "web",
    phaseIds: ["2"],
    lessonIds: [],
    definitions: {
      beginner:
        "React's process of comparing the old and new UI trees to figure out the minimum set of real DOM changes needed.",
      intermediate:
        "React's diffing algorithm. It compares element types first: same type → update props; different type → unmount old, mount new. The `key` prop lets React match list items across renders even if they reorder.",
      advanced:
        "O(n) heuristic reconciler (not optimal O(n³) tree edit distance). Assumes: (1) elements of different types produce different trees; (2) keys hint identity across renders. React 18's Fiber breaks the diff work into small units that can be paused, aborted, or resumed.",
    },
    seeAlso: ["virtual-dom", "key-prop", "component"],
  },
  {
    slug: "server-component",
    term: "Server Component",
    aliases: ["RSC", "React Server Component"],
    category: "web",
    phaseIds: ["2"],
    lessonIds: [],
    definitions: {
      beginner:
        "A React component that runs only on the server — it can read databases and files directly, and sends HTML to the browser with zero JavaScript.",
      intermediate:
        "Default in Next.js App Router. Can use `async`/`await`, access env vars, and call databases — none of which is exposed to the client. Cannot use `useState`, `useEffect`, or event handlers. Data is serialized and sent as RSC payload.",
      advanced:
        "Part of React's server rendering architecture. RSC payload is a serialized component tree (not HTML). Client components hydrate independently. Server and client components can be interleaved, but a client component cannot import a server component as a child — it must receive it via `children` or a slot prop.",
    },
    seeAlso: ["client-component", "ssr", "component"],
  },
  {
    slug: "client-component",
    term: "Client Component",
    aliases: ["'use client'"],
    category: "web",
    phaseIds: ["2"],
    lessonIds: [],
    definitions: {
      beginner:
        "A React component that runs in the browser and can use state, effects, and event handlers. Marked with 'use client' at the top of the file.",
      intermediate:
        "Marked with `'use client'` directive. Renders on both server (initial HTML) and client (hydration). Can use `useState`, `useEffect`, browser APIs, and event handlers. All its imports are also treated as client-side.",
      advanced:
        "Defines a boundary in the component tree. Everything below a 'use client' file is client-side by default. The boundary cannot be crossed back — a client module cannot render an async server component. The boundary is a module boundary, not a component boundary.",
    },
    seeAlso: ["server-component", "component", "hook"],
  },
  {
    slug: "route",
    term: "Route",
    aliases: ["page route", "URL route"],
    category: "web",
    phaseIds: ["2"],
    lessonIds: [],
    definitions: {
      beginner: "A URL path mapped to a specific page or handler in your application.",
      intermediate:
        "In Next.js App Router, routes are defined by the file system: `app/about/page.tsx` serves `/about`. Dynamic segments use brackets: `app/blog/[slug]/page.tsx`. Routes can be grouped (`(group)`) without affecting the URL.",
      advanced:
        "The App Router uses React Suspense as the streaming primitive. Layouts persist across navigations, reducing remounts. Parallel routes (`@slot` syntax) render multiple pages simultaneously. Intercepting routes (`(..)segment`) overlay a route while preserving the URL context.",
    },
    seeAlso: ["layout", "app-router", "dynamic-route"],
  },
  {
    slug: "layout",
    term: "Layout (Next.js)",
    aliases: ["layout.tsx"],
    category: "web",
    phaseIds: ["2"],
    lessonIds: [],
    definitions: {
      beginner:
        "A shared shell that wraps every page in a folder — like a header or sidebar that stays while you navigate.",
      intermediate:
        "Defined in `layout.tsx`. Accepts a `children` prop and wraps it. Layouts nest: the root layout wraps everything; inner layouts wrap their segment's pages. Layouts do NOT remount on navigation — they persist their state.",
      advanced:
        "Server Component by default. Root layout (`app/layout.tsx`) must include `<html>` and `<body>`. Can be made a Client Component when interactive state (like a theme provider or Zustand store) is needed at the root. `template.tsx` is like layout but remounts on every navigation.",
    },
    seeAlso: ["route", "app-router", "server-component"],
  },
  {
    slug: "middleware",
    term: "Middleware",
    aliases: ["middleware.ts"],
    category: "web",
    phaseIds: ["2"],
    lessonIds: [],
    definitions: {
      beginner:
        "Code that runs on every incoming request before it reaches your page — used for checking auth or redirecting.",
      intermediate:
        "In Next.js, defined in `middleware.ts` at the project root. Runs at the edge before the matched route. Can rewrite URLs, redirect, set headers, or return a response. Configured to match specific paths with the `matcher` export.",
      advanced:
        "Executes in the Edge Runtime (V8 isolates, not Node.js) for low latency. Cannot use Node.js APIs. Reads cookies and headers via `NextRequest`; sets them on `NextResponse`. Common patterns: auth token validation, geolocation-based redirects, A/B testing via cookie.",
    },
    seeAlso: ["route", "api-route", "deployment"],
  },
  {
    slug: "api-route",
    term: "API Route",
    aliases: ["route handler"],
    category: "web",
    phaseIds: ["2"],
    lessonIds: [],
    definitions: {
      beginner:
        "A server endpoint in your Next.js app that responds to HTTP requests — like a mini backend.",
      intermediate:
        "Defined as `app/api/route.ts` with exported `GET`, `POST`, etc. functions. Receives a `NextRequest`, returns a `NextResponse`. Can access databases, env vars, and perform any server-side work. Alternative to a separate backend for simple APIs.",
      advanced:
        "Route Handlers replace the Pages Router's `/pages/api` convention. They can run in the Node.js runtime (full Node APIs) or Edge Runtime (global subset only). When to prefer over Server Actions: third-party webhooks, public APIs, streaming responses, or non-form HTTP clients.",
    },
    seeAlso: ["middleware", "server-component", "deployment"],
  },
  {
    slug: "deployment",
    term: "Deployment",
    aliases: ["deploy", "shipping"],
    category: "web",
    phaseIds: ["2"],
    lessonIds: [],
    definitions: {
      beginner:
        "The process of taking your code from your computer and putting it on a server so other people can use it.",
      intermediate:
        "For Next.js: `npm run build` produces the `.next` output. `next start` serves it with Node.js. Vercel connects to your git repo and auto-deploys on every push — preview deployments for PRs, production on main. Environment variables are set in the platform dashboard.",
      advanced:
        "Next.js supports three output modes: default (Node.js server), `output: 'standalone'` (self-contained Docker-friendly bundle), and `output: 'export'` (fully static, no server). Vercel uses ISR via its KV-backed cache; self-hosted ISR requires a cache handler implementation.",
    },
    seeAlso: ["ssr", "middleware", "api-route"],
  },
  {
    slug: "ssr",
    term: "SSR",
    aliases: ["server-side rendering"],
    category: "web",
    phaseIds: ["2"],
    lessonIds: [],
    definitions: {
      beginner:
        "Generating the full HTML of a page on the server before sending it to the browser — so users see content instantly.",
      intermediate:
        "The server renders the React component tree to HTML for each request, sends it to the browser, and then the client 'hydrates' — attaches event listeners to the existing HTML. Benefits: faster first paint, better SEO, works without JavaScript. Cost: server latency per request.",
      advanced:
        "Contrasted with CSR (client-side rendering, hydrate from blank div), SSG (static generation at build time), and ISR (static + revalidation). Next.js App Router routes with uncached fetches are dynamic (SSR); cached fetches are static (SSG). Streaming SSR (`Suspense`) sends HTML in chunks as data resolves.",
    },
    seeAlso: ["server-component", "deployment", "isr"],
  },
  {
    slug: "isr",
    term: "ISR",
    aliases: ["incremental static regeneration"],
    category: "web",
    phaseIds: ["2"],
    lessonIds: [],
    definitions: {
      beginner:
        "A Next.js feature that serves a cached static page instantly, then quietly rebuilds it in the background so it stays fresh.",
      intermediate:
        "Set `next: {revalidate: 60}` in a fetch call. The first request after the TTL triggers a background regeneration while the stale page is still served. Once regeneration completes, all subsequent requests get the fresh version.",
      advanced:
        "Stale-while-revalidate applied to page-level rendering. On Vercel, the CDN cache is purged on successful regeneration. `revalidatePath()` and `revalidateTag()` allow on-demand revalidation from Server Actions or API routes — enabling instant updates after CMS edits.",
    },
    seeAlso: ["ssr", "deployment", "server-component"],
  },

  // ── Phase 3: CS Fundamentals ─────────────────────────────────────────────
  {
    slug: "time-complexity",
    term: "Time Complexity",
    aliases: ["runtime complexity"],
    category: "cs-fundamentals",
    phaseIds: ["3"],
    lessonIds: [],
    definitions: {
      beginner: "A measure of how much slower an algorithm gets as the input grows larger.",
      intermediate:
        "The number of operations an algorithm performs as a function of input size n, expressed in Big O notation. Ignores constants and lower-order terms to capture growth rate.",
      advanced:
        "Formally characterized using asymptotic notation. Determined by the dominant term in the operation count function. Common complexities from fastest to slowest: O(1), O(log n), O(n), O(n log n), O(n²), O(2^n), O(n!).",
    },
    seeAlso: ["big-o", "space-complexity", "algorithm"],
  },
  {
    slug: "space-complexity",
    term: "Space Complexity",
    aliases: ["memory complexity"],
    category: "cs-fundamentals",
    phaseIds: ["3"],
    lessonIds: [],
    definitions: {
      beginner: "How much extra memory an algorithm needs as the input grows.",
      intermediate:
        "The amount of auxiliary memory (beyond the input itself) an algorithm allocates, in Big O. O(1) = fixed extra memory; O(n) = memory grows with input.",
      advanced:
        "Includes explicitly allocated memory and implicit stack space from recursion. The time-space tradeoff is fundamental: memoization reduces exponential time to polynomial at the cost of O(n) space.",
    },
    seeAlso: ["time-complexity", "big-o", "recursion"],
  },
  {
    slug: "linked-list",
    term: "Linked List",
    aliases: ["singly linked list"],
    category: "cs-fundamentals",
    phaseIds: ["3"],
    lessonIds: [],
    definitions: {
      beginner: "A chain of nodes where each node holds a value and a pointer to the next node.",
      intermediate:
        "A linear data structure of nodes connected by references. Head insertion is O(1). Random access is O(n) — no indexing. No cache locality.",
      advanced:
        "A null-terminated sequence of heap-allocated nodes. Singly linked: one next pointer. Doubly linked: next + prev, enabling O(1) deletion given a node reference. Backing structure for stacks, queues, and LRU caches.",
    },
    examples: [
      {
        language: "javascript",
        code: "class Node { constructor(val) { this.val = val; this.next = null; } }\nconst head = new Node(1);\nhead.next = new Node(2);",
      },
    ],
    seeAlso: ["stack", "queue", "array"],
  },
  {
    slug: "stack",
    term: "Stack",
    aliases: ["LIFO"],
    category: "cs-fundamentals",
    phaseIds: ["1", "3"],
    lessonIds: [],
    definitions: {
      beginner: "A pile where you can only add or remove from the top — last in, first out.",
      intermediate:
        "A LIFO (Last In, First Out) data structure. Push, pop, peek are all O(1). JavaScript's call stack uses this for function invocations.",
      advanced:
        "Array-backed stacks are most common. The call stack is a hardware-managed stack of activation records. Recursive algorithms implicitly use it; deep recursion risks stack overflow. Explicit stacks enable DFS and expression evaluation.",
    },
    seeAlso: ["queue", "recursion", "linked-list"],
  },
  {
    slug: "queue",
    term: "Queue",
    aliases: ["FIFO"],
    category: "cs-fundamentals",
    phaseIds: ["3"],
    lessonIds: [],
    definitions: {
      beginner:
        "A line where things are added at the back and removed from the front — first in, first out.",
      intermediate:
        "A FIFO (First In, First Out) data structure. Enqueue and dequeue are O(1) with a proper implementation. Array shift() is O(n) — prefer a linked list or circular buffer.",
      advanced:
        "BFS uses a queue to ensure level-by-level exploration. Priority queues generalize by always dequeuing the highest-priority element — backed by a heap for O(log n) insert and extract.",
    },
    seeAlso: ["stack", "bfs", "heap"],
  },
  {
    slug: "heap",
    term: "Heap",
    aliases: ["binary heap", "priority queue"],
    category: "cs-fundamentals",
    phaseIds: ["3"],
    lessonIds: [],
    definitions: {
      beginner:
        "A tree stored as an array where the smallest (or largest) element is always at the top.",
      intermediate:
        "A complete binary tree satisfying the heap property: min-heap has parent ≤ children; max-heap has parent ≥ children. Insert: O(log n), extract-min: O(log n), peek-min: O(1).",
      advanced:
        "Standard backing structure for priority queues. Used in Dijkstra's algorithm, heap sort, and scheduling. Stored as an array: parent at i, children at 2i+1 and 2i+2. Fibonacci heaps offer amortized O(1) decrease-key.",
    },
    seeAlso: ["queue", "sorting", "dijkstra"],
  },
  {
    slug: "binary-tree",
    term: "Binary Tree",
    aliases: ["tree"],
    category: "cs-fundamentals",
    phaseIds: ["3"],
    lessonIds: [],
    definitions: {
      beginner: "A tree where every node has at most two children: a left child and a right child.",
      intermediate:
        "A hierarchical data structure. Height = longest path from root to a leaf. Balanced binary tree has height O(log n). Tree traversals (inorder, preorder, postorder, level-order) each visit every node in O(n).",
      advanced:
        "Basis for BSTs, heaps, and segment trees. Recursive algorithms on trees are natural — each call processes a node and recurses on its children. Serialization uses preorder or level-order traversal.",
    },
    seeAlso: ["bst", "heap", "graph"],
  },
  {
    slug: "bst",
    term: "Binary Search Tree",
    aliases: ["BST"],
    category: "cs-fundamentals",
    phaseIds: ["3"],
    lessonIds: [],
    definitions: {
      beginner:
        "A binary tree where every left child is smaller than its parent and every right child is larger.",
      intermediate:
        "BST property: left subtree values < node < right subtree values. Search, insert, delete are O(h) where h = height. Inorder traversal yields sorted order.",
      advanced:
        "Degenerate BST (inserting sorted data) has h = n — O(n) operations. Self-balancing BSTs (AVL, red-black) maintain h = O(log n) via rotations. V8's Map is typically backed by a red-black tree.",
    },
    seeAlso: ["binary-tree", "sorting", "balanced-tree"],
  },
  {
    slug: "balanced-tree",
    term: "Balanced Tree",
    aliases: ["AVL tree", "red-black tree"],
    category: "cs-fundamentals",
    phaseIds: ["3"],
    lessonIds: [],
    definitions: {
      beginner: "A BST that automatically stays balanced so operations remain fast.",
      intermediate:
        "Guarantees O(log n) height via rebalancing after insertions/deletions. AVL: balance factor ≤ 1 via rotations. Red-black: coloring rules guarantee height ≤ 2 log n.",
      advanced:
        "AVL trees are more strictly balanced — better for read-heavy workloads. Red-black trees allow more imbalance but fewer rotations — preferred for write-heavy. Java's TreeMap and C++ std::map use red-black trees.",
    },
    seeAlso: ["bst", "binary-tree"],
  },
  {
    slug: "graph",
    term: "Graph",
    aliases: ["network"],
    category: "cs-fundamentals",
    phaseIds: ["3"],
    lessonIds: [],
    definitions: {
      beginner:
        "A structure of nodes (vertices) connected by links (edges) — like a map of cities and roads.",
      intermediate:
        "A set of vertices V and edges E. Directed or undirected. Weighted or unweighted. Represented as adjacency list (O(V + E) space) or adjacency matrix (O(V²) space).",
      advanced:
        "Trees are acyclic connected undirected graphs. DAGs support topological sort. Key algorithms: BFS, DFS, Dijkstra, Bellman-Ford, Floyd-Warshall, Prim, Kruskal. Most run in O(V + E) or O((V + E) log V).",
    },
    seeAlso: ["bfs", "dfs", "dijkstra"],
  },
  {
    slug: "bfs",
    term: "BFS",
    aliases: ["breadth-first search"],
    category: "cs-fundamentals",
    phaseIds: ["3"],
    lessonIds: [],
    definitions: {
      beginner: "Explore a graph level by level — visit all neighbors before going deeper.",
      intermediate:
        "Breadth-First Search uses a queue. Finds shortest path (fewest hops) in unweighted graphs. O(V + E) time and space.",
      advanced:
        "Guaranteed to find the shortest unweighted path. Uses a visited set to avoid cycles. Level-order tree traversal is BFS. Bidirectional BFS halves search depth for large graphs.",
    },
    seeAlso: ["dfs", "queue", "graph"],
  },
  {
    slug: "dfs",
    term: "DFS",
    aliases: ["depth-first search"],
    category: "cs-fundamentals",
    phaseIds: ["3"],
    lessonIds: [],
    definitions: {
      beginner: "Explore a graph by going as deep as possible before backtracking.",
      intermediate:
        "Depth-First Search uses a stack (or recursion). O(V + E) time. Used for cycle detection, topological sort, connected components.",
      advanced:
        "Edge classification (tree, back, forward, cross) is used for cycle detection and SCC algorithms like Tarjan's and Kosaraju's. Recursive DFS uses the call stack implicitly; iterative DFS needs an explicit stack.",
    },
    seeAlso: ["bfs", "stack", "graph", "recursion"],
  },
  {
    slug: "dijkstra",
    term: "Dijkstra's Algorithm",
    aliases: ["Dijkstra"],
    category: "cs-fundamentals",
    phaseIds: ["3"],
    lessonIds: [],
    definitions: {
      beginner: "An algorithm that finds the shortest route through a weighted map.",
      intermediate:
        "Greedy shortest-path for non-negative weighted graphs. Uses a priority queue: always extend the unvisited vertex with the smallest known distance. O((V + E) log V).",
      advanced:
        "Fails with negative edges — use Bellman-Ford instead. Used in routing protocols (OSPF) and navigation. With Fibonacci heaps: O(E + V log V). Johnson's algorithm extends it to graphs with negative edges by reweighting.",
    },
    seeAlso: ["graph", "bfs", "heap"],
  },
  {
    slug: "sorting",
    term: "Sorting",
    aliases: ["sort"],
    category: "cs-fundamentals",
    phaseIds: ["3"],
    lessonIds: [],
    definitions: {
      beginner: "Arranging a list of items in order — one of the most common algorithmic tasks.",
      intermediate:
        "Comparison-based sorting has a lower bound of O(n log n). Merge sort: O(n log n) always, stable, O(n) space. Quick sort: O(n log n) average, O(n²) worst, in-place. Insertion sort: O(n) on nearly-sorted data.",
      advanced:
        "JavaScript's Array.sort() uses Timsort — a hybrid of merge and insertion sort. Non-comparison sorts (counting, radix) achieve O(n) by exploiting key structure, not comparisons.",
    },
    seeAlso: ["time-complexity", "binary-search"],
  },
  {
    slug: "binary-search",
    term: "Binary Search",
    aliases: ["bisection"],
    category: "cs-fundamentals",
    phaseIds: ["3"],
    lessonIds: [],
    definitions: {
      beginner: "Find an item in a sorted list by repeatedly cutting the search space in half.",
      intermediate:
        "Requires a sorted array. Compare target to mid: if equal → found; if less → search left; if greater → search right. O(log n) time, O(1) space.",
      advanced:
        "Generalized binary search finds the smallest x where a monotone predicate is true — applicable to 'answer space' problems. Pitfall: (lo + hi) / 2 overflows 32-bit integers; use lo + Math.floor((hi - lo) / 2).",
    },
    seeAlso: ["sorting", "time-complexity"],
  },
  {
    slug: "dynamic-programming",
    term: "Dynamic Programming",
    aliases: ["DP"],
    category: "cs-fundamentals",
    phaseIds: ["3"],
    lessonIds: [],
    definitions: {
      beginner:
        "Solve a big problem by breaking it into smaller overlapping pieces and remembering the answers.",
      intermediate:
        "Requires overlapping subproblems and optimal substructure. Top-down: recursion + cache (memoization). Bottom-up: fill a table iteratively from base cases. Classic: Fibonacci, coin change, LCS, knapsack.",
      advanced:
        "Rooted in Bellman's optimality principle. Time = unique subproblems × work per subproblem. Space can often be reduced to O(1 row). Bitmask DP handles exponential state spaces.",
    },
    seeAlso: ["recursion", "greedy"],
  },
  {
    slug: "greedy",
    term: "Greedy Algorithm",
    aliases: ["greedy"],
    category: "cs-fundamentals",
    phaseIds: ["3"],
    lessonIds: [],
    definitions: {
      beginner: "Always make the choice that looks best right now and never look back.",
      intermediate:
        "Makes the locally optimal choice at each step. Simpler than DP when applicable. Classic: activity selection, Huffman coding, Dijkstra, canonical coin change.",
      advanced:
        "Correctness proven via greedy choice property and exchange argument. Greedy fails when future choices depend on past ones — use DP. Matroid theory characterizes problems where greedy is optimal.",
    },
    seeAlso: ["dynamic-programming", "algorithm"],
  },
  {
    slug: "backtracking",
    term: "Backtracking",
    aliases: ["pruning"],
    category: "cs-fundamentals",
    phaseIds: ["3"],
    lessonIds: [],
    definitions: {
      beginner: "Try all possibilities, but stop and undo as soon as you know a path can't work.",
      intermediate:
        "Choose an option, explore recursively, undo if it leads to a dead end. Pattern: choose → explore → unchoose. Used for permutations, N-Queens, Sudoku, word search.",
      advanced:
        "Explores the implicit solution tree. Pruning eliminates subtrees that cannot yield valid solutions. Worst case is exhaustive enumeration; pruning gives dramatic practical speedups. Constraint propagation is a powerful complement.",
    },
    seeAlso: ["recursion", "dynamic-programming"],
  },
  {
    slug: "two-pointer",
    term: "Two-Pointer Technique",
    aliases: ["two pointers"],
    category: "cs-fundamentals",
    phaseIds: ["3"],
    lessonIds: [],
    definitions: {
      beginner: "Use two index variables moving through an array to avoid a nested loop.",
      intermediate:
        "Two indices — often moving inward from opposite ends or at different speeds. Reduces O(n²) to O(n). Common: pair sum in sorted array, palindrome check, cycle detection.",
      advanced:
        "Each pointer traverses at most n positions — O(n) by amortization. Fast/slow pointers (Floyd's cycle detection) use speed ratio instead of direction. Applicable to linked lists, sorted arrays, and strings.",
    },
    seeAlso: ["sliding-window-term", "binary-search"],
  },
  {
    slug: "sliding-window-term",
    term: "Sliding Window",
    aliases: ["sliding window"],
    category: "cs-fundamentals",
    phaseIds: ["3"],
    lessonIds: [],
    definitions: {
      beginner:
        "Maintain a moving subarray and slide it across the array to avoid recomputing from scratch.",
      intermediate:
        "For contiguous subarray/substring problems. Fixed window: add right element, remove leftmost. Variable window: expand right to satisfy condition, shrink left to restore it. O(n) — each element enters and exits once.",
      advanced:
        "Window state incrementally maintained. Sliding window + monotonic deque solves sliding window maximum in O(n). Hash map tracks character frequencies in O(1) per update.",
    },
    seeAlso: ["two-pointer", "time-complexity"],
  },
];

export const DICTIONARY_BY_SLUG: Map<string, DictionaryTerm> = new Map(
  DICTIONARY.map((t) => [t.slug, t])
);
