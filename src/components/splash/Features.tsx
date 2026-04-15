"use client";

import { motion } from "motion/react";
import { Lock, Repeat, TerminalSquare, BookCheck } from "lucide-react";

interface Feature {
  icon: React.ReactElement;
  title: string;
  description: string;
  number: string;
}

const FEATURES: Feature[] = [
  {
    icon: <Lock className="h-5 w-5" />,
    title: "Mastery-Gated",
    description: "You don't move on until it sticks. Progress is earned, not skipped.",
    number: "01",
  },
  {
    icon: <Repeat className="h-5 w-5" />,
    title: "FSRS Repetition",
    description: "Spaced review scheduled by the science, tuned to your forgetting curve.",
    number: "02",
  },
  {
    icon: <TerminalSquare className="h-5 w-5" />,
    title: "Code Sandboxes",
    description: "Run real code in real environments. No copy-paste tutorials.",
    number: "03",
  },
  {
    icon: <BookCheck className="h-5 w-5" />,
    title: "Verified Dictionary",
    description: "Every term traced to a primary source. Definitions you can trust.",
    number: "04",
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
              className="group relative"
            >
              {/* Gradient border wrapper */}
              <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-br from-transparent via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:from-[#10B981]/40 group-hover:via-[#06B6D4]/20 group-hover:to-[#10B981]/40 group-hover:opacity-100 motion-reduce:transition-none" />

              <div className="relative rounded-xl border border-[#E5E5E5] bg-white/80 p-8 backdrop-blur-xl transition-all duration-200 group-hover:border-transparent group-hover:bg-[#F0FDF4]/60 dark:border-white/8 dark:bg-white/[0.03] dark:group-hover:border-transparent dark:group-hover:bg-white/[0.06]">
                {/* Number indicator */}
                <span className="absolute top-6 right-6 font-mono text-sm font-medium text-[#E5E5E5] transition-colors duration-200 group-hover:text-[#10B981]/40 dark:text-white/8 dark:group-hover:text-emerald-500/30">
                  {feature.number}
                </span>

                {/* Icon with glow */}
                <div className="relative">
                  <div className="absolute -inset-1 rounded-lg bg-[#10B981]/20 opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-100 motion-reduce:transition-none" />
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-[#10B981]/10 text-[#10B981] shadow-sm shadow-emerald-500/10 dark:bg-emerald-500/15 dark:shadow-emerald-500/5">
                    {feature.icon}
                  </div>
                </div>

                <h3 className="mt-5 text-xl font-semibold text-[#171717] dark:text-[#f0f0f0]">
                  {feature.title}
                </h3>
                <p className="mt-2 text-base leading-relaxed text-[#525252] dark:text-[#a0a0a8]">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
