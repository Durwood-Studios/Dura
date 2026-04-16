"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type ShapeKind = "circle" | "square" | "triangle";

const PRESET_COLORS = [
  { name: "emerald", value: "#10b981" },
  { name: "cyan", value: "#06b6d4" },
  { name: "amber", value: "#f59e0b" },
  { name: "purple", value: "#a855f7" },
  { name: "pink", value: "#ec4899" },
  { name: "blue", value: "#3b82f6" },
] as const;

const SHAPES: ShapeKind[] = ["circle", "square", "triangle"];

/** Draws a single shape centered at the origin. */
function drawShape(
  ctx: CanvasRenderingContext2D,
  shape: ShapeKind,
  size: number,
  color: string
): void {
  ctx.fillStyle = color;
  ctx.beginPath();

  switch (shape) {
    case "circle":
      ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
      break;
    case "square":
      ctx.rect(-size / 2, -size / 2, size, size);
      break;
    case "triangle": {
      const h = (size * Math.sqrt(3)) / 2;
      ctx.moveTo(0, -h / 2);
      ctx.lineTo(-size / 2, h / 2);
      ctx.lineTo(size / 2, h / 2);
      ctx.closePath();
      break;
    }
  }

  ctx.fill();
}

interface SliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}

/** A labeled range slider with current value display. */
function SliderControl({
  label,
  value,
  min,
  max,
  onChange,
}: SliderControlProps): React.ReactElement {
  return (
    <label className="flex flex-col gap-1">
      <span className="flex justify-between text-xs text-[var(--color-text-secondary)]">
        <span>{label}</span>
        <span className="font-semibold text-[var(--color-text-primary)]">{value}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[var(--color-bg-surface)] accent-[var(--color-accent-emerald)]"
      />
    </label>
  );
}

/**
 * Interactive pattern generator teaching loops through visual repetition.
 *
 * Users pick a shape, repeat count, rotation, size, and color. The canvas
 * draws a mandala-like pattern using a simple loop.
 */
export default function PatternMachine(): React.ReactElement {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [shape, setShape] = useState<ShapeKind>("circle");
  const [count, setCount] = useState(12);
  const [rotation, setRotation] = useState(30);
  const [size, setSize] = useState(40);
  const [color, setColor] = useState<string>(PRESET_COLORS[0].value);

  const draw = useCallback((): void => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const displayWidth = 400;
    const displayHeight = 400;

    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;
    ctx.scale(dpr, dpr);

    // Clear
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, displayWidth, displayHeight);

    const cx = displayWidth / 2;
    const cy = displayHeight / 2;
    const radius = Math.min(cx, cy) * 0.55;
    const stepAngle = (rotation * Math.PI) / 180;

    for (let i = 0; i < count; i++) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(stepAngle * i);
      ctx.translate(radius, 0);

      // Slight opacity variation for depth
      ctx.globalAlpha = 0.7 + 0.3 * (i / Math.max(count - 1, 1));

      drawShape(ctx, shape, size, color);
      ctx.restore();
    }

    ctx.globalAlpha = 1;
  }, [shape, count, rotation, size, color]);

  useEffect(() => {
    draw();
  }, [draw]);

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-8 py-8">
      <h2 className="text-center text-2xl font-semibold text-[var(--color-text-primary)]">
        Pattern Machine
      </h2>
      <p className="text-center text-sm text-[var(--color-text-secondary)]">
        Adjust the controls to create patterns with loops
      </p>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="rounded-2xl border border-[var(--color-border)] shadow-md"
        width={400}
        height={400}
        style={{ width: 400, height: 400 }}
        role="img"
        aria-label={`Pattern: ${count} ${shape}s rotated ${rotation} degrees each`}
      />

      {/* Controls */}
      <div className="flex w-full max-w-sm flex-col gap-5">
        {/* Shape selector */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs text-[var(--color-text-secondary)]">Shape</span>
          <div className="flex gap-2">
            {SHAPES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setShape(s)}
                aria-pressed={shape === s}
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-xl border text-lg transition-colors duration-150",
                  shape === s
                    ? "border-[var(--color-accent-emerald)] bg-[var(--color-accent-emerald)]/10 text-[var(--color-accent-emerald)]"
                    : "border-[var(--color-border)] bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface-hover)]"
                )}
              >
                {s === "circle" && (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                    <circle cx="10" cy="10" r="8" />
                  </svg>
                )}
                {s === "square" && (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                    <rect x="2" y="2" width="16" height="16" rx="1" />
                  </svg>
                )}
                {s === "triangle" && (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                    <polygon points="10,2 18,18 2,18" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Color picker */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs text-[var(--color-text-secondary)]">Color</span>
          <div className="flex gap-2">
            {PRESET_COLORS.map((c) => (
              <button
                key={c.name}
                type="button"
                onClick={() => setColor(c.value)}
                aria-label={c.name}
                aria-pressed={color === c.value}
                className={cn(
                  "h-10 w-10 rounded-full border-2 transition-transform duration-150",
                  color === c.value
                    ? "scale-110 border-white"
                    : "border-transparent hover:scale-105"
                )}
                style={{ backgroundColor: c.value }}
              />
            ))}
          </div>
        </div>

        <SliderControl label="Repeat" value={count} min={1} max={24} onChange={setCount} />
        <SliderControl
          label="Rotation (degrees)"
          value={rotation}
          min={0}
          max={360}
          onChange={setRotation}
        />
        <SliderControl label="Size (px)" value={size} min={10} max={80} onChange={setSize} />
      </div>

      {/* What you just learned */}
      <div className="mt-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 backdrop-blur-xl">
        <h3 className="mb-2 text-sm font-semibold text-[var(--color-accent-emerald)]">
          What you just learned
        </h3>
        <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
          You just used a loop — one of the most powerful ideas in programming. Instead of drawing{" "}
          {count} shapes by hand, you gave one instruction and told the computer to repeat it. Every
          time you see a pattern in nature or design, there&apos;s probably a loop behind it.
        </p>
      </div>
    </div>
  );
}
