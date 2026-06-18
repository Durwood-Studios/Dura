"use client";

import { motion, useReducedMotion } from "motion/react";
import { Lock, Repeat, TerminalSquare, BookCheck, WifiOff, Layers } from "lucide-react";

interface Feature {
  icon: React.ReactElement;
  title: string;
  description: string;
  /** Hex color used for icon bg and hover glow */
  color: string;
}

const FEATURES: Feature[] = [
  {
    icon: <Lock className="h-5 w-5" />,
    title: "Mastery-Gated",
    description: "You don't move on until it sticks. Progress is earned, not skipped.",
    color: "#10b981",
  },
  {
    icon: <Repeat className="h-5 w-5" />,
    title: "FSRS Repetition",
    description: "Spaced review scheduled by the science, tuned to your forgetting curve.",
    color: "#06b6d4",
  },
  {
    icon: <TerminalSquare className="h-5 w-5" />,
    title: "Code Sandboxes",
    description: "Run real code in real environments. No copy-paste tutorials.",
    color: "#8b5cf6",
  },
  {
    icon: <BookCheck className="h-5 w-5" />,
    title: "Verified Dictionary",
    description: "Every term traced to a primary source. Definitions you can trust.",
    color: "#f59e0b",
  },
  {
    icon: <WifiOff className="h-5 w-5" />,
    title: "Offline-First",
    description:
      "Your progress lives on-device. No internet required. No cloud dependency. Works on the subway.",
    color: "#f472b6",
  },
  {
    icon: <Layers className="h-5 w-5" />,
    title: "Specialty Tracks",
    description:
      "5 specialty phases: Embedded, Hardware, Robotics, Quant/HFT, Manufacturing — with industry certifications.",
    color: "#a78bfa",
  },
];

export function Features(): React.ReactElement {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="bg-white px-4 py-24 sm:px-6 sm:py-32 dark:bg-[#08080d]">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <motion.h2
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-4xl font-semibold tracking-tight text-[#171717] sm:text-5xl dark:text-[#f0f0f0]"
          >
            Built for how learning actually works.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.08 }}
            className="mt-4 text-lg text-[#525252] dark:text-[#a0a0a8]"
          >
            Six pillars. No shortcuts. No fluff.
          </motion.p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.06, ease: "easeOut" }}
              className="group relative rounded-xl border border-[#E5E5E5] bg-[#FAFAFA] p-8 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg motion-reduce:hover:translate-y-0 dark:border-white/8 dark:bg-white/[0.03]"
              style={
                {
                  "--feature-color": feature.color,
                } as React.CSSProperties
              }
            >
              {/* Colored inner glow on hover — CSS custom property trick */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-200 group-hover:opacity-100 motion-reduce:hidden"
                style={{
                  boxShadow: `inset 0 0 0 1px ${feature.color}33, 0 0 24px ${feature.color}18`,
                }}
              />

              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-110 motion-reduce:group-hover:scale-100"
                style={{
                  background: `${feature.color}1a`,
                  color: feature.color,
                }}
              >
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
