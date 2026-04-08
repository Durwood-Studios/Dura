"use client";

import { useEffect } from "react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): React.ReactElement {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8 text-center">
      <h2 className="text-xl font-semibold text-neutral-900">Something broke here</h2>
      <p className="max-w-md text-neutral-600">Your local progress is intact.</p>
      <button
        onClick={reset}
        className="rounded-lg bg-emerald-500 px-4 py-2 font-medium text-white transition hover:bg-emerald-600"
      >
        Try again
      </button>
    </div>
  );
}
