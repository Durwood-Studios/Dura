import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/og";
import { Passport } from "@/components/discover/Passport";

export const metadata: Metadata = buildMetadata({
  title: "DURA Discovery Center — Computing Playground",
  description:
    "Interactive computing activities for young learners. No account needed. No data collected.",
  path: "/discover",
});

interface Room {
  slug: string;
  name: string;
  tagline: string;
  emoji: string;
  color: string;
  activityCount: number;
}

const ROOMS: Room[] = [
  {
    slug: "secret-codes",
    name: "Secret Codes",
    tagline: "How computers talk",
    emoji: "\u{1F510}",
    color: "#f472b6",
    activityCount: 4,
  },
  {
    slug: "robot-chef",
    name: "Robot Chef",
    tagline: "Teaching a robot to cook",
    emoji: "\u{1F916}",
    color: "#fbbf24",
    activityCount: 3,
  },
  {
    slug: "internet-explorer",
    name: "Internet Explorer",
    tagline: "How messages travel the world",
    emoji: "\u{1F310}",
    color: "#60a5fa",
    activityCount: 3,
  },
  {
    slug: "pattern-factory",
    name: "Pattern Factory",
    tagline: "Making art with rules",
    emoji: "\u{1F52E}",
    color: "#a78bfa",
    activityCount: 4,
  },
  {
    slug: "bug-lab",
    name: "Bug Lab",
    tagline: "Finding what went wrong",
    emoji: "\u{1F52C}",
    color: "#34d399",
    activityCount: 3,
  },
  {
    slug: "first-steps",
    name: "First Steps",
    tagline: "For the youngest explorers",
    emoji: "\u{1F9F8}",
    color: "#fb923c",
    activityCount: 3,
  },
];

export default function DiscoverPage(): React.ReactElement {
  return (
    <main className="mx-auto max-w-[1080px] px-6 py-16">
      {/* Hero */}
      <header className="mb-14 text-center">
        <h1 className="text-5xl font-bold tracking-tight text-[var(--color-text-primary)] sm:text-6xl">
          DURA Discovery Center
        </h1>
        <p className="mt-4 text-xl text-[var(--color-text-secondary)]">
          A place to explore how computers think
        </p>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          No account needed. Nothing is tracked. Just explore.
        </p>
      </header>

      {/* Room grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {ROOMS.map((room) => (
          <Link
            key={room.slug}
            href={`/discover/${room.slug}`}
            className="group relative flex min-h-[240px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-[var(--color-border)] transition-shadow duration-200 hover:shadow-lg hover:shadow-black/20"
          >
            {/* Gradient background */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background: `linear-gradient(135deg, ${room.color}18 0%, ${room.color}08 100%)`,
              }}
            />

            <div className="relative z-10 flex flex-col items-center px-6 py-8">
              <span className="text-6xl" role="img" aria-hidden="true">
                {room.emoji}
              </span>
              <h2 className="mt-4 text-xl font-bold text-[var(--color-text-primary)]">
                {room.name}
              </h2>
              <p className="mt-1 text-[15px] text-[var(--color-text-muted)]">{room.tagline}</p>
              <span
                className="mt-3 rounded-full px-3 py-0.5 text-xs font-medium"
                style={{
                  backgroundColor: `${room.color}20`,
                  color: room.color,
                }}
              >
                {room.activityCount} activities
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Passport */}
      <Passport />

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
