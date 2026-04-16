import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { buildMetadata } from "@/lib/og";

interface ActivityEntry {
  title: string;
  description: string;
  roomSlug: string;
  roomName: string;
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
 * Registry mapping activity slugs to their component, metadata, and parent room.
 * Existing components are dynamically imported; new activities use a placeholder.
 */
const ACTIVITIES: Record<string, ActivityEntry> = {
  // Secret Codes room
  "binary-painter": {
    title: "Binary Painter",
    description: "Mix colors with switches. Discover how computers see the world in numbers.",
    roomSlug: "secret-codes",
    roomName: "Secret Codes",
    Component: dynamic(() => import("@/components/discover/BinaryPainter"), {
      loading: () => <ActivitySkeleton />,
    }),
  },
  "morse-code": {
    title: "Morse Code",
    description: "Tap out messages using dots and dashes — the original digital code.",
    roomSlug: "secret-codes",
    roomName: "Secret Codes",
    Component: dynamic(() => import("@/components/discover/MorseCode").then((m) => m.MorseCode), {
      loading: () => <ActivitySkeleton />,
    }),
  },
  "pixel-art": {
    title: "Pixel Art",
    description: "Place squares on a grid to make pictures, just like a screen does.",
    roomSlug: "secret-codes",
    roomName: "Secret Codes",
    Component: dynamic(() => import("@/components/discover/PixelArt").then((m) => m.PixelArt), {
      loading: () => <ActivitySkeleton />,
    }),
  },
  "secret-encoder": {
    title: "Secret Encoder",
    description: "Scramble a message so only your friend can read it.",
    roomSlug: "secret-codes",
    roomName: "Secret Codes",
    Component: dynamic(
      () => import("@/components/discover/SecretEncoder").then((m) => m.SecretEncoder),
      { loading: () => <ActivitySkeleton /> }
    ),
  },

  // Robot Chef room
  "algorithm-kitchen": {
    title: "Algorithm Kitchen",
    description: "Follow the recipe. Miss a step and the sandwich falls apart.",
    roomSlug: "robot-chef",
    roomName: "Robot Chef",
    Component: dynamic(
      () => import("@/components/discover/AlgorithmKitchen").then((m) => m.AlgorithmKitchen),
      { loading: () => <ActivitySkeleton /> }
    ),
  },
  "robot-dance": {
    title: "Robot Dance",
    description: "Write dance moves in order. The robot follows your instructions exactly.",
    roomSlug: "robot-chef",
    roomName: "Robot Chef",
    Component: dynamic(() => import("@/components/discover/RobotDance").then((m) => m.RobotDance), {
      loading: () => <ActivitySkeleton />,
    }),
  },
  "treasure-map": {
    title: "Treasure Map",
    description: "Give step-by-step directions to guide the explorer to the treasure.",
    roomSlug: "robot-chef",
    roomName: "Robot Chef",
    Component: dynamic(
      () => import("@/components/discover/TreasureMap").then((m) => m.TreasureMap),
      { loading: () => <ActivitySkeleton /> }
    ),
  },

  // Internet Explorer room
  "network-post-office": {
    title: "Network Post Office",
    description: "Send a message across the internet. Watch it hop from place to place.",
    roomSlug: "internet-explorer",
    roomName: "Internet Explorer",
    Component: dynamic(
      () => import("@/components/discover/NetworkPostOffice").then((m) => m.NetworkPostOffice),
      { loading: () => <ActivitySkeleton /> }
    ),
  },
  "dns-phonebook": {
    title: "DNS Phonebook",
    description: "Look up website addresses like a giant phone book for the internet.",
    roomSlug: "internet-explorer",
    roomName: "Internet Explorer",
    Component: dynamic(
      () => import("@/components/discover/DnsPhonebook").then((m) => m.DnsPhonebook),
      { loading: () => <ActivitySkeleton /> }
    ),
  },
  "website-builder": {
    title: "Website Builder",
    description: "Stack blocks to build a simple web page and see the code underneath.",
    roomSlug: "internet-explorer",
    roomName: "Internet Explorer",
    Component: dynamic(
      () => import("@/components/discover/WebsiteBuilder").then((m) => m.WebsiteBuilder),
      { loading: () => <ActivitySkeleton /> }
    ),
  },

  // Pattern Factory room
  "pattern-machine": {
    title: "Pattern Machine",
    description: "Draw a shape. Tell the machine to repeat it. Make art from instructions.",
    roomSlug: "pattern-factory",
    roomName: "Pattern Factory",
    Component: dynamic(() => import("@/components/discover/PatternMachine"), {
      loading: () => <ActivitySkeleton />,
    }),
  },
  "fractal-tree": {
    title: "Fractal Tree",
    description: "Watch a tree grow by repeating the same branching rule over and over.",
    roomSlug: "pattern-factory",
    roomName: "Pattern Factory",
    Component: dynamic(
      () => import("@/components/discover/FractalTree").then((m) => m.FractalTree),
      { loading: () => <ActivitySkeleton /> }
    ),
  },
  "music-beats": {
    title: "Music Beats",
    description: "Arrange repeating patterns of sound to compose a simple beat.",
    roomSlug: "pattern-factory",
    roomName: "Pattern Factory",
    Component: dynamic(() => import("@/components/discover/MusicBeats").then((m) => m.MusicBeats), {
      loading: () => <ActivitySkeleton />,
    }),
  },
  "tile-designer": {
    title: "Tile Designer",
    description: "Design one tile, then see it repeat to fill an entire floor.",
    roomSlug: "pattern-factory",
    roomName: "Pattern Factory",
    Component: dynamic(
      () => import("@/components/discover/TileDesigner").then((m) => m.TileDesigner),
      { loading: () => <ActivitySkeleton /> }
    ),
  },

  // Bug Lab room
  "bug-detective": {
    title: "Bug Detective",
    description: "Something went wrong. Can you find the mistake?",
    roomSlug: "bug-lab",
    roomName: "Bug Lab",
    Component: dynamic(
      () => import("@/components/discover/BugDetective").then((m) => m.BugDetective),
      { loading: () => <ActivitySkeleton /> }
    ),
  },
  "logic-gates": {
    title: "Logic Gates",
    description: "Wire up true-or-false switches and see what comes out the other end.",
    roomSlug: "bug-lab",
    roomName: "Bug Lab",
    Component: dynamic(() => import("@/components/discover/LogicGates").then((m) => m.LogicGates), {
      loading: () => <ActivitySkeleton />,
    }),
  },
  "story-builder": {
    title: "Story Builder",
    description: "Put the story in the right order. One wrong step changes the ending.",
    roomSlug: "bug-lab",
    roomName: "Bug Lab",
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
    title: `${entry.title} — ${entry.roomName} — Discovery Center`,
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

  const { title, roomName, Component } = entry;

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

      <h1 className="mb-8 text-3xl font-bold text-[var(--color-text-primary)] sm:text-4xl">
        {title}
      </h1>

      <Component />
    </main>
  );
}
