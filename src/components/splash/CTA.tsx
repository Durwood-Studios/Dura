"use client";

import { motion } from "motion/react";
import Link from "next/link";

export function CTA(): React.ReactElement {
  return (
    <section className="relative overflow-hidden bg-white px-6 py-28 dark:bg-[#08080d]">
      {/* Large soft gradient background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(16,185,129,0.08) 0%, rgba(6,182,212,0.06) 40%, transparent 70%)",
        }}
      />

      {/* Dark mode gradient */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 hidden dark:block"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(16,185,129,0.06) 0%, rgba(6,182,212,0.04) 40%, transparent 70%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative mx-auto max-w-2xl text-center"
      >
        <h2 className="text-4xl font-semibold tracking-tight text-[#171717] sm:text-5xl dark:text-[#f0f0f0]">
          Ready to start?
        </h2>
        <p className="mt-4 text-lg text-[#525252] dark:text-[#a0a0a8]">
          The first lesson is free. So is the last.
        </p>

        {/* Shimmer button */}
        <div className="group relative mt-10 inline-flex">
          <Link
            href="/paths"
            className="relative inline-flex h-14 min-w-[220px] items-center justify-center overflow-hidden rounded-xl bg-[#10B981] px-10 text-lg font-medium text-white shadow-lg shadow-emerald-500/25 transition-all duration-200 hover:bg-[#059669] hover:shadow-xl hover:shadow-emerald-500/30 dark:shadow-emerald-500/15 dark:hover:shadow-emerald-500/20"
          >
            <span className="relative z-10">Begin Phase 0</span>
            {/* Shimmer effect */}
            <div
              className="absolute inset-0 -translate-x-full opacity-0 transition-opacity duration-200 group-hover:animate-[shimmer_1.5s_ease_forwards] group-hover:opacity-100 motion-reduce:hidden"
              style={{
                background:
                  "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.2) 50%, transparent 60%)",
              }}
            />
          </Link>
        </div>
      </motion.div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </section>
  );
}
