/**
 * Discover group layout — wraps all /discover/* routes with the
 * DiscoverSurface context (DLS-1.0 §Surface 3).
 */
import { DiscoverSurface } from "@/components/surfaces";

export default function DiscoverLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return <DiscoverSurface className="min-h-screen">{children}</DiscoverSurface>;
}
