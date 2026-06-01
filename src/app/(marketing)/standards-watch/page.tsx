import type { Metadata } from "next";
import { StandardsWatch } from "@/components/standards-watch/StandardsWatch";

export const metadata: Metadata = {
  title: "Standards-watch · DURA",
  description:
    "Are we citing current revisions? Author-facing view of the standards-watch scan report — outdated references, upcoming revisions, the 28-family registry of canonical industry-standard versions.",
};

export default function StandardsWatchPage(): React.ReactElement {
  return <StandardsWatch />;
}
