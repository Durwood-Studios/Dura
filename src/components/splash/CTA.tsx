"use client";

import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";

export function CTA(): React.ReactElement {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-white px-4 py-28 sm:px-6 dark:bg-[#08080d]">
      {/* Aurora gradient — animated, very slow 9s cycle */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 30% 50%, rgba(16,185,129,0.07) 0%, transparent 60%), radial-gradient(ellipse 60% 45% at 70% 50%, rgba(6,182,212,0.07) 0%, transparent 60%)",
          animation: shouldReduceMotion ? "none" : "cta-aurora 9s ease-in-out infinite alternate",
        }}
      />
      {/* Static base gradient for light mode */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-20"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(16,185,129,0.05) 0%, rgba(6,182,212,0.04) 40%, transparent 70%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative mx-auto max-w-2xl text-center"
      >
        <h2 className="text-4xl font-semibold tracking-tight text-[#171717] sm:text-5xl md:text-6xl dark:text-[#f0f0f0]">
          Ready to start?
        </h2>
        <p className="mt-4 text-lg text-[#525252] sm:text-xl dark:text-[#a0a0a8]">
          The first lesson is free. So is the last.
        </p>

        {/* Primary CTA with pulse glow ring */}
        <div className="group relative mt-10 inline-flex">
          {/* Pulse ring — not animated under reduced-motion */}
          {!shouldReduceMotion && (
            <span
              aria-hidden
              className="absolute inset-0 rounded-xl bg-[#10B981]/20"
              style={{
                animation: "cta-pulse 2.5s ease-out infinite",
              }}
            />
          )}
          <Link
            href="/paths"
            className="relative inline-flex h-14 min-w-[220px] items-center justify-center overflow-hidden rounded-xl bg-[#10B981] px-10 text-lg font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all duration-200 hover:bg-[#059669] hover:shadow-xl hover:shadow-emerald-500/35 dark:shadow-emerald-500/15"
          >
            <span className="relative z-10">Begin Phase 0</span>
            {/* Shimmer on hover */}
            <div
              aria-hidden
              className="absolute inset-0 -translate-x-full opacity-0 transition-opacity duration-200 group-hover:opacity-100 motion-reduce:hidden"
              style={{
                background:
                  "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.18) 50%, transparent 60%)",
                animation: "cta-shimmer 0s",
              }}
            />
          </Link>
        </div>

        {/* Secondary action link */}
        <div className="mt-5">
          <Link
            href="/discover"
            className="text-sm text-[#525252] underline-offset-4 transition-colors duration-150 hover:text-[#10B981] hover:underline dark:text-[#a0a0a8] dark:hover:text-emerald-400"
          >
            or explore the curriculum &rarr;
          </Link>
        </div>
      </motion.div>

      <style>{`
        @keyframes cta-aurora {
          0%   { opacity: 0.8; transform: scale(1) translateX(0); }
          100% { opacity: 1;   transform: scale(1.08) translateX(2%); }
        }
        @keyframes cta-pulse {
          0%   { transform: scale(1);    opacity: 0.5; }
          70%  { transform: scale(1.18); opacity: 0; }
          100% { transform: scale(1.18); opacity: 0; }
        }
        @keyframes cta-shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .group:hover .group-hover\\:opacity-100 {
          animation: cta-shimmer 1.2s ease forwards;
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes cta-aurora { 0%, 100% { opacity: 1; transform: none; } }
          @keyframes cta-pulse  { 0%, 100% { transform: none; opacity: 0; } }
        }
      `}</style>
    </section>
  );
}
