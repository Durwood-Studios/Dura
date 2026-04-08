"use client";

import dynamic from "next/dynamic";
import { SandboxExerciseSkeleton } from "@/components/lesson/SandboxExerciseSkeleton";

interface SandboxExerciseProps {
  language?: "javascript" | "typescript";
  instructions: string;
  initialCode: string;
  solution: string;
  testCases?: string[];
}

const SandboxExerciseInner = dynamic(() => import("@/components/lesson/SandboxExerciseInner"), {
  ssr: false,
  loading: () => <SandboxExerciseSkeleton />,
});

export function SandboxExercise({
  language = "javascript",
  instructions,
  initialCode,
  solution,
  testCases = [],
}: SandboxExerciseProps): React.ReactElement {
  return (
    <SandboxExerciseInner
      language={language}
      instructions={instructions}
      initialCode={initialCode}
      solution={solution}
      testCases={testCases}
    />
  );
}
