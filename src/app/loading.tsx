"use client";

import { useState } from "react";
import { Spinner } from "@/components/ui/Spinner";

const LOADING_MESSAGES = [
  "Compiling your future...",
  "Loading knowledge...",
  "Preparing your next lesson...",
  "Warming up the sandbox...",
  "Fetching your progress...",
  "Almost there...",
];

export default function Loading(): React.ReactElement {
  // Pick once per mount so the message stays stable during the load.
  const [message] = useState(
    () => LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)]
  );

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <p className="text-sm font-medium text-[var(--color-text-secondary)]">{message}</p>
      <Spinner size="lg" />
    </div>
  );
}
