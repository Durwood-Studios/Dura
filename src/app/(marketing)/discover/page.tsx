import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/og";

export const metadata: Metadata = buildMetadata({
  title: "DURA Discovery — Computing Playground",
  description:
    "Interactive computing activities for young learners. No account needed. No data collected.",
  path: "/discover",
});

interface ActivityCard {
  slug: string;
  title: string;
  description: string;
  color: string;
  emoji: string;
}

const ACTIVITIES: ActivityCard[] = [
  {
    slug: "binary-painter",
    title: "Binary Painter",
    description: "Mix colors with switches. Discover how computers see the world in numbers.",
    color: "#f472b6",
    emoji: "🎨",
  },
  {
    slug: "algorithm-kitchen",
    title: "Algorithm Kitchen",
    description: "Follow the recipe. Miss a step and the sandwich falls apart.",
    color: "#fbbf24",
    emoji: "🥪",
  },
  {
    slug: "network-post-office",
    title: "Network Post Office",
    description: "Send a message across the internet. Watch it hop from place to place.",
    color: "#60a5fa",
    emoji: "✉️",
  },
  {
    slug: "pattern-machine",
    title: "Pattern Machine",
    description: "Draw a shape. Tell the machine to repeat it. Make art from instructions.",
    color: "#a78bfa",
    emoji: "🔮",
  },
  {
    slug: "bug-detective",
    title: "Bug Detective",
    description: "Something went wrong. Can you find the mistake?",
    color: "#34d399",
    emoji: "🔍",
  },
];

export default function DiscoverPage(): React.ReactElement {
  return (
    <main className="mx-auto max-w-[960px] px-6 py-16">
      {/* Hero */}
      <header className="mb-14 text-center">
        <h1 className="text-5xl font-bold tracking-tight text-[var(--color-text-primary)] sm:text-6xl">
          Discovery
        </h1>
        <p className="mt-4 text-xl text-[var(--color-text-secondary)]">
          A playground for curious minds
        </p>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          No account needed. Nothing is tracked. Just explore.
        </p>
      </header>

      {/* Activity grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {ACTIVITIES.map((activity) => (
          <Link
            key={activity.slug}
            href={`/discover/${activity.slug}`}
            className="group relative flex min-h-[200px] flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] transition-all duration-200 hover:scale-[1.02] hover:border-white/16 hover:bg-[var(--color-bg-surface-hover)]"
          >
            {/* Colored top border */}
            <div className="h-2 w-full shrink-0" style={{ backgroundColor: activity.color }} />

            <div className="flex flex-1 flex-col p-6">
              <span className="text-5xl" role="img" aria-hidden="true">
                {activity.emoji}
              </span>
              <h2 className="mt-4 text-xl font-semibold text-[var(--color-text-primary)]">
                {activity.title}
              </h2>
              <p className="mt-2 text-[15px] leading-relaxed text-[var(--color-text-secondary)]">
                {activity.description}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Footer note */}
      <p className="mt-14 text-center text-sm text-[var(--color-text-muted)]">
        When you&rsquo;re ready for more,{" "}
        <Link
          href="/paths/0"
          className="text-emerald-400 underline underline-offset-2 hover:text-emerald-300"
        >
          Phase 0 is waiting
        </Link>
        .
      </p>
    </main>
  );
}
