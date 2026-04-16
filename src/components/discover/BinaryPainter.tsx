"use client";

import { useCallback, useMemo, useState, useRef } from "react";
import { markActivityComplete } from "@/components/discover/Passport";
import { cn } from "@/lib/utils";

function scale3(value: number): number {
  return Math.round((value / 7) * 255);
}

function scale2(value: number): number {
  return Math.round((value / 3) * 255);
}

function pad(str: string, len: number): string {
  return str.padStart(len, "0");
}

interface BitSwitchProps {
  bitIndex: number;
  isOn: boolean;
  onToggle: () => void;
}

function BitSwitch({ bitIndex, isOn, onToggle }: BitSwitchProps): React.ReactElement {
  const channel = bitIndex >= 5 ? "R" : bitIndex >= 2 ? "G" : "B";
  const channelColor =
    bitIndex >= 5 ? "text-red-400" : bitIndex >= 2 ? "text-green-400" : "text-blue-400";

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={`Bit ${bitIndex}: ${isOn ? "on" : "off"}`}
      aria-pressed={isOn}
      className="flex flex-col items-center gap-1"
    >
      <span className={cn("text-[10px] font-medium", channelColor)}>{channel}</span>
      <div
        className={cn(
          "flex h-12 w-7 items-end rounded-full p-0.5 transition-colors duration-150",
          isOn ? "bg-emerald-500" : "bg-[var(--color-bg-subtle)]"
        )}
        style={isOn ? {} : { border: "1px solid var(--color-border)" }}
      >
        <div
          className={cn(
            "h-6 w-6 rounded-full bg-white shadow transition-transform duration-150",
            isOn ? "-translate-y-5" : "translate-y-0"
          )}
        />
      </div>
      <span className="font-mono text-lg font-bold text-[var(--color-text-primary)]">
        {isOn ? "1" : "0"}
      </span>
    </button>
  );
}

export default function BinaryPainter(): React.ReactElement {
  // bits[0] = bit 7 (MSB), bits[7] = bit 0 (LSB)
  const [bits, setBits] = useState<boolean[]>(Array(8).fill(false) as boolean[]);
  const toggleCount = useRef(0);

  const toggle = useCallback((displayIndex: number): void => {
    setBits((prev) => {
      const next = [...prev];
      next[displayIndex] = !next[displayIndex];
      return next;
    });
    toggleCount.current++;
    if (toggleCount.current >= 4) {
      markActivityComplete("binary-painter");
    }
  }, []);

  const { r, g, b, decimal, binary, hex } = useMemo(() => {
    let value = 0;
    for (let i = 0; i < 8; i++) {
      if (bits[i]) value |= 1 << (7 - i);
    }
    return {
      r: scale3((value >> 5) & 0b111),
      g: scale3((value >> 2) & 0b111),
      b: scale2(value & 0b11),
      decimal: value,
      binary: pad(value.toString(2), 8),
      hex: pad(value.toString(16).toUpperCase(), 2),
    };
  }, [bits]);

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-6 py-6">
      <p className="text-center text-sm text-[var(--color-text-secondary)]">
        Flip the switches to mix a color using binary
      </p>

      {/* Bit switches — scrollable on small phones */}
      <div className="flex w-full items-start justify-center gap-2 overflow-x-auto px-2 sm:gap-3">
        {bits.map((isOn, i) => (
          <BitSwitch key={i} bitIndex={7 - i} isOn={isOn} onToggle={() => toggle(i)} />
        ))}
      </div>

      {/* Color swatch */}
      <div
        className="h-40 w-40 rounded-2xl shadow-lg transition-colors duration-150 sm:h-48 sm:w-48"
        style={{ backgroundColor: `rgb(${r}, ${g}, ${b})` }}
        role="img"
        aria-label={`Color: RGB(${r}, ${g}, ${b})`}
      />

      {/* Readouts */}
      <div className="flex flex-col items-center gap-2">
        <p className="font-mono text-2xl tracking-widest text-[var(--color-text-primary)]">
          {binary}
        </p>
        <div className="flex gap-6 text-sm text-[var(--color-text-secondary)]">
          <span>
            Decimal: <strong className="text-[var(--color-text-primary)]">{decimal}</strong>
          </span>
          <span>
            Hex: <strong className="text-[var(--color-text-primary)]">#{hex}</strong>
          </span>
        </div>
        <div className="flex gap-4 text-xs">
          <span className="text-red-400">R: {r}</span>
          <span className="text-green-400">G: {g}</span>
          <span className="text-blue-400">B: {b}</span>
        </div>
      </div>

      {/* What you just learned */}
      <div className="mt-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5">
        <h3 className="mb-2 text-sm font-semibold text-emerald-600">What you just learned</h3>
        <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
          Computers store colors as numbers. Each pixel on your screen is a combination of Red,
          Green, and Blue values. You just controlled those values with binary switches — the same
          language computers speak.
        </p>
      </div>
    </div>
  );
}
