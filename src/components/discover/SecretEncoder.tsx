"use client";

import { useCallback, useMemo, useState } from "react";
import { markActivityComplete } from "@/components/discover/Passport";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/** Applies a Caesar cipher shift to a single character. */
function shiftChar(ch: string, shift: number, decode: boolean): string {
  const upper = ch.toUpperCase();
  const idx = ALPHABET.indexOf(upper);
  if (idx === -1) return ch;
  const direction = decode ? -1 : 1;
  const shifted = (((idx + direction * shift) % 26) + 26) % 26;
  const result = ALPHABET[shifted];
  // Preserve original case
  return ch === upper ? result : result.toLowerCase();
}

/** Applies the Caesar cipher to an entire string. */
function caesarCipher(text: string, shift: number, decode: boolean): string {
  return text
    .split("")
    .map((ch) => shiftChar(ch, shift, decode))
    .join("");
}

/**
 * Caesar Cipher Encoder — encode and decode secret messages with a shift key.
 *
 * Features a visual alphabet wheel, real-time output, and a decode toggle.
 */
export function SecretEncoder(): React.ReactElement {
  const [message, setMessage] = useState("");
  const [shift, setShift] = useState(3);
  const [isDecode, setIsDecode] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const output = useMemo(() => caesarCipher(message, shift, isDecode), [message, shift, isDecode]);

  const handleMessageChange = useCallback(
    (value: string): void => {
      setMessage(value);
      if (!hasInteracted && value.length >= 3) {
        setHasInteracted(true);
        markActivityComplete("secret-encoder");
      }
    },
    [hasInteracted]
  );

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-8 py-8">
      <h2 className="text-center text-2xl font-semibold text-[var(--color-text-primary)]">
        Secret Encoder
      </h2>
      <p className="text-center text-sm text-[var(--color-text-secondary)]">
        Scramble messages with a secret key — only you and your friend can read them
      </p>

      {/* Encode / Decode toggle */}
      <div className="flex gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-1">
        <button
          type="button"
          onClick={() => setIsDecode(false)}
          className={`rounded-lg px-6 py-2.5 text-sm font-semibold transition-colors ${
            !isDecode
              ? "bg-[var(--color-accent-emerald)] text-black"
              : "text-[var(--color-text-secondary)]"
          }`}
        >
          Encode
        </button>
        <button
          type="button"
          onClick={() => setIsDecode(true)}
          className={`rounded-lg px-6 py-2.5 text-sm font-semibold transition-colors ${
            isDecode
              ? "bg-[var(--color-accent-emerald)] text-black"
              : "text-[var(--color-text-secondary)]"
          }`}
        >
          Decode
        </button>
      </div>

      {/* Message input */}
      <div className="w-full">
        <label className="mb-1.5 block text-sm text-[var(--color-text-muted)]">
          {isDecode ? "Encoded message" : "Your message"}
        </label>
        <input
          type="text"
          value={message}
          onChange={(e) => handleMessageChange(e.target.value)}
          placeholder={isDecode ? "Paste an encoded message..." : "Type your secret message..."}
          className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-5 py-4 text-lg text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] transition-colors outline-none focus:border-[var(--color-accent-emerald)]"
        />
      </div>

      {/* Shift slider */}
      <div className="w-full">
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm text-[var(--color-text-muted)]">Shift key</label>
          <span className="rounded-lg bg-[var(--color-bg-surface)] px-3 py-1 font-[family-name:var(--font-mono)] text-lg font-bold text-[var(--color-accent-emerald)]">
            {shift}
          </span>
        </div>
        <input
          type="range"
          min={1}
          max={25}
          value={shift}
          onChange={(e) => setShift(Number(e.target.value))}
          className="w-full accent-[var(--color-accent-emerald)]"
          aria-label={`Shift amount: ${shift}`}
        />
        <div className="mt-1 flex justify-between text-xs text-[var(--color-text-muted)]">
          <span>1</span>
          <span>25</span>
        </div>
      </div>

      {/* Output */}
      <div className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-5 py-4 backdrop-blur-xl">
        <label className="mb-1.5 block text-xs text-[var(--color-text-muted)]">
          {isDecode ? "Decoded message" : "Encoded message"}
        </label>
        <p className="min-h-[28px] font-[family-name:var(--font-mono)] text-xl tracking-wide break-all text-[var(--color-accent-emerald)]">
          {output || (
            <span className="text-[var(--color-text-muted)]">Your result will appear here</span>
          )}
        </p>
      </div>

      {/* Alphabet wheel */}
      <div className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5 backdrop-blur-xl">
        <h3 className="mb-3 text-sm font-semibold text-[var(--color-text-secondary)]">
          Alphabet mapping
        </h3>
        <div className="flex flex-wrap gap-x-1 gap-y-2">
          {ALPHABET.split("").map((letter) => {
            const shifted = ALPHABET[(ALPHABET.indexOf(letter) + shift) % 26];
            return (
              <div key={letter} className="flex w-9 flex-col items-center gap-0.5">
                <span className="text-xs font-semibold text-[var(--color-text-primary)]">
                  {letter}
                </span>
                <span className="text-[10px] text-[var(--color-text-muted)]">&#8595;</span>
                <span className="text-xs font-bold text-[var(--color-accent-emerald)]">
                  {shifted}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* What you just learned */}
      <div className="mt-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 backdrop-blur-xl">
        <h3 className="mb-2 text-sm font-semibold text-[var(--color-accent-emerald)]">
          What you just learned
        </h3>
        <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
          You just used encryption — scrambling a message so only someone with the key can read it.
          Every time you see a lock icon in your browser, encryption is protecting your data.
        </p>
      </div>
    </div>
  );
}
