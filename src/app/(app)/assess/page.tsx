import type { Metadata } from "next";
import { AssessmentQuiz } from "@/components/assess/AssessmentQuiz";

export const metadata: Metadata = {
  title: "Skill Assessment",
  description: "Take a 10-minute placement test to find your ideal starting point in DURA.",
};

export default function AssessPage(): React.ReactElement {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <AssessmentQuiz />
    </main>
  );
}
