import type { Metadata } from "next";
import { ServerAssessment } from "@/components/verify/ServerAssessment";

export const metadata: Metadata = { title: "Server-scored assessment — DURA" };

/** Dedicated optional online assessment, isolated from offline learning and its question bundle. */
export default function AssessmentPage(): React.ReactElement {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <ServerAssessment />
    </main>
  );
}
