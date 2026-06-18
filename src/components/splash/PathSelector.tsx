"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { Lightbulb, Sprout, Rocket, Hammer, GraduationCap, ArrowRight } from "lucide-react";

interface PathCard {
  title: string;
  icon: React.ReactElement;
  description: string;
  href: string;
  color: string;
}

const PATHS: PathCard[] = [
  {
    title: "First time? Start here.",
    icon: <Lightbulb className="h-7 w-7" />,
    description:
      "Twenty interactive activities that teach how computers think. No reading walls, no account, no English fluency required. Built for everyone — including kids, beginners, and anyone curious.",
    href: "/discover",
    color: "#f472b6",
  },
  {
    title: "I'm ready to learn to code",
    icon: <Sprout className="h-7 w-7" />,
    description:
      "A 35-question assessment finds where you belong in the curriculum, then guides you step by step. Best when you've used a computer before — if not, the Discovery card above is your front door.",
    href: "/assess",
    color: "#10b981",
  },
  {
    title: "I'm building my career",
    icon: <Rocket className="h-7 w-7" />,
    description:
      "12 career tracks from Frontend to CTO. Each one maps skills to real job descriptions and industry standards.",
    href: "/tracks",
    color: "#3b82f6",
  },
  {
    title: "I want to build something",
    icon: <Hammer className="h-7 w-7" />,
    description:
      "100 project tutorials. Pick one, build it, deploy it. From CLI tools to AI agents.",
    href: "/tutorials",
    color: "#f59e0b",
  },
  {
    title: "I'm a teacher",
    icon: <GraduationCap className="h-7 w-7" />,
    description:
      "Browse the curriculum, export resources, and track which standards each lesson covers.",
    href: "/teach",
    color: "#8b5cf6",
  },
  {
    title: "I'm already learning",
    icon: <ArrowRight className="h-7 w-7" />,
    description: "Pick up where you left off.",
    href: "/dashboard",
    color: "#06b6d4",
  },
];

/** Audience-routing cards that help visitors find the right entry point. */
export function PathSelector(): React.ReactElement {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="bg-[#F5F5F4] px-4 py-24 sm:px-6 sm:py-32 dark:bg-[#0a0a0f]">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <motion.h2
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-3xl font-semibold tracking-tight text-[#171717] sm:text-4xl dark:text-[#f0f0f0]"
          >
            Where are you on your journey?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.07 }}
            className="mt-4 text-lg text-[#525252] dark:text-[#a0a0a8]"
          >
            DURA meets you where you are — from first curiosity to engineering leadership.
          </motion.p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
          {PATHS.map((path, i) => (
            <Link key={path.title} href={path.href} className="block">
              <motion.article
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  duration: 0.5,
                  delay: i * 0.07,
                  ease: "easeOut",
                }}
                className="group relative flex min-h-[80px] items-start gap-5 overflow-hidden rounded-xl border border-[#E5E5E5] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-all duration-200 hover:-translate-y-0.5 motion-reduce:hover:translate-y-0 dark:border-white/8 dark:bg-white/[0.03]"
                style={{ borderLeftWidth: 4, borderLeftColor: path.color }}
              >
                {/* Color-matched drop shadow on hover */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-200 group-hover:opacity-100 motion-reduce:hidden"
                  style={{
                    boxShadow: `0 8px 28px ${path.color}22`,
                  }}
                />

                {/* Icon */}
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-105 motion-reduce:group-hover:scale-100"
                  style={{
                    background: `${path.color}1a`,
                    color: path.color,
                  }}
                >
                  {path.icon}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-semibold text-[#171717] sm:text-lg dark:text-[#f0f0f0]">
                    {path.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-[#525252] dark:text-[#a0a0a8]">
                    {path.description}
                  </p>
                </div>

                {/* Arrow indicator — always visible on mobile, slide-in on desktop */}
                <span
                  aria-hidden
                  className="mt-1 shrink-0 text-lg transition-all duration-200 motion-reduce:transition-none sm:translate-x-[-4px] sm:opacity-0 sm:group-hover:translate-x-0 sm:group-hover:opacity-100"
                  style={{ color: path.color }}
                >
                  &rarr;
                </span>
              </motion.article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
