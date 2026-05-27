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
};

/** Room-to-activities mapping for generateStaticParams. */
const ROOM_ACTIVITIES: Record<string, string[]> = {
  "secret-codes": ["binary-painter", "morse-code", "pixel-art", "secret-encoder"],
  "robot-chef": ["algorithm-kitchen", "robot-dance", "treasure-map"],
  "internet-explorer": ["network-post-office", "dns-phonebook", "website-builder"],
  "pattern-factory": ["pattern-machine", "fractal-tree", "music-beats", "tile-designer"],
  "bug-lab": ["bug-detective", "logic-gates", "story-builder"],
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
