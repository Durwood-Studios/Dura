"use client";

import { useEffect, useState } from "react";

interface ConfettiProps {
  /** When true, fires a single burst. The component unmounts itself ~2s later. */
  active: boolean;
  particles?: number;
}

const COLORS = ["#10b981", "#06b6d4", "#f59e0b", "#8b5cf6", "#f472b6", "#a3e635"];

/**
 * Pure-CSS confetti. 20 particles by default, ~2 seconds, reduced-motion safe.
 * Zero animation JS — only random initial transforms.
 */
export function Confetti({ active, particles = 20 }: ConfettiProps): React.ReactElement | null {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!active) return;
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), 2000);
    return () => clearTimeout(timer);
  }, [active]);

  if (!visible) return null;

  return (
    <div
      aria-hidden
      className="confetti pointer-events-none fixed inset-0 z-[60] overflow-hidden motion-reduce:hidden"
    >
      {Array.from({ length: particles }, (_, i) => {
        const angle = (Math.random() * 360).toFixed(0);
        const distance = (60 + Math.random() * 220).toFixed(0);
        const delay = (Math.random() * 0.1).toFixed(2);
        const color = COLORS[i % COLORS.length];
        return (
          <span
            key={i}
            className="confetti-piece"
            style={
              {
                left: "50%",
                top: "40%",
                background: color,
                animationDelay: `${delay}s`,
                "--angle": `${angle}deg`,
                "--distance": `${distance}px`,
              } as React.CSSProperties
            }
          />
        );
      })}
    </div>
  );
}
