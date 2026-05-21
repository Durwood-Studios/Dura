import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/og";
import { Passport } from "@/components/discover/Passport";
import { DiscoverGrid } from "@/components/discover/DiscoverGrid";

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
      <DiscoverGrid rooms={ROOMS} />

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
