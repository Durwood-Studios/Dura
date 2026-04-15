import type { DictionaryTerm } from "@/types/dictionary";

/**
 * Dictionary expansion batch — 60 terms filling gaps across all phases.
 * Brings the dictionary from ~446 to 506+ unique terms.
 */
export const EXPANSION_TERMS: DictionaryTerm[] = [
  // ── Phase 0: Digital Literacy (6) ─────────────────────────────────────

  {
    slug: "file-system",
    term: "File System",
    aliases: ["filesystem", "fs"],
    category: "fundamentals",
    phaseIds: ["0"],
    lessonIds: [],
    definitions: {
      beginner:
        "The system your computer uses to organize files into folders — like a filing cabinet with labeled drawers and folders inside.",
      intermediate:
        "An OS abstraction that maps human-readable paths (/home/user/file.txt) to physical storage locations. Manages metadata (permissions, timestamps), directories, and free space. Common file systems: ext4 (Linux), APFS (macOS), NTFS (Windows).",
      advanced:
        "File systems implement a tree-structured namespace over block devices. Journaling file systems (ext4, NTFS) write metadata changes to a log before applying them — crash-safe at the cost of write amplification. Copy-on-write file systems (btrfs, ZFS) never overwrite data in place.",
    },
    seeAlso: ["inode", "shell", "terminal"],
  },
  {
    slug: "ip-address",
    term: "IP Address",
    aliases: ["IP", "internet protocol address"],
    category: "networking",
    phaseIds: ["0"],
    lessonIds: [],
    definitions: {
      beginner:
        "A unique number that identifies every device on the internet — like a street address for your computer.",
      intermediate:
        "IPv4 addresses are 32-bit (4 octets, e.g. 192.168.1.1, ~4.3 billion total). IPv6 addresses are 128-bit (e.g. 2001:db8::1). Private ranges (10.x, 172.16-31.x, 192.168.x) are used inside networks; NAT translates them to public addresses for the internet.",
      advanced:
        "CIDR notation (10.0.0.0/24) specifies subnet masks. DHCP assigns addresses dynamically. BGP advertises IP prefix routes between autonomous systems. IPv4 exhaustion drove NAT proliferation and the transition to IPv6, though dual-stack operation remains common.",
    },
    seeAlso: ["dns", "http", "url"],
  },
  {
    slug: "bandwidth",
    term: "Bandwidth",
    aliases: ["throughput"],
    category: "networking",
    phaseIds: ["0"],
    lessonIds: [],
    definitions: {
      beginner:
        "How much data can flow through a connection at once — like the width of a highway determining how many cars can drive side by side.",
      intermediate:
        "Measured in bits per second (Mbps, Gbps). Bandwidth is the maximum capacity; throughput is the actual achieved rate. Throughput is limited by bandwidth, latency, packet loss, and protocol overhead. A 1 Gbps link rarely delivers 1 Gbps of application data.",
      advanced:
        "Shannon's theorem sets the theoretical maximum channel capacity based on bandwidth and signal-to-noise ratio. TCP throughput is bounded by bandwidth-delay product (BDP = bandwidth × RTT). High-BDP links ('long fat networks') require large TCP windows to saturate.",
    },
    seeAlso: ["tcp", "http", "cdn"],
  },
  {
    slug: "compression",
    term: "Compression",
    aliases: ["data compression", "zip"],
    category: "fundamentals",
    phaseIds: ["0"],
    lessonIds: [],
    definitions: {
      beginner:
        "Making files smaller so they take up less space and transfer faster — like vacuum-sealing clothes to fit more in a suitcase.",
      intermediate:
        "Lossless compression (gzip, Brotli, zstd) preserves all data — used for code, text, and archives. Lossy compression (JPEG, MP3, H.264) discards imperceptible detail for much smaller sizes — used for media. Web servers typically gzip/brotli HTML, CSS, and JS responses.",
      advanced:
        "Huffman coding assigns shorter bit sequences to common symbols. LZ77 (used by gzip) replaces repeated sequences with back-references. Brotli uses a pre-shared dictionary of common web strings for better ratios on HTML/CSS. Content-Encoding and Accept-Encoding headers negotiate compression in HTTP.",
    },
    seeAlso: ["http", "bandwidth", "cdn"],
  },
  {
    slug: "pixel",
    term: "Pixel",
    aliases: ["px", "picture element"],
    category: "fundamentals",
    phaseIds: ["0"],
    lessonIds: [],
    definitions: {
      beginner:
        "The smallest dot of color on a screen — millions of them together make up everything you see.",
      intermediate:
        "In CSS, `px` is a logical unit — not always a physical pixel. On high-DPI displays (Retina), 1 CSS pixel may map to 2×2 or 3×3 device pixels. `window.devicePixelRatio` reveals the ratio. Images should be 2× or 3× for sharp rendering on these screens.",
      advanced:
        "The CSS px is defined as 1/96 of an inch at arm's length viewing distance (CSS Values spec). Sub-pixel rendering (ClearType, FreeType) uses individual RGB sub-pixels to increase effective resolution for text. Canvas and WebGL operate in device pixels when `getContext` uses the pixel ratio.",
    },
    seeAlso: ["responsive", "viewport", "css"],
  },
  {
    slug: "encryption",
    term: "Encryption",
    aliases: ["cipher", "encrypted"],
    category: "fundamentals",
    phaseIds: ["0"],
    lessonIds: [],
    definitions: {
      beginner:
        "Scrambling data so only the intended recipient can read it — like writing a letter in a secret code that only your friend knows.",
      intermediate:
        "Symmetric encryption (AES) uses one shared key for encrypt and decrypt — fast, used for data at rest and TLS session data. Asymmetric encryption (RSA, ECDSA) uses a key pair (public encrypts, private decrypts) — used for key exchange and digital signatures.",
      advanced:
        "AES-256-GCM provides authenticated encryption (confidentiality + integrity). ECDH key exchange derives a shared secret without transmitting it. Forward secrecy (ephemeral keys per session) means compromising a long-term key doesn't decrypt past traffic. TLS 1.3 mandates forward secrecy.",
    },
    seeAlso: ["tls", "bcrypt", "jwt"],
  },

  // ── Phase 1: Programming Fundamentals (12) ────────────────────────────

  {
    slug: "boolean",
    term: "Boolean",
    aliases: ["bool", "true/false"],
    category: "fundamentals",
    phaseIds: ["1"],
    lessonIds: [],
    definitions: {
      beginner:
        "A value that is either true or false — the simplest type of data, like a yes/no question.",
      intermediate:
        "Named after George Boole. In JavaScript, falsy values include false, 0, '', null, undefined, and NaN — everything else is truthy. Booleans are the result of comparison operators (===, <, >) and logical operators (&&, ||, !).",
      advanced:
        "In typed languages, booleans occupy 1 byte despite needing only 1 bit — alignment and addressing constraints dictate this. Bitfields and bit manipulation can pack multiple booleans into a single integer. Short-circuit evaluation (&&, ||) means the right operand may never execute.",
    },
    seeAlso: ["conditional", "variable", "type-coercion"],
  },
  {
    slug: "null-undefined",
    term: "Null and Undefined",
    aliases: ["null", "undefined", "nil"],
    category: "fundamentals",
    phaseIds: ["1"],
    lessonIds: [],
    definitions: {
      beginner:
        "Two ways JavaScript says 'nothing here.' Undefined means a variable exists but has no value yet. Null means you deliberately set it to empty.",
      intermediate:
        "typeof null === 'object' (a famous JS bug from 1995). typeof undefined === 'undefined'. Use === (strict equality) to distinguish them — null == undefined is true but null === undefined is false. Optional chaining (?.) and nullish coalescing (??) handle both safely.",
      advanced:
        "TypeScript's strictNullChecks mode removes null and undefined from all types unless explicitly included (string | null). This eliminates the 'billion dollar mistake' of nullable references at compile time. Other languages use Option/Maybe types (Rust's Option<T>, Haskell's Maybe) instead of null.",
    },
    seeAlso: ["variable", "type-coercion", "boolean"],
  },
  {
    slug: "class",
    term: "Class",
    aliases: ["class definition"],
    category: "fundamentals",
    phaseIds: ["1"],
    lessonIds: [],
    definitions: {
      beginner:
        "A blueprint for creating objects — define it once, then make as many objects from it as you need.",
      intermediate:
        "In JavaScript, classes are syntactic sugar over prototypal inheritance. A class has a constructor, methods, and optionally static methods and private fields (#field). Use `new ClassName()` to instantiate. Extends + super() for inheritance.",
      advanced:
        "JavaScript classes compile to constructor functions + prototype chains. Private fields (#) are enforced by the engine at runtime — not just a convention. Abstract classes don't exist natively in JS; TypeScript adds them. Favor composition over inheritance for flexible, testable designs.",
    },
    seeAlso: ["object", "function", "inheritance"],
  },
  {
    slug: "inheritance",
    term: "Inheritance",
    aliases: ["extends", "subclass"],
    category: "fundamentals",
    phaseIds: ["1"],
    lessonIds: [],
    definitions: {
      beginner:
        "When a new class gets all the abilities of an existing class and can add its own — like a child inheriting traits from a parent.",
      intermediate:
        "class Dog extends Animal creates a Dog that has all of Animal's methods plus its own. super() calls the parent constructor. Methods can be overridden. JavaScript supports single inheritance only — use mixins or composition for multiple behavior sources.",
      advanced:
        "Deep inheritance hierarchies are fragile — the fragile base class problem. The Liskov Substitution Principle requires subclasses to be usable anywhere the parent is expected. Composition over inheritance (embedding objects instead of extending classes) is preferred in modern design.",
    },
    seeAlso: ["class", "polymorphism", "encapsulation"],
  },
  {
    slug: "polymorphism",
    term: "Polymorphism",
    aliases: ["poly"],
    category: "fundamentals",
    phaseIds: ["1"],
    lessonIds: [],
    definitions: {
      beginner:
        "The ability for different objects to respond to the same method call in their own way — like how both a dog and a cat 'speak' but make different sounds.",
      intermediate:
        "In OOP: method overriding (subclass provides its own version of a parent method). In TypeScript: interfaces allow different classes to implement the same contract. Duck typing in JS: if it has a .quack() method, treat it as a duck.",
      advanced:
        "Ad-hoc polymorphism (function overloading), subtype polymorphism (inheritance-based dispatch), and parametric polymorphism (generics) are the three classical forms. TypeScript uses structural typing — polymorphism based on shape, not nominal class hierarchy.",
    },
    seeAlso: ["inheritance", "class", "interface-type"],
  },
  {
    slug: "encapsulation",
    term: "Encapsulation",
    aliases: ["information hiding"],
    category: "fundamentals",
    phaseIds: ["1"],
    lessonIds: [],
    definitions: {
      beginner:
        "Keeping an object's internal details hidden and only exposing what others need to use — like a TV remote with buttons but no exposed circuit board.",
      intermediate:
        "In JavaScript, use private fields (#balance) or closures to hide internal state. Public methods expose a controlled interface. This prevents external code from depending on implementation details that may change.",
      advanced:
        "Encapsulation reduces coupling between modules. The information expert principle (GRASP) assigns responsibility to the class that has the data. TypeScript's private/protected keywords are compile-time only; JavaScript's # fields are runtime-enforced.",
    },
    seeAlso: ["class", "closure", "scope"],
  },
  {
    slug: "interface-type",
    term: "Interface",
    aliases: ["contract", "protocol"],
    category: "fundamentals",
    phaseIds: ["1"],
    lessonIds: [],
    definitions: {
      beginner:
        "A contract that says 'any object that claims to be this type must have these properties and methods' — like a job description listing required skills.",
      intermediate:
        "In TypeScript: `interface Printable { print(): void }`. Any class or object matching the shape satisfies it — no explicit 'implements' required (structural typing). Interfaces can extend other interfaces. Use interfaces for object shapes; types for unions and utilities.",
      advanced:
        "TypeScript interfaces are open (declaration merging) while type aliases are closed. In languages like Go, interfaces are satisfied implicitly (structural). In Java/C#, they're satisfied explicitly (nominal). Protocol-oriented programming (Swift) builds around interface-first design.",
    },
    seeAlso: ["class", "polymorphism", "generic"],
  },
  {
    slug: "generic",
    term: "Generic",
    aliases: ["type parameter", "generics"],
    category: "fundamentals",
    phaseIds: ["1"],
    lessonIds: [],
    definitions: {
      beginner:
        "A way to write a function or class that works with any type — like a box that can hold shoes, books, or anything, while still knowing what's inside.",
      intermediate:
        "In TypeScript: `function identity<T>(value: T): T { return value; }`. The type parameter T is filled in when called. Constraints: `<T extends HasLength>` restricts T to types with a length property. Used heavily in collections, utilities, and API types.",
      advanced:
        "TypeScript generics are erased at compile time — zero runtime cost. Conditional types (`T extends string ? A : B`), mapped types (`{ [K in keyof T]: ... }`), and infer keyword enable type-level programming. Variance (covariant, contravariant) determines generic assignability.",
    },
    seeAlso: ["interface-type", "class", "polymorphism"],
  },
  {
    slug: "enum",
    term: "Enum",
    aliases: ["enumeration", "enum type"],
    category: "fundamentals",
    phaseIds: ["1"],
    lessonIds: [],
    definitions: {
      beginner:
        "A named set of constant values — like a menu with fixed options such as 'small', 'medium', or 'large'.",
      intermediate:
        "TypeScript enums: `enum Direction { Up, Down, Left, Right }`. Numeric enums auto-increment from 0. String enums (`Up = 'UP'`) are more debuggable. `const enum` inlines values at compile time for zero runtime overhead.",
      advanced:
        "Regular TypeScript enums generate runtime JavaScript objects — increasing bundle size. Union types (`type Direction = 'up' | 'down'`) are preferred in modern TS: they're fully erased, tree-shakeable, and structurally typed. Rust enums (tagged unions) carry data per variant — more powerful than TS enums.",
    },
    seeAlso: ["variable", "constant", "interface-type"],
  },
  {
    slug: "iterator",
    term: "Iterator",
    aliases: ["iterable", "iteration protocol"],
    category: "fundamentals",
    phaseIds: ["1"],
    lessonIds: [],
    definitions: {
      beginner:
        "An object that lets you go through a collection one item at a time — like flipping through pages of a book one by one.",
      intermediate:
        "JavaScript's iteration protocol: an iterable has a [Symbol.iterator]() method that returns an iterator with a next() method. Arrays, Maps, Sets, and strings are iterable. for...of, spread (...), and destructuring all use the protocol.",
      advanced:
        "Generators (function*) create iterators that yield values lazily — computed on demand rather than stored in memory. Async iterators (Symbol.asyncIterator, for await...of) handle asynchronous data streams. Custom iterables enable pagination, infinite sequences, and tree traversal.",
    },
    seeAlso: ["array", "loop", "generator"],
  },
  {
    slug: "try-catch",
    term: "Try/Catch",
    aliases: ["error handling", "exception handling"],
    category: "fundamentals",
    phaseIds: ["1"],
    lessonIds: [],
    definitions: {
      beginner:
        "A way to run code that might fail and catch the error gracefully instead of crashing — like having a safety net under a tightrope.",
      intermediate:
        "try { riskyCode() } catch (error) { handleError(error) } finally { cleanup() }. In async code: try/catch works with await. For Promises without await, use .catch(). Always check error type — don't assume it's an Error instance (throw can throw anything in JS).",
      advanced:
        "Exception handling uses stack unwinding — the runtime walks up the call stack until it finds a catch block. This is expensive (~100× slower than a conditional). For expected failures (validation, parsing), return Result/Either types instead of throwing. TypeScript 4.0+ types catch as unknown.",
    },
    seeAlso: ["promise", "async-await", "callback"],
  },
  {
    slug: "destructuring",
    term: "Destructuring",
    aliases: ["destructure", "unpack"],
    category: "fundamentals",
    phaseIds: ["1"],
    lessonIds: [],
    definitions: {
      beginner:
        "A shorthand for pulling values out of objects or arrays into their own variables — instead of reaching into the box one item at a time.",
      intermediate:
        "Object: `const { name, age } = user;`. Array: `const [first, ...rest] = items;`. Works in function parameters: `function greet({ name }: User)`. Supports defaults: `const { port = 3000 } = config;`. Nested: `const { address: { city } } = user;`.",
      advanced:
        "Destructuring is syntactic sugar over property access — no performance difference. Combined with rest elements, it's powerful for extracting known keys while collecting the remainder. In React, props destructuring in function signatures is the idiomatic pattern.",
    },
    seeAlso: ["object", "array", "variable"],
  },

  // ── Phase 2: Web Development (8) ──────────────────────────────────────

  {
    slug: "box-model",
    term: "CSS Box Model",
    aliases: ["box model"],
    category: "web",
    phaseIds: ["2"],
    lessonIds: [],
    definitions: {
      beginner:
        "Every HTML element is a box with four layers: content (the stuff inside), padding (space around content), border, and margin (space between elements).",
      intermediate:
        "Default (content-box): width/height set the content area — padding and border add to the total size. With box-sizing: border-box, width/height include padding and border. Most projects set `* { box-sizing: border-box; }` globally to avoid layout surprises.",
      advanced:
        "Margin collapsing: vertical margins between siblings collapse to the larger value. Margins of parent and first/last child collapse unless separated by padding, border, or BFC. BFC (Block Formatting Context) creates a new layout context — prevents margin collapse and contains floats.",
    },
    seeAlso: ["css", "flexbox", "grid"],
  },
  {
    slug: "z-index",
    term: "Z-Index",
    aliases: ["stacking context", "z-order"],
    category: "web",
    phaseIds: ["2"],
    lessonIds: [],
    definitions: {
      beginner:
        "A CSS property that controls which elements appear on top of others — like stacking cards on a table, higher numbers go on top.",
      intermediate:
        "Only works on positioned elements (relative, absolute, fixed, sticky) or flex/grid children. Stacking contexts are created by elements with z-index + position, opacity < 1, transform, filter, and other properties. Z-index only competes within the same stacking context.",
      advanced:
        "The most common z-index bug: an element has a high z-index but is inside a parent with a low z-index stacking context — it can never appear above elements in a higher context. Isolation: isolate creates a stacking context without visual side effects. Use CSS custom properties for z-index scales.",
    },
    seeAlso: ["css", "box-model", "flexbox"],
  },
  {
    slug: "css-variable",
    term: "CSS Custom Property",
    aliases: ["css variable", "custom property", "--variable"],
    category: "web",
    phaseIds: ["2"],
    lessonIds: [],
    definitions: {
      beginner:
        "A reusable value you define once and use throughout your CSS — like a label for a color so you can change it everywhere by editing one line.",
      intermediate:
        "Declared with `--name: value;` on any element (usually :root for globals). Used with `var(--name, fallback)`. Unlike preprocessor variables (Sass $var), custom properties are live in the DOM — they cascade, inherit, and can be changed with JavaScript or media queries at runtime.",
      advanced:
        "Custom properties enable runtime theming (change --bg-color on :root to switch themes). They participate in the cascade — a child element can override a parent's custom property. @property at-rule registers typed custom properties with syntax, initial value, and inheritance — enabling animated custom properties.",
    },
    seeAlso: ["css", "responsive", "selector"],
  },
  {
    slug: "svg",
    term: "SVG",
    aliases: ["scalable vector graphics"],
    category: "web",
    phaseIds: ["2"],
    lessonIds: [],
    definitions: {
      beginner:
        "A way to draw images using math (lines, circles, curves) instead of pixels — so they stay sharp at any size, unlike photos.",
      intermediate:
        "XML-based format for 2D vector graphics. Inline SVG in HTML is fully styleable with CSS and scriptable with JavaScript. Common uses: icons (Lucide, Heroicons), logos, illustrations, charts. Can be animated with CSS transitions/animations or GSAP.",
      advanced:
        "SVG elements live in the DOM — each shape is a node. For thousands of shapes, Canvas (pixel-based, no DOM nodes) performs better. viewBox attribute defines the coordinate system, enabling responsive scaling. SVG sprites (symbol + use) reduce HTTP requests while maintaining per-instance styling via currentColor.",
    },
    seeAlso: ["html", "css", "dom"],
  },
  {
    slug: "canvas",
    term: "Canvas",
    aliases: ["html canvas", "canvas api"],
    category: "web",
    phaseIds: ["2"],
    lessonIds: [],
    definitions: {
      beginner:
        "An HTML element that gives you a blank drawing surface you can paint on with JavaScript — for games, charts, image editing, and anything visual.",
      intermediate:
        "2D context: `canvas.getContext('2d')` provides drawing primitives (fillRect, arc, drawImage, fillText). WebGL context: `getContext('webgl2')` for 3D rendering. Canvas is immediate mode — nothing retained, you redraw everything each frame. requestAnimationFrame drives smooth 60fps loops.",
      advanced:
        "OffscreenCanvas moves rendering to a Web Worker — no main-thread blocking. Canvas pixel manipulation (getImageData/putImageData) enables image filters. WebGPU (successor to WebGL) provides lower-level GPU access for compute shaders. Canvas elements are not accessible by default — add fallback content and ARIA attributes.",
    },
    seeAlso: ["svg", "dom", "html"],
  },
  {
    slug: "form-validation",
    term: "Form Validation",
    aliases: ["input validation", "client-side validation"],
    category: "web",
    phaseIds: ["2"],
    lessonIds: [],
    definitions: {
      beginner:
        "Checking that a user typed the right kind of data before sending it — like making sure an email field actually contains an email address.",
      intermediate:
        "HTML5 validation attributes (required, type='email', pattern, minlength, maxlength) handle basic cases without JS. The Constraint Validation API (checkValidity(), setCustomValidity()) provides programmatic control. Always validate on the server too — client validation is UX, not security.",
      advanced:
        "React controlled forms: validate on every keystroke or on blur. Zod schemas can be shared between client and server for single-source-of-truth validation. Server-side validation is the security boundary — never trust client input. Return field-level error messages with HTTP 422.",
    },
    seeAlso: ["html", "dom", "event"],
  },
  {
    slug: "web-api",
    term: "Web API",
    aliases: ["browser api"],
    category: "web",
    phaseIds: ["2"],
    lessonIds: [],
    definitions: {
      beginner:
        "Built-in tools that browsers provide to JavaScript — for storage, location, notifications, cameras, and much more.",
      intermediate:
        "Key APIs: fetch (HTTP requests), localStorage/sessionStorage (key-value), IndexedDB (structured offline storage), Geolocation, Notification, Clipboard, IntersectionObserver, ResizeObserver, Web Workers (background threads), WebSocket, and Service Worker (offline + push).",
      advanced:
        "Web APIs are specified by W3C/WHATWG and implemented by browser vendors. Feature detection (if ('serviceWorker' in navigator)) is safer than browser sniffing. The Web Platform is converging toward capabilities that rival native apps — Project Fugu tracks new APIs like File System Access, WebGPU, and Web Bluetooth.",
    },
    seeAlso: ["dom", "fetch-api", "service-worker"],
  },
  {
    slug: "accessibility",
    term: "Web Accessibility",
    aliases: ["a11y", "WCAG"],
    category: "web",
    phaseIds: ["2"],
    lessonIds: [],
    definitions: {
      beginner:
        "Making websites usable by everyone, including people who use screen readers, keyboards, or other assistive tools.",
      intermediate:
        "WCAG 2.1 AA is the widely adopted standard. Key principles (POUR): Perceivable (alt text, contrast ≥ 4.5:1), Operable (keyboard navigable, focus visible), Understandable (clear language, consistent nav), Robust (valid HTML, ARIA roles). Test with screen readers (VoiceOver, NVDA) and keyboard-only navigation.",
      advanced:
        "ARIA (Accessible Rich Internet Applications) adds semantics to dynamic content: role, aria-label, aria-live, aria-expanded. Misused ARIA is worse than no ARIA — prefer semantic HTML (button, nav, dialog) over div+role. The Accessibility Object Model (AOM) proposal will allow programmatic ARIA without DOM attributes.",
    },
    seeAlso: ["html", "semantic-html", "accessibility-aria"],
  },

  // ── Phase 3: CS Fundamentals (8) ──────────────────────────────────────

  {
    slug: "hash-function",
    term: "Hash Function",
    aliases: ["hashing", "hash"],
    category: "cs-fundamentals",
    phaseIds: ["3"],
    lessonIds: [],
    definitions: {
      beginner:
        "A function that converts any input into a fixed-size number — used to quickly find and compare data, like a library catalog number.",
      intermediate:
        "A good hash function distributes keys uniformly across buckets. Hash maps use it for O(1) average lookups: hash(key) % tableSize → bucket index. Collisions (two keys mapping to the same bucket) are resolved via chaining (linked list) or open addressing (probing).",
      advanced:
        "Cryptographic hash functions (SHA-256) are one-way and collision-resistant — used for integrity verification and password storage. Non-cryptographic hashes (MurmurHash, xxHash) prioritize speed for hash tables. Consistent hashing (used in distributed systems) minimizes key remapping when nodes are added/removed.",
    },
    seeAlso: ["hash-map", "big-o", "binary-search"],
  },
  {
    slug: "trie",
    term: "Trie",
    aliases: ["prefix tree", "digital tree"],
    category: "cs-fundamentals",
    phaseIds: ["3"],
    lessonIds: [],
    definitions: {
      beginner:
        "A tree where each branch represents one letter — you follow the branches to spell out words, making it very fast to find words that start with a given prefix.",
      intermediate:
        "Each node has up to 26 children (for lowercase English). Lookup is O(k) where k is the key length — independent of how many keys are stored. Used for autocomplete, spell checking, IP routing tables, and dictionary implementations.",
      advanced:
        "Space optimization: compressed tries (radix trees) merge single-child chains into one node. Ternary search tries use three children (less, equal, greater) — more memory-efficient than 26-way tries. Patricia tries (practical algorithm to retrieve information coded in alphanumeric) are used in IP routing.",
    },
    seeAlso: ["binary-tree", "hash-map", "algorithm"],
  },
  {
    slug: "topological-sort",
    term: "Topological Sort",
    aliases: ["topo sort", "dependency ordering"],
    category: "cs-fundamentals",
    phaseIds: ["3"],
    lessonIds: [],
    definitions: {
      beginner:
        "Putting tasks in order so that every task comes after the tasks it depends on — like getting dressed: socks before shoes.",
      intermediate:
        "Only works on directed acyclic graphs (DAGs). Kahn's algorithm: repeatedly remove nodes with no incoming edges. DFS-based: finish-time ordering reversed. O(V + E). Used for build systems (Make), package managers (npm install order), and course prerequisites.",
      advanced:
        "If a cycle exists, no topological ordering is possible — cycle detection is a side effect of the algorithm. Parallel task scheduling uses topological sort to find independent tasks. Reverse topological order equals DFS post-order — this is why DFS-based topo sort works.",
    },
    seeAlso: ["graph", "bfs", "dfs"],
  },
  {
    slug: "amortized-analysis",
    term: "Amortized Analysis",
    aliases: ["amortized cost", "amortized time"],
    category: "cs-fundamentals",
    phaseIds: ["3"],
    lessonIds: [],
    definitions: {
      beginner:
        "Looking at the average cost of an operation over many calls instead of the worst single call — like how a piggy bank costs nothing most times you add a coin, and a lot when it's full and you break it.",
      intermediate:
        "Dynamic array push is O(1) amortized: most pushes are O(1), but when the array is full, it doubles and copies everything — O(n). Over n pushes, total work is O(n), so each push averages O(1). Methods: aggregate, accounting, and potential (physicist's) analysis.",
      advanced:
        "The potential method assigns a 'potential energy' to the data structure. Expensive operations discharge potential; cheap operations build it. Splay trees use amortized analysis to prove O(log n) per operation despite O(n) worst case for any single operation.",
    },
    seeAlso: ["big-o", "time-complexity", "space-complexity"],
  },
  {
    slug: "union-find",
    term: "Union-Find",
    aliases: ["disjoint set", "disjoint set union"],
    category: "cs-fundamentals",
    phaseIds: ["3"],
    lessonIds: [],
    definitions: {
      beginner:
        "A data structure that tracks which items belong to the same group and can quickly merge two groups together.",
      intermediate:
        "Two operations: find(x) returns the group representative, union(x, y) merges two groups. With path compression and union-by-rank, both operations are nearly O(1) — technically O(α(n)) where α is the inverse Ackermann function. Used in Kruskal's MST algorithm.",
      advanced:
        "The inverse Ackermann function α(n) ≤ 4 for any practical input size — effectively constant time. Applications beyond MST: detecting cycles in undirected graphs, connected components, percolation theory, image segmentation, and least common ancestor queries.",
    },
    seeAlso: ["graph", "algorithm", "topological-sort"],
  },
  {
    slug: "np-complete",
    term: "NP-Complete",
    aliases: ["NP-hard", "computational complexity"],
    category: "cs-fundamentals",
    phaseIds: ["3"],
    lessonIds: [],
    definitions: {
      beginner:
        "A category of problems so hard that no one has found a fast solution — and if you could solve one fast, you could solve them all fast.",
      intermediate:
        "NP: verifiable in polynomial time. NP-complete: in NP and at least as hard as every other NP problem. Examples: traveling salesman, graph coloring, boolean satisfiability (SAT), subset sum. No known polynomial-time algorithm exists for any of them. P ≠ NP is unproven.",
      advanced:
        "Proving NP-completeness: show the problem is in NP, then reduce a known NP-complete problem to it in polynomial time. Cook-Levin theorem (1971) proved SAT is NP-complete. Practical approaches for NP-hard problems: approximation algorithms, heuristics (genetic algorithms, simulated annealing), and fixed-parameter tractability.",
    },
    seeAlso: ["algorithm", "big-o", "dynamic-programming"],
  },
  {
    slug: "minimum-spanning-tree",
    term: "Minimum Spanning Tree",
    aliases: ["MST", "spanning tree"],
    category: "cs-fundamentals",
    phaseIds: ["3"],
    lessonIds: [],
    definitions: {
      beginner:
        "The cheapest way to connect all points in a network — like finding the shortest total cable to wire every house in a neighborhood together.",
      intermediate:
        "A tree that connects all vertices of a weighted graph with the minimum total edge weight. Kruskal's algorithm: sort edges by weight, add if no cycle (use union-find). Prim's algorithm: grow tree from a start vertex, always adding the cheapest adjacent edge. Both O(E log V).",
      advanced:
        "MST is unique if all edge weights are distinct. Borůvka's algorithm (1926) is parallelizable — each component finds its cheapest outgoing edge simultaneously. Applications: network design, clustering (remove the k-1 heaviest MST edges for k clusters), and image segmentation.",
    },
    seeAlso: ["graph", "dijkstra", "union-find"],
  },
  {
    slug: "segment-tree",
    term: "Segment Tree",
    aliases: ["range query tree"],
    category: "cs-fundamentals",
    phaseIds: ["3"],
    lessonIds: [],
    definitions: {
      beginner:
        "A tree that pre-computes answers for ranges of an array — so you can quickly find things like 'the sum of elements from index 3 to 7' without adding them up each time.",
      intermediate:
        "Build in O(n). Range query (sum, min, max) in O(log n). Point update in O(log n). Each node stores the answer for a segment. Left child covers the left half; right child covers the right. Lazy propagation enables O(log n) range updates.",
      advanced:
        "Persistent segment trees preserve all historical versions — used in competitive programming for versioned range queries. 2D segment trees handle matrix range queries. Merge sort trees (segment tree of sorted arrays per node) answer 'count of elements in range [l,r] less than k' in O(log² n).",
    },
    seeAlso: ["binary-tree", "array", "algorithm"],
  },

  // ── Phase 4: Backend Engineering (6) ──────────────────────────────────

  {
    slug: "orm",
    term: "ORM",
    aliases: ["object-relational mapping", "object relational mapper"],
    category: "backend",
    phaseIds: ["4"],
    lessonIds: [],
    definitions: {
      beginner:
        "A tool that lets you work with database tables as if they were objects in your code — write JavaScript instead of SQL.",
      intermediate:
        "ORMs (Prisma, Drizzle, Sequelize, SQLAlchemy) map database tables to classes/objects and rows to instances. They generate SQL from method calls. Benefits: type safety, migration management, DB portability. Drawbacks: N+1 query problems, abstraction leaks, and generated SQL may be suboptimal.",
      advanced:
        "The object-relational impedance mismatch: objects have identity, inheritance, and encapsulation; relations have rows, joins, and set operations. Active Record (Rails) ties objects to tables; Data Mapper (TypeORM, Prisma) separates domain objects from persistence. For complex queries, raw SQL often outperforms ORM-generated queries.",
    },
    seeAlso: ["sql", "join", "postgresql"],
  },
  {
    slug: "redis",
    term: "Redis",
    aliases: ["redis cache", "in-memory store"],
    category: "backend",
    phaseIds: ["4"],
    lessonIds: [],
    definitions: {
      beginner:
        "An extremely fast database that keeps everything in memory — used for caching, sessions, and real-time features where speed is critical.",
      intermediate:
        "In-memory key-value store supporting strings, lists, sets, sorted sets, hashes, streams, and more. Sub-millisecond latency. Common uses: cache layer (cache-aside pattern), session storage, rate limiting, pub/sub messaging, leaderboards (sorted sets), and distributed locks (Redlock).",
      advanced:
        "Single-threaded event loop (no lock contention). Persistence: RDB snapshots (point-in-time) and AOF (append-only file, every write). Redis Cluster shards data across nodes with hash slots (16384 total). Sentinel provides failover for non-clustered setups. Redis 7+ supports functions (server-side Lua replacement).",
    },
    seeAlso: ["cache-invalidation", "message-queue", "connection-pool"],
  },
  {
    slug: "caching",
    term: "Caching",
    aliases: ["cache", "cache layer"],
    category: "backend",
    phaseIds: ["4"],
    lessonIds: [],
    definitions: {
      beginner:
        "Storing a copy of data in a faster location so you don't have to fetch it from the slow source every time — like keeping frequently used files on your desk instead of the filing cabinet.",
      intermediate:
        "Cache-aside (lazy loading): check cache → miss → fetch from DB → store in cache. Write-through: write to cache and DB simultaneously. Write-behind: write to cache, async flush to DB. TTL-based expiry is simplest. Cache invalidation ('the two hard problems') requires careful strategy.",
      advanced:
        "The two hard problems in CS: cache invalidation and naming things. Stale data strategies: TTL (time-based), event-driven invalidation (pub/sub on write), and versioned keys. Thundering herd: when a popular cache key expires and hundreds of requests simultaneously hit the DB — use lock-based recomputation or stale-while-revalidate.",
    },
    seeAlso: ["redis", "cache-invalidation", "cdn"],
  },
  {
    slug: "pagination",
    term: "Pagination",
    aliases: ["paging", "cursor pagination"],
    category: "backend",
    phaseIds: ["4"],
    lessonIds: [],
    definitions: {
      beginner:
        "Breaking a long list of results into numbered pages so you don't have to load everything at once — like a book having page numbers.",
      intermediate:
        "Offset-based: `LIMIT 20 OFFSET 40` for page 3. Simple but slow for deep pages (DB must skip offset rows) and unstable if data changes. Cursor-based: `WHERE id > last_seen_id LIMIT 20`. Stable, efficient, but no 'jump to page 5'. Keyset pagination is cursor-based on indexed columns.",
      advanced:
        "Cursor pagination is O(1) per page (index seek) while offset is O(offset) per page (scan and skip). For APIs: encode the cursor as an opaque base64 string — clients don't parse it, just pass it back. GraphQL Connections spec standardizes cursor-based pagination with edges, nodes, and pageInfo.",
    },
    seeAlso: ["sql", "rest", "index"],
  },
  {
    slug: "environment-variable",
    term: "Environment Variable",
    aliases: ["env var", ".env", "process.env"],
    category: "backend",
    phaseIds: ["4"],
    lessonIds: [],
    definitions: {
      beginner:
        "A configuration value stored outside your code — like a sticky note on your monitor with a password, rather than writing the password in your notebook.",
      intermediate:
        "Set per-environment (development, staging, production) in .env files or the hosting platform's dashboard. Accessed via `process.env.DATABASE_URL` in Node.js. NEVER commit .env files to git. Next.js prefixes client-safe vars with NEXT_PUBLIC_; all others are server-only.",
      advanced:
        "12-Factor App methodology stores all config in environment variables — not in code or config files. Secrets managers (AWS Secrets Manager, Vault) provide rotation, audit logging, and access control beyond what .env files offer. Zod validation on startup catches missing env vars before they cause runtime errors.",
    },
    seeAlso: ["nodejs", "docker", "deployment"],
  },
  {
    slug: "logging",
    term: "Logging",
    aliases: ["application logs", "structured logging"],
    category: "backend",
    phaseIds: ["4"],
    lessonIds: [],
    definitions: {
      beginner:
        "Recording what your application does as it runs — so when something goes wrong, you can look at the logs and figure out what happened.",
      intermediate:
        "Log levels: error (something broke), warn (something is off), info (normal events), debug (developer detail). Structured logging (JSON) is machine-parseable: `{level: 'error', msg: 'DB timeout', duration_ms: 5000}`. Never log secrets, passwords, or PII. Ship logs to a central system (Datadog, ELK, Loki).",
      advanced:
        "Structured logging enables filtering, alerting, and dashboards. Correlation IDs (request ID passed through all services) tie logs across microservices. Log sampling at high throughput reduces cost. Winston (Node.js), Pino (fast JSON logger), and Python's structlog are common libraries. OpenTelemetry logs bridge logs and traces.",
    },
    seeAlso: ["observability", "nodejs", "middleware"],
  },

  // ── Phase 6: AI/ML (6) ────────────────────────────────────────────────

  {
    slug: "gradient-descent",
    term: "Gradient Descent",
    aliases: ["SGD", "stochastic gradient descent"],
    category: "ai-ml",
    phaseIds: ["6"],
    lessonIds: [],
    definitions: {
      beginner:
        "The way a model learns: it makes a guess, measures how wrong it is, then nudges its numbers a tiny bit in the direction that reduces the error — over and over.",
      intermediate:
        "Computes the gradient (partial derivatives) of the loss function with respect to each parameter, then updates: w = w - lr × gradient. Learning rate (lr) controls step size. Too high: overshoots. Too low: converges slowly. SGD uses mini-batches for efficiency; Adam adapts lr per parameter.",
      advanced:
        "Backpropagation computes gradients via the chain rule through the computational graph. Gradient accumulation enables effective batch sizes larger than GPU memory. Gradient clipping prevents exploding gradients in RNNs. Mixed-precision training (FP16 forward, FP32 gradients) halves memory and doubles throughput on modern GPUs.",
    },
    seeAlso: ["loss-function", "transformer", "fine-tuning"],
  },
  {
    slug: "loss-function",
    term: "Loss Function",
    aliases: ["cost function", "objective function"],
    category: "ai-ml",
    phaseIds: ["6"],
    lessonIds: [],
    definitions: {
      beginner:
        "A number that measures how wrong a model's prediction is — the goal of training is to make this number as small as possible.",
      intermediate:
        "Classification: cross-entropy loss compares predicted probabilities to true labels. Regression: MSE (mean squared error) penalizes large errors quadratically. The loss function defines what 'good' means — choosing the wrong one trains the wrong behavior. Regularization terms (L1, L2) are added to prevent overfitting.",
      advanced:
        "Focal loss down-weights easy examples to focus on hard ones — used in object detection. Contrastive loss (SimCLR, CLIP) trains embeddings by pulling similar pairs together and pushing dissimilar pairs apart. RLHF uses a reward model (trained on human preferences) as the loss signal for fine-tuning LLMs.",
    },
    seeAlso: ["gradient-descent", "transformer", "fine-tuning"],
  },
  {
    slug: "overfitting",
    term: "Overfitting",
    aliases: ["overfit", "memorization"],
    category: "ai-ml",
    phaseIds: ["6"],
    lessonIds: [],
    definitions: {
      beginner:
        "When a model memorizes the training data so perfectly that it fails on new data it hasn't seen — like studying only the answer key and failing the real test.",
      intermediate:
        "Signs: training loss decreases but validation loss increases. Prevention: more training data, data augmentation, dropout, early stopping, weight decay (L2 regularization), and simpler models. The bias-variance tradeoff: too simple = underfitting; too complex = overfitting.",
      advanced:
        "Modern deep learning contradicts classical bias-variance theory — very large models can generalize well despite having more parameters than training examples (double descent). Lottery ticket hypothesis suggests large networks contain small, trainable subnetworks. Regularization in transformers often uses dropout, weight decay, and careful learning rate scheduling.",
    },
    seeAlso: ["loss-function", "gradient-descent", "training-data-ai"],
  },
  {
    slug: "tokenizer",
    term: "Tokenizer",
    aliases: ["tokenization", "text tokenizer"],
    category: "ai-ml",
    phaseIds: ["6"],
    lessonIds: [],
    definitions: {
      beginner:
        "The tool that breaks text into smaller pieces (tokens) that a language model can understand — like breaking a sentence into puzzle pieces.",
      intermediate:
        "BPE (Byte Pair Encoding) is most common: start with individual bytes, iteratively merge the most frequent pairs into tokens. A word like 'tokenizer' might become ['token', 'izer']. Vocabulary size (32K-100K) balances compression and expressiveness. Each token maps to an integer ID for the model.",
      advanced:
        "Tokenizer choice affects model behavior: languages with different scripts may get fewer tokens per word (inefficient). SentencePiece trains tokenizers directly on raw text (no pre-tokenization). tiktoken (OpenAI) is a fast BPE implementation. Token count determines context usage and API costs — always count tokens, not characters.",
    },
    seeAlso: ["bpe-tokenization", "llm", "context-window"],
  },
  {
    slug: "transfer-learning",
    term: "Transfer Learning",
    aliases: ["pretrained model", "fine-tuning"],
    category: "ai-ml",
    phaseIds: ["6"],
    lessonIds: [],
    definitions: {
      beginner:
        "Using a model that already learned from millions of examples as a starting point for your specific task — instead of training from scratch.",
      intermediate:
        "Pre-trained models (BERT, GPT, ResNet) learned general features from large datasets. Fine-tuning adapts them: freeze lower layers (general features), train upper layers (task-specific). Requires far less data and compute than training from scratch. LoRA/QLoRA fine-tune by adding small trainable matrices.",
      advanced:
        "Foundation models are pre-trained on massive corpora and adapted via fine-tuning, few-shot prompting, or retrieval augmentation. Feature extraction (freeze all layers, train only a classification head) is the simplest form. Progressive unfreezing gradually trains more layers. Domain adaptation handles distribution shift between pre-training and target data.",
    },
    seeAlso: ["fine-tuning", "lora", "embedding"],
  },
  {
    slug: "beam-search",
    term: "Beam Search",
    aliases: ["beam decoding"],
    category: "ai-ml",
    phaseIds: ["6"],
    lessonIds: [],
    definitions: {
      beginner:
        "A way for a language model to consider multiple possible next words at once instead of always picking the single most likely one — like exploring several paths in a maze simultaneously.",
      intermediate:
        "Beam width (k) controls how many candidates are kept at each step. k=1 is greedy decoding. k=5 explores 5 parallel hypotheses, keeping the best-scoring sequences. Produces more coherent output than greedy but is slower. Used in translation, speech recognition, and code generation.",
      advanced:
        "Beam search maximizes sequence probability but can produce bland, repetitive text — it favors safe, high-probability tokens. Nucleus sampling (top-p) and temperature scaling trade off diversity vs coherence and often produce more natural text. For tasks requiring correctness (translation), beam search is preferred; for creative tasks, sampling is better.",
    },
    seeAlso: ["temperature", "top-p", "llm"],
  },

  // ── Phase 7: Advanced Systems (4) ─────────────────────────────────────

  {
    slug: "garbage-collection",
    term: "Garbage Collection",
    aliases: ["GC", "gc"],
    category: "systems",
    phaseIds: ["7"],
    lessonIds: [],
    definitions: {
      beginner:
        "Automatic memory cleanup — the runtime finds objects your program no longer uses and frees the memory, so you don't have to do it manually.",
      intermediate:
        "Mark-and-sweep: start from roots (global variables, stack), mark all reachable objects, sweep (free) unmarked ones. Generational GC (V8, JVM): most objects die young, so the 'young generation' is collected more frequently. GC pauses can cause latency spikes.",
      advanced:
        "V8's Orinoco GC uses concurrent marking (marks while JS runs), parallel sweeping (multiple threads), and incremental marking (small pause slices). Go uses a concurrent tri-color mark-and-sweep with sub-millisecond pauses. Rust eliminates GC entirely via ownership and borrowing — zero runtime cost.",
    },
    seeAlso: ["ownership", "memory-leak", "heap"],
  },
  {
    slug: "coroutine",
    term: "Coroutine",
    aliases: ["coroutines", "async generator"],
    category: "systems",
    phaseIds: ["7"],
    lessonIds: [],
    definitions: {
      beginner:
        "A function that can pause itself and give control back, then resume exactly where it left off — like bookmarking your place in a book.",
      intermediate:
        "JavaScript generators (function*) are coroutines: yield pauses execution, next() resumes it. Async/await is built on coroutines — await suspends until the promise resolves. Coroutines enable cooperative multitasking without threads.",
      advanced:
        "Stackful coroutines (Go goroutines, Lua) have their own call stack and can yield from nested calls. Stackless coroutines (Rust async, JS generators) are state machines — lighter but can only yield from the top-level function. Kotlin coroutines and Swift structured concurrency are modern stackless implementations with cancellation support.",
    },
    seeAlso: ["async-await", "promise", "thread"],
  },
  {
    slug: "memory-mapped-io",
    term: "Memory-Mapped I/O",
    aliases: ["mmap", "memory mapping"],
    category: "systems",
    phaseIds: ["7"],
    lessonIds: [],
    definitions: {
      beginner:
        "A technique that lets your program read a file as if it were already in memory — the OS loads pieces on demand as you access them.",
      intermediate:
        "mmap() maps a file (or device) into the process's virtual address space. Reading a mapped region triggers a page fault that loads the data from disk. Benefits: no explicit read() calls, the OS manages caching via page cache, and multiple processes can share the mapping.",
      advanced:
        "mmap is used by databases (LMDB, SQLite WAL mode) to map data files directly. Advantages: zero-copy I/O, kernel page cache handles eviction. Disadvantages: hard to handle errors (SIGBUS on I/O failure), no control over eviction order, and TLB pressure with many mappings. Huge pages (2MB) reduce TLB misses for large mmaps.",
    },
    seeAlso: ["virtual-memory", "page-fault", "file-descriptor"],
  },
  {
    slug: "lock-free",
    term: "Lock-Free Data Structure",
    aliases: ["lock-free", "wait-free", "non-blocking"],
    category: "systems",
    phaseIds: ["7"],
    lessonIds: [],
    definitions: {
      beginner:
        "A way to share data between threads without using locks — avoiding the risk of one stuck thread blocking all the others.",
      intermediate:
        "Uses atomic operations (compare-and-swap/CAS) instead of mutexes. Lock-free: at least one thread makes progress. Wait-free: every thread makes progress in bounded steps. Lock-free queues (Michael-Scott queue) and stacks are common. More complex to implement correctly than lock-based alternatives.",
      advanced:
        "ABA problem: a CAS may succeed when the value changed from A→B→A — solved with tagged pointers or hazard pointers. Memory ordering (acquire, release, seq_cst) determines which writes are visible to other threads. Java's ConcurrentHashMap and Go's sync/atomic provide lock-free building blocks. Formal verification (TLA+) is recommended for lock-free designs.",
    },
    seeAlso: ["mutex", "thread", "deadlock"],
  },

  // ── Phase 8: Professional Practice (4) ────────────────────────────────

  {
    slug: "pair-programming",
    term: "Pair Programming",
    aliases: ["pairing", "mob programming"],
    category: "professional",
    phaseIds: ["8"],
    lessonIds: [],
    definitions: {
      beginner:
        "Two developers working on the same code at the same time — one types (driver) while the other thinks ahead and reviews (navigator).",
      intermediate:
        "Driver writes code; navigator reviews, thinks strategically, and catches errors. Switch roles every 15-30 minutes. Benefits: fewer bugs, knowledge sharing, faster onboarding. Costs: two people on one task. Best for: complex logic, unfamiliar codebases, and mentoring. Mob programming extends this to the whole team.",
      advanced:
        "Research (Williams & Kessler, 2000) shows paired code has ~15% fewer defects and takes ~15% longer — net positive when considering review and bug-fixing time. Remote pairing tools: VS Code Live Share, Tuple, screen sharing. Strong-style pairing: the navigator dictates, the driver only types — forces verbalization and knowledge transfer.",
    },
    seeAlso: ["pull-request", "adr", "tdd"],
  },
  {
    slug: "scrum",
    term: "Scrum",
    aliases: ["sprint", "scrum framework"],
    category: "professional",
    phaseIds: ["8"],
    lessonIds: [],
    definitions: {
      beginner:
        "A way to organize work into short cycles (sprints) where a team plans, builds, and reviews together — making progress visible and predictable.",
      intermediate:
        "Roles: Product Owner (what to build), Scrum Master (process), Development Team (how to build). Ceremonies: Sprint Planning, Daily Standup (15 min), Sprint Review (demo), Sprint Retrospective (improve process). Sprints are 1-4 weeks. The backlog is prioritized by value.",
      advanced:
        "Scrum works well for teams building product with unclear requirements that evolve. It struggles with maintenance-heavy work and teams that need flow-based delivery (Kanban is better). Velocity (story points per sprint) is a planning tool, not a performance metric — using it as such incentivizes gaming. SAFe (Scaled Agile) extends Scrum to large orgs but adds significant overhead.",
    },
    seeAlso: ["sprint-velocity", "pull-request", "dora-metrics-term"],
  },
  {
    slug: "kanban",
    term: "Kanban",
    aliases: ["kanban board"],
    category: "professional",
    phaseIds: ["8"],
    lessonIds: [],
    definitions: {
      beginner:
        "A visual board with columns (To Do, In Progress, Done) where cards represent tasks — you pull work when you have capacity instead of being assigned batches.",
      intermediate:
        "Core principle: limit work-in-progress (WIP). If the 'In Review' column has a WIP limit of 3 and it's full, no new items enter review — forcing the team to finish before starting. This reduces context-switching and exposes bottlenecks. No sprints — work flows continuously.",
      advanced:
        "Kanban metrics: lead time (idea to done), cycle time (started to done), throughput (items per week). Cumulative flow diagrams visualize WIP and bottlenecks over time. Kanban is complementary to Scrum (Scrumban) — use sprints for planning cadence but Kanban for flow. Little's Law: Avg Lead Time = Avg WIP / Avg Throughput.",
    },
    seeAlso: ["scrum", "dora-metrics-term", "sprint-velocity"],
  },
  {
    slug: "sprint-retrospective",
    term: "Sprint Retrospective",
    aliases: ["retro", "retrospective"],
    category: "professional",
    phaseIds: ["8"],
    lessonIds: [],
    definitions: {
      beginner:
        "A meeting at the end of each sprint where the team discusses what went well, what didn't, and what to improve next time.",
      intermediate:
        "Common formats: Start/Stop/Continue, 4Ls (Liked/Learned/Lacked/Longed-for), Sailboat (wind = helps, anchors = blockers). Key: choose 1-2 actionable improvements and track them. Without follow-through, retros become venting sessions. Psychological safety is required for honest feedback.",
      advanced:
        "The prime directive: 'Regardless of what we discover, we understand that everyone did the best job they could.' Blameless retros focus on systems and processes, not individuals. Rotate facilitators to prevent staleness. Track retro action items as first-class backlog items — if they never get done, the retro is theater.",
    },
    seeAlso: ["scrum", "psychological-safety-term", "blameless-postmortem-term"],
  },
];
