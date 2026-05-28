import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { buildMetadata } from "@/lib/og";

interface TeachesLink {
  label: string;
  href: string;
}

interface ActivityEntry {
  title: string;
  /** SEO description — also shown under the title. */
  description: string;
  /** Short concept tag — e.g. "Binary representation · RGB encoding". */
  concept: string;
  /** Concept-led intro shown ABOVE the interactive. 2-3 sentences. */
  intro: string;
  /** Technical bullets shown BELOW the interactive — what's really happening. */
  underTheHood: string[];
  /** Curriculum link — where the concept is taught with full depth. */
  teaches: TeachesLink;
  /** Room this activity belongs to. Used for routing validation. */
  roomSlug: string;
  /** Display name of the parent room. */
  roomName: string;
  /** Accent color for the parent room (matches the room page). */
  roomColor: string;
  /** Lazy-loaded React component for the interactive itself. */
  Component: React.ComponentType;
}

/** Loading skeleton shown while the activity component streams in. */
function ActivitySkeleton(): React.ReactElement {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--color-border)] border-t-emerald-400" />
    </div>
  );
}

/**
 * Registry mapping activity slugs to their component, metadata, and pedagogical
 * scaffold. The scaffold (concept / intro / underTheHood / teaches) is what
 * makes the Discovery Zone teach — not just demo. The hook is play; the
 * destination is the curriculum.
 *
 * Note: the previous "first-steps" room (shape-sorter / counting-blocks /
 * color-mixer) was removed from the public surface in the 2026-05 refresh.
 * Components remain in the codebase but are not registered here.
 */
const ACTIVITIES: Record<string, ActivityEntry> = {
  // ─── Secret Codes — encoding & representation ───────────────────────────
  "binary-painter": {
    title: "Binary Painter",
    description: "Flip 8 binary switches and watch a color appear. Real RGB encoding, hands-on.",
    concept: "Binary representation · RGB encoding",
    intro:
      "Computers store colors as numbers. This demo uses the RGB332 scheme — 8 bits split across red (3), green (3), and blue (2). Flip the switches and watch the binary value, decimal value, hex code, and resulting color all update together. The relationship between the four representations is the relationship every graphics system on the planet runs on.",
    underTheHood: [
      "Each switch contributes a power of 2 to its channel: bit 7 = 128, bit 6 = 64, bit 5 = 32, and so on.",
      "RGB332 (used here) fits one pixel in 1 byte. Modern displays use 24-bit RGB (8 bits per channel) — same idea, more precision.",
      "The hex code (e.g. #FF0040) is the same byte sequence in base 16. Designers, browsers, and CSS all use this notation for the same underlying bits.",
    ],
    teaches: { label: "Phase 0 · How Computers Think", href: "/paths/0" },
    roomSlug: "secret-codes",
    roomName: "Secret Codes",
    roomColor: "#f472b6",
    Component: dynamic(() => import("@/components/discover/BinaryPainter"), {
      loading: () => <ActivitySkeleton />,
    }),
  },

  "morse-code": {
    title: "Morse Code",
    description: "Tap out letters in dots and dashes. The original digital protocol.",
    concept: "Symbol encoding · Variable-length codes",
    intro:
      "Morse is binary in disguise: every letter is a sequence of two symbols (dot, dash) plus timed gaps. The frequent letters get the shortest codes — E is a single dot — which is the same idea Huffman coding uses, 130 years later, to compress every JPEG and ZIP file you've opened.",
    underTheHood: [
      "Two symbols per letter, variable length per letter — a prefix code (no letter's encoding is the prefix of another's).",
      "Letter frequency drove the length assignments. Samuel Morse counted type cases in a printer to find common English letters.",
      "Huffman (1952) generalized this idea into the optimal-prefix-code algorithm at the heart of every modern compression format.",
    ],
    teaches: { label: "Phase 0 · How Computers Think", href: "/paths/0" },
    roomSlug: "secret-codes",
    roomName: "Secret Codes",
    roomColor: "#f472b6",
    Component: dynamic(() => import("@/components/discover/MorseCode").then((m) => m.MorseCode), {
      loading: () => <ActivitySkeleton />,
    }),
  },

  "pixel-art": {
    title: "Pixel Art",
    description: "Place colored squares on a grid. The data structure behind every screen.",
    concept: "2D arrays · Raster images",
    intro:
      "Every screen, every JPEG, every game sprite is a 2D array of color values. This demo lets you fill that array by hand. The grid you're drawing on is the same data structure your operating system holds in memory for every image on disk and every pixel on your monitor.",
    underTheHood: [
      "Each cell is a (row, column) coordinate mapping to a color value — the underlying type is array-of-array, the same shape JavaScript reaches for as Uint8ClampedArray on a canvas.",
      "Memory layout matters: row-major arrays make horizontal scans cache-friendly, vertical scans cache-hostile. This shows up as measurable speed differences in production graphics code.",
      "Real images add compression (JPEG, PNG, WebP) on top of this same raster substrate. The pixels are still there; the encoding gets cleverer.",
    ],
    teaches: { label: "Phase 0 · How Computers Think", href: "/paths/0" },
    roomSlug: "secret-codes",
    roomName: "Secret Codes",
    roomColor: "#f472b6",
    Component: dynamic(() => import("@/components/discover/PixelArt").then((m) => m.PixelArt), {
      loading: () => <ActivitySkeleton />,
    }),
  },

  "secret-encoder": {
    title: "Secret Encoder",
    description: "Apply a substitution cipher. Encrypt, decrypt, and see why this scheme broke.",
    concept: "Substitution ciphers · Cryptography 101",
    intro:
      "A substitution cipher swaps each letter for another according to a fixed rule. It's the simplest form of encryption — and the first one ever broken systematically, by Arab cryptographers in the 9th century, using letter-frequency analysis. Modern cryptography is built on the lessons of why this scheme fails.",
    underTheHood: [
      "Key: a permutation of the 26-letter alphabet. Encrypt = lookup table. Decrypt = reverse lookup. Trivial to implement, trivial to attack.",
      "Vulnerable to frequency analysis: in English, E appears ~12% of the time, T ~9%, A ~8%. The most common letter in the ciphertext is almost certainly E.",
      "Modern algorithms (AES, ChaCha20) defeat frequency analysis by encrypting blocks of bytes with a key that changes every block — defeating any single-letter statistical attack.",
    ],
    teaches: { label: "Phase 7 · Security Engineering", href: "/paths/7" },
    roomSlug: "secret-codes",
    roomName: "Secret Codes",
    roomColor: "#f472b6",
    Component: dynamic(
      () => import("@/components/discover/SecretEncoder").then((m) => m.SecretEncoder),
      { loading: () => <ActivitySkeleton /> }
    ),
  },

  "hash-avalanche": {
    title: "Hash Avalanche",
    description:
      "Paste a message and watch its SHA-256 bit grid. Change one character; about half the bits flip.",
    concept: "Cryptographic hashing · Avalanche property",
    intro:
      "A cryptographic hash function maps any input to a fixed-size output that should look uniformly random. The avalanche property says: change one bit of input, and about half the output bits should flip. Without that property, similar inputs would produce similar hashes — and attackers could forge messages by tweaking real ones. SHA-256 has it by design. This demo computes real SHA-256 in your browser via the Web Crypto API; the bit grid you see is exactly what your operating system computes when it verifies a git commit, a TLS certificate, or a software-update signature.",
    underTheHood: [
      "SHA-256 produces a 256-bit output (32 bytes, displayed as 64 hex characters). The bit grid shows all 256 bits laid out in 8 rows of 32.",
      "Avalanche is measured by Hamming distance — count of differing bits. Ideal value for a one-character change: ~128 bits (50%). SHA-256 hovers right around that.",
      "The Web Crypto API (crypto.subtle.digest) runs the same SHA-256 implementation browsers use for HTTPS certificate verification — no JS-level reimplementation needed.",
    ],
    teaches: { label: "Phase 7 · Security Engineering", href: "/paths/7" },
    roomSlug: "secret-codes",
    roomName: "Secret Codes",
    roomColor: "#f472b6",
    Component: dynamic(() => import("@/components/discover/HashAvalanche"), {
      loading: () => <ActivitySkeleton />,
    }),
  },

  // ─── Robot Chef — algorithms & sequencing ───────────────────────────────
  "algorithm-kitchen": {
    title: "Algorithm Kitchen",
    description: "Follow a recipe step by step. Watch what 'literal execution' really means.",
    concept: "Sequential algorithms · Preconditions",
    intro:
      "Programs do exactly what you say, in exactly the order you say it. Build the sandwich by sequencing the steps. Skip one, swap two, and watch the failure mode — this is the same class of error that produces 'works on my machine' bugs in real production code.",
    underTheHood: [
      "Each step has implicit preconditions (you can't 'spread mayo' before 'get bread'). Real programs make those constraints explicit through types, guards, and assertions.",
      "The dependency graph between steps is identical to the topological-sort problem in a build system — Make, Bazel, npm scripts, GitHub Actions all solve this.",
      "Production algorithms add error handling at each step: what to do if 'get bread' fails. Out of stock? Return an error. Try a fallback. Retry with backoff. The recipe is the easy part; the error handling is the production part.",
    ],
    teaches: { label: "Phase 1 · Programming Fundamentals", href: "/paths/1" },
    roomSlug: "robot-chef",
    roomName: "Robot Chef",
    roomColor: "#fbbf24",
    Component: dynamic(
      () => import("@/components/discover/AlgorithmKitchen").then((m) => m.AlgorithmKitchen),
      { loading: () => <ActivitySkeleton /> }
    ),
  },

  "robot-dance": {
    title: "Robot Dance",
    description: "Write dance moves in order. Literal execution, made visible.",
    concept: "Imperative programming · Literal execution",
    intro:
      "The robot does exactly what you tell it, in exactly the order you wrote it. No interpretation, no helpful guesses. Off-by-one and out-of-order sequences are the dominant class of beginner bugs in every imperative language — because programs don't 'mean what you meant'; they do what you wrote.",
    underTheHood: [
      "Imperative programming: a sequence of statements executed top to bottom. C, Python, JavaScript, Java all share this core model.",
      "Each move is a function call with no return value — just a side effect on the robot's state. Mutating shared state is also the source of most concurrency bugs in real systems.",
      "The opposite paradigm — declarative — describes what you want rather than how to do it. SQL, HTML, regex, and Datalog are declarative; they let the engine pick the procedure.",
    ],
    teaches: { label: "Phase 1 · Control Flow", href: "/paths/1" },
    roomSlug: "robot-chef",
    roomName: "Robot Chef",
    roomColor: "#fbbf24",
    Component: dynamic(() => import("@/components/discover/RobotDance").then((m) => m.RobotDance), {
      loading: () => <ActivitySkeleton />,
    }),
  },

  "treasure-map": {
    title: "Treasure Map",
    description: "Navigate a grid with precise directions. Procedural thinking, made tactile.",
    concept: "Grid navigation · Procedural thinking",
    intro:
      "Give the explorer step-by-step directions: north, east, south, west. The grid is your data structure, the directions are your program, the treasure is correctness. This is the smallest possible model of pathfinding — the algorithm class that powers GPS routing, robot navigation, and game AI.",
    underTheHood: [
      "Grid = 2D array. Position = (row, col). Each direction is a coordinate transform: north = (row-1, col), east = (row, col+1).",
      "Pathfinding algorithms (Dijkstra, A*) explore the same grid by searching outward from the start until they reach the goal. Same data structure, smarter search.",
      "Real pathfinding adds obstacles, weighted edges (cost per move), and heuristics (best guess at distance to goal). Same primitive, layered sophistication.",
    ],
    teaches: { label: "Phase 1 · Programming Fundamentals", href: "/paths/1" },
    roomSlug: "robot-chef",
    roomName: "Robot Chef",
    roomColor: "#fbbf24",
    Component: dynamic(
      () => import("@/components/discover/TreasureMap").then((m) => m.TreasureMap),
      { loading: () => <ActivitySkeleton /> }
    ),
  },

  "sorting-race": {
    title: "Sorting Race",
    description:
      "Bubble sort vs merge sort vs quick sort on the same shuffled array. Big-O made visible.",
    concept: "Sorting algorithms · Big-O complexity",
    intro:
      "Three sorting algorithms run on the same starting array. Bubble sort makes ~n² comparisons; merge and quick sort make ~n log n. With 30 elements that's a 6× gap. With 1,000 it's 100×. With 1,000,000 it's 50,000×. This is what complexity classes actually mean — not a textbook abstraction, but elapsed time you can watch.",
    underTheHood: [
      "Bubble sort: O(n²) — compares every pair across n-1 passes. Worst case is also its average case. Used here because it makes the cost of bad complexity visible, not because anyone ships it.",
      "Merge sort: O(n log n) — divide the array in halves recursively, merge sorted halves. Worst case equals average case. Stable, predictable, the default for guaranteed bounds.",
      "Quick sort: O(n log n) average, O(n²) worst — partition around a pivot, recurse on each side. Faster than merge in practice because it sorts in place; the worst case is rare with good pivot selection.",
    ],
    teaches: { label: "Phase 3 · Complexity and Big O", href: "/paths/3" },
    roomSlug: "robot-chef",
    roomName: "Robot Chef",
    roomColor: "#fbbf24",
    Component: dynamic(
      () => import("@/components/discover/SortingRace").then((m) => m.SortingRace),
      { loading: () => <ActivitySkeleton /> }
    ),
  },

  pathfinding: {
    title: "Pathfinding",
    description:
      "BFS, Dijkstra, and A* race across the same grid. Watch the heuristic shape the search.",
    concept: "Graph search · Heuristics · A*",
    intro:
      "Three classic search algorithms run on one grid. BFS explores layer by layer; Dijkstra factors in weights; A* uses a heuristic — an informed guess at the remaining distance — to bias the search toward the goal. Drop walls, drop mud (cost 5), and load the maze preset to see how each algorithm trades exploration for guarantees.",
    underTheHood: [
      "BFS finds the shortest unweighted path. Optimal when every step costs the same. It does not understand mud — it counts steps, not cost.",
      "Dijkstra generalizes BFS to weighted graphs by pulling the lowest-cost frontier cell next. Optimal when edge costs are non-negative. Explores symmetrically because it has no sense of direction.",
      "A* keeps Dijkstra's optimality (when the heuristic never overestimates) but pulls the cell that minimizes cost-so-far + estimated-remaining. With Manhattan distance as the heuristic, exploration becomes goal-directed — fewer cells touched, same path quality.",
    ],
    teaches: { label: "Phase 3 · Algorithms & Complexity", href: "/paths/3" },
    roomSlug: "robot-chef",
    roomName: "Robot Chef",
    roomColor: "#fbbf24",
    Component: dynamic(
      () => import("@/components/discover/Pathfinding").then((m) => m.Pathfinding),
      { loading: () => <ActivitySkeleton /> }
    ),
  },

  // ─── Internet Explorer — networking fundamentals ────────────────────────
  "network-post-office": {
    title: "Network Post Office",
    description: "Split a message into packets, route them, reassemble. Real TCP/IP mechanics.",
    concept: "Packet switching · Routing · TCP",
    intro:
      "Every web request you've ever made was chopped into small packets, routed individually through the internet's hop-by-hop network, and reassembled at the destination. The packets can arrive out of order; some can be lost and retransmitted. This demo makes that mechanism visible at a slowed-down pace.",
    underTheHood: [
      "TCP segments a message into packets (~1500 bytes typical), numbers them, and tracks acknowledgments per packet. Lost packets are retransmitted automatically.",
      "Each hop (router) reads the destination IP, picks the next hop based on its routing table, forwards. No router knows the full path — only the next step.",
      "UDP skips TCP's reliability layer for lower latency. Video calls and gaming prefer occasional packet loss over the multi-RTT cost of retransmission.",
    ],
    teaches: { label: "Phase 5 · Computer Networking", href: "/paths/5" },
    roomSlug: "internet-explorer",
    roomName: "Internet Explorer",
    roomColor: "#60a5fa",
    Component: dynamic(
      () => import("@/components/discover/NetworkPostOffice").then((m) => m.NetworkPostOffice),
      { loading: () => <ActivitySkeleton /> }
    ),
  },

  "dns-phonebook": {
    title: "DNS Phonebook",
    description: "Resolve a domain to an IP. The lookup chain behind every URL.",
    concept: "DNS resolution · Hierarchical lookup",
    intro:
      "Type a URL in a browser and dozens of millisecond-scale lookups happen before the first byte arrives. The resolver walks a hierarchy: root nameservers → TLD servers (.com, .org, .io) → authoritative servers for the domain → IP address. Caching at each layer is why a repeat visit is fast.",
    underTheHood: [
      "DNS is a distributed key-value store keyed by domain. ~14 root servers worldwide; thousands of TLD and authoritative servers.",
      "Records have a TTL (time to live) — how long resolvers cache the answer. Tradeoff: faster lookups vs. slower propagation of changes (which is why DNS updates often take 'up to 48 hours').",
      "DNS over HTTPS (DoH) and DNS over TLS encrypt the lookup — addressing the privacy gap that plain DNS leaves wide open by default.",
    ],
    teaches: { label: "Phase 0 · How the Internet Works", href: "/paths/0" },
    roomSlug: "internet-explorer",
    roomName: "Internet Explorer",
    roomColor: "#60a5fa",
    Component: dynamic(
      () => import("@/components/discover/DnsPhonebook").then((m) => m.DnsPhonebook),
      { loading: () => <ActivitySkeleton /> }
    ),
  },

  "website-builder": {
    title: "Website Builder",
    description: "Stack semantic HTML blocks, then read the generated markup.",
    concept: "HTML semantics · Document structure",
    intro:
      "A web page is a tree of nested elements: header, main, article, footer. Drag the blocks together and the generated HTML appears beneath. Browsers parse this tree, apply CSS, and run JavaScript against it. The DOM you'll later use in React is the same tree, just modifiable from code.",
    underTheHood: [
      "Semantic HTML (`<article>`, `<nav>`, `<aside>`, `<main>`) carries meaning, not just appearance. Screen readers, search engines, and accessibility tools all depend on it.",
      "The browser parses HTML into a Document Object Model — a tree of nodes. JavaScript manipulates this tree at runtime; CSS styles its nodes via selectors.",
      "Frameworks like React render the same DOM tree from a description (JSX). The browser doesn't know the difference; it sees the resulting tree either way.",
    ],
    teaches: { label: "Phase 2 · HTML Foundations", href: "/paths/2" },
    roomSlug: "internet-explorer",
    roomName: "Internet Explorer",
    roomColor: "#60a5fa",
    Component: dynamic(
      () => import("@/components/discover/WebsiteBuilder").then((m) => m.WebsiteBuilder),
      { loading: () => <ActivitySkeleton /> }
    ),
  },

  "event-loop": {
    title: "Event Loop",
    description:
      "Schedule setTimeout, Promise.then, and requestAnimationFrame. Watch the loop drain microtasks before macrotasks, and watch a sync block freeze the paint counter.",
    concept: "Event loop · Microtasks · rAF",
    intro:
      "JavaScript runs one thing at a time. The event loop is the scheduler that decides which queued thing runs next — and the order it picks is the difference between a smooth UI and a janky one. This demo simulates the loop one tick at a time: schedule the four kinds of work, click Step, and watch the call stack pull from the microtask queue, the macrotask queue, and the animation-frame queue in the order the spec says it must.",
    underTheHood: [
      "Microtasks (Promise.then, queueMicrotask, MutationObserver) drain to EXHAUSTION between every macrotask. The loop will never take the next setTimeout while a single microtask is still queued — which is why a deep .then chain can postpone macrotasks indefinitely. Queue a `.then chain ×5` and watch the setTimeout sit there waiting.",
      "requestAnimationFrame is wired to RENDER, not to the microtask queue. The browser runs rAF callbacks immediately before committing the next frame — which is what makes rAF the right hook for animation work (it runs at the display's pace) and the wrong hook for general async coordination.",
      "A synchronous CPU loop blocks EVERYTHING: no microtasks drain, no rAFs fire, no paint commits. This is the pathology behind every FE perf war story — a long for-loop, a sync JSON.parse on a big blob, a heavy markdown render — and the original argument for moving work off the main thread (workers, idle callbacks, streaming, time-slicing).",
    ],
    teaches: { label: "Phase 2 · Web Development", href: "/paths/2" },
    roomSlug: "web-platform",
    roomName: "Web Platform",
    roomColor: "#3b82f6",
    Component: dynamic(() => import("@/components/discover/EventLoop").then((m) => m.EventLoop), {
      loading: () => <ActivitySkeleton />,
    }),
  },

  // ─── Pattern Factory — loops & recursion ────────────────────────────────
  "pattern-machine": {
    title: "Pattern Machine",
    description: "Define one motif, loop it. Generative art from a tiny program.",
    concept: "Loops · Procedural generation",
    intro:
      "Three lines of code can produce thousands of visual elements when wrapped in a loop. Define a small motif here, then watch the loop draw a full canvas. The same pattern powers procedural generation in games, generative-art frameworks like Processing, and the rendering of every CSS gradient.",
    underTheHood: [
      "A loop has two parts: a body of code, and a termination condition. Each iteration produces one output.",
      "Procedural generation is deterministic but rule-based: same rules + same seed = same output, every time. This is why game saves can encode a 1-TB world in a few KB of seed + state.",
      "The cost of procedural content is one program + the loop's iteration count, not one file per output. Minecraft uses this to generate worlds that are effectively infinite.",
    ],
    teaches: { label: "Phase 1 · Control Flow", href: "/paths/1" },
    roomSlug: "pattern-factory",
    roomName: "Pattern Factory",
    roomColor: "#a78bfa",
    Component: dynamic(() => import("@/components/discover/PatternMachine"), {
      loading: () => <ActivitySkeleton />,
    }),
  },

  "fractal-tree": {
    title: "Fractal Tree",
    description: "Apply one branching rule recursively. Self-similar structures, made tangible.",
    concept: "Recursion · Self-similar structures",
    intro:
      "A fractal tree is built by one rule: a branch grows two smaller branches at a fixed angle, each of which grows two smaller branches, forever. Stop after N iterations and you have a tree. Recursion — the function that calls itself — is the natural language for any self-similar structure.",
    underTheHood: [
      "Recursive function: `drawBranch(length, angle)`. Base case: length below threshold → stop. Recursive case: call `drawBranch(length × 0.7, angle ± 30°)` twice.",
      "Each recursion level doubles the branch count: depth 5 = 32 leaves, depth 10 = 1024, depth 20 = ~1 million. Exponential growth is exactly what recursion expresses.",
      "Recursion appears throughout CS: tree traversals, parsers, search algorithms, divide-and-conquer sorts (merge sort, quick sort), and the call stack itself.",
    ],
    teaches: { label: "Phase 1 · Functions", href: "/paths/1" },
    roomSlug: "pattern-factory",
    roomName: "Pattern Factory",
    roomColor: "#a78bfa",
    Component: dynamic(
      () => import("@/components/discover/FractalTree").then((m) => m.FractalTree),
      { loading: () => <ActivitySkeleton /> }
    ),
  },

  "music-beats": {
    title: "Music Beats",
    description: "Sequence a 16-step beat. The cyclic loop that drives every sequencer.",
    concept: "Cyclic iteration · Step sequencers",
    intro:
      "Modern music software is built on the same 16-step grid you're playing with here. The pattern loops; each step either triggers a sound or doesn't. The underlying data structure — a fixed-length array iterated cyclically — is the same one driving traffic-light controllers, animation timelines, and game-loop tick handlers.",
    underTheHood: [
      "Fixed-length array of booleans, one per step. Iterator advances modulo array length — when it hits the end, it wraps back to 0.",
      "The same primitive runs at radically different scales: 60 Hz for game loops, 44,100 Hz for audio samples, 4 Hz for trance hi-hats.",
      "Time-keeping at audio-rate is a hard real-time problem: missing a tick by 5ms is audible. Audio engines run on dedicated threads to avoid garbage-collection pauses.",
    ],
    teaches: { label: "Phase 1 · Control Flow", href: "/paths/1" },
    roomSlug: "pattern-factory",
    roomName: "Pattern Factory",
    roomColor: "#a78bfa",
    Component: dynamic(() => import("@/components/discover/MusicBeats").then((m) => m.MusicBeats), {
      loading: () => <ActivitySkeleton />,
    }),
  },

  "tile-designer": {
    title: "Tile Designer",
    description:
      "Design one tile, repeat it. The primitive behind CSS Grid and procedural textures.",
    concept: "Tiling · CSS Grid analogy",
    intro:
      "Design one tile, then tile a plane with it. The primitive — repeat one pattern in two dimensions — is exactly what CSS Grid does in layout, what game engines do with texture atlases, and what M.C. Escher built his career on. The grid you fill here is the abstract version every renderer ultimately runs.",
    underTheHood: [
      "2D tiling = (tile_size × N) repetitions in X and Y. Identical to CSS `background-repeat: repeat` and to game texture atlases.",
      "Modern variations: tilemaps with multiple tile variants sampled procedurally — rooftop in this cell, grass in that one. Used in roguelikes, terrain generation, and CSS-grid layouts.",
      "Performance trick: one texture, many cells = one GPU draw call. Drawing each tile separately would be 100× slower; batching is why games can render thousands of tiles per frame.",
    ],
    teaches: { label: "Phase 2 · CSS Fundamentals", href: "/paths/2" },
    roomSlug: "pattern-factory",
    roomName: "Pattern Factory",
    roomColor: "#a78bfa",
    Component: dynamic(
      () => import("@/components/discover/TileDesigner").then((m) => m.TileDesigner),
      { loading: () => <ActivitySkeleton /> }
    ),
  },

  "memoization-cliff": {
    title: "Memoization Cliff",
    description:
      "Slider for fib(N); side-by-side call trees, naive vs memoized. Watch the exponential turn linear.",
    concept: "Memoization · Dynamic programming",
    intro:
      "The same recursive function, with one tiny addition — caching the result of each sub-call. The naive version recomputes fib(k) for every value of k that appears in the recursion tree; the memoized version computes each fib(k) exactly once. The call count drops from exponential to linear. This is the entire idea of dynamic programming, in the smallest possible form.",
    underTheHood: [
      "Naive fib(n) has T(n) = T(n-1) + T(n-2) + 1 function calls — growing like Fibonacci itself, roughly 1.618ⁿ. fib(35) needs ~30 million calls.",
      "Memoized fib(n) computes each value once: n+1 unique values, plus ~n-1 cache hits = ~2n-1 total calls. fib(35) needs ~69 calls.",
      "Memoization is the canonical dynamic-programming optimization. Every DP problem in the textbook reduces to: identify the sub-problems, cache them, never recompute. The same principle drives prompt caching in LLM APIs (lesson 6-7 · cost engineering).",
    ],
    teaches: { label: "Phase 1 · Functions", href: "/paths/1" },
    roomSlug: "pattern-factory",
    roomName: "Pattern Factory",
    roomColor: "#a78bfa",
    Component: dynamic(
      () => import("@/components/discover/MemoizationCliff").then((m) => m.MemoizationCliff),
      { loading: () => <ActivitySkeleton /> }
    ),
  },

  "embedding-galaxy": {
    title: "Embedding Galaxy",
    description:
      "Click a concept; watch its semantic neighbors light up. Toggle cosine vs euclidean and see why every vector database uses cosine.",
    concept: "Vector embeddings · Semantic similarity",
    intro:
      "Modern AI represents meaning as position in a high-dimensional space — text, images, audio all become vectors of numbers, where semantically related things land near each other. This demo plots 36 CS concepts on a 2D map we hand-placed by meaning. Click any concept to highlight its three nearest neighbors by cosine similarity; toggle to euclidean distance and watch the ranking shift. The math you're running here is the same math a vector database (Pinecone, Weaviate, pgvector) runs at query time — just in 2 dimensions instead of 1,536.",
    underTheHood: [
      "Real embeddings come from neural networks (BERT, OpenAI's text-embedding-3, sentence-transformers) pre-trained on massive text corpora with objectives that pull semantically related pieces of text close together — typically into a 768- or 1,536-dimensional vector space. Models don't 'understand' meaning; they learn a geometry in which proximity correlates with meaning.",
      "Cosine similarity measures the angle between two vectors, ignoring their lengths. Euclidean measures absolute distance. Embedding spaces care about direction — a long document and a short one about the same topic point the same way but live at different distances from the origin. Cosine catches the similarity; euclidean misses it. Every production vector search engine defaults to cosine for this reason.",
      "“Semantic space” means a coordinate system where geometric operations have meaning — the famous example is `vector('king') - vector('man') + vector('woman') ≈ vector('queen')`. The model never stored these analogies; they emerged from the training objective. Nearest-neighbor lookup over that space is what powers retrieval-augmented generation, image search, recommendation systems, and the “related lessons” surface DURA may eventually ship.",
    ],
    teaches: { label: "Phase 6 · AI/ML Engineering", href: "/paths/6" },
    roomSlug: "pattern-factory",
    roomName: "Pattern Factory",
    roomColor: "#a78bfa",
    Component: dynamic(
      () => import("@/components/discover/EmbeddingGalaxy").then((m) => m.EmbeddingGalaxy),
      { loading: () => <ActivitySkeleton /> }
    ),
  },

  // ─── Bug Lab — debugging & logic ────────────────────────────────────────
  "bug-detective": {
    title: "Bug Detective",
    description: "Find the bug by reasoning, not guessing. The under-taught skill in programming.",
    concept: "Defect localization · Hypothesis testing",
    intro:
      "Inspect this small program that does the wrong thing. Find the bug by stepping through what each line actually does and comparing it to what you expected it to do. The discipline this builds — narrowing down where reality and assumption diverge — is what separates good debuggers from people who 'try things' until something works.",
    underTheHood: [
      "Scientific method applied to code: form a hypothesis ('I think X is broken'), test it by inspecting that exact thing, narrow the search space.",
      "Print debugging is real debugging. So is rubber-duck explanation. The cheapest tool that surfaces the bug wins.",
      "Modern debuggers (lldb, Chrome DevTools, IDE-integrated debuggers) automate the inspection — but the hypothesis-testing discipline is still on you.",
    ],
    teaches: { label: "Phase 1 · Debugging", href: "/paths/1" },
    roomSlug: "bug-lab",
    roomName: "Bug Lab",
    roomColor: "#34d399",
    Component: dynamic(
      () => import("@/components/discover/BugDetective").then((m) => m.BugDetective),
      { loading: () => <ActivitySkeleton /> }
    ),
  },

  "logic-gates": {
    title: "Logic Gates",
    description: "Wire AND / OR / NOT / XOR. The primitives every CPU is built from.",
    concept: "Boolean logic · Digital circuits",
    intro:
      "Every CPU on Earth is built from a small set of logical primitives: AND, OR, NOT, XOR. Compose them and you can implement any computation. The patterns you wire here are the same patterns inside an addition circuit, a memory cell, and every Boolean condition you'll ever write in code.",
    underTheHood: [
      "Boolean algebra: 0 and 1, AND/OR/NOT operations. George Boole (1854) → Claude Shannon (1937, applied to switching circuits) → every digital computer that followed.",
      "Functional completeness: NAND alone can express every logical operation. Real CPUs are built from billions of these primitives etched into silicon.",
      "Boolean expressions in your code (`if (x > 0 && !done)`) compile down to these same gate operations on the CPU's ALU.",
    ],
    teaches: { label: "Phase 0 · How Computers Think", href: "/paths/0" },
    roomSlug: "bug-lab",
    roomName: "Bug Lab",
    roomColor: "#34d399",
    Component: dynamic(() => import("@/components/discover/LogicGates").then((m) => m.LogicGates), {
      loading: () => <ActivitySkeleton />,
    }),
  },

  "story-builder": {
    title: "Story Builder",
    description: "Reorder a sequence of beats. Same skill as Algorithm Kitchen, different lens.",
    concept: "Sequence reasoning · Causal chains",
    intro:
      "Put the story in the right order. The skill you're using — reasoning about which event must precede another to make the whole make sense — is the same skill that fixes broken algorithms, untangles dependency graphs, and writes coherent technical specifications.",
    underTheHood: [
      "Causal ordering: A must happen before B if B depends on A. Same constraint as build systems, database transactions, and distributed-system message ordering.",
      "Multiple valid orderings can exist: some events have no dependency on each other and can swap freely. This is the same idea as 'parallelizable tasks' in a build graph.",
      "The discipline of writing operations in the right order — and recognizing when order doesn't matter — is what makes the difference between code that ships and code that mostly works.",
    ],
    teaches: { label: "Phase 1 · Control Flow", href: "/paths/1" },
    roomSlug: "bug-lab",
    roomName: "Bug Lab",
    roomColor: "#34d399",
    Component: dynamic(
      () => import("@/components/discover/StoryBuilder").then((m) => m.StoryBuilder),
      { loading: () => <ActivitySkeleton /> }
    ),
  },

  "race-condition": {
    title: "Race Condition",
    description:
      "Two threads share a counter. Run it; watch the final value drift. Add a lock; watch the variance go away.",
    concept: "Concurrency · Interleaving · Atomicity",
    intro:
      "Both threads do the same job: read the shared counter, add one, write it back, fifty times each. With one thread that's 100. With two threads and no coordination, the answer drifts — sometimes 100, sometimes 87, sometimes 64 — because the steps of one thread's increment slot in between the steps of the other's. Run it a few times, watch the histogram fan out, then flip the atomic switch and watch every run land on exactly 100.",
    underTheHood: [
      "The bug lives in the gap between read and write — a classic TOCTOU (time-of-check / time-of-use). Thread A reads 41, thread B reads 41, both compute 42, both write 42. One increment is lost. The hardware ran the code correctly; the program just told it to race.",
      "The atomic toggle adds a single global lock around the read/+1/write triple. The cost is real: threads now wait on each other inside the critical section, throughput drops, and a careless second lock can deadlock the program. Real systems use atomic CPU instructions (CAS, fetch-add) when they can — they're the same idea, baked into one uninterruptible memory operation.",
      "Modern CPUs and JIT compilers reorder reads and writes for speed; the memory model is the contract that says which reorderings a program can observe. Java's volatile, C++'s std::atomic, and JavaScript's SharedArrayBuffer + Atomics all exist because the naive 'just read and write the variable' you can write in a single thread is not safe across threads. The concept here is the floor; the memory model is the rest of the building.",
    ],
    teaches: { label: "Phase 5 · Concurrency", href: "/paths/5" },
    roomSlug: "bug-lab",
    roomName: "Bug Lab",
    roomColor: "#34d399",
    Component: dynamic(
      () => import("@/components/discover/RaceCondition").then((m) => m.RaceCondition),
      { loading: () => <ActivitySkeleton /> }
    ),
  },

  "n-plus-one": {
    title: "N+1 Query Problem",
    description:
      "Loop over users, fetch each user's posts. Watch query count and elapsed time explode — then watch one IN-clause make it disappear.",
    concept: "Database performance · ORM traps",
    intro:
      "The most common backend performance bug in the world hides in three lines of innocent-looking ORM code: fetch a list of users, then for each user, fetch their posts. In development with 5 fake users it runs in milliseconds. In production with 200 real users it issues 201 round-trips and ships a dashboard that takes 8 seconds to load. Run both patterns side-by-side; watch the gap grow linearly with users; reveal the antidote — one line in every major ORM.",
    underTheHood: [
      "The ORM convenience trap: `user.posts` looks like a property access but is a network call. The code reads like a list comprehension; the runtime behavior is a tight loop of round-trips. This is why N+1 survives every code review — it doesn't look like a database access at all.",
      "Production data is what surfaces this. With 5 seed-data users the latency is invisible; with 200 real users at 20 ms each it's a 4-second page. By the time the bug is felt, the schema, the API contract, and the UI are all already shipped — so the fix shows up as a frantic patch instead of a design choice.",
      "Every major ORM ships a one-line antidote: Django `prefetch_related` / `select_related`, Prisma `include`, Laravel `with`, ActiveRecord `includes`, SQLAlchemy `joinedload`, GraphQL `DataLoader`. They all do the same thing: collect the parent IDs, fire one `IN`-clause or `JOIN` query, distribute the results to the right parents. The hard part is noticing the bug exists.",
    ],
    teaches: { label: "Phase 4 · Backend Engineering", href: "/paths/4" },
    roomSlug: "data-vault",
    roomName: "Data Vault",
    roomColor: "#a855f7",
    Component: dynamic(() => import("@/components/discover/NPlusOne").then((m) => m.NPlusOne), {
      loading: () => <ActivitySkeleton />,
    }),
  },

  "optimistic-ui": {
    title: "Optimistic UI",
    description:
      "Like a post under varying latency and failure rates. Toggle optimistic vs pessimistic; watch the rollback flicker and the queued wait.",
    concept: "Optimistic updates · FE/BE contract · Rollback paths",
    intro:
      "Optimistic UI lies to the user, kindly. The local state updates the moment they click; the server gets told later, and on the rare day the server says no, the lie has to be undone. This simulator runs a like button against a fake server you control — latency slider, failure-rate slider — and surfaces what feels different. Flip to pessimistic mode and the heart waits for the round trip; flip back to optimistic and it fires instantly, with the rollback path doing quiet work behind the scenes. The stats panel shows perceived latency and rollback counts diverging in real time. The whole point: optimism feels faster, but ships more code.",
    underTheHood: [
      "Perceived latency vs complexity: optimistic mode collapses time-to-feedback to a single frame (~16ms) at the cost of a reconcile path that must exist, must be tested, and must handle the case where the user kept interacting before the server got back to you. Pessimistic mode pays a real round trip every click, and stops a class of bugs from being possible at all. There is no free choice — the trade is between user-felt speed and code surface area.",
      "Rollback-path-exists invariant: every optimistic update in production must have a corresponding revert. The simulator makes the rollback visible as a flicker because real codebases hide it behind a toast — and the day the rollback path is missing or wrong is the day users see counts that disagree across refreshes. Idempotency keys (so retries don't double-apply) and version numbers (so a late-arriving response can't overwrite a newer one) are how real systems make the rollback safe; the rapid-click burst in this demo is the closest thing to seeing why both are necessary.",
      "Irreversible-ops boundary: never go optimistic for payments, deletes, account changes, or any action whose rollback can't be made truly invisible. The cost of a wrong rollback on a like is a flicker; the cost on a charge is a refund ticket and a furious user. The rule of thumb: optimistic for actions the user repeats freely and won't notice a 200ms hiccup on; pessimistic for actions where being wrong has a tail.",
    ],
    teaches: { label: "Phase 4 · Backend Engineering", href: "/paths/4" },
    roomSlug: "state-machine",
    roomName: "State Machine",
    roomColor: "#f43f5e",
    Component: dynamic(
      () => import("@/components/discover/OptimisticUI").then((m) => m.OptimisticUI),
      { loading: () => <ActivitySkeleton /> }
    ),
  },

  "gc-visualizer": {
    title: "GC Visualizer",
    description:
      "Allocate objects, mutate references, run mark-and-sweep. Watch the reachable set glow green and the rest get reclaimed.",
    concept: "Garbage collection · Memory management",
    intro:
      "Every modern language manages heap memory for you — but only by running an algorithm under the hood. This is that algorithm, slowed down. Build a small object graph from roots, then run GC and watch the mark phase BFS outward from the roots, painting everything reachable. The sweep phase reclaims the rest. Toggle to reference counting and build a cycle to see why most modern runtimes still ship a tracing collector alongside any RC scheme.",
    underTheHood: [
      "Memory bugs (use-after-free, double-free, leaks) were the dominant security-bug class for decades — Microsoft and Google have each reported that ~70% of their critical vulnerabilities trace back to manual memory errors. GC trades a small runtime cost for an entire class of bugs disappearing.",
      "The reachability invariant: an object is live iff it can be reached from a root by following references. Roots are the stack frames + global registers + CPU registers a real runtime walks at GC time. Everything else is, by definition, garbage.",
      "Three regimes: manual (C, C++, Zig) — fastest, most error-prone; reference counting (Swift, CPython) — incremental, cheap, but cycles leak without a cycle-detector; tracing (Java, JavaScript, Go, .NET) — periodic stop-the-world or concurrent walks, handles cycles natively, costs throughput and tail latency. There is no free lunch — every language picks its trade-off.",
    ],
    teaches: { label: "Phase 7 · Advanced Systems", href: "/paths/7" },
    roomSlug: "bug-lab",
    roomName: "Bug Lab",
    roomColor: "#34d399",
    Component: dynamic(
      () => import("@/components/discover/GcVisualizer").then((m) => m.GcVisualizer),
      { loading: () => <ActivitySkeleton /> }
    ),
  },

  // ─── Live Wire — real-time pub/sub mechanics ────────────────────────────
  pubsub: {
    title: "Pub/Sub",
    description:
      "Publishers, topics, subscribers. Watch fan-out, backpressure, disconnect and replay — the dynamics every real-time system has to survive.",
    concept: "Real-time messaging · Fan-out · Backpressure",
    intro:
      "Every chat app, live dashboard, push notification, and stock ticker is built on the same primitive: a broker fans messages out from publishers to many subscribers in real time. This simulation runs that primitive at a slowed-down pace — turn up a publisher's rate, drop a subscriber's drain speed, and watch a queue climb until it's backpressured. Disconnect a consumer, flip the 'broker buffers' toggle, and see why the same gap can either replay cleanly or silently drop everything depending on one configuration choice.",
    underTheHood: [
      "Fan-out: one publisher writes once, the broker delivers to every subscriber whose subscription set matches the topic. Crucially different from point-to-point queues (where each message goes to one consumer). Redis pub/sub, Kafka consumer groups in broadcast mode, MQTT, and every WebSocket fan-out server implement this same shape — your phone gets the push notification because it subscribed to a topic, not because the server addressed it directly.",
      "Backpressure: the queue grows whenever inbound rate exceeds drain rate. In a single-machine sim this is a `q=12` indicator. In production it's a slow consumer melting a Kafka broker's disk, a WebSocket server running out of socket buffer, or a Lambda hitting its concurrency cap. The dominant production failure mode in real-time systems is not 'the message got lost' — it's 'one consumer is slow and now everyone is'.",
      "Delivery semantics live on a spectrum. At-most-once: fire and forget (UDP, raw WebSockets, default Redis pub/sub) — fast, simple, lossy under failure. At-least-once: the broker holds the message until the consumer acks, redelivering on disconnect (Kafka, RabbitMQ with acks, SQS) — durable, but the consumer must be idempotent because duplicates happen. Exactly-once: only achievable with transactional brokers, idempotent producers, and ack protocols (Kafka with transactions, Pulsar) — the most expensive guarantee in distributed systems, and the one most teams don't actually need.",
    ],
    teaches: { label: "Phase 5 · Systems Engineering", href: "/paths/5" },
    roomSlug: "live-wire",
    roomName: "Live Wire",
    roomColor: "#06B6D4",
    Component: dynamic(() => import("@/components/discover/PubSub").then((m) => m.PubSub), {
      loading: () => <ActivitySkeleton />,
    }),
  },
};

/** Room-to-activities mapping for generateStaticParams. */
const ROOM_ACTIVITIES: Record<string, string[]> = {
  "secret-codes": ["binary-painter", "morse-code", "pixel-art", "secret-encoder", "hash-avalanche"],
  "robot-chef": ["algorithm-kitchen", "robot-dance", "treasure-map", "sorting-race", "pathfinding"],
  "internet-explorer": ["network-post-office", "dns-phonebook", "website-builder"],
  "pattern-factory": [
    "pattern-machine",
    "fractal-tree",
    "music-beats",
    "tile-designer",
    "memoization-cliff",
    "embedding-galaxy",
  ],
  "bug-lab": ["bug-detective", "logic-gates", "story-builder", "race-condition", "gc-visualizer"],
  // New rooms (2026-05-28) — each anchored by one well-built activity
  // with room to grow as more land. The four below cover frontend (web
  // platform), backend (databases + queries), full-stack (distributed
  // state), and live data (sockets + pub/sub) — the "frontend, backend,
  // full stack, sockets" axis the universality audit asked for.
  "web-platform": ["event-loop"],
  "data-vault": ["n-plus-one"],
  "state-machine": ["optimistic-ui"],
  "live-wire": ["pubsub"],
};

/** Pre-render all room+activity combinations at build time. */
export function generateStaticParams(): Array<{ slug: string; activity: string }> {
  return Object.entries(ROOM_ACTIVITIES).flatMap(([roomSlug, activities]) =>
    activities.map((activity) => ({ slug: roomSlug, activity }))
  );
}

/** Generate metadata per activity. */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; activity: string }>;
}): Promise<Metadata> {
  const { slug, activity: activitySlug } = await params;
  const entry = ACTIVITIES[activitySlug];
  if (!entry || entry.roomSlug !== slug) return {};

  return buildMetadata({
    title: `${entry.title} — ${entry.roomName} — Discovery Zone`,
    description: entry.description,
    path: `/discover/${slug}/${activitySlug}`,
  });
}

export default async function DiscoverActivityPage({
  params,
}: {
  params: Promise<{ slug: string; activity: string }>;
}): Promise<React.ReactElement> {
  const { slug, activity: activitySlug } = await params;
  const entry = ACTIVITIES[activitySlug];

  // Validate that the activity exists and belongs to this room
  if (!entry || entry.roomSlug !== slug) notFound();

  const {
    title,
    description,
    concept,
    intro,
    underTheHood,
    teaches,
    roomName,
    roomColor,
    Component,
  } = entry;

  return (
    <main className="mx-auto max-w-[960px] px-6 py-10">
      {/* Back link */}
      <Link
        href={`/discover/${slug}`}
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)] transition hover:text-[var(--color-text-primary)]"
      >
        <ArrowLeft size={16} />
        Back to {roomName}
      </Link>

      {/* Activity header — concept kicker + title + short description */}
      <header className="mb-8">
        <p
          className="mb-2 text-xs font-medium tracking-wide uppercase"
          style={{ color: roomColor }}
        >
          {concept}
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text-primary)] sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 text-lg text-[var(--color-text-secondary)]">{description}</p>
      </header>

      {/* Pedagogical intro — concept-led setup BEFORE the interactive */}
      <section
        className="mb-10 rounded-xl border px-6 py-5"
        style={{
          borderColor: `${roomColor}33`,
          backgroundColor: `${roomColor}0a`,
        }}
      >
        <p className="text-[15px] leading-relaxed text-[var(--color-text-secondary)]">{intro}</p>
      </section>

      {/* The interactive activity itself — unchanged */}
      <section className="mb-12">
        <Component />
      </section>

      {/* Under the hood — what's really happening, in CS terms */}
      <section className="mb-10 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-6 py-5">
        <h2 className="mb-3 text-base font-semibold text-[var(--color-text-primary)]">
          What&rsquo;s happening under the hood
        </h2>
        <ul className="space-y-2 text-[14px] leading-relaxed text-[var(--color-text-secondary)]">
          {underTheHood.map((point) => (
            <li key={point} className="flex gap-2">
              <span className="shrink-0" style={{ color: roomColor }}>
                ›
              </span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Curriculum link — where the concept lives formally */}
      <section
        className="rounded-xl border px-6 py-5"
        style={{ borderColor: `${roomColor}55`, backgroundColor: `${roomColor}10` }}
      >
        <p className="text-xs font-medium tracking-wide text-[var(--color-text-muted)] uppercase">
          Dig deeper
        </p>
        <Link
          href={teaches.href}
          className="mt-1 inline-flex items-center gap-1 text-base font-semibold text-[var(--color-text-primary)] transition hover:text-[var(--color-accent)]"
        >
          {teaches.label}
          <ArrowUpRight size={16} />
        </Link>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          The concept you just explored is taught with full depth in the formal DURA curriculum.
        </p>
      </section>
    </main>
  );
}
