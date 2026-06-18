"use client";

import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";

interface StatChip {
  label: string;
}

const STATS: StatChip[] = [
  { label: "400+ Lessons" },
  { label: "10 Phases" },
  { label: "2,850 Hours" },
  { label: "Free Forever" },
];

export function Hero(): React.ReactElement {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden px-4 pt-32 pb-24 sm:px-6 sm:pt-40 sm:pb-32">
      {/* Dot grid background — dark mode */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-20 hidden dark:block"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 35%, black 20%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 60% at 50% 35%, black 20%, transparent 100%)",
        }}
      />
      {/* Dot grid background — light mode */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-20 dark:hidden"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.07) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 35%, black 20%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 60% at 50% 35%, black 20%, transparent 100%)",
        }}
      />

      {/* Ambient glow behind heading */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -z-10 flex justify-center"
        style={{ top: "20%", transform: "translateY(-50%)" }}
      >
        <div
          style={{
            width: "600px",
            height: "400px",
            background:
              "radial-gradient(ellipse at center, oklch(68% 0.18 145 / 0.09) 0%, oklch(65% 0.18 250 / 0.07) 50%, transparent 75%)",
            filter: shouldReduceMotion ? "none" : "blur(40px)",
          }}
        />
      </div>

      <div className="mx-auto max-w-3xl text-center">
        {/* Badge — floats gently */}
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200/60 bg-emerald-50/80 px-4 py-1.5 text-sm font-medium text-emerald-700 shadow-sm backdrop-blur-sm dark:border-emerald-800/40 dark:bg-emerald-950/40 dark:text-emerald-300"
        >
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500 motion-reduce:animate-none" />
          Open Source &middot; Free Forever
        </motion.div>

        {/* Primary heading */}
        <motion.h1
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: "easeOut", delay: 0.05 }}
          className="bg-gradient-to-r from-[#10B981] via-[#0891B2] to-[#06B6D4] bg-clip-text text-6xl font-semibold tracking-tight text-transparent sm:text-7xl md:text-8xl"
        >
          DURA
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.12 }}
          className="mt-5 font-serif text-xl text-[#525252] italic sm:text-2xl md:text-3xl dark:text-[#a0a0a8]"
        >
          Engineering education, hardened by design.
        </motion.p>

        {/* Body copy */}
        <motion.p
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-[#525252] sm:text-lg dark:text-[#a0a0a8]"
        >
          From your first click to engineering leadership. 10 phases. 2,850 hours. Standards-backed.
          Free forever.
        </motion.p>

        {/* CTA buttons — full-width stacked on mobile, row on sm+ */}
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.28 }}
          className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center sm:gap-4"
        >
          {/* Primary CTA — animated gradient border */}
          <div className="group relative sm:min-w-[180px]">
            <div
              aria-hidden
              className="absolute -inset-[2px] rounded-xl opacity-60 blur-sm transition-opacity duration-300 group-hover:opacity-100 motion-reduce:transition-none"
              style={{
                background: "linear-gradient(135deg, #10B981, #06B6D4, #10B981, #06B6D4)",
                backgroundSize: "300% 300%",
                animation: "hero-gradient-shift 4s ease infinite",
              }}
            />
            <Link
              href="/paths"
              className="relative flex h-14 w-full items-center justify-center rounded-xl bg-[#10B981] px-8 text-base font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all duration-200 hover:bg-[#059669] hover:shadow-xl hover:shadow-emerald-500/35 sm:min-w-[180px] dark:shadow-emerald-500/15"
            >
              Start Learning
            </Link>
          </div>

          {/* Secondary CTA */}
          <Link
            href="/discover"
            className="flex h-14 items-center justify-center rounded-xl border border-[#E5E5E5]/80 bg-white/80 px-8 text-base font-medium text-[#525252] backdrop-blur-sm transition-all duration-200 hover:border-[#10B981]/50 hover:text-[#10B981] sm:min-w-[180px] dark:border-white/8 dark:bg-white/5 dark:text-[#a0a0a8] dark:hover:border-emerald-500/40 dark:hover:text-emerald-400"
          >
            Play first
          </Link>
        </motion.div>

        {/* Stats chips row */}
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-2"
          aria-label="Curriculum statistics"
        >
          {STATS.map((stat, i) => (
            <span
              key={stat.label}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#E5E5E5]/60 bg-[#F5F5F4]/80 px-3 py-1 text-xs font-medium text-[#525252] backdrop-blur-sm dark:border-white/6 dark:bg-white/[0.04] dark:text-[#a0a0a8]"
            >
              {i > 0 && (
                <span aria-hidden className="h-1 w-1 rounded-full bg-[#A3A3A3] dark:bg-[#6b6b75]" />
              )}
              {stat.label}
            </span>
          ))}
        </motion.div>
      </div>

      {/* CSS animations — gradient-shift + reduced-motion override */}
      <style>{`
        @keyframes hero-gradient-shift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes hero-gradient-shift {
            0%, 50%, 100% { background-position: 0% 50%; }
          }
        }
      `}</style>
    </section>
  );
}
