"use client";

import { useCallback, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

/** Maps a 3-bit value (0-7) to a full 0-255 range. */
function scale3(value: number): number {
  return Math.round((value / 7) * 255);
}

/** Maps a 2-bit value (0-3) to a full 0-255 range. */
function scale2(value: number): number {
  return Math.round((value / 3) * 255);
}

/** Pads a string to the given length with leading zeros. */
function pad(str: string, len: number): string {
  return str.padStart(len, "0");
}

interface BitSwitchProps {
  index: number;
  isOn: boolean;
  onToggle: (index: number) => void;
}

/** A single toggle switch representing one bit. */
function BitSwitch({ index, isOn, onToggle }: BitSwitchProps): React.ReactElement {
  const channelLabel = index >= 5 ? "R" : index >= 2 ? "G" : "B";
  const channelColor =
    index >= 5 ? "text-red-400" : index >= 2 ? "text-green-400" : "text-blue-400";

  return (
    <button
      type="button"
      onClick={() => onToggle(index)}
      aria-label={`Bit ${index}: ${isOn ? "on" : "off"}`}
      aria-pressed={isOn}
      className="flex flex-col items-center gap-1.5"
    >
      <span className="text-[11px] font-medium text-[var(--color-text-muted)]">bit {index}</span>
      <div
        className={cn(
          "relative h-14 w-8 rounded-full transition-colors duration-200",
          isOn ? "bg-[var(--color-accent-emerald)]" : "bg-[var(--color-bg-surface)]"
        )}
      >
        <div
          className={cn(
            "absolute left-1 h-6 w-6 rounded-full bg-white shadow-md transition-all duration-200",
            isOn ? "top-1" : "top-7"
          )}
        />
      </div>
      <span className={cn("text-xs font-bold", channelColor)}>{channelLabel}</span>
      <span className="text-sm font-[var(--font-mono)] font-semibold text-[var(--color-text-primary)]">
        {isOn ? "1" : "0"}
      </span>
    </button>
  );
}

/**
 * Interactive binary-to-color discovery activity.
 *
 * 8 toggle switches form a byte. Bits 7-5 control Red, 4-2 control Green,
 * 1-0 control Blue. A color swatch updates in real-time.
 */
export default function BinaryPainter(): React.ReactElement {
  const [bits, setBits] = useState<boolean[]>([
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
  ]);

  const toggleBit = useCallback((index: number): void => {
    setBits((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  }, []);

  const { r, g, b, decimal, binary, hex } = useMemo(() => {
    // Convert boolean array to number (bit 7 is index 0)
    let value = 0;
    for (let i = 0; i < 8; i++) {
      if (bits[i]) {
        value |= 1 << (7 - i);
      }
    }

    const redBits = (value >> 5) & 0b111;
    const greenBits = (value >> 2) & 0b111;
    const blueBits = value & 0b11;

    return {
      r: scale3(redBits),
      g: scale3(greenBits),
      b: scale2(blueBits),
      decimal: value,
      binary: pad(value.toString(2), 8),
      hex: pad(value.toString(16).toUpperCase(), 2),
    };
  }, [bits]);

  const colorStyle = `rgb(${r}, ${g}, ${b})`;

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-8 py-8">
      <h2 className="text-center text-2xl font-semibold text-[var(--color-text-primary)]">
        Binary Painter
      </h2>
      <p className="text-center text-sm text-[var(--color-text-secondary)]">
        Flip the switches to mix a color using binary
      </p>

      {/* Bit switches */}
      <div className="flex items-start gap-3 sm:gap-4">
        {bits.map((isOn, i) => (
          <BitSwitch
            key={i}
            index={7 - i}
            isOn={isOn}
            onToggle={(bitIndex) => toggleBit(7 - bitIndex)}
          />
        ))}
      </div>

      {/* Color swatch */}
      <div
        className="h-[200px] w-[200px] rounded-2xl shadow-lg shadow-black/20 transition-colors duration-150"
        style={{ backgroundColor: colorStyle }}
        role="img"
        aria-label={`Color swatch: RGB(${r}, ${g}, ${b})`}
      />

      {/* Numeric readouts */}
      <div className="flex flex-col items-center gap-2">
        <p className="font-[family-name:var(--font-mono)] text-2xl tracking-widest text-[var(--color-text-primary)]">
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
        <div className="flex gap-4 text-xs text-[var(--color-text-muted)]">
          <span>
            R: <span className="text-red-400">{r}</span>
          </span>
          <span>
            G: <span className="text-green-400">{g}</span>
          </span>
          <span>
            B: <span className="text-blue-400">{b}</span>
          </span>
        </div>
      </div>

      {/* What you just learned */}
      <div className="mt-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 backdrop-blur-xl">
        <h3 className="mb-2 text-sm font-semibold text-[var(--color-accent-emerald)]">
          What you just learned
        </h3>
        <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
          Computers store colors as numbers. Each pixel on your screen is a combination of Red,
          Green, and Blue values. You just controlled those values with binary switches — the same
          language computers speak.
        </p>
      </div>
    </div>
  );
}
