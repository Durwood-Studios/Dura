import { buildMetadata } from "@/lib/og";
import { GOALS } from "@/content/goals";
import { ROLES } from "@/content/roles";
import { TracksClient } from "@/components/tracks/TracksClient";

export const metadata = buildMetadata({
  title: "Career Tracks",
  description:
    "Explore 12 engineering career paths — from frontend to AI/ML. Pick a goal, find your role, and start building.",
  path: "/tracks",
});

export default function TracksPage(): React.ReactElement {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="mb-1 text-3xl font-semibold">Career Tracks</h1>
      <p className="mb-10 text-[var(--color-text-secondary)]">
        Find the engineering role that fits your ambition.
      </p>
      <TracksClient goals={GOALS} roles={ROLES} />
    </div>
  );
}
