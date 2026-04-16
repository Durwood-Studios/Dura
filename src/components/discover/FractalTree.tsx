"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { markActivityComplete } from "@/components/discover/Passport";

const PRESET_COLORS = [
  { name: "Brown", value: "#8B4513" },
  { name: "Green", value: "#22c55e" },
  { name: "Pink", value: "#f472b6" },
  { name: "Blue", value: "#60a5fa" },
] as const;

/** Draws a recursive fractal tree on a canvas. */
export function FractalTree(): React.ReactElement {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [depth, setDepth] = useState(5);
  const [angle, setAngle] = useState(30);
  const [length, setLength] = useState(60);
  const [colorIndex, setColorIndex] = useState(0);
  const [hasCompleted, setHasCompleted] = useState(false);

  const drawTree = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      len: number,
      ang: number,
      currentDepth: number,
      branchColor: string
    ): void => {
      if (currentDepth === 0) return;

      const endX = x + len * Math.sin((ang * Math.PI) / 180);
      const endY = y - len * Math.cos((ang * Math.PI) / 180);

      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = branchColor;
      ctx.lineWidth = Math.max(1, currentDepth * 1.2);
      ctx.lineCap = "round";
      ctx.stroke();

      const shrink = 0.7;
      drawTree(ctx, endX, endY, len * shrink, ang - angle, currentDepth - 1, branchColor);
      drawTree(ctx, endX, endY, len * shrink, ang + angle, currentDepth - 1, branchColor);
    },
    [angle]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawTree(ctx, 200, 380, length, 0, depth, PRESET_COLORS[colorIndex].value);

    if (depth >= 4 && !hasCompleted) {
      setHasCompleted(true);
      markActivityComplete("fractal-tree");
    }
  }, [depth, angle, length, colorIndex, drawTree, hasCompleted]);

  return (
    <div className="flex flex-col items-center gap-6">
      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        className="rounded-2xl border border-white/10 bg-[#0c0c14]"
      />

      <div className="flex w-full max-w-[400px] flex-col gap-4">
        {/* Depth slider */}
        <label className="flex flex-col gap-1">
          <span className="text-lg font-medium text-white/90">Branch Depth: {depth}</span>
          <input
            type="range"
            min={1}
            max={10}
            value={depth}
            onChange={(e) => setDepth(Number(e.target.value))}
            className="h-3 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-purple-400"
          />
        </label>

        {/* Angle slider */}
        <label className="flex flex-col gap-1">
          <span className="text-lg font-medium text-white/90">Branch Angle: {angle}°</span>
          <input
            type="range"
            min={10}
            max={60}
            value={angle}
            onChange={(e) => setAngle(Number(e.target.value))}
            className="h-3 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-purple-400"
          />
        </label>

        {/* Length slider */}
        <label className="flex flex-col gap-1">
          <span className="text-lg font-medium text-white/90">Branch Length: {length}px</span>
          <input
            type="range"
            min={20}
            max={100}
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="h-3 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-purple-400"
          />
        </label>

        {/* Color presets */}
        <div className="flex flex-col gap-1">
          <span className="text-lg font-medium text-white/90">Color</span>
          <div className="flex gap-3">
            {PRESET_COLORS.map((c, i) => (
              <button
                key={c.name}
                onClick={() => setColorIndex(i)}
                aria-label={c.name}
                className="size-12 min-h-12 min-w-12 rounded-xl border-2 transition-transform hover:scale-110"
                style={{
                  backgroundColor: c.value,
                  borderColor: i === colorIndex ? "#fff" : "transparent",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Learning callout */}
      <div className="w-full max-w-[400px] rounded-2xl border border-purple-400/20 bg-purple-400/5 p-5">
        <p className="text-lg leading-relaxed text-purple-200">
          <strong className="text-purple-300">What you just learned:</strong> This tree draws itself
          by repeating one simple rule: &ldquo;draw a branch, then draw two smaller branches.&rdquo;
          This is called <em>recursion</em> &mdash; a function that calls itself. Trees, rivers, and
          snowflakes all follow recursive patterns.
        </p>
      </div>
    </div>
  );
}
