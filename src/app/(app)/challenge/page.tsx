import type { Metadata } from "next";
import { ChallengeMode } from "@/components/study/ChallengeMode";

export const metadata: Metadata = { title: "Challenge — DURA" };

export default function ChallengePage(): React.ReactElement {
  return (
    <main className="mx-auto max-w-2xl px-6 py-8">
      <ChallengeMode />
    </main>
  );
}
