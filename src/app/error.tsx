"use client";

import { useEffect } from "react";

export default function Error({
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
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-2xl font-semibold text-neutral-900">Something went wrong</h1>
      <p className="max-w-md text-neutral-600">
        An unexpected error occurred. Your progress is safe.
      </p>
      <button
        onClick={reset}
        className="rounded-lg bg-emerald-500 px-4 py-2 font-medium text-white transition hover:bg-emerald-600"
      >
        Try again
      </button>
    </div>
  );
}
