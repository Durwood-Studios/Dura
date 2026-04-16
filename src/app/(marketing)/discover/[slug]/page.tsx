import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { buildMetadata } from "@/lib/og";

interface Activity {
  slug: string;
  name: string;
  description: string;
}

interface Room {
  name: string;
  tagline: string;
  emoji: string;
  color: string;
  activities: Activity[];
}

const ROOMS: Record<string, Room> = {
  "secret-codes": {
    name: "Secret Codes",
    tagline: "How computers talk",
    emoji: "\u{1F510}",
    color: "#f472b6",
    activities: [
      {
        slug: "binary-painter",
        name: "Binary Painter",
        description: "Mix colors with switches. Discover how computers see the world in numbers.",
      },
      {
        slug: "morse-code",
        name: "Morse Code",
        description: "Tap out messages using dots and dashes — the original digital code.",
      },
      {
        slug: "pixel-art",
        name: "Pixel Art",
        description: "Place squares on a grid to make pictures, just like a screen does.",
      },
      {
        slug: "secret-encoder",
        name: "Secret Encoder",
        description: "Scramble a message so only your friend can read it.",
      },
    ],
  },
  "robot-chef": {
    name: "Robot Chef",
    tagline: "Teaching a robot to cook",
    emoji: "\u{1F916}",
    color: "#fbbf24",
    activities: [
      {
        slug: "algorithm-kitchen",
        name: "Algorithm Kitchen",
        description: "Follow the recipe. Miss a step and the sandwich falls apart.",
      },
      {
        slug: "robot-dance",
        name: "Robot Dance",
        description: "Write dance moves in order. The robot follows your instructions exactly.",
      },
      {
        slug: "treasure-map",
        name: "Treasure Map",
        description: "Give step-by-step directions to guide the explorer to the treasure.",
      },
    ],
  },
  "internet-explorer": {
    name: "Internet Explorer",
    tagline: "How messages travel the world",
    emoji: "\u{1F310}",
    color: "#60a5fa",
    activities: [
      {
        slug: "network-post-office",
        name: "Network Post Office",
        description: "Send a message across the internet. Watch it hop from place to place.",
      },
      {
        slug: "dns-phonebook",
        name: "DNS Phonebook",
        description: "Look up website addresses like a giant phone book for the internet.",
      },
      {
        slug: "website-builder",
        name: "Website Builder",
        description: "Stack blocks to build a simple web page and see the code underneath.",
      },
    ],
  },
  "pattern-factory": {
    name: "Pattern Factory",
    tagline: "Making art with rules",
    emoji: "\u{1F52E}",
    color: "#a78bfa",
    activities: [
      {
        slug: "pattern-machine",
        name: "Pattern Machine",
        description: "Draw a shape. Tell the machine to repeat it. Make art from instructions.",
      },
      {
        slug: "fractal-tree",
        name: "Fractal Tree",
        description: "Watch a tree grow by repeating the same branching rule over and over.",
      },
      {
        slug: "music-beats",
        name: "Music Beats",
        description: "Arrange repeating patterns of sound to compose a simple beat.",
      },
      {
        slug: "tile-designer",
        name: "Tile Designer",
        description: "Design one tile, then see it repeat to fill an entire floor.",
      },
    ],
  },
  "bug-lab": {
    name: "Bug Lab",
    tagline: "Finding what went wrong",
    emoji: "\u{1F52C}",
    color: "#34d399",
    activities: [
      {
        slug: "bug-detective",
        name: "Bug Detective",
        description: "Something went wrong. Can you find the mistake?",
      },
      {
        slug: "logic-gates",
        name: "Logic Gates",
        description: "Wire up true-or-false switches and see what comes out the other end.",
      },
      {
        slug: "story-builder",
        name: "Story Builder",
        description: "Put the story in the right order. One wrong step changes the ending.",
      },
    ],
  },
  "first-steps": {
    name: "First Steps",
    tagline: "For the youngest explorers",
    emoji: "\u{1F9F8}",
    color: "#fb923c",
    activities: [
      {
        slug: "shape-sorter",
        name: "Shape Sorter",
        description: "Sort the shapes by color.",
      },
      {
        slug: "counting-blocks",
        name: "Counting Blocks",
        description: "Click the right number of blocks.",
      },
      {
        slug: "color-mixer",
        name: "Color Mixer",
        description: "Mix colors with sliders.",
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
    title: `${room.name} — Discovery Center`,
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
        Back to Discovery Center
      </Link>

      {/* Room header */}
      <header className="mb-10">
        <div className="flex items-center gap-4">
          <span className="text-5xl" role="img" aria-hidden="true">
            {room.emoji}
          </span>
          <div>
            <h1 className="text-3xl font-bold text-[var(--color-text-primary)] sm:text-4xl">
              {room.name}
            </h1>
            <p className="mt-1 text-lg text-[var(--color-text-muted)]">{room.tagline}</p>
          </div>
        </div>
      </header>

      {/* Activity grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {room.activities.map((activity) => (
          <Link
            key={activity.slug}
            href={`/discover/${slug}/${activity.slug}`}
            className="group flex min-h-[140px] flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] transition-shadow duration-200 hover:shadow-lg hover:shadow-black/20"
          >
            {/* Colored top border */}
            <div className="h-1.5 w-full shrink-0" style={{ backgroundColor: room.color }} />

            <div className="flex flex-1 flex-col p-5">
              <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
                {activity.name}
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                {activity.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
