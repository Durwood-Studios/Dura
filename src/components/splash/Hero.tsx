"use client";

import { motion } from "motion/react";
import Link from "next/link";

export function Hero(): React.ReactElement {
  return (
    <section className="relative overflow-hidden px-6 pt-32 pb-24 sm:pt-40 sm:pb-32">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-20 -z-10 mx-auto h-[400px] max-w-3xl rounded-full bg-gradient-to-b from-emerald-100/60 via-cyan-50/40 to-transparent blur-3xl"
      />
      <div className="mx-auto max-w-3xl text-center">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-5xl font-semibold tracking-tight text-[#171717] sm:text-6xl md:text-7xl"
        >
          DURA
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          className="mt-6 font-serif text-xl text-[#525252] italic sm:text-2xl md:text-3xl"
        >
          Engineering education, hardened by design.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[#525252] sm:text-lg"
        >
          From absolute zero to CTO-ready. 10 phases. 2,850 hours. Standards-backed. Free forever.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
          className="mt-10 flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row sm:items-center sm:gap-4"
        >
          <Link
            href="/dashboard"
            className="inline-flex h-12 items-center justify-center rounded-lg bg-[#10B981] px-6 text-base font-medium text-white shadow-sm transition-all duration-200 hover:bg-[#059669] hover:shadow-md sm:min-w-[180px]"
          >
            Start Learning
          </Link>
          <Link
            href="/dictionary"
            className="inline-flex h-12 items-center justify-center rounded-lg border border-[#E5E5E5] bg-white px-6 text-base font-medium text-[#171717] shadow-sm transition-all duration-200 hover:border-[#10B981] hover:text-[#10B981] sm:min-w-[180px]"
          >
            Explore Dictionary
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
