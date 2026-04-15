import type { Metadata } from "next";
import dynamic from "next/dynamic";

const ChallengeMode = dynamic(() =>
  import("@/components/study/ChallengeMode").then((m) => m.ChallengeMode)
);

export const metadata: Metadata = { title: "Challenge — DURA" };

export default function ChallengePage(): React.ReactElement {
  return (
    <main className="mx-auto max-w-2xl px-6 py-8">
      <ChallengeMode />
    </main>
  );
}
