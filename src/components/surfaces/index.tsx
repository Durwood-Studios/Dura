/**
 * DLS-1.0 §Adoption Failure Mode 3 — Surface wrappers.
 *
 * Each surface sets its own CSS context so inner components can read
 * the correct background + accent tokens without prop-drilling.
 * Wrappers are purely presentational: they add a className and a
 * data-surface attribute for devtools visibility.
 *
 * Usage:
 *   // In the Classroom route layout:
 *   <ClassroomSurface>{children}</ClassroomSurface>
 *
 *   // In the Discover route layout:
 *   <DiscoverSurface>{children}</DiscoverSurface>
 */

interface SurfaceProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Classroom surface — DLS-1.0 §Surface 1.
 * Applied to lesson reading routes (/paths/…).
 * Background tinted slightly warm (--color-classroom-surface-1).
 */
export function ClassroomSurface({ children, className }: SurfaceProps): React.ReactElement {
  return (
    <div
      data-surface="classroom"
      className={className}
      style={{ background: "var(--color-classroom-surface-1)" }}
    >
      {children}
    </div>
  );
}

/**
 * Discover surface — DLS-1.0 §Surface 3.
 * Applied to /discover routes.
 * Background tinted cool (--color-discover-surface-1).
 */
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
