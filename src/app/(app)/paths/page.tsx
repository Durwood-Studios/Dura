import type { Metadata } from "next";
import { PathsDirectory } from "@/components/paths/PathsDirectory";

export const metadata: Metadata = {
  title: "Paths · DURA",
  description:
    "What kind of engineer do you want to be? Curated learning paths that sequence DURA's phases into named outcomes — Full-Stack, Backend, ML, Robotics, Embedded, and more.",
};

/**
 * /paths — the curriculum discovery surface.
 *
 * Replaces the legacy "pick a phase" listing with an outcome-driven
 * Paths directory. Phases are still independently navigable via
 * /paths/[phaseId] (legacy phase pages for bookmarks) — each Path
 * just curates a recommended sequence through them.
 */
export default function PathsPage(): React.ReactElement {
  return <PathsDirectory />;
}
