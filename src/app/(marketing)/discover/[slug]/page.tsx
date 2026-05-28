import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { buildMetadata } from "@/lib/og";

interface Activity {
  slug: string;
  name: string;
  description: string;
  /** One-line concept this activity puts hands-on. Surfaces as a card badge. */
  concept: string;
  /** Where the concept is taught formally — phase/module/lesson display. */
  teaches: {
    label: string;
    /** Phase-level link target. Module/lesson navigation is up to the route. */
    href: string;
  };
}

interface Room {
  name: string;
  tagline: string;
  emoji: string;
  color: string;
  /** Concept area this room covers, surfaced under the title. */
  concept: string;
  /** Long-form intro: what this room is for and what it teaches. */
  intro: string;
  activities: Activity[];
}

/**
 * Discovery Zone rooms. Each activity is paired with the formal curriculum
 * lesson where the concept is taught — "the hook is play, the destination
 * is the curriculum."
 *
 * Note: the previous "first-steps" room (Shape Sorter / Counting Blocks /
 * Color Mixer) was removed from the public Discovery surface in the 2026-05
 * refresh because those activities are below DURA's target reading level.
 * The components remain in the codebase for potential later use.
 */
const ROOMS: Record<string, Room> = {
  "secret-codes": {
    name: "Secret Codes",
    tagline: "How computers represent information — binary, encoding, encryption.",
    emoji: "\u{1F510}",
    color: "#f472b6",
    concept: "Encoding & representation",
    intro:
      "Computers can't really 'see' images, words, or colors — only numbers. These activities make the encoding rules visible: how 8 bits become a color, how dots and dashes become letters, how a grid of pixels becomes a picture, and how a substitution cipher hides a message in plain sight.",
    activities: [
      {
        slug: "binary-painter",
        name: "Binary Painter",
        description:
          "Flip 8 binary switches and watch a color appear. The first 3 bits set red, the next 3 green, the last 2 blue — the same scheme every monitor on Earth uses.",
        concept: "Binary representation · RGB encoding",
        teaches: { label: "Phase 0 · How Computers Think", href: "/paths/0" },
      },
      {
        slug: "morse-code",
        name: "Morse Code",
        description:
          "Tap out letters in dots and dashes. The original binary protocol — and a working primer on how every digital code maps symbols to short, unambiguous patterns.",
        concept: "Symbol encoding · Variable-length codes",
        teaches: { label: "Phase 0 · How Computers Think", href: "/paths/0" },
      },
      {
        slug: "pixel-art",
        name: "Pixel Art",
        description:
          "Place squares on a grid. The same data structure (a 2D array of color values) is what backs every PNG, every game sprite, every screen on every device you've ever used.",
        concept: "2D arrays · Raster images",
        teaches: { label: "Phase 0 · How Computers Think", href: "/paths/0" },
      },
      {
        slug: "secret-encoder",
        name: "Secret Encoder",
        description:
          "Scramble a message with a substitution cipher. Learn why the rules of encryption are mathematical — and why this specific cipher hasn't been considered secure since the 9th century.",
        concept: "Substitution ciphers · Cryptography 101",
        teaches: { label: "Phase 7 · Security Engineering", href: "/paths/7" },
      },
      {
        slug: "hash-avalanche",
        name: "Hash Avalanche",
        description:
          "Paste a message and see its SHA-256 bit grid. Change one character — watch about half the 256 output bits flip. The avalanche property is what makes cryptographic hashes safe for signatures, passwords, and blockchain integrity.",
        concept: "Cryptographic hashing · Avalanche property",
        teaches: { label: "Phase 7 · Security Engineering", href: "/paths/7" },
      },
    ],
  },
  "robot-chef": {
    name: "Robot Chef",
    tagline: "Algorithms, sequencing, and the discipline of step-by-step instructions.",
    emoji: "\u{1F916}",
    color: "#fbbf24",
    concept: "Algorithms & sequencing",
    intro:
      "Computers do exactly what you say, in exactly the order you say it. These activities put that constraint hands-on: a sandwich falls apart when you skip a step, a dance ends in chaos when instructions are out of order, an explorer wanders when directions are vague. The discipline of writing correct, ordered instructions is the foundation of programming.",
    activities: [
      {
        slug: "algorithm-kitchen",
        name: "Algorithm Kitchen",
        description:
          "Follow the recipe in the right order. Skip a step, swap two, and watch the sandwich fall apart. Algorithms reward precision and order.",
        concept: "Sequential algorithms · Preconditions",
        teaches: { label: "Phase 1 · Programming Fundamentals", href: "/paths/1" },
      },
      {
        slug: "robot-dance",
        name: "Robot Dance",
        description:
          "Write a sequence of dance moves; the robot executes them literally. Surfaces what 'literal interpretation' really means — and why off-by-one and misordered instructions are the dominant class of beginner bugs.",
        concept: "Imperative programming · Literal execution",
        teaches: { label: "Phase 1 · Control Flow", href: "/paths/1" },
      },
      {
        slug: "treasure-map",
        name: "Treasure Map",
        description:
          "Give precise step-by-step directions to guide an explorer through a grid. The grid is your data structure; the directions are your program; the treasure is correctness.",
        concept: "Grid navigation · Procedural thinking",
        teaches: { label: "Phase 1 · Programming Fundamentals", href: "/paths/1" },
      },
      {
        slug: "sorting-race",
        name: "Sorting Race",
        description:
          "Three sorting algorithms run on the same shuffled array. Bubble sort vs merge sort vs quick sort — the same problem at O(n²) vs O(n log n) made viscerally visible. Big-O isn't a textbook abstraction here; it's elapsed time you can watch.",
        concept: "Sorting algorithms · Big-O complexity",
        teaches: { label: "Phase 3 · Complexity and Big O", href: "/paths/3" },
      },
      {
        slug: "pathfinding",
        name: "Pathfinding",
        description:
          "BFS, Dijkstra, and A* race across the same grid. Drop walls and mud, watch each algorithm sweep. The heuristic that makes A* goal-directed becomes obvious when you compare cell counts side-by-side.",
        concept: "Graph search · Heuristics · A*",
        teaches: { label: "Phase 3 · Algorithms & Complexity", href: "/paths/3" },
      },
    ],
  },
  "internet-explorer": {
    name: "Internet Explorer",
    tagline: "DNS, packets, and the architecture behind every web request.",
    emoji: "\u{1F310}",
    color: "#60a5fa",
    concept: "Networking fundamentals",
    intro:
      "Every time you load a website, dozens of layered protocols cooperate to deliver the result in under a second. These activities pull each layer apart: how a domain name resolves to an IP address, how a message is split into packets and reassembled across hops, and how the markup and code of a web page actually fit together.",
    activities: [
      {
        slug: "network-post-office",
        name: "Network Post Office",
        description:
          "Send a message across a simulated network. Watch it split into packets, route through intermediate hops, and reassemble at the destination — the same dance every TCP connection performs.",
        concept: "Packet switching · Routing · TCP",
        teaches: { label: "Phase 5 · Computer Networking", href: "/paths/5" },
      },
      {
        slug: "dns-phonebook",
        name: "DNS Phonebook",
        description:
          "Look up a domain name and watch the resolver chain walk: root server → TLD server → authoritative server → IP address. The system underneath every web link you've ever clicked.",
        concept: "DNS resolution · Hierarchical lookup",
        teaches: { label: "Phase 0 · How the Internet Works", href: "/paths/0" },
      },
      {
        slug: "website-builder",
        name: "Website Builder",
        description:
          "Stack semantic HTML blocks to build a page, then peek at the generated markup. Bridges the visual editor world and the actual code that the browser parses.",
        concept: "HTML semantics · Document structure",
        teaches: { label: "Phase 2 · HTML Foundations", href: "/paths/2" },
      },
    ],
  },
  "pattern-factory": {
    name: "Pattern Factory",
    tagline: "Iteration, recursion, and rule-based composition.",
    emoji: "\u{1F52E}",
    color: "#a78bfa",
    concept: "Loops & recursion",
    intro:
      "Most computer programs are short rules repeated over and over. These activities make that pattern visible: a shape repeats to make a wallpaper, a single branching rule grows into a tree, a beat loops to compose a song. Loops and recursion are how a few lines of code produce complex, scalable output.",
    activities: [
      {
        slug: "pattern-machine",
        name: "Pattern Machine",
        description:
          "Define a small motif, then loop it. The result is parametric art — a 3-line program producing visual complexity that would take a thousand lines if you wrote each step out.",
        concept: "Loops · Procedural generation",
        teaches: { label: "Phase 1 · Control Flow", href: "/paths/1" },
      },
      {
        slug: "fractal-tree",
        name: "Fractal Tree",
        description:
          "Watch a tree grow by recursively applying the same branching rule. The recursion depth slider makes the relationship between depth and complexity tangible — and shows why recursion is the natural language for self-similar data.",
        concept: "Recursion · Self-similar structures",
        teaches: { label: "Phase 1 · Functions", href: "/paths/1" },
      },
      {
        slug: "music-beats",
        name: "Music Beats",
        description:
          "Arrange a 16-step grid of percussion. The same loop primitive that drives every sequencer in music software — and a hands-on version of the cyclic data structure underneath.",
        concept: "Cyclic iteration · Step sequencers",
        teaches: { label: "Phase 1 · Control Flow", href: "/paths/1" },
      },
      {
        slug: "tile-designer",
        name: "Tile Designer",
        description:
          "Design one tile, then tile a plane. The same repeat-mode primitive that powers CSS Grid, wallpaper rendering, and procedural texture generation in games.",
        concept: "Tiling · CSS Grid analogy",
        teaches: { label: "Phase 2 · CSS Fundamentals", href: "/paths/2" },
      },
      {
        slug: "memoization-cliff",
        name: "Memoization Cliff",
        description:
          "Slider for fib(N); side-by-side call trees, naive recursion vs memoized. At N=30, naive needs ~2.7 million calls; memoized needs 59. The dynamic-programming insight in its purest form — caching turns an exponential algorithm into a linear one.",
        concept: "Memoization · Dynamic programming",
        teaches: { label: "Phase 1 · Functions", href: "/paths/1" },
      },
      {
        slug: "embedding-galaxy",
        name: "Embedding Galaxy",
        description:
          "Click any of 36 CS concepts plotted on a 2D semantic map and watch its three nearest neighbors light up. Toggle cosine similarity vs euclidean distance to see why every vector database defaults to cosine — and feel, in your hand, what 'meaning is a position' actually means.",
        concept: "Vector embeddings · Semantic similarity",
        teaches: { label: "Phase 6 · AI/ML Engineering", href: "/paths/6" },
      },
    ],
  },
  "bug-lab": {
    name: "Bug Lab",
    tagline: "Debugging logic, tracing failures, and Boolean reasoning.",
    emoji: "\u{1F52C}",
    color: "#34d399",
    concept: "Debugging & logic",
    intro:
      "Half of all programming time is spent finding bugs. These activities train the specific reasoning that distinguishes good debuggers: tracing execution step by step, narrowing down where reality and assumption diverged, and reasoning about Boolean conditions until you spot the one that's wrong.",
    activities: [
      {
        slug: "bug-detective",
        name: "Bug Detective",
        description:
          "Inspect a small program that does the wrong thing. Find the bug by reasoning about each step, not by guessing. The cognitive habit this builds is the most under-taught skill in programming education.",
        concept: "Defect localization · Hypothesis testing",
        teaches: { label: "Phase 1 · Debugging", href: "/paths/1" },
      },
      {
        slug: "logic-gates",
        name: "Logic Gates",
        description:
          "Wire AND / OR / NOT / XOR gates and see the outputs. The same primitives every CPU on the planet is built from — and the foundation of every Boolean condition you'll ever write in code.",
        concept: "Boolean logic · Digital circuits",
        teaches: { label: "Phase 0 · How Computers Think", href: "/paths/0" },
      },
      {
        slug: "story-builder",
        name: "Story Builder",
        description:
          "Reorder a sequence of story beats. A different framing of the same skill that breaks Algorithm Kitchen if you skip a step: getting ordered logic right.",
        concept: "Sequence reasoning · Causal chains",
        teaches: { label: "Phase 1 · Control Flow", href: "/paths/1" },
      },
      {
        slug: "race-condition",
        name: "Race Condition",
        description:
          "Two threads share a counter; each runs read/+1/write fifty times. Without coordination, increments get lost — final values fan out below 100. Flip the atomic switch and every run lands on exactly 100. The histogram tells the whole story.",
        concept: "Concurrency · Interleaving · Atomicity",
        teaches: { label: "Phase 5 · Concurrency", href: "/paths/5" },
      },
      {
        slug: "gc-visualizer",
        name: "GC Visualizer",
        description:
          "Allocate objects on a tiny heap, mutate references, then run mark-and-sweep. Watch the BFS wave paint reachable objects green and the sweep phase reclaim the rest. Toggle reference counting and build a cycle to see the failure mode every modern runtime had to work around.",
        concept: "Garbage collection · Memory management",
        teaches: { label: "Phase 7 · Advanced Systems", href: "/paths/7" },
      },
    ],
  },
  "web-platform": {
    name: "Web Platform",
    tagline: "The browser is your stage. The event loop, the DOM, hydration, layout, paint.",
    emoji: "\u{1F310}",
    color: "#3b82f6",
    concept: "Frontend internals",
    intro:
      "Every web app you have ever used runs on the same platform — the browser. Underneath the framework of the week sits the same handful of mechanisms: an event loop that decides what runs when, a DOM that the browser parses and paints, a hydration handshake between server-rendered HTML and client JavaScript. These activities make those mechanisms visible. They are the things you reach for when a button feels slow and the framework can't tell you why.",
    activities: [
      {
        slug: "event-loop",
        name: "Event Loop",
        description:
          "Schedule setTimeout, Promise.then, requestAnimationFrame, and a synchronous CPU block. Step the loop and watch microtasks drain to exhaustion between every macrotask, rAF fire right before paint, and a 50ms sync block freeze the renderer cold.",
        concept: "Event loop · Microtasks · rAF",
        teaches: { label: "Phase 2 · Web Development", href: "/paths/2" },
      },
    ],
  },
  "data-vault": {
    name: "Data Vault",
    tagline: "Where data lives, why it disagrees with itself, and how queries actually run.",
    emoji: "\u{1F5C4}",
    color: "#a855f7",
    concept: "Databases & queries",
    intro:
      "The database is the part of your stack that survives the longest. Frameworks rotate; schemas accumulate. These activities make the mechanics of queries, indexes, transactions, and replication visible — so when a dashboard hits 8 seconds in production at the size where it ran in 80 milliseconds in dev, you can read the explain plan and know which bug you are looking at.",
    activities: [
      {
        slug: "n-plus-one",
        name: "N+1 Query Problem",
        description:
          "Side-by-side: loop over users and fetch their posts one-at-a-time vs one IN-clause query. Watch query count and elapsed time fan out as users grow. The most common backend performance bug in the world, made impossible to miss.",
        concept: "Database performance · ORM traps",
        teaches: { label: "Phase 4 · Backend Engineering", href: "/paths/4" },
      },
    ],
  },
  "state-machine": {
    name: "State Machine",
    tagline: "When two computers disagree about what's true — and how UIs survive it.",
    emoji: "\u{1F501}",
    color: "#f43f5e",
    concept: "Distributed state · Sync",
    intro:
      "Every modern app is two computers pretending to agree. The browser holds a copy of the state; the server holds the truth. These activities surface the contract — what happens when the browser updates first and asks later, what conflicts look like when two clients edit at once, why CRDTs and version vectors exist. The full-stack engineer's mental model lives here.",
    activities: [
      {
        slug: "optimistic-ui",
        name: "Optimistic UI",
        description:
          "Like a post with latency and failure-rate sliders. Optimistic mode updates instantly and rolls back on server failure; pessimistic mode waits. Burst five clicks and watch the trade between user-felt speed and rollback complexity play out in real time.",
        concept: "Optimistic updates · FE/BE contract · Rollback paths",
        teaches: { label: "Phase 4 · Backend Engineering", href: "/paths/4" },
      },
    ],
  },
  "live-wire": {
    name: "Live Wire",
    tagline:
      "Real-time systems — sockets, streams, and the live data your phone never stops receiving.",
    emoji: "\u{1F4E1}",
    color: "#06B6D4",
    concept: "Real-time + pub/sub",
    intro:
      "Every chat app, live sports score, push notification, and real-time dashboard belongs to the same category of system: a broker fans messages out from publishers to many subscribers, in something close to real time. These activities make the mechanics visible — the fan-out pattern, the queue depth that grows when a consumer is too slow, the disconnect-and-replay dance that decides whether your inbox catches up or silently loses what it missed.",
    activities: [
      {
        slug: "pubsub",
        name: "Pub/Sub",
        description:
          "Drive publishers, watch a broker fan messages out to subscribers, and surface the dynamics that wreck real-time systems in production — runaway queues from backpressure, lost messages on disconnect, the trade-off between at-most-once and at-least-once delivery. Crank one publisher to 50 msg/s with a 1 msg/s consumer and watch the queue go red.",
        concept: "Real-time messaging · Fan-out · Backpressure",
        teaches: { label: "Phase 5 · Systems Engineering", href: "/paths/5" },
      },
    ],
  },
};

const VALID_SLUGS = Object.keys(ROOMS);

/** Pre-render all room pages at build time. */
export function generateStaticParams(): Array<{ slug: string }> {
  return VALID_SLUGS.map((slug) => ({ slug }));
}

/** Generate metadata per room. */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const room = ROOMS[slug];
  if (!room) return {};

  return buildMetadata({
    title: `${room.name} — Discovery Zone`,
    description: room.tagline,
    path: `/discover/${slug}`,
  });
}

export default async function DiscoverRoomPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<React.ReactElement> {
  const { slug } = await params;
  const room = ROOMS[slug];

  if (!room) notFound();

  return (
    <main className="mx-auto max-w-[960px] px-6 py-10">
      {/* Back link */}
      <Link
        href="/discover"
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)] transition hover:text-[var(--color-text-primary)]"
      >
        <ArrowLeft size={16} />
        Back to Discovery Zone
      </Link>

      {/* Room header */}
      <header className="mb-10">
        <div className="flex items-start gap-4">
          <span className="text-4xl" role="img" aria-hidden="true">
            {room.emoji}
          </span>
          <div className="flex-1">
            <p
              className="mb-2 text-xs font-medium tracking-wide uppercase"
              style={{ color: room.color }}
            >
              {room.concept}
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text-primary)] sm:text-4xl">
              {room.name}
            </h1>
            <p className="mt-2 text-lg text-[var(--color-text-secondary)]">{room.tagline}</p>
          </div>
        </div>
        <p className="mt-5 max-w-[720px] text-[15px] leading-relaxed text-[var(--color-text-secondary)]">
          {room.intro}
        </p>
      </header>

      {/* Activity grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {room.activities.map((activity) => (
          <div
            key={activity.slug}
            className="group flex min-h-[200px] flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] transition-shadow duration-200 hover:shadow-lg hover:shadow-black/20"
          >
            {/* Colored top border */}
            <div className="h-1.5 w-full shrink-0" style={{ backgroundColor: room.color }} />

            <div className="flex flex-1 flex-col p-5">
              {/* Concept badge */}
              <span
                className="self-start rounded-full px-2.5 py-0.5 text-xs font-medium tracking-wide uppercase"
                style={{
                  backgroundColor: `${room.color}1f`,
                  color: room.color,
                }}
              >
                {activity.concept}
              </span>

              {/* Title + description */}
              <Link
                href={`/discover/${slug}/${activity.slug}`}
                className="mt-3 text-lg font-semibold text-[var(--color-text-primary)] transition hover:text-[var(--color-accent)]"
              >
                {activity.name}
              </Link>
              <p className="mt-1.5 flex-1 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                {activity.description}
              </p>

              {/* Teaches link */}
              <Link
                href={activity.teaches.href}
                className="mt-4 inline-flex items-center gap-1 self-start text-xs font-medium text-[var(--color-text-muted)] transition hover:text-[var(--color-accent)]"
              >
                Teaches: {activity.teaches.label}
                <ArrowUpRight size={12} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
