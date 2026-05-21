/**
 * DojoSurface wrapper — DLS-1.0 §Surface 2 / DLS-1.0 §Adoption Friction.
 * Sets the Dojo CSS context: dark tint, performance-mode register.
 */

interface SurfaceProps {
  children: React.ReactNode;
  className?: string;
}

export function DojoSurface({ children, className }: SurfaceProps): React.ReactElement {
  return (
    <div
      data-surface="dojo"
      className={className}
      style={{ background: "var(--color-dojo-surface-0)" }}
    >
      {children}
    </div>
  );
}
