"use client";

import { motion } from "motion/react";
import { Lock, Repeat, TerminalSquare, BookCheck } from "lucide-react";

interface Feature {
  icon: React.ReactElement;
  title: string;
  description: string;
}

const FEATURES: Feature[] = [
  {
    icon: <Lock className="h-5 w-5" />,
    title: "Mastery-Gated",
    description: "You don't move on until it sticks. Progress is earned, not skipped.",
  },
  {
    icon: <Repeat className="h-5 w-5" />,
    title: "FSRS Repetition",
    description: "Spaced review scheduled by the science, tuned to your forgetting curve.",
  },
  {
    icon: <TerminalSquare className="h-5 w-5" />,
    title: "Code Sandboxes",
    description: "Run real code in real environments. No copy-paste tutorials.",
  },
  {
    icon: <BookCheck className="h-5 w-5" />,
    title: "Verified Dictionary",
    description: "Every term traced to a primary source. Definitions you can trust.",
  },
];

export function Features(): React.ReactElement {
  return (
    <section className="bg-white px-6 py-24 sm:py-32 dark:bg-[#08080d]">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-semibold tracking-tight text-[#171717] sm:text-5xl dark:text-[#f0f0f0]">
            Built for how learning actually works.
          </h2>
          <p className="mt-4 text-lg text-[#525252] dark:text-[#a0a0a8]">
            Four pillars. No shortcuts. No fluff.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" }}
              className="group rounded-xl border border-[#E5E5E5] bg-[#FAFAFA] p-8 transition-shadow duration-200 hover:shadow-md dark:border-white/8 dark:bg-white/[0.03] dark:hover:border-white/12"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#10B981]/10 text-[#10B981] dark:bg-emerald-500/15">
                {feature.icon}
              </div>
              <h3 className="mt-5 text-xl font-semibold text-[#171717] dark:text-[#f0f0f0]">
                {feature.title}
              </h3>
              <p className="mt-2 text-base leading-relaxed text-[#525252] dark:text-[#a0a0a8]">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
