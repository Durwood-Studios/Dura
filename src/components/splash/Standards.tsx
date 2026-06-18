"use client";

import { motion, useReducedMotion } from "motion/react";

const STANDARDS: ReadonlyArray<{ name: string; full: string }> = [
  { name: "ACM CS2023", full: "ACM/IEEE Computing Curricula 2023" },
  { name: "SWEBOK v4", full: "Software Engineering Body of Knowledge" },
  { name: "SFIA 9", full: "Skills Framework for the Information Age" },
  { name: "Bloom's Taxonomy", full: "Cognitive learning hierarchy" },
];

export function Standards(): React.ReactElement {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="bg-[#F5F5F4] px-4 py-20 sm:px-6 dark:bg-[#0a0a0f]">
      <div className="mx-auto max-w-5xl">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center font-mono text-xs tracking-[0.2em] text-[#A3A3A3] uppercase dark:text-[#6b6b75]"
        >
          Mapped to industry standards
        </motion.p>
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
          {STANDARDS.map((s, i) => (
            <motion.div
              key={s.name}
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="group rounded-xl border border-[#E5E5E5] bg-white px-5 py-6 text-center transition-all duration-200 hover:border-[var(--color-accent)]/30 hover:shadow-md dark:border-white/8 dark:bg-white/[0.03] dark:hover:border-white/14"
            >
              <div className="text-sm font-semibold text-[#171717] sm:text-base dark:text-[#f0f0f0]">
                {s.name}
              </div>
              <div className="mt-1.5 text-xs leading-snug text-[#A3A3A3] dark:text-[#6b6b75]">
                {s.full}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
