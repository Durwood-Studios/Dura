"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Sparkles, X, RefreshCw } from "lucide-react";
import { useServiceWorkerUpdate } from "@/hooks/useServiceWorkerUpdate";

// ── Confetti particle data ────────────────────────────────────────────────
// Deterministic so there's no Math.random() at render — just index math.
const COLORS = [
  "#10b981",
  "#06b6d4",
  "#8b5cf6",
  "#f59e0b",
  "#ec4899",
  "#3b82f6",
  "#f97316",
  "#a3e635",
  "#34d399",
  "#38bdf8",
  "#a78bfa",
  "#fcd34d",
];

const PIECES = Array.from({ length: 96 }, (_, i) => ({
  id: i,
  color: COLORS[i % COLORS.length],
  angle: (360 / 96) * i + (i % 5) * 3, // spread evenly with slight jitter
  distance: 130 + ((i * 7) % 160), // 130–290px
  size: 7 + (i % 5) * 2, // 7–15px
  delay: (i % 12) * 0.012, // 0–0.13s stagger
  duration: 1.0 + (i % 5) * 0.14, // 1.0–1.56s
  rotation: (i % 2 === 0 ? 1 : -1) * (180 + ((i * 47) % 360)), // ±180-540°
  isCircle: i % 4 === 0,
  isThin: i % 3 === 0,
}));

// ── Types ─────────────────────────────────────────────────────────────────
type Phase = "pill" | "bento" | "exploding";

// ── Confetti layer ────────────────────────────────────────────────────────
function ConfettiLayer(): React.ReactElement {
  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
      {/* Centred origin so all pieces burst from viewport centre */}
      <div className="absolute top-1/2 left-1/2">
        {PIECES.map((p) => (
          <div
            key={p.id}
            className="absolute"
            style={
              {
                width: p.isThin ? p.size / 2.5 : p.size,
                height: p.isThin ? p.size * 2.5 : p.size,
                background: p.color,
                borderRadius: p.isCircle ? "50%" : 2,
                left: 0,
                top: 0,
                transformOrigin: "center center",
                // All physics expressed as CSS custom properties + the keyframe
                "--angle": `${p.angle}deg`,
                "--distance": `${p.distance}px`,
                "--rot": `${p.rotation}deg`,
                animation: `update-confetti-fly ${p.duration}s cubic-bezier(0.22, 1, 0.36, 1) ${p.delay}s both`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
    </div>
  );
}

// ── Bento card ────────────────────────────────────────────────────────────
interface BentoProps {
  onRestart: () => void;
  onDismiss: () => void;
  prefersReduced: boolean;
}

function BentoCard({ onRestart, onDismiss, prefersReduced }: BentoProps): React.ReactElement {
  return (
    <>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 z-[9997] bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={onDismiss}
      />

      {/* Card */}
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Update available"
        className="fixed top-1/2 left-1/2 z-[9998] w-[340px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl border border-white/10 bg-[var(--color-bg-surface)] shadow-2xl"
        initial={prefersReduced ? false : { scale: 0.82, y: 48, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 1.08, opacity: 0 }}
        transition={{
          type: "spring",
          stiffness: 420,
          damping: 28,
          mass: 0.8,
        }}
      >
        {/* Hero gradient stripe */}
        <div className="relative flex h-36 items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-500/20 via-cyan-500/15 to-violet-500/20">
          {/* Ambient glow circles */}
          <div className="absolute h-40 w-40 rounded-full bg-emerald-400/20 blur-2xl" />
          <div className="absolute top-4 right-6 h-24 w-24 rounded-full bg-cyan-400/15 blur-xl" />
          {/* Spinning outer ring */}
          {!prefersReduced && (
            <motion.div
              className="absolute h-20 w-20 rounded-full border border-emerald-400/20"
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            />
          )}
          {/* Icon */}
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-400/30 bg-emerald-500/15 shadow-lg shadow-emerald-500/20">
            <Sparkles className="h-8 w-8 text-emerald-400" />
          </div>
        </div>

        {/* Body */}
        <div className="px-6 pt-5 pb-6">
          <p className="mb-1 text-[10px] font-semibold tracking-[0.15em] text-emerald-500 uppercase">
            New version ready
          </p>
          <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
            DURA just got better
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
            A fresh build is cached and ready to install. Restart to get the latest — your progress
            is safe.
          </p>

          {/* CTA row */}
          <div className="mt-5 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={onRestart}
              className="group relative flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-emerald-500 font-semibold text-white transition hover:bg-emerald-600 active:scale-[0.98]"
            >
              {/* Subtle shimmer on hover */}
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
              <RefreshCw className="h-4 w-4" />
              Restart DURA
            </button>
            <button
              type="button"
              onClick={onDismiss}
              className="h-10 w-full rounded-xl text-sm text-[var(--color-text-muted)] transition hover:text-[var(--color-text-secondary)]"
            >
              Later
            </button>
          </div>
        </div>

        {/* Dismiss X */}
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/20 text-white/70 transition hover:bg-black/30 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </motion.div>
    </>
  );
}

// ── Main export ───────────────────────────────────────────────────────────
export function UpdateAvailable(): React.ReactElement | null {
  const { updateAvailable, applying, applyUpdate } = useServiceWorkerUpdate();
  const [phase, setPhase] = useState<Phase>("pill");
  const [mounted, setMounted] = useState(false);
  const prefersReduced = useReducedMotion() ?? false;

  // Ensure portal mounts client-side only
  useEffect(() => setMounted(true), []);

  if (!updateAvailable) return null;

  const handleOpenBento = () => setPhase("bento");

  const handleDismiss = () => setPhase("pill");

  const handleRestart = () => {
    if (prefersReduced) {
      void applyUpdate();
      return;
    }
    // Trigger confetti burst, then apply update
    setPhase("exploding");
    setTimeout(() => void applyUpdate(), 900);
  };

  const portal =
    mounted && typeof document !== "undefined"
      ? createPortal(
          <>
            <AnimatePresence>
              {phase === "bento" && (
                <BentoCard
                  key="bento"
                  onRestart={handleRestart}
                  onDismiss={handleDismiss}
                  prefersReduced={prefersReduced}
                />
              )}
            </AnimatePresence>

            <AnimatePresence>
              {phase === "exploding" && (
                <motion.div
                  key="exploding"
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                >
                  <ConfettiLayer />
                  {/* Card ghost — expands then dissolves */}
                  <motion.div
                    className="fixed top-1/2 left-1/2 z-[9998] h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400"
                    initial={{ scale: 60, opacity: 0.5 }}
                    animate={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </>,
          document.body
        )
      : null;

  return (
    <>
      {/* TopBar pill — hidden while bento/exploding are open */}
      {phase === "pill" && !applying && (
        <motion.button
          type="button"
          onClick={handleOpenBento}
          aria-label="A new version of DURA is ready. Click to update."
          className="flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 transition hover:border-emerald-500/60 hover:bg-emerald-500/15 dark:text-emerald-300"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <Sparkles className="h-3 w-3" aria-hidden />
          Update
        </motion.button>
      )}

      {portal}
    </>
  );
}
