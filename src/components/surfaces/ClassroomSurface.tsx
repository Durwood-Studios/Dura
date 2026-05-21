interface SurfaceProps {
  children: React.ReactNode;
  className?: string;
}

/** Classroom surface — DLS-1.0 §Surface 1. Lesson reading routes (/paths/…). */
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
