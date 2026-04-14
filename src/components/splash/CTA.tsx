"use client";

import { motion } from "motion/react";
import Link from "next/link";

export function CTA(): React.ReactElement {
  return (
    <section className="bg-white px-6 py-28">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mx-auto max-w-2xl text-center"
      >
        <h2 className="text-4xl font-semibold tracking-tight text-[#171717] sm:text-5xl">
          Ready to start?
        </h2>
        <p className="mt-4 text-lg text-[#525252]">The first lesson is free. So is the last.</p>
        <Link
          href="/paths"
          className="mt-10 inline-flex h-12 min-w-[200px] items-center justify-center rounded-lg bg-[#10B981] px-8 text-base font-medium text-white shadow-sm transition-all duration-200 hover:bg-[#059669] hover:shadow-md"
        >
          Begin Phase 0
        </Link>
      </motion.div>
    </section>
  );
}
