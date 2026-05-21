interface SurfaceProps {
  children: React.ReactNode;
  className?: string;
}

/** Discover surface — DLS-1.0 §Surface 3. /discover routes. */
export function DiscoverSurface({ children, className }: SurfaceProps): React.ReactElement {
  return (
    <div
      data-surface="discover"
      className={className}
      style={{ background: "var(--color-discover-surface-1)" }}
    >
      {children}
    </div>
  );
}
