import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { buildMetadata } from "@/lib/og";

interface ActivityEntry {
  title: string;
  description: string;
  Component: React.ComponentType;
}

const ACTIVITIES: Record<string, ActivityEntry> = {
  "binary-painter": {
    title: "Binary Painter",
    description: "Mix colors with switches. Discover how computers see the world in numbers.",
    Component: dynamic(() => import("@/components/discover/BinaryPainter"), {
      loading: () => <ActivitySkeleton />,
    }),
  },
  "algorithm-kitchen": {
    title: "Algorithm Kitchen",
    description: "Follow the recipe. Miss a step and the sandwich falls apart.",
    Component: dynamic(
      () => import("@/components/discover/AlgorithmKitchen").then((m) => m.AlgorithmKitchen),
      {
        loading: () => <ActivitySkeleton />,
      }
    ),
  },
  "network-post-office": {
    title: "Network Post Office",
    description: "Send a message across the internet. Watch it hop from place to place.",
    Component: dynamic(
      () => import("@/components/discover/NetworkPostOffice").then((m) => m.NetworkPostOffice),
      {
        loading: () => <ActivitySkeleton />,
      }
    ),
  },
  "pattern-machine": {
    title: "Pattern Machine",
    description: "Draw a shape. Tell the machine to repeat it. Make art from instructions.",
    Component: dynamic(() => import("@/components/discover/PatternMachine"), {
      loading: () => <ActivitySkeleton />,
    }),
  },
  "bug-detective": {
    title: "Bug Detective",
    description: "Something went wrong. Can you find the mistake?",
    Component: dynamic(
      () => import("@/components/discover/BugDetective").then((m) => m.BugDetective),
      {
        loading: () => <ActivitySkeleton />,
      }
    ),
  },
};

const VALID_SLUGS = Object.keys(ACTIVITIES);

/** Pre-render all activity pages at build time. */
export function generateStaticParams(): Array<{ slug: string }> {
  return VALID_SLUGS.map((slug) => ({ slug }));
}

/** Generate metadata per activity. */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const activity = ACTIVITIES[slug];
  if (!activity) return {};

  return buildMetadata({
    title: `${activity.title} — Discovery`,
    description: activity.description,
    path: `/discover/${slug}`,
  });
}

/** Loading skeleton shown while the activity component streams in. */
function ActivitySkeleton(): React.ReactElement {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--color-border)] border-t-emerald-400" />
    </div>
  );
}

export default async function DiscoverActivityPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<React.ReactElement> {
  const { slug } = await params;
  const activity = ACTIVITIES[slug];

  if (!activity) notFound();

  const { title, Component } = activity;

  return (
    <main className="mx-auto max-w-[960px] px-6 py-10">
      {/* Back link */}
      <Link
        href="/discover"
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)] transition hover:text-[var(--color-text-primary)]"
      >
        <ArrowLeft size={16} />
        Back to Discovery
      </Link>

      <h1 className="mb-8 text-3xl font-bold text-[var(--color-text-primary)] sm:text-4xl">
        {title}
      </h1>

      <Component />
    </main>
  );
}
