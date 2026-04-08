"use client";

import { motion } from "motion/react";

const STANDARDS: ReadonlyArray<{ name: string; full: string }> = [
  { name: "ACM CS2023", full: "ACM/IEEE Computing Curricula 2023" },
  { name: "SWEBOK v4", full: "Software Engineering Body of Knowledge" },
  { name: "SFIA 9", full: "Skills Framework for the Information Age" },
  { name: "Bloom's Taxonomy", full: "Cognitive learning hierarchy" },
];

export function Standards(): React.ReactElement {
  return (
    <section className="bg-[#F5F5F4] px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center font-mono text-xs tracking-[0.2em] text-[#A3A3A3] uppercase"
        >
          Mapped to industry standards
        </motion.p>
        <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4">
          {STANDARDS.map((s, i) => (
            <motion.div
              key={s.name}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="rounded-lg border border-[#E5E5E5] bg-white px-5 py-6 text-center"
            >
              <div className="text-base font-semibold text-[#171717]">{s.name}</div>
              <div className="mt-1 text-xs leading-snug text-[#A3A3A3]">{s.full}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
