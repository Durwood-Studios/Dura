import { Spinner } from "@/components/ui/Spinner";

export default function Loading(): React.ReactElement {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <Spinner size="lg" />
      <p className="text-sm text-[var(--color-text-muted)]">Loading</p>
    </div>
  );
}
