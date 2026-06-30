import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/og";
import { Passport } from "@/components/discover/Passport";
import { DiscoverGrid } from "@/components/discover/DiscoverGrid";

export const metadata: Metadata = buildMetadata({
  title: "Discovery Zone — DURA",
  description:
    "Interactive computer-science concepts you can play with. Each activity teaches a real idea — and links to where it lives in the full curriculum.",
  path: "/discover",
});

interface Room {
  slug: string;
  name: string;
  tagline: string;
  emoji: string;
  color: string;
  activityCount: number;
  /** The concept area this room covers — surfaces as a badge on the card. */
  concept: string;
  /** Phase the room's concepts most align with, for the curriculum link. */
  phaseId: string;
}

/**
 * The Discovery Zone is the playful entry point into the DURA curriculum.
 * Activities are interactive demos of real CS concepts; each one explicitly
 * links to the lesson where the concept is taught formally.
 *
 * The hook is play. The destination is real learning.
 */
const ROOMS: Room[] = [
  {
    slug: "secret-codes",
    name: "Secret Codes",
    tagline: "Encoding, encryption, and how computers represent information.",
    emoji: "\u{1F510}",
    color: "#f472b6",
    activityCount: 5,
    concept: "Encoding & representation",
    phaseId: "0",
  },
  {
    slug: "robot-chef",
    name: "Robot Chef",
    tagline: "Sequencing, ordering, and the discipline of step-by-step instructions.",
    emoji: "\u{1F916}",
    color: "#fbbf24",
    activityCount: 4,
    concept: "Algorithms & sequencing",
    phaseId: "1",
  },
  {
    slug: "internet-explorer",
    name: "Internet Explorer",
    tagline: "DNS, packets, and the architecture behind every web request.",
    emoji: "\u{1F310}",
    color: "#60a5fa",
    activityCount: 3,
    concept: "Networking fundamentals",
    phaseId: "0",
  },
  {
    slug: "pattern-factory",
    name: "Pattern Factory",
    tagline: "Iteration, recursion, and rule-based composition.",
    emoji: "\u{1F52E}",
    color: "#a78bfa",
    activityCount: 5,
    concept: "Loops & recursion",
    phaseId: "1",
  },
  {
    slug: "bug-lab",
    name: "Bug Lab",
    tagline: "Debugging logic, tracing failures, and Boolean reasoning.",
    emoji: "\u{1F52C}",
    color: "#34d399",
    activityCount: 3,
    concept: "Debugging & logic",
    phaseId: "1",
  },
];

export default function DiscoverPage(): React.ReactElement {
  return (
    <main className="mx-auto max-w-[1080px] px-6 py-16">
      {/* Hero */}
      <header className="mb-14 max-w-[720px]">
        <p className="mb-3 text-sm font-medium tracking-wide text-[var(--color-text-muted)] uppercase">
          Discovery Zone
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-[var(--color-text-primary)] sm:text-5xl">
          Real computer science, taught through play.
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-[var(--color-text-secondary)]">
          Each activity is an interactive demo of a real concept — binary encoding, recursion, DNS,
          algorithm sequencing, Boolean logic. The hook is exploration. The destination is the full
          curriculum: every activity links to the lesson where the idea is taught formally.
        </p>
        <p className="mt-4 text-sm text-[var(--color-text-muted)]">
          No account needed. Nothing is tracked. Activities run entirely in your browser.
        </p>
      </header>

      {/* Room grid */}
      <DiscoverGrid rooms={ROOMS} />

      {/* Passport */}
      <Passport />

      {/* Footer note */}
      <section className="mt-16 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-7 py-6">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
          When you&rsquo;re ready for the full curriculum
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
          The Discovery Zone is the play surface. The full DURA curriculum runs across 15 phases and
          118 modules — from binary and the command line through agentic AI in production. Every
          concept you explore here is taught more deeply somewhere in those phases. Start where you
          want.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/paths/0"
            className="rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--color-accent-hover)]"
          >
            Start at Phase 0
          </Link>
          <Link
            href="/paths"
            className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-text-primary)] transition hover:bg-[var(--color-bg-subtle)]"
          >
            Browse learning paths
          </Link>
        </div>
      </section>
    </main>
  );
}
