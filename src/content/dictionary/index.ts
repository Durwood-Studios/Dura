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

  // ─── Phase 4: Backend Engineering ────────────────────────────────────────

  {
    slug: "nodejs",
    term: "Node.js",
    aliases: ["node", "node.js"],
    category: "backend",
    phaseIds: ["4"],
    lessonIds: [],
    definitions: {
      beginner:
        "A runtime that lets you run JavaScript outside the browser — on a server or your laptop.",
      intermediate:
        "Built on V8 with an event-driven, non-blocking I/O model. Single-threaded but handles many concurrent operations via the event loop. npm gives access to millions of packages.",
      advanced:
        "libuv wraps OS async I/O primitives (epoll, kqueue, IOCP). Worker threads (worker_threads module) add true parallelism for CPU-bound work. Cluster module forks OS processes to use all CPU cores.",
    },
    examples: [
      {
        language: "js",
        code: "const fs = require('fs/promises'); const data = await fs.readFile('data.json', 'utf8');",
      },
    ],
    seeAlso: ["event-loop", "middleware"],
  },
  {
    slug: "event-loop",
    term: "Event Loop",
    aliases: ["event loop"],
    category: "backend",
    phaseIds: ["1", "4"],
    lessonIds: [],
    definitions: {
      beginner:
        "The mechanism that lets JavaScript do one thing at a time while still handling many tasks — like waiting for a file without freezing.",
      intermediate:
        "Single-threaded loop that processes one callback at a time. Phases: timers → I/O callbacks → idle → poll → check → close. Microtasks (Promises, queueMicrotask) drain between every phase.",
      advanced:
        "Poll phase blocks until I/O completes or the next timer fires. nextTick queue and microtask queue drain completely before any macro-task runs — starvation risk. `setImmediate` fires in the check phase, after I/O.",
    },
    examples: [
      {
        language: "js",
        code: "setTimeout(() => console.log('timer'), 0); Promise.resolve().then(() => console.log('microtask')); // microtask logs first",
      },
    ],
    seeAlso: ["nodejs", "async-await"],
  },
  {
    slug: "middleware",
    term: "Middleware",
    aliases: [],
    category: "backend",
    phaseIds: ["4"],
    lessonIds: [],
    definitions: {
      beginner:
        "A function that runs between an incoming request and your final response — like a checkpoint that can inspect, modify, or block requests.",
      intermediate:
        "In Express: (req, res, next) => void. Calling next() passes control to the next middleware. Used for logging, auth, body parsing, error handling. Order matters — middleware runs top to bottom.",
      advanced:
        "Error middleware has signature (err, req, res, next). Middleware composition is function pipelining — each wraps the next. Frameworks like Koa use async generator-based 'onion model' instead.",
    },
    examples: [
      {
        language: "js",
        code: "app.use((req, res, next) => { console.log(req.method, req.path); next(); });",
      },
    ],
    seeAlso: ["rest", "nodejs"],
  },
  {
    slug: "rest",
    term: "REST",
    aliases: ["REST API", "RESTful", "representational state transfer"],
    category: "backend",
    phaseIds: ["4"],
    lessonIds: [],
    definitions: {
      beginner:
        "A style for building web APIs where URLs represent resources and HTTP verbs (GET, POST, PUT, DELETE) represent actions on them.",
      intermediate:
        "Six constraints: client-server, stateless, cacheable, uniform interface, layered system, optional code-on-demand. Stateless means no session state on the server — each request carries all context.",
      advanced:
        "Richardson Maturity Model levels 0-3. HATEOAS (level 3) embeds hypermedia links so clients discover transitions dynamically. Content negotiation via Accept/Content-Type headers.",
    },
    seeAlso: ["crud", "middleware", "jwt"],
  },
  {
    slug: "crud",
    term: "CRUD",
    aliases: ["create read update delete"],
    category: "backend",
    phaseIds: ["4"],
    lessonIds: [],
    definitions: {
      beginner:
        "The four basic operations every data-driven app needs: Create, Read, Update, and Delete.",
      intermediate:
        "Maps to HTTP methods: POST (Create), GET (Read), PUT/PATCH (Update), DELETE (Delete). Also maps to SQL: INSERT, SELECT, UPDATE, DELETE.",
      advanced:
        "CQRS (Command Query Responsibility Segregation) splits read and write models. Event sourcing replaces CRUD updates with immutable event logs, deriving current state by replaying events.",
    },
    seeAlso: ["rest", "sql"],
  },
  {
    slug: "jwt",
    term: "JWT",
    aliases: ["JSON Web Token", "json web token"],
    category: "backend",
    phaseIds: ["4"],
    lessonIds: [],
    definitions: {
      beginner:
        "A compact, self-contained token that proves who you are — sent with every request so the server doesn't need to look you up in a database.",
      intermediate:
        "Three base64url-encoded parts: header (alg, typ), payload (claims: sub, iat, exp), signature. Stateless — server verifies signature with the secret key without a DB lookup. Expires via `exp` claim.",
      advanced:
        "HS256 is symmetric (same key signs and verifies). RS256 is asymmetric — private key signs, public key verifies (good for microservices). Refresh token rotation mitigates stolen access tokens.",
    },
    examples: [
      {
        language: "text",
        code: "// Header.Payload.Signature\n// eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyMSJ9.signature",
      },
    ],
    seeAlso: ["bcrypt", "rest"],
  },
  {
    slug: "bcrypt",
    term: "bcrypt",
    aliases: ["password hashing"],
    category: "backend",
    phaseIds: ["4"],
    lessonIds: [],
    definitions: {
      beginner:
        "A function that converts a password into a scrambled string that can't be reversed — so you never store raw passwords.",
      intermediate:
        "Adaptive hash function with a cost factor (work factor) that controls how slow it runs. Slow-by-design resists brute force. Each hash includes a random salt to prevent rainbow table attacks.",
      advanced:
        "Cost factor doubles work per increment. bcrypt truncates at 72 bytes — pre-hash with SHA-256 for longer passwords. Argon2id (winner of Password Hashing Competition) is the modern successor.",
    },
    seeAlso: ["jwt"],
  },
  {
    slug: "sql",
    term: "SQL",
    aliases: ["structured query language"],
    category: "backend",
    phaseIds: ["4"],
    lessonIds: [],
    definitions: {
      beginner:
        "The language used to talk to relational databases — asking for data, adding rows, updating records, and deleting entries.",
      intermediate:
        "DDL (CREATE, ALTER, DROP) defines schema. DML (SELECT, INSERT, UPDATE, DELETE) manipulates data. Queries compose via WHERE, GROUP BY, HAVING, ORDER BY, and LIMIT. JOINs combine rows from multiple tables.",
      advanced:
        "Query planner parses SQL into an AST, optimizes it into a plan, and executes. CTEs (WITH clause) and window functions (ROW_NUMBER, LAG) enable complex analytic queries. EXPLAIN ANALYZE reveals actual execution cost.",
    },
    examples: [
      {
        language: "sql",
        code: "SELECT u.name, COUNT(o.id) AS orders FROM users u LEFT JOIN orders o ON o.user_id = u.id GROUP BY u.id;",
      },
    ],
    seeAlso: ["join", "transaction", "index", "migration"],
  },
  {
    slug: "join",
    term: "JOIN",
    aliases: ["sql join", "table join"],
    category: "backend",
    phaseIds: ["4"],
    lessonIds: [],
    definitions: {
      beginner:
        "A way to combine rows from two tables based on a matching column — like linking orders to the customer who placed them.",
      intermediate:
        "INNER JOIN: only rows with matches in both tables. LEFT JOIN: all left rows, nulls for unmatched right. RIGHT JOIN: mirror of LEFT. FULL OUTER JOIN: all rows from both. CROSS JOIN: Cartesian product.",
      advanced:
        "Planner picks hash join (build hash table on smaller relation), merge join (both sorted), or nested loop (small outer). Index on the join column makes nested loop O(n log n) instead of O(n²).",
    },
    seeAlso: ["sql", "index"],
  },
  {
    slug: "index",
    term: "Database Index",
    aliases: ["index", "db index"],
    category: "backend",
    phaseIds: ["4"],
    lessonIds: [],
    definitions: {
      beginner:
        "A data structure the database builds to find rows faster — like a book's index letting you skip to a page without reading every page.",
      intermediate:
        "B-tree index (default in Postgres) supports =, <, >, BETWEEN, LIKE 'prefix%'. Hash index is equality-only but O(1). Covering index includes all columns in the query — no table heap fetch needed.",
      advanced:
        "Index write overhead: each INSERT/UPDATE/DELETE must update all indexes on that table. Partial indexes (WHERE clause) index only a subset of rows — smaller and faster. BRIN indexes for naturally ordered data (timestamps) are tiny.",
    },
    seeAlso: ["sql", "join", "transaction"],
  },
  {
    slug: "transaction",
    term: "Database Transaction",
    aliases: ["transaction", "db transaction"],
    category: "backend",
    phaseIds: ["4"],
    lessonIds: [],
    definitions: {
      beginner:
        "A group of database operations that either all succeed together or all fail together — no partial updates.",
      intermediate:
        "BEGIN / COMMIT / ROLLBACK. Guarantees ACID. Isolation levels control what partial changes are visible between concurrent transactions: Read Uncommitted, Read Committed, Repeatable Read, Serializable.",
      advanced:
        "MVCC (Multi-Version Concurrency Control) lets readers and writers not block each other — Postgres keeps old row versions. Deadlocks occur when two transactions each hold a lock the other needs — detected and one is aborted.",
    },
    seeAlso: ["acid", "sql"],
  },
  {
    slug: "acid",
    term: "ACID",
    aliases: ["atomicity consistency isolation durability"],
    category: "backend",
    phaseIds: ["4"],
    lessonIds: [],
    definitions: {
      beginner:
        "Four guarantees a good database makes: all-or-nothing operations, correct data, isolated concurrent changes, and data that survives crashes.",
      intermediate:
        "Atomicity: transaction fully completes or fully rolls back. Consistency: constraints (FK, NOT NULL, CHECK) always hold. Isolation: concurrent transactions don't see each other's dirty work. Durability: committed data survives crashes (WAL).",
      advanced:
        "WAL (Write-Ahead Log) ensures durability — changes written to log before data pages. Isolation is implemented via MVCC in Postgres. Distributed databases trade some ACID guarantees for availability (see CAP theorem).",
    },
    seeAlso: ["transaction", "sql"],
  },
  {
    slug: "migration",
    term: "Database Migration",
    aliases: ["schema migration", "db migration"],
    category: "backend",
    phaseIds: ["4"],
    lessonIds: [],
    definitions: {
      beginner:
        "A versioned script that changes your database structure — adding a column, renaming a table — and can be run or reversed.",
      intermediate:
        "Each migration has an up (apply) and down (rollback) script. Tools run pending migrations in order, tracking applied ones in a metadata table. Zero-downtime migrations avoid long-running locks.",
      advanced:
        "Expand-contract pattern: add new column nullable → backfill → add NOT NULL constraint → remove old column. Never add NOT NULL without a default on a table with rows — it acquires a full table lock in older Postgres.",
    },
    seeAlso: ["sql", "transaction"],
  },
  {
    slug: "docker",
    term: "Docker",
    aliases: [],
    category: "backend",
    phaseIds: ["4"],
    lessonIds: [],
    definitions: {
      beginner:
        "A tool that packages your app and everything it needs into a portable box called a container — so it runs the same everywhere.",
      intermediate:
        "Docker builds images from a Dockerfile. Images are layered — each instruction adds a layer. `docker run` creates a container from an image. Docker Compose orchestrates multi-container apps with a YAML file.",
      advanced:
        "Images use Union File System (OverlayFS on Linux) — layers are read-only, container adds a writable layer on top. Build cache invalidates from the first changed instruction downward — order Dockerfile instructions by change frequency.",
    },
    seeAlso: ["container", "image", "dockerfile", "compose"],
  },
  {
    slug: "container",
    term: "Container",
    aliases: ["containers"],
    category: "backend",
    phaseIds: ["4"],
    lessonIds: [],
    definitions: {
      beginner:
        "A lightweight, isolated environment that runs your app — like a VM but much smaller and faster to start.",
      intermediate:
        "Containers share the host kernel but isolate processes with Linux namespaces (pid, net, mnt, uts, ipc) and limit resources with cgroups. Not a VM — no separate OS kernel.",
      advanced:
        "Namespaces provide isolation; cgroups provide resource control. Container escape vulnerabilities exploit namespace or cgroup misconfiguration. Rootless containers run without host root privileges — better security posture.",
    },
    seeAlso: ["docker", "image", "volume"],
  },
  {
    slug: "image",
    term: "Container Image",
    aliases: ["docker image"],
    category: "backend",
    phaseIds: ["4"],
    lessonIds: [],
    definitions: {
      beginner:
        "A read-only blueprint for a container — like a recipe. Running a container is like cooking from that recipe.",
      intermediate:
        "Composed of read-only layers. Each Dockerfile instruction (RUN, COPY, ADD) creates a layer. Images are stored in registries (Docker Hub, ECR, GHCR) and pulled by reference (name:tag or digest).",
      advanced:
        "Multi-stage builds compile in one stage and copy only the artifact to a minimal final stage — dramatically reduces image size. Image digest (sha256:...) is content-addressable and immutable; tags are mutable pointers.",
    },
    seeAlso: ["docker", "container", "dockerfile"],
  },
  {
    slug: "dockerfile",
    term: "Dockerfile",
    aliases: [],
    category: "backend",
    phaseIds: ["4"],
    lessonIds: [],
    definitions: {
      beginner:
        "A text file of instructions that tells Docker how to build your container image — like a recipe for your app's environment.",
      intermediate:
        "Key instructions: FROM (base image), RUN (execute command), COPY (add files), WORKDIR (set working dir), EXPOSE (document port), CMD/ENTRYPOINT (default process). Each RUN creates a layer.",
      advanced:
        'Use .dockerignore to exclude node_modules, .git, .env from build context. ENTRYPOINT sets the fixed command; CMD provides default args overridable at runtime. Use exec form (["node", "server.js"]) not shell form to avoid PID 1 signal issues.',
    },
    examples: [
      {
        language: "dockerfile",
        code: 'FROM node:20-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci --only=production\nCOPY . .\nCMD ["node", "server.js"]',
      },
    ],
    seeAlso: ["docker", "image"],
  },
  {
    slug: "compose",
    term: "Docker Compose",
    aliases: ["docker compose", "docker-compose"],
    category: "backend",
    phaseIds: ["4"],
    lessonIds: [],
    definitions: {
      beginner:
        "A tool that lets you define and run multiple containers together with a single YAML file — so your app, database, and cache all start with one command.",
      intermediate:
        "`docker compose up` starts all services. Services share a network by default — reachable by service name as hostname. `depends_on` controls startup order. Volumes persist data across container restarts.",
      advanced:
        "Compose profiles let you opt-in to optional services (dev tools, test databases). Compose Watch (v2.22+) syncs file changes into running containers — faster than rebuilding. Not for production orchestration — use Kubernetes or ECS.",
    },
    seeAlso: ["docker", "container", "volume"],
  },
  {
    slug: "volume",
    term: "Docker Volume",
    aliases: ["volumes", "docker volume"],
    category: "backend",
    phaseIds: ["4"],
    lessonIds: [],
    definitions: {
      beginner:
        "A way to save data outside the container so it isn't lost when the container stops or is deleted.",
      intermediate:
        "Named volumes are managed by Docker and live at /var/lib/docker/volumes. Bind mounts link a host directory into the container — good for development file sync. Volumes survive `docker rm`; container filesystem doesn't.",
      advanced:
        "For stateful workloads (databases) in production, use cloud-managed storage (EBS, GCP Persistent Disk) not Docker volumes — volumes are local to one host. Volume drivers extend Docker to NFS, S3, and other backends.",
    },
    seeAlso: ["docker", "container", "compose"],
  },
  {
    slug: "ci-cd",
    term: "CI/CD",
    aliases: ["continuous integration", "continuous delivery", "continuous deployment"],
    category: "backend",
    phaseIds: ["4"],
    lessonIds: [],
    definitions: {
      beginner:
        "An automated system that tests and deploys your code every time you push — so you catch bugs early and ship faster.",
      intermediate:
        "CI: run tests, lint, type-check on every push. CD: automatically deploy to staging or production when CI passes. Tools: GitHub Actions, CircleCI, Jenkins. Pipelines defined as YAML.",
      advanced:
        "Trunk-based development + feature flags enables continuous deployment without long-lived branches. Canary deployments route a small percentage of traffic to new code before full rollout. Rollback = re-deploy the previous image.",
    },
    seeAlso: ["pipeline", "deployment"],
  },
  {
    slug: "pipeline",
    term: "Deployment Pipeline",
    aliases: ["pipeline", "build pipeline"],
    category: "backend",
    phaseIds: ["4"],
    lessonIds: [],
    definitions: {
      beginner:
        "The automated sequence of steps — build, test, deploy — that runs every time you push code.",
      intermediate:
        "Stages: checkout → install deps → lint → test → build → push image → deploy. Each stage must pass for the next to run. Parallel stages run concurrently to reduce total time.",
      advanced:
        "Artifact promotion: build once, deploy the same artifact to staging then production. Immutable artifacts (Docker images tagged by git SHA) ensure staging and production run identical code. Gate approvals between staging and production for compliance.",
    },
    seeAlso: ["ci-cd", "deployment"],
  },
  {
    slug: "deployment",
    term: "Deployment",
    aliases: ["deploy", "releasing"],
    category: "backend",
    phaseIds: ["4"],
    lessonIds: [],
    definitions: {
      beginner:
        "The process of making your code available on the internet — uploading it to a server so real users can access it.",
      intermediate:
        "Deployment strategies: recreate (downtime), rolling (gradual), blue-green (instant cutover), canary (percentage-based). PaaS (Vercel, Render, Railway) abstracts server management. IaaS (EC2, GCE) gives more control.",
      advanced:
        "Immutable infrastructure: never modify running servers — replace them. Infrastructure-as-Code (Terraform, Pulumi) versions infrastructure alongside application code. GitOps: git is the source of truth for cluster state.",
    },
    seeAlso: ["ci-cd", "pipeline", "load-balancer"],
  },
  {
    slug: "dns",
    term: "DNS",
    aliases: ["domain name system"],
    category: "backend",
    phaseIds: ["0", "4"],
    lessonIds: [],
    definitions: {
      beginner:
        "The internet's phone book — it translates human-readable domain names like 'example.com' into the IP addresses computers actually use.",
      intermediate:
        "Record types: A (domain → IPv4), AAAA (domain → IPv6), CNAME (alias to another domain), MX (mail servers), TXT (verification, SPF, DKIM). TTL controls how long resolvers cache records.",
      advanced:
        "Recursive resolver queries root → TLD nameserver → authoritative nameserver. DNSSEC adds cryptographic signatures to prevent cache poisoning. Anycast routes DNS queries to the nearest datacenter.",
    },
    seeAlso: ["ssl", "deployment"],
  },
  {
    slug: "ssl",
    term: "SSL/TLS",
    aliases: ["tls", "ssl", "https", "tls certificate"],
    category: "backend",
    phaseIds: ["4"],
    lessonIds: [],
    definitions: {
      beginner:
        "The encryption layer that makes HTTPS work — scrambling data between your browser and the server so no one in between can read it.",
      intermediate:
        "TLS handshake: client hello (supported ciphers) → server hello + certificate → key exchange → encrypted session. Certificate issued by a Certificate Authority (CA) proves the server owns the domain. Let's Encrypt provides free certs.",
      advanced:
        "TLS 1.3 reduces handshake to 1 round-trip (0-RTT for resumption). HSTS header tells browsers to always use HTTPS. Certificate Transparency logs all issued certs — public record for detecting misissuance.",
    },
    seeAlso: ["dns", "load-balancer"],
  },
  {
    slug: "load-balancer",
    term: "Load Balancer",
    aliases: ["load balancing"],
    category: "backend",
    phaseIds: ["4"],
    lessonIds: [],
    definitions: {
      beginner:
        "A server that sits in front of your app servers and distributes incoming requests among them — so no single server gets overwhelmed.",
      intermediate:
        "Algorithms: round-robin, least connections, IP hash (sticky sessions). Layer 4 (TCP) balances by IP/port. Layer 7 (HTTP) balances by URL path, headers, or cookies — enables routing /api to backend and / to frontend.",
      advanced:
        "Health checks detect unhealthy instances and remove them from rotation. Connection draining gives in-flight requests time to complete before removing an instance. AWS ALB, Nginx, HAProxy, Cloudflare are common implementations.",
    },
    seeAlso: ["deployment", "ssl", "ci-cd"],
  },

  // ─── Phase 5: Systems Engineering ────────────────────────────────────────

  {
    slug: "kernel",
    term: "Kernel",
    aliases: ["os kernel", "linux kernel"],
    category: "systems",
    phaseIds: ["5"],
    lessonIds: [],
    definitions: {
      beginner:
        "The core of an operating system — the software that manages hardware and lets programs run.",
      intermediate:
        "Runs in privileged CPU mode (ring 0). Manages CPU scheduling, memory mapping, device I/O, and system calls. User programs run in user space and request kernel services via system calls.",
      advanced:
        "Monolithic kernels (Linux) run all OS services in kernel space — fast but a bug crashes the system. Microkernels (Mach, L4) run most services in user space — more isolated but IPC overhead. Linux uses loadable kernel modules to get flexibility without full microkernel cost.",
    },
    seeAlso: ["process", "system-call", "virtual-memory"],
  },
  {
    slug: "process",
    term: "Process",
    aliases: ["unix process", "os process"],
    category: "systems",
    phaseIds: ["5"],
    lessonIds: [],
    definitions: {
      beginner:
        "A running program — the OS creates a process for each program you launch, giving it its own memory and CPU time.",
      intermediate:
        "A process has: address space (code, heap, stack), file descriptors, PID, UID/GID, and state (running, sleeping, zombie). Created via fork() + exec(). Destroyed when it exits and the parent reads its exit code.",
      advanced:
        "fork() uses copy-on-write — pages shared until written. Zombie processes accumulate if the parent never calls wait(). /proc/[pid]/ exposes the full process state: maps, status, file descriptors, thread list.",
    },
    seeAlso: ["kernel", "thread", "virtual-memory"],
  },
  {
    slug: "thread",
    term: "Thread",
    aliases: ["pthread", "kernel thread"],
    category: "systems",
    phaseIds: ["5"],
    lessonIds: [],
    definitions: {
      beginner:
        "A lightweight unit of execution within a process — multiple threads share the same memory and can run in parallel on multi-core CPUs.",
      intermediate:
        "Threads share heap, code, globals, and file descriptors. Each thread has its own stack and CPU registers. Cheaper to create than processes. Shared memory requires synchronization (mutexes, atomics).",
      advanced:
        "Linux implements threads as tasks (clone() syscall with CLONE_VM | CLONE_FILES). POSIX threads (pthreads) are the standard API. Thread-local storage (TLS) gives each thread its own copy of a variable without locking.",
    },
    seeAlso: ["process", "mutex", "concurrency"],
  },
  {
    slug: "virtual-memory",
    term: "Virtual Memory",
    aliases: ["virtual address space", "paging"],
    category: "systems",
    phaseIds: ["5"],
    lessonIds: [],
    definitions: {
      beginner:
        "A technique that gives each process the illusion of having its own large block of memory, even though RAM is shared and limited.",
      intermediate:
        "The MMU translates virtual addresses to physical addresses via a page table. Pages not in RAM trigger a page fault — the OS loads the page from disk (swap). Enables isolation, overcommitment, and memory-mapped files.",
      advanced:
        "x86-64 uses 4-level page tables (PML4 → PDPT → PD → PT → physical). TLB caches recent translations — a TLB miss is expensive. Huge pages (2MB/1GB) reduce TLB pressure for large allocations. mmap() maps files directly into the address space.",
    },
    seeAlso: ["kernel", "process", "page-fault"],
  },
  {
    slug: "mutex",
    term: "Mutex",
    aliases: ["mutual exclusion", "lock"],
    category: "systems",
    phaseIds: ["5"],
    lessonIds: [],
    definitions: {
      beginner:
        "A lock that only one thread can hold at a time — other threads wait until it's released before entering the protected section of code.",
      intermediate:
        "Prevents race conditions on shared data. lock() acquires (blocks if held), unlock() releases. The protected region is the critical section. Recursive mutexes allow the same thread to lock again without deadlocking itself.",
      advanced:
        "Kernel mutexes (futex-based on Linux) sleep in kernel when contended — low CPU waste but context-switch overhead. Spinlocks busy-wait — better when the wait is very short (< 1μs) and the CPU would waste time on a context switch.",
    },
    seeAlso: ["thread", "deadlock", "semaphore"],
  },
  {
    slug: "deadlock",
    term: "Deadlock",
    aliases: [],
    category: "systems",
    phaseIds: ["5"],
    lessonIds: [],
    definitions: {
      beginner:
        "A situation where two or more threads are stuck waiting for each other forever — like two people each holding a key the other needs.",
      intermediate:
        "Four conditions (all required): mutual exclusion, hold-and-wait, no preemption, circular wait. Prevention: break any one condition. Detection: build a wait-for graph and check for cycles. Recovery: kill one process.",
      advanced:
        "Lock ordering (always acquire locks in a fixed global order) prevents circular wait. Banker's algorithm detects unsafe states before granting resources. In practice, most systems use timeouts and retry rather than formal deadlock avoidance.",
    },
    seeAlso: ["mutex", "thread", "semaphore"],
  },
  {
    slug: "tcp",
    term: "TCP",
    aliases: ["transmission control protocol"],
    category: "networking",
    phaseIds: ["5"],
    lessonIds: [],
    definitions: {
      beginner:
        "A protocol that ensures data sent over the internet arrives completely, in order, and without errors — the reliable foundation under HTTP.",
      intermediate:
        "Connection-oriented: three-way handshake (SYN/SYN-ACK/ACK) before data. Reliability via sequence numbers and retransmission. Flow control via receiver window. Congestion control via slow start, AIMD. Teardown via FIN/FIN-ACK.",
      advanced:
        "TCP Fast Open reduces handshake round-trips. BBR (Bottleneck Bandwidth and RTT) congestion control maximizes throughput without loss-based signals. Head-of-line blocking occurs when a lost packet stalls the stream — HTTP/3 moves to QUIC over UDP to eliminate this.",
    },
    seeAlso: ["udp", "http2", "socket"],
  },
  {
    slug: "udp",
    term: "UDP",
    aliases: ["user datagram protocol"],
    category: "networking",
    phaseIds: ["5"],
    lessonIds: [],
    definitions: {
      beginner:
        "A lightweight protocol that sends data without guaranteeing delivery or order — used when speed matters more than reliability.",
      intermediate:
        "Connectionless: no handshake, no state. Sends datagrams independently. No retransmission, no congestion control. Applications handle loss (or tolerate it). Good for DNS queries, live video, gaming, VoIP.",
      advanced:
        "QUIC (used by HTTP/3) is built on UDP but adds reliability, multiplexing, and encryption in user space — getting TCP reliability without kernel TCP's HOL blocking. WebRTC uses DTLS + SRTP over UDP for real-time media.",
    },
    seeAlso: ["tcp", "datagram", "websocket"],
  },
  {
    slug: "http2",
    term: "HTTP/2",
    aliases: ["http2", "h2"],
    category: "networking",
    phaseIds: ["5"],
    lessonIds: [],
    definitions: {
      beginner:
        "A faster version of HTTP that can send multiple requests at once over one connection instead of one at a time.",
      intermediate:
        "Binary framing instead of text. Multiplexing: multiple streams over one TCP connection — no head-of-line blocking at the HTTP layer. Header compression via HPACK. Server push (deprecated in practice). Requires TLS in browsers.",
      advanced:
        "HTTP/2 solves application-layer HOL blocking but TCP still has transport-layer HOL blocking — a lost packet stalls all streams. HTTP/3 (QUIC) eliminates this by multiplexing over independent UDP streams. HTTP/2 prioritization (stream weight/dependency) was rarely implemented correctly by servers.",
    },
    seeAlso: ["tcp", "tls", "http-protocol"],
  },
  {
    slug: "tls",
    term: "TLS",
    aliases: ["ssl", "transport layer security", "https"],
    category: "networking",
    phaseIds: ["5"],
    lessonIds: [],
    definitions: {
      beginner:
        "The encryption layer that makes HTTPS secure — it scrambles data in transit so eavesdroppers can't read it.",
      intermediate:
        "TLS 1.3 handshake: ClientHello (ciphers, key share) → ServerHello (chosen cipher, cert, key share) → client verifies cert → both derive session keys → encrypted data flows. 1-RTT handshake (vs 2-RTT in TLS 1.2).",
      advanced:
        "0-RTT resumption sends data on the first packet by reusing session tickets — but is vulnerable to replay attacks. OCSP stapling lets the server include a signed cert validity proof so clients don't need a separate CA lookup. Certificate Transparency logs all issued certs publicly.",
    },
    seeAlso: ["tcp", "http2", "certificate"],
  },
  {
    slug: "dns-resolver",
    term: "DNS Resolver",
    aliases: ["recursive resolver", "dns cache"],
    category: "networking",
    phaseIds: ["5"],
    lessonIds: [],
    definitions: {
      beginner:
        "The server that does the work of translating a domain name into an IP address by asking a series of other servers.",
      intermediate:
        "Recursive resolver (your ISP or 8.8.8.8) does the full resolution: queries root → TLD → authoritative nameserver. Caches results for the record's TTL. Stub resolver (on your machine) simply forwards to the recursive resolver.",
      advanced:
        "DNS over HTTPS (DoH) and DNS over TLS (DoT) encrypt resolver queries to prevent ISP snooping. DNSSEC adds digital signatures to records — resolvers verify the chain of trust. Negative caching (NXDOMAIN) also caches with the SOA's negative TTL.",
    },
    seeAlso: ["dns", "ttl", "anycast"],
  },
  {
    slug: "socket",
    term: "Socket",
    aliases: ["network socket", "tcp socket"],
    category: "networking",
    phaseIds: ["5"],
    lessonIds: [],
    definitions: {
      beginner:
        "An endpoint for network communication — like a phone socket that lets your program send and receive data over the network.",
      intermediate:
        "Identified by (protocol, local IP, local port, remote IP, remote port). TCP sockets are connection-oriented (connect/accept). UDP sockets are connectionless (sendto/recvfrom). File descriptors — everything is a file in Unix.",
      advanced:
        "epoll (Linux) / kqueue (BSD) let a single thread monitor thousands of sockets efficiently — the basis of Node.js and Nginx's performance. SO_REUSEPORT allows multiple processes to bind the same port — used by Nginx and HAProxy for multi-process load distribution.",
    },
    seeAlso: ["tcp", "udp", "websocket"],
  },
  {
    slug: "websocket",
    term: "WebSocket",
    aliases: ["websockets", "ws"],
    category: "networking",
    phaseIds: ["5"],
    lessonIds: [],
    definitions: {
      beginner:
        "A protocol for full-duplex communication between a browser and server — both sides can send messages at any time without polling.",
      intermediate:
        "Starts as HTTP, upgraded via the Upgrade: websocket header. Persistent TCP connection. Frames are small — opcode (text/binary/ping/close) + payload length + payload. Used for chat, live dashboards, collaborative editing, gaming.",
      advanced:
        "WebSocket frames have a masking key (client-to-server direction) to prevent cache poisoning by proxies. At scale, WebSocket servers require sticky sessions or a pub/sub layer (Redis) so messages can be routed to the correct server holding the client's connection.",
    },
    seeAlso: ["socket", "tcp", "long-polling"],
  },
  {
    slug: "b-tree",
    term: "B-Tree",
    aliases: ["b+ tree", "btree"],
    category: "database-internals",
    phaseIds: ["5"],
    lessonIds: [],
    definitions: {
      beginner:
        "The data structure that most database indexes use — a sorted tree that keeps data balanced so lookups are always fast.",
      intermediate:
        "Self-balancing tree where each node holds multiple keys. Leaf nodes store data (B+ tree) or pointers. Nodes are sized to match disk page size (4-16KB). Supports equality, range, and prefix lookups. O(log n) insert/search/delete.",
      advanced:
        "B+ tree leaf nodes are linked — range scans traverse leaves without returning to the root. Fill factor controls how full pages are before a split. Write amplification: every leaf update may cascade splits up the tree. Write-ahead logging must record all structural changes.",
    },
    seeAlso: ["lsm-tree", "index", "storage-engine"],
  },
  {
    slug: "lsm-tree",
    term: "LSM-Tree",
    aliases: ["log-structured merge tree", "lsm"],
    category: "database-internals",
    phaseIds: ["5"],
    lessonIds: [],
    definitions: {
      beginner:
        "A storage structure optimized for high write throughput — it buffers writes in memory and periodically merges sorted files on disk.",
      intermediate:
        "Writes go to an in-memory memtable. When full, it's flushed as an immutable SSTable. Background compaction merges SSTables — maintaining sorted order and removing tombstones. Used by RocksDB, Cassandra, LevelDB.",
      advanced:
        "Write amplification: data is written multiple times during compaction. Read amplification: a read may scan multiple SSTables before finding the value (Bloom filters reduce this). Space amplification: multiple versions of the same key exist until compacted. Leveled compaction minimizes space; tiered maximizes write throughput.",
    },
    seeAlso: ["b-tree", "storage-engine", "wal"],
  },
  {
    slug: "wal",
    term: "Write-Ahead Log",
    aliases: ["WAL", "write ahead log", "redo log"],
    category: "database-internals",
    phaseIds: ["5"],
    lessonIds: [],
    definitions: {
      beginner:
        "A log where the database records every change before applying it — so if it crashes, it can replay the log and recover.",
      intermediate:
        "WAL protocol: log record must be on disk before the data page is modified. Recovery replays committed transactions from the log. Checkpoints flush dirty pages to disk and truncate old log segments. Used by Postgres, MySQL, SQLite.",
      advanced:
        "LSN (Log Sequence Number) monotonically orders log records. ARIES recovery algorithm: Analysis (find dirty pages and active transactions) → Redo (replay from earliest dirty page) → Undo (roll back uncommitted transactions). WAL is also the basis for logical replication — followers replay the primary's WAL.",
    },
    seeAlso: ["transaction", "crash-recovery", "replication"],
  },
  {
    slug: "mvcc",
    term: "MVCC",
    aliases: ["multi-version concurrency control"],
    category: "database-internals",
    phaseIds: ["5"],
    lessonIds: [],
    definitions: {
      beginner:
        "A technique that lets readers and writers work at the same time without blocking each other — by keeping multiple versions of each row.",
      intermediate:
        "Writers create a new row version tagged with the transaction ID. Readers see the latest version committed before their snapshot timestamp. Old versions are garbage-collected by VACUUM (Postgres) or GC (MySQL InnoDB's purge thread).",
      advanced:
        "Postgres stores old versions in the heap with xmin/xmax fields. InnoDB stores old versions in a separate undo log segment. MVCC enables Snapshot Isolation — transactions see a consistent point-in-time view. Write-write conflicts still require locks to detect concurrent updates to the same row.",
    },
    seeAlso: ["transaction", "isolation", "wal"],
  },
  {
    slug: "replication",
    term: "Database Replication",
    aliases: ["leader-follower", "primary-replica"],
    category: "database-internals",
    phaseIds: ["5"],
    lessonIds: [],
    definitions: {
      beginner:
        "Copying your database to multiple servers so you can handle more reads, survive hardware failures, and serve users from nearby locations.",
      intermediate:
        "Leader-follower: writes go to leader, replicated asynchronously to followers. Followers serve reads. Failover promotes a follower to leader. Multi-leader: writes accepted at multiple nodes — complex conflict resolution.",
      advanced:
        "Synchronous replication (wait for follower ACK) is durable but adds latency. Asynchronous is fast but risks data loss on failover. Postgres logical replication sends row-level changes (vs physical WAL). Raft/Paxos provide consensus for leader election and consistent replication.",
    },
    seeAlso: ["wal", "mvcc", "sharding"],
  },
  {
    slug: "sharding",
    term: "Sharding",
    aliases: ["horizontal partitioning", "database sharding"],
    category: "database-internals",
    phaseIds: ["5"],
    lessonIds: [],
    definitions: {
      beginner:
        "Splitting a database across multiple servers so each server only holds a portion of the data — enabling horizontal scaling.",
      intermediate:
        "Each shard holds a subset of rows determined by a shard key. Range sharding: shard by ID or timestamp range. Hash sharding: hash(key) % N gives even distribution. Cross-shard queries and transactions are expensive.",
      advanced:
        "Consistent hashing minimizes reshuffling when adding/removing shards. Vitess (MySQL) and Citus (Postgres) provide sharding middleware. Resharding is operationally painful — choose the shard key carefully upfront. Two-phase commit handles cross-shard transactions but degrades availability.",
    },
    seeAlso: ["replication", "partitioning", "hotspot"],
  },
  {
    slug: "vpc",
    term: "VPC",
    aliases: ["virtual private cloud"],
    category: "cloud",
    phaseIds: ["5"],
    lessonIds: [],
    definitions: {
      beginner:
        "Your own private network inside the cloud — isolated from other customers, with you in control of subnets, routing, and firewalls.",
      intermediate:
        "You define CIDR range (e.g., 10.0.0.0/16), divide into subnets (public: has internet gateway route; private: uses NAT gateway). Security groups act as instance-level firewalls. NACLs act at subnet level. VPC peering connects two VPCs.",
      advanced:
        "Transit Gateway connects many VPCs and on-premises networks via a central hub — replacing full-mesh peering. PrivateLink exposes a service privately without traffic crossing the internet. Flow Logs capture all VPC traffic metadata for security auditing and debugging.",
    },
    seeAlso: ["cdn", "terraform", "load-balancer"],
  },
  {
    slug: "cdn",
    term: "CDN",
    aliases: ["content delivery network", "edge network"],
    category: "cloud",
    phaseIds: ["5"],
    lessonIds: [],
    definitions: {
      beginner:
        "A network of servers spread around the world that cache your content close to users — so pages load faster no matter where users are.",
      intermediate:
        "Edge nodes cache static assets (images, JS, CSS, video). Cache-Control headers control TTL. On cache miss, the edge fetches from origin and caches the response. Also provides DDoS protection, TLS termination, and WAF.",
      advanced:
        "Anycast routing sends users to the nearest edge node by advertising the same IP from multiple locations. CDNs can run edge compute (Cloudflare Workers, Lambda@Edge) to personalize or transform responses without a round-trip to origin. Stale-while-revalidate serves cached content while refreshing in the background.",
    },
    seeAlso: ["vpc", "ssl", "load-balancer"],
  },
  {
    slug: "terraform",
    term: "Terraform",
    aliases: ["iac", "infrastructure as code"],
    category: "cloud",
    phaseIds: ["5"],
    lessonIds: [],
    definitions: {
      beginner:
        "A tool that lets you describe your cloud infrastructure in code — then automatically creates or changes it to match.",
      intermediate:
        "Declarative HCL (HashiCorp Configuration Language) describes desired state. `terraform plan` shows what will change. `terraform apply` makes it so. State file tracks real-world resources. Providers wrap cloud APIs (AWS, GCP, Azure).",
      advanced:
        "Remote state (S3 + DynamoDB lock) enables team collaboration. Terraform modules are reusable components. Workspaces manage multiple environments from one config. Drift detection finds manual changes not in state. Alternatives: Pulumi (real programming languages), CDK (AWS-specific, TypeScript/Python).",
    },
    seeAlso: ["vpc", "ci-cd", "deployment"],
  },
  {
    slug: "slo",
    term: "SLO",
    aliases: ["service level objective", "sli", "sla"],
    category: "cloud",
    phaseIds: ["5"],
    lessonIds: [],
    definitions: {
      beginner:
        "A target for how reliable your service should be — like 'respond to 99.9% of requests in under 200ms'.",
      intermediate:
        "SLI (indicator): the metric you measure (success rate, latency p99). SLO (objective): the target value (99.9% success). SLA (agreement): the contract with consequences if you breach it. Error budget: 100% - SLO — the allowed failure headroom.",
      advanced:
        "Error budget burn rate alerts: if you burn the monthly budget in a day, page immediately. Multiwindow, multi-burn-rate alerts reduce both false positives and detection delay. SLOs should be set from user pain thresholds, not infrastructure capabilities — what actually makes users unhappy?",
    },
    seeAlso: ["observability", "chaos-engineering", "reliability"],
  },
  {
    slug: "observability",
    term: "Observability",
    aliases: ["o11y", "monitoring"],
    category: "cloud",
    phaseIds: ["5"],
    lessonIds: [],
    definitions: {
      beginner:
        "The ability to understand what your system is doing from the outside — by collecting metrics, logs, and traces.",
      intermediate:
        "Three pillars: metrics (aggregated numbers — latency p99, error rate, saturation), logs (discrete events with context), traces (distributed request journeys spanning multiple services). Together they let you ask: is it broken? Where? Why?",
      advanced:
        "OpenTelemetry is the vendor-neutral standard for instrumenting applications. Exemplars link a trace ID to a metric data point — click from a histogram bucket to the exact trace that caused it. Cardinality is the enemy of metrics — high-cardinality dimensions (user IDs) belong in traces, not metric labels.",
    },
    seeAlso: ["slo", "opentelemetry", "tracing"],
  },
  {
    slug: "opentelemetry",
    term: "OpenTelemetry",
    aliases: ["otel"],
    category: "cloud",
    phaseIds: ["5"],
    lessonIds: [],
    definitions: {
      beginner:
        "An open standard and set of tools for collecting metrics, logs, and traces from your application without locking into a specific vendor.",
      intermediate:
        "Provides SDKs for every major language, a wire protocol (OTLP), and a Collector that receives, processes, and exports telemetry to any backend (Prometheus, Jaeger, Datadog, Grafana). Instrument once, export anywhere.",
      advanced:
        "Auto-instrumentation agents inject tracing into frameworks (Express, Django, gRPC) without code changes. Context propagation (W3C TraceContext header) passes trace IDs across service boundaries. Resource attributes identify the source (service.name, service.version, host). Sampling reduces overhead — tail-based sampling keeps interesting traces (errors, slow requests).",
    },
    seeAlso: ["observability", "slo", "tracing"],
  },
  // ── Phase 6: AI/ML Engineering ───────────────────────────────────────────
  {
    slug: "llm",
    term: "Large Language Model",
    aliases: ["LLM"],
    category: "ai",
    phaseIds: ["6"],
    lessonIds: [],
    definitions: {
      beginner:
        "An AI model trained on massive amounts of text that can generate, summarize, translate, and reason about language.",
      intermediate:
        "A neural network with billions of parameters trained on internet-scale text using the transformer architecture. Generates text by predicting the most likely next token. Examples: Claude, GPT-4, Llama.",
      advanced:
        "An autoregressive transformer model trained via next-token prediction on a large corpus, often followed by RLHF/RLAIF alignment. Inference is sequential (one token per forward pass for output). Capabilities emerge at scale — larger models exhibit reasoning, in-context learning, and instruction following not present in smaller models.",
    },
    seeAlso: ["transformer", "token"],
  },
  {
    slug: "transformer",
    term: "Transformer",
    aliases: [],
    category: "ai",
    phaseIds: ["6"],
    lessonIds: [],
    definitions: {
      beginner:
        "The architecture behind every modern AI language model. It processes all words at once using 'attention' to understand context.",
      intermediate:
        "A neural network architecture introduced in 'Attention Is All You Need' (2017). Uses self-attention to weigh relationships between all tokens in parallel, replacing sequential RNNs. The foundation of GPT, Claude, and all modern LLMs.",
      advanced:
        "Multi-head self-attention over input embeddings with positional encoding, followed by feed-forward layers, with residual connections and layer normalization. Encoder-decoder (original), decoder-only (GPT/Claude), or encoder-only (BERT) variants. Computational complexity O(n²) in sequence length; mitigated by FlashAttention, sparse attention, and sliding window approaches.",
    },
    seeAlso: ["llm", "attention"],
  },
  {
    slug: "attention",
    term: "Attention",
    aliases: ["self-attention"],
    category: "ai",
    phaseIds: ["6"],
    lessonIds: [],
    definitions: {
      beginner:
        "The mechanism that lets an AI model look at all the words in a sentence at once and figure out which ones are most relevant to each other.",
      intermediate:
        "A mechanism where each token computes a weighted sum over all other tokens, with weights determined by learned query-key similarity. This is how 'bank' in 'river bank' attends to 'river' to resolve its meaning.",
      advanced:
        "Scaled dot-product attention: Attention(Q,K,V) = softmax(QK^T / √d_k)V. Multi-head attention runs h parallel attention functions with different learned projections. KV-cache stores computed keys/values for autoregressive decoding, trading memory for speed.",
    },
    seeAlso: ["transformer", "llm"],
  },
  {
    slug: "token",
    term: "Token",
    aliases: ["BPE token"],
    category: "ai",
    phaseIds: ["6"],
    lessonIds: [],
    definitions: {
      beginner:
        "A chunk of text (roughly 4 characters) that the AI model processes as one unit. Models think in tokens, not words.",
      intermediate:
        "A sub-word unit produced by Byte Pair Encoding (BPE) or SentencePiece tokenization. Common words are single tokens; rare words are split into pieces. 1 token ≈ 4 English characters. API pricing and context windows are measured in tokens.",
      advanced:
        "The atomic unit of the model's vocabulary. BPE tokenizers iteratively merge frequent byte pairs to build a vocabulary (typically 32K-100K tokens). Tokenization is deterministic and model-specific — the same text produces different token counts on different models. Tiktoken (OpenAI) and the Anthropic tokenizer are the main implementations.",
    },
    seeAlso: ["llm", "context-window"],
  },
  {
    slug: "prompt-engineering",
    term: "Prompt Engineering",
    aliases: [],
    category: "ai",
    phaseIds: ["6"],
    lessonIds: [],
    definitions: {
      beginner: "The skill of writing instructions that get the best results from an AI model.",
      intermediate:
        "Systematic design of prompts to control LLM behavior. Techniques include system prompts, few-shot examples, chain-of-thought reasoning, and structured output formatting. Requires version control, testing, and measurement — it's real engineering.",
      advanced:
        "Prompt optimization over a design space of instruction text, examples, and formatting constraints, evaluated against task-specific metrics. Advanced techniques: constitutional AI prompting, meta-prompting, prompt chaining, and automated prompt optimization (DSPy, OPRO).",
    },
    seeAlso: ["llm", "system-prompt"],
  },
  {
    slug: "embedding",
    term: "Embedding",
    aliases: ["vector embedding"],
    category: "ai",
    phaseIds: ["6"],
    lessonIds: [],
    definitions: {
      beginner:
        "A list of numbers that captures the meaning of a piece of text. Similar texts get similar number lists.",
      intermediate:
        "A dense vector (typically 256-3072 dimensions) that encodes semantic meaning. Produced by embedding models (OpenAI text-embedding-3, Cohere embed-v3, open-source alternatives). Used for similarity search, clustering, and RAG retrieval.",
      advanced:
        "A learned mapping from discrete tokens to a continuous vector space where geometric distance approximates semantic similarity. Cosine similarity is the standard metric. Matryoshka embeddings allow truncation to smaller dimensions with graceful degradation. Embedding models are typically encoder-only transformers trained with contrastive objectives.",
    },
    seeAlso: ["vector-database", "rag"],
  },
  {
    slug: "vector-database",
    term: "Vector Database",
    aliases: ["vector store"],
    category: "ai",
    phaseIds: ["6"],
    lessonIds: [],
    definitions: {
      beginner:
        "A database designed to store and search embeddings — finding the most similar items by meaning, not exact match.",
      intermediate:
        "A specialized database that indexes high-dimensional vectors for fast approximate nearest neighbor (ANN) search. Examples: Pinecone, Qdrant, Weaviate, pgvector (PostgreSQL extension), ChromaDB. Core to every RAG pipeline.",
      advanced:
        "Implements ANN algorithms (HNSW, IVF, product quantization) to trade exactness for speed at scale. HNSW (Hierarchical Navigable Small World) is the dominant index type — O(log n) search with high recall. Metadata filtering combines vector similarity with structured attribute constraints.",
    },
    seeAlso: ["embedding", "rag"],
  },
  {
    slug: "rag",
    term: "RAG",
    aliases: ["Retrieval-Augmented Generation"],
    category: "ai",
    phaseIds: ["6"],
    lessonIds: [],
    definitions: {
      beginner:
        "A pattern where the AI searches for relevant documents first, then uses them as context to answer your question accurately.",
      intermediate:
        "Retrieval-Augmented Generation: retrieve relevant documents from a knowledge base, augment the prompt with them, and generate a response grounded in real context. Reduces hallucination and enables real-time knowledge without retraining.",
      advanced:
        "A pipeline: query → embed → ANN search → rerank → stuff top-K into context → generate. Advanced variants: HyDE (hypothetical document embeddings), multi-step retrieval, query decomposition, parent document retrieval. Evaluated via RAGAS metrics: faithfulness, relevance, precision, recall.",
    },
    seeAlso: ["embedding", "vector-database", "chunking"],
  },
  {
    slug: "chunking",
    term: "Chunking",
    aliases: ["text splitting"],
    category: "ai",
    phaseIds: ["6"],
    lessonIds: [],
    definitions: {
      beginner:
        "Splitting documents into smaller pieces so an AI can search and use them effectively.",
      intermediate:
        "Breaking documents into chunks sized for embedding and retrieval. Strategies: fixed-size (by character/token count), recursive character splitting, semantic chunking (by paragraph/section boundaries). Overlap between chunks preserves context at boundaries.",
      advanced:
        "Chunk size is the critical hyperparameter in RAG quality. Too small (< 100 tokens) loses context; too large (> 1000 tokens) dilutes relevance and wastes context window. Semantic chunking using sentence-level embeddings or LLM-based boundary detection outperforms fixed-size for heterogeneous documents.",
    },
    seeAlso: ["rag", "embedding"],
  },
  {
    slug: "reranking",
    term: "Reranking",
    aliases: ["reranker", "cross-encoder"],
    category: "ai",
    phaseIds: ["6"],
    lessonIds: [],
    definitions: {
      beginner:
        "A second-pass scoring step that re-sorts search results to put the most relevant ones first.",
      intermediate:
        "After initial retrieval (fast but approximate), a reranker scores each result more accurately using a cross-encoder model. Cohere Rerank and open-source cross-encoders are common. Dramatically improves precision at a small latency cost.",
      advanced:
        "Cross-encoders jointly encode (query, document) pairs and produce a relevance score, unlike bi-encoders which encode separately. O(n) per query (score each candidate), so applied only to top-K from the initial retrieval. FlashRank and ColBERT offer faster alternatives with late interaction.",
    },
    seeAlso: ["rag", "embedding"],
  },
  {
    slug: "agent",
    term: "AI Agent",
    aliases: ["agent"],
    category: "ai",
    phaseIds: ["6"],
    lessonIds: [],
    definitions: {
      beginner:
        "An AI system that can use tools, plan multi-step actions, and take actions in the real world — not just generate text.",
      intermediate:
        "An LLM + tools + action loop. The model reasons about what to do, calls tools (search, database, APIs), observes results, and reasons again until the task is complete. The ReAct pattern (Reason + Act) is the standard agent loop.",
      advanced:
        "An autonomous system combining an LLM for reasoning with tool-use capabilities and memory. Key challenges: planning reliability, error recovery, cost control (unbounded loops), and evaluation (non-deterministic multi-step outputs). Multi-agent architectures use specialized agents coordinated by a supervisor.",
    },
    seeAlso: ["tool-calling", "mcp"],
  },
  {
    slug: "tool-calling",
    term: "Tool Calling",
    aliases: ["function calling"],
    category: "ai",
    phaseIds: ["6"],
    lessonIds: [],
    definitions: {
      beginner:
        "When an AI model decides to use a tool (like search, calculator, or database) instead of just generating text.",
      intermediate:
        "The model receives tool definitions (JSON Schema) and can choose to emit a structured tool_use request instead of text. The application executes the tool and returns the result. This is how agents interact with the world.",
      advanced:
        "Implemented via special tokens or output modes in the model. The tool definition includes name, description, and inputSchema. The model's output is parsed for tool_use blocks, executed by the runtime, and results are fed back as tool_result messages for continued generation.",
    },
    seeAlso: ["agent", "mcp"],
  },
  {
    slug: "mcp",
    term: "MCP",
    aliases: ["Model Context Protocol"],
    category: "ai",
    phaseIds: ["6"],
    lessonIds: [],
    definitions: {
      beginner:
        "A standard protocol that lets AI models connect to external tools and data sources in a consistent way.",
      intermediate:
        "Model Context Protocol — an open specification by Anthropic for connecting AI models to tools, resources, and prompts via JSON-RPC 2.0. MCP servers expose capabilities; clients (Claude Desktop, IDEs) connect to them. Transports: stdio, SSE, HTTP.",
      advanced:
        "A client-server protocol with capabilities negotiation during initialization. Servers expose three primitives: tools (executable actions), resources (data sources via URIs), and prompts (reusable templates). The protocol separates what tools exist (discovery) from when to call them (model decision). Designed for composability — multiple MCP servers can be connected to one client.",
    },
    seeAlso: ["tool-calling", "agent"],
  },
  {
    slug: "json-rpc",
    term: "JSON-RPC",
    aliases: ["JSON-RPC 2.0"],
    category: "ai",
    phaseIds: ["6"],
    lessonIds: [],
    definitions: {
      beginner: "A simple way for programs to call functions on each other using JSON messages.",
      intermediate:
        "A lightweight remote procedure call protocol encoded in JSON. Each request has a method, params, and id. Responses include result or error. Used by MCP for communication between AI clients and tool servers.",
      advanced:
        "Spec: jsonrpc.org/specification. Stateless, transport-agnostic. Request: {jsonrpc: '2.0', method, params, id}. Response: {jsonrpc: '2.0', result, id} or {jsonrpc: '2.0', error: {code, message, data}, id}. Notifications have no id and expect no response. Batch requests are arrays.",
    },
    seeAlso: ["mcp"],
  },
  {
    slug: "lora",
    term: "LoRA",
    aliases: ["Low-Rank Adaptation"],
    category: "ai",
    phaseIds: ["6"],
    lessonIds: [],
    definitions: {
      beginner:
        "A technique that makes fine-tuning AI models much cheaper by only training a small add-on instead of changing the whole model.",
      intermediate:
        "Low-Rank Adaptation freezes the pretrained model weights and injects small trainable matrices (adapters) into attention layers. Instead of updating all parameters (billions), you train only the adapter (millions). QLoRA adds quantization (4-bit base model) to further reduce memory.",
      advanced:
        "Decomposes weight updates as ΔW = BA where B ∈ R^{d×r} and A ∈ R^{r×k} with rank r << min(d,k). Typically r=8-64. Alpha scaling controls the adapter's influence. Target modules are usually q_proj and v_proj in attention layers. Merged adapters can be deployed without runtime overhead.",
    },
    seeAlso: ["fine-tuning", "qlora"],
  },
  {
    slug: "qlora",
    term: "QLoRA",
    aliases: ["Quantized LoRA"],
    category: "ai",
    phaseIds: ["6"],
    lessonIds: [],
    definitions: {
      beginner:
        "A way to fine-tune AI models on regular computers by making the base model smaller (4-bit) and only training a tiny add-on.",
      intermediate:
        "Combines 4-bit quantization of the base model with LoRA adapters trained in higher precision. A 7B parameter model that normally needs 28GB VRAM can be fine-tuned with QLoRA on a single 24GB GPU.",
      advanced:
        "Uses NormalFloat4 (NF4) quantization — an information-theoretically optimal data type for normally distributed weights. Double quantization (quantizing the quantization constants) further reduces memory. Paged optimizers handle memory spikes. Published by Dettmers et al. (2023).",
    },
    seeAlso: ["lora", "fine-tuning"],
  },
  {
    slug: "fine-tuning",
    term: "Fine-Tuning",
    aliases: [],
    category: "ai",
    phaseIds: ["6"],
    lessonIds: [],
    definitions: {
      beginner:
        "Teaching an existing AI model to behave differently by training it on your own examples.",
      intermediate:
        "Updating a pretrained model's weights on task-specific data to change its behavior, style, or output format. Uses JSONL training data with system/user/assistant messages. Parameter-efficient methods (LoRA, QLoRA) make this practical without massive compute.",
      advanced:
        "Supervised fine-tuning (SFT) on instruction-output pairs, optionally followed by preference optimization (DPO/RLHF). Full fine-tuning updates all parameters; PEFT methods (LoRA, prefix tuning, adapters) update a small fraction. Key hyperparameters: learning rate (1e-5 to 5e-4), epochs (1-5), batch size, warmup ratio.",
    },
    seeAlso: ["lora", "qlora", "training-data"],
  },
  {
    slug: "context-window",
    term: "Context Window",
    aliases: ["context length"],
    category: "ai",
    phaseIds: ["6"],
    lessonIds: [],
    definitions: {
      beginner:
        "The maximum amount of text an AI model can see and work with at once — like the size of its working memory.",
      intermediate:
        "The total number of tokens (input + output) a model can process in one request. Claude's context window is up to 200K tokens. Exceeding it causes an error. Longer context enables RAG with more documents but increases cost and latency.",
      advanced:
        "Determined by the positional encoding scheme and training data. RoPE (Rotary Position Embeddings) with YaRN or NTK-aware scaling extends context beyond training length. Attention is O(n²) in context length — long contexts are expensive. Prompt caching amortizes repeated prefixes.",
    },
    seeAlso: ["token", "llm"],
  },
  {
    slug: "hallucination",
    term: "Hallucination",
    aliases: [],
    category: "ai",
    phaseIds: ["6"],
    lessonIds: [],
    definitions: {
      beginner:
        "When an AI confidently says something that is not true — like citing a paper that doesn't exist.",
      intermediate:
        "The generation of plausible but factually incorrect content. Happens because LLMs predict statistically likely tokens, not truth. Mitigations: RAG (ground in real documents), citations (verify sources exist), constrained generation, and lower temperature.",
      advanced:
        "A consequence of the autoregressive training objective — the model maximizes P(next_token | context), not P(factually_correct). Closed-book hallucination (no supporting context) differs from open-book (context provided but ignored). Faithfulness metrics (RAGAS) measure hallucination rate. Constitutional AI training reduces but does not eliminate it.",
    },
    seeAlso: ["rag", "llm"],
  },
  {
    slug: "temperature",
    term: "Temperature",
    aliases: [],
    category: "ai",
    phaseIds: ["6"],
    lessonIds: [],
    definitions: {
      beginner:
        "A setting that controls how creative vs predictable an AI's responses are. Lower = more predictable.",
      intermediate:
        "A sampling parameter that scales the token probability distribution before selection. Temperature 0 always picks the most likely token (deterministic). Temperature 0.7 is typical for balanced output. Temperature 1.0+ increases randomness and creativity.",
      advanced:
        "Applied as softmax(logits / T) where T is the temperature. T→0 approaches argmax (greedy decoding). T=1 is the unmodified distribution. T>1 flattens the distribution, increasing entropy. Often combined with top_p (nucleus sampling) which truncates the distribution to the smallest set of tokens whose cumulative probability exceeds p.",
    },
    seeAlso: ["llm", "top-p"],
  },
  {
    slug: "top-p",
    term: "Top-p (Nucleus Sampling)",
    aliases: ["nucleus sampling"],
    category: "ai",
    phaseIds: ["6"],
    lessonIds: [],
    definitions: {
      beginner:
        "A way to limit which words the AI considers when generating text — only the most likely ones that add up to a certain probability.",
      intermediate:
        "A sampling method that considers only the smallest set of tokens whose cumulative probability exceeds p. top_p=0.9 means the model samples from tokens covering 90% of the probability mass, ignoring the long tail of unlikely tokens.",
      advanced:
        "Sorts tokens by descending probability and truncates at cumulative probability ≥ p. Adapts the effective vocabulary per token — high-confidence positions consider fewer candidates than ambiguous ones. Typically set between 0.9-0.95. When combined with temperature, apply temperature first then top-p truncation.",
    },
    seeAlso: ["temperature", "llm"],
  },
  {
    slug: "system-prompt",
    term: "System Prompt",
    aliases: ["system message"],
    category: "ai",
    phaseIds: ["6"],
    lessonIds: [],
    definitions: {
      beginner:
        "Instructions you give the AI at the start of a conversation that tell it how to behave — like a job description.",
      intermediate:
        "A message with role 'system' that sets persistent behavior, personality, constraints, and output format for the conversation. The primary control surface for LLM behavior. Processed before user messages and treated as authoritative instructions.",
      advanced:
        "In Anthropic's API, passed as a top-level 'system' string (not in the messages array). In OpenAI's API, the first message with role='system'. Cached separately by prompt caching systems for cost efficiency. Vulnerable to prompt injection — user input can attempt to override system instructions.",
    },
    seeAlso: ["prompt-engineering", "llm"],
  },
  {
    slug: "structured-output",
    term: "Structured Output",
    aliases: ["JSON mode"],
    category: "ai",
    phaseIds: ["6"],
    lessonIds: [],
    definitions: {
      beginner:
        "Getting AI to respond in a specific format (like JSON) instead of free text, so your code can reliably parse the response.",
      intermediate:
        "Techniques for constraining LLM output to a machine-readable format. Approaches: tool use / function calling (model fills a JSON Schema), JSON mode (API constrains output to valid JSON), or prompt-based (ask for JSON and validate). Always validate the output.",
      advanced:
        "Tool use provides the strongest guarantees — the model is constrained to emit a tool_use content block matching the provided inputSchema. Constrained decoding (grammar-based sampling) guarantees syntactic validity at the token level. Even with constraints, semantic validation (Zod, Pydantic) is necessary for business rules.",
    },
    seeAlso: ["tool-calling", "llm"],
  },
  {
    slug: "semantic-cache",
    term: "Semantic Cache",
    aliases: [],
    category: "ai",
    phaseIds: ["6"],
    lessonIds: [],
    definitions: {
      beginner:
        "A cache that returns a stored AI response when a new question is similar in meaning (not just identical) to a previous one.",
      intermediate:
        "Embeds incoming prompts and checks similarity against cached prompt embeddings. If cosine similarity exceeds a threshold, returns the cached response without calling the model. Reduces cost and latency for repetitive queries with varying phrasing.",
      advanced:
        "Requires a vector store for prompt embeddings alongside a key-value store for responses. Threshold tuning is critical — too low returns incorrect cached results, too high misses valid cache hits. Unsuitable for personalized, time-sensitive, or multi-turn conversations where context changes the expected response.",
    },
    seeAlso: ["embedding", "vector-database"],
  },
  {
    slug: "guardrail",
    term: "Guardrail",
    aliases: ["AI guardrail"],
    category: "ai",
    phaseIds: ["6"],
    lessonIds: [],
    definitions: {
      beginner:
        "Safety checks on AI input and output — catching bad requests before they reach the model and bad responses before they reach the user.",
      intermediate:
        "Input guardrails: PII detection, prompt injection scanning, content policy filtering, input validation. Output guardrails: schema validation, safety classification, hallucination detection, toxicity checks. Defense in depth — layer multiple guardrails.",
      advanced:
        "Implemented as middleware in the AI service pipeline. Input guardrails run before inference (fast, cheap). Output guardrails run after (may use a secondary model for classification). Guardrail frameworks: Guardrails AI, NeMo Guardrails, custom regex + classifier pipelines. False positive rate is the key metric — blocking valid requests erodes trust.",
    },
    seeAlso: ["prompt-engineering", "hallucination"],
  },
  {
    slug: "eval-harness",
    term: "Eval Harness",
    aliases: ["evaluation harness"],
    category: "ai",
    phaseIds: ["6"],
    lessonIds: [],
    definitions: {
      beginner:
        "A testing tool that automatically checks if your AI system gives good answers on a set of example questions.",
      intermediate:
        "A script or framework that runs an AI system against a curated set of test cases and reports metrics (accuracy, faithfulness, relevance, latency, cost). Run on every prompt change to catch regressions. The AI equivalent of a test suite.",
      advanced:
        "Components: golden dataset (input + expected output pairs), scoring functions (exact match, LLM-as-judge, RAGAS metrics), reporting (aggregate scores, per-category breakdowns), and CI integration (fail the build if metrics degrade). Advanced: multi-turn evaluation, trajectory scoring for agents, human-in-the-loop annotation.",
    },
    seeAlso: ["rag", "hallucination"],
  },
  {
    slug: "function-calling",
    term: "Function Calling",
    aliases: [],
    category: "ai",
    phaseIds: ["6"],
    lessonIds: [],
    definitions: {
      beginner:
        "Another name for tool calling — when the AI decides to use a specific function you defined instead of just generating text.",
      intermediate:
        "OpenAI's term for tool use. You define functions with name, description, and parameters (JSON Schema). The model can choose to call a function, and you execute it and return the result. Anthropic calls the same concept 'tool use.'",
      advanced:
        "Parallel function calling allows models to emit multiple tool_use blocks in one turn. Forced tool use constrains the model to always call a specific tool (useful for structured extraction). The tool_choice parameter controls this: 'auto' (model decides), 'any' (must call at least one), or specific tool name.",
    },
    seeAlso: ["tool-calling", "structured-output"],
  },
  {
    slug: "perplexity",
    term: "Perplexity",
    aliases: [],
    category: "ai",
    phaseIds: ["6"],
    lessonIds: [],
    definitions: {
      beginner:
        "A score that measures how surprised a language model is by new text. Lower = the model is better at predicting what comes next.",
      intermediate:
        "The exponentiated average negative log-likelihood of the test set. A model with perplexity 10 is, on average, as uncertain as choosing uniformly among 10 options per token. Lower perplexity means better language modeling. Used to compare base models and detect overfitting during fine-tuning.",
      advanced:
        "PPL = exp(-1/N Σ log P(t_i | t_<i)). Computed over the full test set. Sensitive to tokenization — only comparable between models with the same tokenizer. Not a direct measure of task quality (a model can have low perplexity but poor instruction-following). Use alongside task-specific metrics.",
    },
    seeAlso: ["fine-tuning", "llm"],
  },
  {
    slug: "vllm",
    term: "vLLM",
    aliases: [],
    category: "ai",
    phaseIds: ["6"],
    lessonIds: [],
    definitions: {
      beginner: "A tool for running AI models fast and efficiently, serving many users at once.",
      intermediate:
        "A high-throughput LLM serving engine that uses PagedAttention to manage GPU memory efficiently. Supports continuous batching, tensor parallelism, and OpenAI-compatible API endpoints. The standard choice for self-hosted LLM inference in production.",
      advanced:
        "PagedAttention stores KV-cache in non-contiguous memory pages, eliminating internal fragmentation that wastes 60-80% of memory in naive implementations. Continuous batching adds new requests to running batches without waiting for completion. Supports speculative decoding, AWQ/GPTQ quantization, and multi-GPU tensor parallelism.",
    },
    seeAlso: ["llm", "fine-tuning"],
  },
  // ── Phase 7: Advanced Systems ────────────────────────────────────────────
  {
    slug: "compiler",
    term: "Compiler",
    aliases: [],
    category: "systems",
    phaseIds: ["7"],
    lessonIds: [],
    definitions: {
      beginner:
        "A program that translates source code into machine code or bytecode before it runs.",
      intermediate:
        "Transforms source code through a pipeline: lexing → parsing → semantic analysis → optimization → code generation. Ahead-of-time (AOT) compilers (GCC, rustc) produce executables; JIT compilers (V8, JVM) compile at runtime.",
      advanced:
        "Multi-pass compilation separates front-end (source-specific: lexer, parser, AST) from back-end (target-specific: IR, register allocation, instruction selection). LLVM provides a shared back-end IR used by Rust, Swift, and Clang.",
    },
    seeAlso: ["lexer", "parser", "ast"],
  },
  {
    slug: "lexer",
    term: "Lexer",
    aliases: ["scanner", "tokenizer"],
    category: "systems",
    phaseIds: ["7"],
    lessonIds: [],
    definitions: {
      beginner:
        "The first stage of a compiler — it breaks source code text into small labeled chunks called tokens.",
      intermediate:
        "Reads a character stream and produces a token stream. Each token has a type (keyword, identifier, literal, operator) and a value. Typically implemented with regular expressions or hand-written state machines.",
      advanced:
        "Maximal munch: the lexer always matches the longest possible token. Context-sensitive lexing (e.g., JSX angle brackets vs comparison operators) requires lexer modes or parser feedback. Performance: O(n) in input length.",
    },
    seeAlso: ["compiler", "parser"],
  },
  {
    slug: "parser",
    term: "Parser",
    aliases: [],
    category: "systems",
    phaseIds: ["7"],
    lessonIds: [],
    definitions: {
      beginner:
        "Takes tokens from the lexer and builds a tree structure (AST) that represents the program's grammar.",
      intermediate:
        "Implements a context-free grammar. Recursive descent parsers map each grammar rule to a function. Pratt parsing handles operator precedence elegantly. Parser generators (ANTLR, PEG.js) automate construction from grammar specs.",
      advanced:
        "LL (top-down, left-to-right) vs LR (bottom-up) parsing. Recursive descent is LL(k). Error recovery: synchronization points (semicolons, braces) allow parsing to continue after syntax errors. Parser combinators compose small parsers into larger ones.",
    },
    seeAlso: ["lexer", "ast"],
  },
  {
    slug: "ast",
    term: "AST",
    aliases: ["Abstract Syntax Tree"],
    category: "systems",
    phaseIds: ["7"],
    lessonIds: [],
    definitions: {
      beginner:
        "A tree that represents the structure of source code. Linters, formatters, and compilers all use ASTs.",
      intermediate:
        "A tree of nodes where each node represents a language construct (literal, binary expression, function declaration). Unlike a parse tree, it omits syntactic details (parentheses, semicolons) and captures only semantic structure.",
      advanced:
        "ASTs enable separation of syntax from semantics. The visitor pattern traverses the tree without modifying it. ESTree is the standard AST format for JavaScript (used by ESLint, Babel, Prettier). CSTs (Concrete Syntax Trees) preserve all syntactic information for formatters.",
    },
    seeAlso: ["compiler", "parser"],
  },
  {
    slug: "bytecode",
    term: "Bytecode",
    aliases: ["intermediate code"],
    category: "systems",
    phaseIds: ["7"],
    lessonIds: [],
    definitions: {
      beginner:
        "A simplified instruction set that a virtual machine runs — halfway between source code and machine code.",
      intermediate:
        "Platform-independent instructions for a virtual machine. JVM bytecode, Python bytecode (.pyc), and V8's Ignition bytecode all serve this role. Faster to interpret than source code; can be JIT-compiled to native code for hot paths.",
      advanced:
        "Stack-based (JVM, CPython) vs register-based (Lua, V8 Ignition) VMs. Bytecode verification ensures type safety without re-parsing. AOT compilation from bytecode (GraalVM native-image, Android ART) enables startup-time optimization.",
    },
    seeAlso: ["compiler"],
  },
  {
    slug: "cap-theorem",
    term: "CAP Theorem",
    aliases: ["Brewer's theorem"],
    category: "systems",
    phaseIds: ["7"],
    lessonIds: [],
    definitions: {
      beginner:
        "A distributed system can guarantee at most two of three things: consistency, availability, and partition tolerance.",
      intermediate:
        "In a network partition, you must choose: CP systems (MongoDB, HBase) refuse requests to stay consistent; AP systems (Cassandra, DynamoDB) serve requests but may return stale data. CA is impossible in the presence of partitions (and partitions always happen).",
      advanced:
        "The PACELC extension: in Partition → choose A or C; Else → choose Latency or Consistency. This captures the everyday tradeoff better than CAP alone. Jepsen testing empirically verifies consistency claims under failure.",
    },
    seeAlso: ["consensus", "raft"],
  },
  {
    slug: "consensus",
    term: "Consensus",
    aliases: [],
    category: "systems",
    phaseIds: ["7"],
    lessonIds: [],
    definitions: {
      beginner:
        "Getting multiple computers to agree on the same value — even when some of them fail or messages get lost.",
      intermediate:
        "The consensus problem: N nodes must agree on a single value despite crashes and network delays. Raft and Paxos are the dominant algorithms. Used by etcd, ZooKeeper, CockroachDB, and every replicated database.",
      advanced:
        "Safety (never disagree) and liveness (eventually decide) under crash-fault models. Byzantine fault tolerance (BFT) handles malicious nodes but at higher cost. FLP impossibility: no deterministic consensus protocol can guarantee termination in an asynchronous system with even one crash failure.",
    },
    seeAlso: ["raft", "cap-theorem"],
  },
  {
    slug: "raft",
    term: "Raft",
    aliases: [],
    category: "systems",
    phaseIds: ["7"],
    lessonIds: [],
    definitions: {
      beginner:
        "A way for a group of servers to elect a leader and agree on a shared log of events — even if some servers crash.",
      intermediate:
        "A consensus algorithm: leader election (randomized timeouts), log replication (leader sends entries, followers acknowledge), and safety (committed entries are never lost). Designed to be understandable — the paper's explicit goal over Paxos.",
      advanced:
        "Term numbers provide monotonic logical time. The Leader Completeness Property guarantees a leader has all committed entries. Membership changes use joint consensus. Implementations: etcd (Kubernetes), CockroachDB, TiKV. Performance: one round-trip for replication in the common case.",
    },
    seeAlso: ["consensus", "cap-theorem"],
  },
  {
    slug: "crdt",
    term: "CRDT",
    aliases: ["Conflict-free Replicated Data Type"],
    category: "systems",
    phaseIds: ["7"],
    lessonIds: [],
    definitions: {
      beginner:
        "A data structure that can be copied to many servers and merged back together without conflicts.",
      intermediate:
        "Data types where concurrent updates always converge to the same state regardless of merge order. G-Counter (grow-only), LWW-Register (last-writer-wins), OR-Set (observed-remove set). Used in collaborative editing, offline-first apps, and eventually consistent stores.",
      advanced:
        "State-based CRDTs merge via a join semilattice; operation-based CRDTs require exactly-once causal delivery. The tradeoff: CRDTs guarantee convergence but limit the operations you can express. Automerge and Yjs are production CRDT frameworks for rich text and JSON documents.",
    },
    seeAlso: ["consensus", "cap-theorem"],
  },
  {
    slug: "consistent-hashing",
    term: "Consistent Hashing",
    aliases: [],
    category: "systems",
    phaseIds: ["7"],
    lessonIds: [],
    definitions: {
      beginner:
        "A way to spread data across servers so that adding or removing a server moves as little data as possible.",
      intermediate:
        "Maps both keys and nodes onto a hash ring. Each key is assigned to the next node clockwise. Adding a node only moves keys between the new node and its neighbor. Virtual nodes (multiple positions per physical node) improve balance.",
      advanced:
        "Expected data movement on a node change: K/n keys (vs K keys for naive modulo). Jump consistent hash is an alternative with perfect balance and O(1) computation. Rendezvous hashing (highest random weight) is simpler and provides the same guarantees.",
    },
    seeAlso: ["cap-theorem"],
  },
  {
    slug: "message-queue",
    term: "Message Queue",
    aliases: ["message broker"],
    category: "systems",
    phaseIds: ["7"],
    lessonIds: [],
    definitions: {
      beginner:
        "A system that stores messages between services so they can communicate without being online at the same time.",
      intermediate:
        "Decouples producers from consumers. Delivery semantics: at-most-once (may lose), at-least-once (may duplicate), exactly-once (idempotent consumers). Kafka, RabbitMQ, SQS are dominant. Patterns: pub/sub, work queues, dead letter queues.",
      advanced:
        "Kafka's log-based architecture: ordered, partitioned, replicated append-only log. Consumer groups enable parallel processing with partition assignment. Exactly-once via idempotent producers + transactional consumers. Backpressure: consumer lag monitoring triggers scaling or alerting.",
    },
    seeAlso: ["consensus"],
  },
  {
    slug: "saga",
    term: "Saga",
    aliases: ["saga pattern"],
    category: "systems",
    phaseIds: ["7"],
    lessonIds: [],
    definitions: {
      beginner:
        "A way to handle a multi-step operation across services where each step can be undone if a later step fails.",
      intermediate:
        "A sequence of local transactions with compensating actions for rollback. Choreography: each service triggers the next via events. Orchestration: a central coordinator manages the sequence. Replaces distributed transactions (2PC) in microservices.",
      advanced:
        "Sagas trade atomicity for availability — intermediate states are visible. Semantic locking (soft state fields like 'pending') mitigates this. Compensation must be idempotent. The orchestrator is itself a state machine that must handle crashes and retries.",
    },
    seeAlso: ["consensus", "message-queue"],
  },
  {
    slug: "ownership",
    term: "Ownership (Rust)",
    aliases: [],
    category: "systems",
    phaseIds: ["7"],
    lessonIds: [],
    definitions: {
      beginner:
        "Rust's rule that every value has exactly one owner — when the owner goes away, the value is automatically cleaned up.",
      intermediate:
        "Three rules: (1) each value has one owner, (2) ownership can be moved (invalidating the original), (3) when the owner goes out of scope, the value is dropped. This eliminates use-after-free and double-free without garbage collection.",
      advanced:
        "Ownership models the concept of affine types (used at most once). Move semantics transfer ownership; Copy trait opts into bitwise copy for stack-allocated types. Drop trait customizes cleanup. The borrow checker statically verifies ownership rules at compile time with zero runtime cost.",
    },
    seeAlso: ["borrowing", "lifetime"],
  },
  {
    slug: "borrowing",
    term: "Borrowing (Rust)",
    aliases: ["references"],
    category: "systems",
    phaseIds: ["7"],
    lessonIds: [],
    definitions: {
      beginner:
        "Lending a value to a function without giving up ownership — like letting someone read your book without giving it away.",
      intermediate:
        "Creating a reference (&T for immutable, &mut T for mutable) without moving ownership. The rule: you can have many &T OR one &mut T, never both simultaneously. This prevents data races at compile time.",
      advanced:
        "Non-lexical lifetimes (NLL) allow borrows to end before the scope closes, based on usage analysis. Reborrowing allows passing &mut to functions that take &mut without moving the borrow. Interior mutability (Cell, RefCell, Mutex) provides runtime-checked mutation through shared references.",
    },
    seeAlso: ["ownership", "lifetime"],
  },
  {
    slug: "lifetime",
    term: "Lifetime (Rust)",
    aliases: [],
    category: "systems",
    phaseIds: ["7"],
    lessonIds: [],
    definitions: {
      beginner:
        "A label that tells the Rust compiler how long a reference is valid — preventing it from outliving the data it points to.",
      intermediate:
        "Lifetime annotations ('a) explicitly mark how long references are valid relative to each other. The compiler infers most lifetimes via elision rules. 'static means the data lives for the entire program (string literals, owned data in threads).",
      advanced:
        "Lifetimes are a form of region-based memory management verified at compile time. Variance: &'a T is covariant in 'a (longer lifetimes can substitute for shorter ones). Higher-ranked trait bounds (for<'a>) express lifetimes that must work for any lifetime.",
    },
    seeAlso: ["ownership", "borrowing"],
  },
  {
    slug: "trait",
    term: "Trait (Rust)",
    aliases: [],
    category: "systems",
    phaseIds: ["7"],
    lessonIds: [],
    definitions: {
      beginner:
        "A set of methods that a type can implement — like a contract that says 'I can do these things.'",
      intermediate:
        "Rust's version of interfaces. Define with `trait Display { fn fmt(&self, f: &mut Formatter) -> Result; }`. Implement with `impl Display for MyType { ... }`. Generic bounds: `fn print<T: Display>(val: T)` requires T to implement Display.",
      advanced:
        "Traits enable static dispatch (monomorphization — zero-cost) via generics and dynamic dispatch (vtable — runtime cost) via `dyn Trait`. Blanket implementations (`impl<T: Display> ToString for T`) provide derived behavior. Orphan rules prevent conflicting implementations across crates.",
    },
    seeAlso: ["ownership"],
  },
  {
    slug: "profiling",
    term: "Profiling",
    aliases: ["performance profiling"],
    category: "systems",
    phaseIds: ["7"],
    lessonIds: [],
    definitions: {
      beginner: "Measuring where your program spends its time so you know what to optimize.",
      intermediate:
        "Sampling-based profilers (periodically record the call stack) provide low-overhead statistical data. Instrumentation-based profilers (inject measurement code) give exact counts but slow execution. Flame graphs visualize the results: width = time, stack depth = call chain.",
      advanced:
        "CPU profilers: Linux perf, Node.js --prof, Chrome DevTools Performance tab. Memory profilers: heap snapshots, allocation timelines. Continuous profiling in production (Pyroscope, Parca) catches performance regressions that only appear under real load.",
    },
    seeAlso: ["flame-graph"],
  },
  {
    slug: "flame-graph",
    term: "Flame Graph",
    aliases: [],
    category: "systems",
    phaseIds: ["7"],
    lessonIds: [],
    definitions: {
      beginner:
        "A chart where each bar is a function and its width shows how much time was spent there. Wider = slower.",
      intermediate:
        "Visualizes profiling data as stacked bars: x-axis is time (or sample count), y-axis is call depth. The widest bars at the top are the biggest optimization targets. Invented by Brendan Gregg. Available in Chrome DevTools, Node.js, and most profiling tools.",
      advanced:
        "Differential flame graphs compare two profiles (before/after) by color-coding changes. Icicle graphs (inverted flame graphs) show callers instead of callees. Cold flame graphs highlight functions called infrequently but expensively per-call.",
    },
    seeAlso: ["profiling"],
  },
  {
    slug: "cache-invalidation",
    term: "Cache Invalidation",
    aliases: [],
    category: "systems",
    phaseIds: ["7"],
    lessonIds: [],
    definitions: {
      beginner:
        "Deciding when cached data is stale and should be refreshed — famously one of the hardest problems in computer science.",
      intermediate:
        "Strategies: TTL (expire after N seconds), event-driven (invalidate on write), versioning (cache key includes version). Write-through (update cache on write), write-behind (write to cache, async persist). Stale-while-revalidate serves cached data while fetching fresh.",
      advanced:
        "Thundering herd: when a popular cached item expires, hundreds of requests hit the origin simultaneously. Mitigate with request coalescing (single-flight) or probabilistic early expiration. Distributed cache invalidation across multiple servers requires pub/sub or gossip protocols.",
    },
    seeAlso: ["profiling"],
  },
  {
    slug: "back-pressure",
    term: "Back-Pressure",
    aliases: ["backpressure"],
    category: "systems",
    phaseIds: ["7"],
    lessonIds: [],
    definitions: {
      beginner:
        "A way for a slow part of a system to tell the fast part to slow down, preventing overwhelm.",
      intermediate:
        "When a consumer processes slower than a producer produces, without back-pressure the queue between them grows until memory runs out. Back-pressure signals the producer to slow down (reject requests, apply rate limiting, or drop lowest-priority work).",
      advanced:
        "Reactive Streams specification defines back-pressure semantics (request-based pull model). TCP flow control is back-pressure at the transport layer (receiver window). In Node.js, stream.pipe() implements back-pressure via the drain event. Bounded queues with blocking push are the simplest form.",
    },
    seeAlso: ["message-queue"],
  },
];

export const DICTIONARY_BY_SLUG: Map<string, DictionaryTerm> = new Map(
  DICTIONARY.map((t) => [t.slug, t])
);
