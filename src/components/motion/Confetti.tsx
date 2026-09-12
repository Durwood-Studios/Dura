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
  const [expired, setExpired] = useState(false);
  const [previousActive, setPreviousActive] = useState(active);
  if (active !== previousActive) {
    setPreviousActive(active);
    setExpired(false);
  }

  useEffect(() => {
    if (!active) return;
    const timer = setTimeout(() => setExpired(true), 2000);
    return () => clearTimeout(timer);
  }, [active]);

  if (!active || expired) return null;

  return (
    <div
      aria-hidden
      className="confetti pointer-events-none fixed inset-0 z-[60] overflow-hidden motion-reduce:hidden"
    >
      {Array.from({ length: particles }, (_, i) => {
        const angle = ((i * 137.508) % 360).toFixed(0);
        const distance = (60 + ((i * 83) % 220)).toFixed(0);
        const delay = ((i % 5) * 0.02).toFixed(2);
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
