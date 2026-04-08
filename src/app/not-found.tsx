import Link from "next/link";

export default function NotFound(): React.ReactElement {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <p className="font-mono text-sm text-neutral-500">404</p>
      <h1 className="text-3xl font-semibold text-neutral-900">Page not found</h1>
      <p className="max-w-md text-neutral-600">
        The page you&apos;re looking for doesn&apos;t exist or has moved.
      </p>
      <Link
        href="/"
        className="rounded-lg bg-emerald-500 px-4 py-2 font-medium text-white transition hover:bg-emerald-600"
      >
        Back home
      </Link>
    </div>
  );
}
