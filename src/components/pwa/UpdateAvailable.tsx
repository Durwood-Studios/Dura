"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Sparkles, X, RefreshCw } from "lucide-react";
import { useServiceWorkerUpdate } from "@/hooks/useServiceWorkerUpdate";

// ── Confetti particles (deterministic — index math only, no Math.random) ──
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
  // spread evenly with a slight jitter so it doesn't look like a perfect sunburst
  angle: (360 / 96) * i + (i % 5) * 3,
  distance: 130 + ((i * 7) % 160), // 130–290 px radius
  size: 7 + (i % 5) * 2, // 7–15 px
  delay: (i % 12) * 0.012, // 0–0.13 s stagger
  duration: 1.0 + (i % 5) * 0.14, // 1.0–1.56 s
  rotation: (i % 2 === 0 ? 1 : -1) * (180 + ((i * 47) % 360)),
  isCircle: i % 4 === 0,
  isThin: i % 3 === 0,
}));

// ── Phase machine ─────────────────────────────────────────────────────────
// pill → bento (card open, page blurred) → exploding (card+blur exit,
// confetti fires above) → page reloads
type Phase = "pill" | "bento" | "exploding";

// ── Confetti layer ────────────────────────────────────────────────────────
// Rendered in the "exploding" phase. Sits at z-[9999] — above the fading
// backdrop (9997) and card (9998) so it bursts through as they dissolve.
function ConfettiLayer(): React.ReactElement {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
      {/* All pieces originate from viewport centre */}
      <div className="absolute top-1/2 left-1/2">
        {PIECES.map((p) => (
          <div
            key={p.id}
            className="absolute"
            style={
              {
                width: p.isThin ? Math.round(p.size / 2.5) : p.size,
                height: p.isThin ? p.size * 2.5 : p.size,
                background: p.color,
                borderRadius: p.isCircle ? "50%" : 2,
                left: 0,
                top: 0,
                transformOrigin: "center center",
                "--angle": `${p.angle}deg`,
                "--distance": `${p.distance}px`,
                "--rot": `${p.rotation}deg`,
                animation: `update-confetti-fly ${p.duration}s cubic-bezier(0.22,1,0.36,1) ${p.delay}s both`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
    </div>
  );
}

// ── Gaussian blur backdrop ────────────────────────────────────────────────
// A fixed overlay that blurs the entire page behind it.
// Uses backdrop-filter so only page content is blurred — not the card itself.
// Animates blur strength + opacity so the transition feels silky, not abrupt.
interface BlurBackdropProps {
  onClick: () => void;
}

function BlurBackdrop({ onClick }: BlurBackdropProps): React.ReactElement {
  return (
    <motion.div
      className="fixed inset-0 z-[9997] cursor-default"
      // Subtle dark wash combined with strong Gaussian blur
      style={{ background: "rgba(0,0,0,0.22)" }}
      initial={{ opacity: 0, backdropFilter: "blur(0px) saturate(100%)" }}
      animate={{ opacity: 1, backdropFilter: "blur(18px) saturate(75%)" }}
      exit={{ opacity: 0, backdropFilter: "blur(0px) saturate(100%)" }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      onClick={onClick}
      aria-hidden
    />
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
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Update available"
      // Responsive width: fills width on small screens, caps at 340 px on larger
      className="fixed top-1/2 left-1/2 z-[9998] w-[min(340px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl border border-white/10 bg-[var(--color-bg-surface)] shadow-2xl"
      initial={prefersReduced ? false : { scale: 0.82, y: 56, opacity: 0 }}
      animate={{ scale: 1, y: 0, opacity: 1 }}
      // Exit: the card inflates very slightly then dissolves — as if the
      // confetti burst from inside it
      exit={{ scale: 1.06, opacity: 0 }}
      transition={{
        type: "spring",
        stiffness: 420,
        damping: 28,
        mass: 0.8,
      }}
    >
      {/* ── Hero gradient stripe ── */}
      <div className="relative flex h-36 items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-500/20 via-cyan-500/15 to-violet-500/20">
        {/* Ambient glow blobs */}
        <div className="absolute h-40 w-40 rounded-full bg-emerald-400/20 blur-2xl" />
        <div className="absolute top-4 right-6 h-24 w-24 rounded-full bg-cyan-400/15 blur-xl" />

        {/* Slow-spinning ring — decorative, skipped with reduced-motion */}
        {!prefersReduced && (
          <motion.div
            className="absolute h-20 w-20 rounded-full border border-emerald-400/25"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />
        )}

        {/* Icon box */}
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-400/30 bg-emerald-500/15 shadow-lg shadow-emerald-500/20">
          <Sparkles className="h-8 w-8 text-emerald-400" />
        </div>
      </div>

      {/* ── Body ── */}
      <div className="px-6 pt-5 pb-6">
        <p className="mb-1 text-[10px] font-semibold tracking-[0.15em] text-emerald-500 uppercase">
          New version ready
        </p>
        <h2 className="text-xl font-bold text-[var(--color-text-primary)]">DURA just got better</h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
          A fresh build is cached and ready. Restart to get the latest —&nbsp; your progress is safe
          and nothing is lost.
        </p>

        <div className="mt-5 flex flex-col gap-2.5">
          {/* Primary CTA */}
          <button
            type="button"
            onClick={onRestart}
            className="group relative flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-emerald-500 font-semibold text-white transition hover:bg-emerald-600 active:scale-[0.98]"
          >
            {/* Hover shimmer sweep */}
            <span
              aria-hidden
              className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-500 group-hover:translate-x-full"
            />
            <RefreshCw className="h-4 w-4" aria-hidden />
            Restart DURA
          </button>

          {/* Dismiss */}
          <button
            type="button"
            onClick={onDismiss}
            className="h-10 w-full rounded-xl text-sm text-[var(--color-text-muted)] transition hover:text-[var(--color-text-secondary)]"
          >
            Later
          </button>
        </div>
      </div>

      {/* Close ×  */}
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss update"
        className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/20 text-white/70 transition hover:bg-black/30 hover:text-white"
      >
        <X className="h-4 w-4" aria-hidden />
      </button>
    </motion.div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────
export function UpdateAvailable(): React.ReactElement | null {
  const { updateAvailable, applyUpdate } = useServiceWorkerUpdate();
  const [phase, setPhase] = useState<Phase>("pill");
  const [mounted, setMounted] = useState(false);
  const prefersReduced = useReducedMotion() ?? false;

  // Portal requires the DOM — only activate after first client render
  useEffect(() => setMounted(true), []);

  if (!updateAvailable) return null;

  const handleDismiss = () => setPhase("pill");

  const handleRestart = () => {
    if (prefersReduced) {
      // Reduced motion: skip all theatrics, apply immediately
      void applyUpdate();
      return;
    }

    // Phase transition:
    //   • "bento" AnimatePresence exit fires (backdrop + card fade / dissolve)
    //   • "exploding" mounts simultaneously at z-[9999] — confetti fires
    //     THROUGH the still-fading backdrop, giving the "bursting out" effect
    //   • applyUpdate() waits long enough for confetti to peak
    setPhase("exploding");
    setTimeout(() => void applyUpdate(), 1400);
  };

  const portal =
    mounted && typeof document !== "undefined"
      ? createPortal(
          <>
            {/* ── Bento phase: blur backdrop + card ── */}
            <AnimatePresence>
              {phase === "bento" && (
                <>
                  <BlurBackdrop key="backdrop" onClick={handleDismiss} />
                  <BentoCard
                    key="card"
                    onRestart={handleRestart}
                    onDismiss={handleDismiss}
                    prefersReduced={prefersReduced}
                  />
                </>
              )}
            </AnimatePresence>

            {/* ── Exploding phase: backdrop + card exit, confetti fires above ──
                The two AnimatePresence blocks run independently so the
                "bento" exits can overlap with the confetti mounting. */}
            <AnimatePresence>
              {phase === "exploding" && (
                // Confetti wrapper fades itself out after pieces finish
                <motion.div
                  key="confetti-root"
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  // Allow a long exit so the last few pieces finish gracefully
                  transition={{ delay: 1.0, duration: 0.4 }}
                >
                  <ConfettiLayer />
                </motion.div>
              )}
            </AnimatePresence>
          </>,
          document.body
        )
      : null;

  return (
    <>
      {/* ── TopBar pill — hidden while any overlay is active ── */}
      <AnimatePresence>
        {phase === "pill" && (
          <motion.button
            type="button"
            key="pill"
            onClick={() => setPhase("bento")}
            aria-label="A new version of DURA is ready. Click to update."
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 transition hover:border-emerald-500/60 hover:bg-emerald-500/15 dark:text-emerald-300"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <Sparkles className="h-3 w-3" aria-hidden />
            Update
          </motion.button>
        )}
      </AnimatePresence>

      {portal}
    </>
  );
}
