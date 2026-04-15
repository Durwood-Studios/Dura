"use client";

import { motion } from "motion/react";
import Link from "next/link";

export function Hero(): React.ReactElement {
  return (
    <section className="relative overflow-hidden px-6 pt-32 pb-24 sm:pt-40 sm:pb-32">
      {/* Grid pattern background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-20"
        style={{
          backgroundImage: "radial-gradient(circle, #d4d4d4 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage: "radial-gradient(ellipse 60% 50% at 50% 40%, black 20%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 60% 50% at 50% 40%, black 20%, transparent 100%)",
        }}
      />

      {/* Dark mode grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-20 hidden dark:block"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage: "radial-gradient(ellipse 60% 50% at 50% 40%, black 20%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 60% 50% at 50% 40%, black 20%, transparent 100%)",
        }}
      />

      <div className="mx-auto max-w-3xl text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200/60 bg-emerald-50/80 px-4 py-1.5 text-sm font-medium text-emerald-700 shadow-sm backdrop-blur-sm dark:border-emerald-800/40 dark:bg-emerald-950/40 dark:text-emerald-300"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Open Source &middot; Free Forever
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="bg-gradient-to-r from-[#10B981] via-[#0891B2] to-[#06B6D4] bg-clip-text text-5xl font-semibold tracking-tight text-transparent sm:text-6xl md:text-7xl"
        >
          DURA
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          className="mt-6 font-serif text-xl text-[#525252] italic sm:text-2xl md:text-3xl dark:text-[#a0a0a8]"
        >
          Engineering education, hardened by design.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[#525252] sm:text-lg dark:text-[#a0a0a8]"
        >
          From absolute zero to CTO-ready. 10 phases. 2,850 hours. Standards-backed. Free forever.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
          className="mt-10 flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row sm:items-center sm:gap-4"
        >
          {/* Animated gradient border button */}
          <div className="group relative inline-flex sm:min-w-[180px]">
            <div
              className="absolute -inset-[2px] rounded-lg opacity-60 blur-sm transition-opacity duration-300 group-hover:opacity-100 motion-reduce:transition-none"
              style={{
                background: "linear-gradient(135deg, #10B981, #06B6D4, #10B981, #06B6D4)",
                backgroundSize: "300% 300%",
                animation: "gradient-shift 4s ease infinite",
              }}
            />
            <Link
              href="/paths"
              className="relative inline-flex h-12 w-full items-center justify-center rounded-lg bg-[#10B981] px-6 text-base font-medium text-white shadow-lg shadow-emerald-500/25 transition-all duration-200 hover:bg-[#059669] hover:shadow-xl hover:shadow-emerald-500/30 dark:shadow-emerald-500/15 dark:hover:shadow-emerald-500/20"
            >
              Start Learning
            </Link>
          </div>
          <Link
            href="/dictionary"
            className="inline-flex h-12 items-center justify-center rounded-lg border border-[#E5E5E5] bg-white/80 px-6 text-base font-medium text-[#171717] shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-[#10B981] hover:text-[#10B981] hover:shadow-md sm:min-w-[180px] dark:border-white/10 dark:bg-white/5 dark:text-[#f0f0f0] dark:hover:border-emerald-500 dark:hover:text-emerald-400"
          >
            Explore Dictionary
          </Link>
        </motion.div>
      </div>

      {/* CSS animation for gradient border */}
      <style jsx>{`
        @keyframes gradient-shift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes gradient-shift {
            0%,
            50%,
            100% {
              background-position: 0% 50%;
            }
          }
        }
      `}</style>
    </section>
  );
}
