"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import {
  Sprout,
  Code2,
  Cpu,
  Database,
  Globe,
  Layers,
  Boxes,
  Shield,
  Crown,
  Bot,
  Activity,
  TrendingUp,
  Cog,
  Factory,
} from "lucide-react";

interface Phase {
  number: number;
  color: string;
  icon: React.ReactElement;
  title: string;
  subtitle: string;
  hours: number;
  modules: number;
  lessons: number;
}

const PHASES: Phase[] = [
  {
    number: 0,
    color: "#6ee7b7",
    icon: <Sprout className="h-5 w-5" />,
    title: "Digital Literacy",
    subtitle: "Computing literacy & first principles",
    hours: 50,
    modules: 4,
    lessons: 16,
  },
  {
    number: 1,
    color: "#93c5fd",
    icon: <Code2 className="h-5 w-5" />,
    title: "Programming Fundamentals",
    subtitle: "Variables, control flow, functions, debugging",
    hours: 260,
    modules: 7,
    lessons: 50,
  },
  {
    number: 2,
    color: "#c4b5fd",
    icon: <Globe className="h-5 w-5" />,
    title: "Web Development",
    subtitle: "HTML, CSS, React, TypeScript, deployment",
    hours: 365,
    modules: 7,
    lessons: 60,
  },
  {
    number: 3,
    color: "#fda4af",
    icon: <Cpu className="h-5 w-5" />,
    title: "CS Fundamentals",
    subtitle: "Data structures, algorithms, discrete math",
    hours: 270,
    modules: 6,
    lessons: 45,
  },
  {
    number: 4,
    color: "#fdba74",
    icon: <Database className="h-5 w-5" />,
    title: "Backend Engineering",
    subtitle: "APIs, databases, auth, queues, deployment",
    hours: 325,
    modules: 6,
    lessons: 50,
  },
  {
    number: 5,
    color: "#f0abfc",
    icon: <Layers className="h-5 w-5" />,
    title: "Systems Engineering",
    subtitle: "OS, networking, database internals, cloud",
    hours: 395,
    modules: 5,
    lessons: 40,
  },
  {
    number: 6,
    color: "#67e8f9",
    icon: <Bot className="h-5 w-5" />,
    title: "AI/ML Engineering",
    subtitle: "RAG, agents, MCP, fine-tuning, production AI",
    hours: 550,
    modules: 9,
    lessons: 71,
  },
  {
    number: 7,
    color: "#fcd34d",
    icon: <Boxes className="h-5 w-5" />,
    title: "Advanced Systems",
    subtitle: "Compilers, distributed systems, Rust, perf",
    hours: 360,
    modules: 5,
    lessons: 35,
  },
  {
    number: 8,
    color: "#a3e635",
    icon: <Shield className="h-5 w-5" />,
    title: "Professional Practice",
    subtitle: "Testing, CI/CD, architecture, security",
    hours: 270,
    modules: 7,
    lessons: 44,
  },
  {
    number: 9,
    color: "#f472b6",
    icon: <Crown className="h-5 w-5" />,
    title: "CTO Track",
    subtitle: "Leadership, architecture at scale, org design",
    hours: 600,
    modules: 10,
    lessons: 68,
  },
  {
    number: 10,
    color: "#fb923c",
    icon: <Cpu className="h-5 w-5" />,
    title: "Embedded / Firmware",
    subtitle: "C and Rust on ARM Cortex-M, RTOS, drivers",
    hours: 19,
    modules: 10,
    lessons: 10,
  },
  {
    number: 11,
    color: "#a78bfa",
    icon: <Activity className="h-5 w-5" />,
    title: "Hardware Verification",
    subtitle: "SystemVerilog, UVM testbenches, IEEE 1800",
    hours: 16,
    modules: 10,
    lessons: 10,
  },
  {
    number: 12,
    color: "#f59e0b",
    icon: <TrendingUp className="h-5 w-5" />,
    title: "Quant / HFT Systems",
    subtitle: "Microsecond-latency C++ for quant trading",
    hours: 16,
    modules: 9,
    lessons: 12,
  },
  {
    number: 13,
    color: "#818cf8",
    icon: <Cog className="h-5 w-5" />,
    title: "Robotics",
    subtitle: "ISO 10218, collaborative robot safety, ROS 2",
    hours: 13,
    modules: 9,
    lessons: 12,
  },
  {
    number: 14,
    color: "#2dd4bf",
    icon: <Factory className="h-5 w-5" />,
    title: "Manufacturing",
    subtitle: "ISO 9001, GD&T, Lean, Six Sigma, IIoT",
    hours: 20,
    modules: 14,
    lessons: 16,
  },
];

export function PhaseGrid(): React.ReactElement {
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
            className="text-4xl font-semibold tracking-tight text-[#171717] sm:text-5xl dark:text-[#f0f0f0]"
          >
            Fifteen phases. One path.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.08 }}
            className="mt-4 text-lg text-[#525252] dark:text-[#a0a0a8]"
          >
            A complete arc from first keystroke to engineering leadership.
          </motion.p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {PHASES.map((phase, i) => (
            <Link key={phase.number} href={`/paths/${phase.number}`} className="block">
              <motion.article
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.05, ease: "easeOut" }}
                className="group relative overflow-hidden rounded-xl border border-[#E5E5E5] bg-white p-6 transition-all duration-200 hover:-translate-y-0.5 motion-reduce:hover:translate-y-0 dark:border-white/8 dark:bg-white/[0.03]"
              >
                {/* Phase color bar at top */}
                <div
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-1 transition-all duration-200 group-hover:h-[3px]"
                  style={{ background: phase.color }}
                />

                {/* Color-matched hover glow */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-200 group-hover:opacity-100 motion-reduce:hidden"
                  style={{
                    boxShadow: `0 8px 32px ${phase.color}20`,
                  }}
                />

                <div className="flex items-center gap-3">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-[#171717] transition-transform duration-200 group-hover:scale-110 motion-reduce:group-hover:scale-100 dark:text-[#f0f0f0]"
                    style={{ background: `${phase.color}33` }}
                  >
                    {phase.icon}
                  </div>
                  <span className="font-mono text-xs tracking-wide text-[#A3A3A3] uppercase dark:text-[#6b6b75]">
                    Phase {phase.number}
                  </span>
                </div>

                <h3 className="mt-4 text-lg font-semibold text-[#171717] dark:text-[#f0f0f0]">
                  {phase.title}
                </h3>
                <p className="mt-1 text-sm text-[#525252] dark:text-[#a0a0a8]">{phase.subtitle}</p>

                {/* "Explore →" slide-in on hover */}
                <div className="mt-3 h-5 overflow-hidden">
                  <span
                    className="inline-flex items-center gap-1 text-sm font-medium transition-all duration-200 motion-reduce:transition-none sm:translate-x-[-10px] sm:opacity-0 sm:group-hover:translate-x-0 sm:group-hover:opacity-100"
                    style={{ color: phase.color }}
                  >
                    Explore
                    <span
                      aria-hidden
                      className="transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none"
                    >
                      &rarr;
                    </span>
                  </span>
                </div>

                {/* Stats row */}
                <dl className="mt-3 flex gap-0 overflow-hidden rounded-lg border-t border-[#F0F0F0] font-mono text-xs text-[#525252] dark:border-white/5 dark:text-[#a0a0a8]">
                  <div className="flex-1 bg-[#FAFAFA] px-3 py-3 dark:bg-white/[0.02]">
                    <dt className="text-[#A3A3A3] dark:text-[#6b6b75]">Hours</dt>
                    <dd className="mt-0.5 font-medium text-[#171717] dark:text-[#f0f0f0]">
                      {phase.hours}
                    </dd>
                  </div>
                  <div className="flex-1 px-3 py-3">
                    <dt className="text-[#A3A3A3] dark:text-[#6b6b75]">Modules</dt>
                    <dd className="mt-0.5 font-medium text-[#171717] dark:text-[#f0f0f0]">
                      {phase.modules}
                    </dd>
                  </div>
                  <div className="flex-1 bg-[#FAFAFA] px-3 py-3 dark:bg-white/[0.02]">
                    <dt className="text-[#A3A3A3] dark:text-[#6b6b75]">Lessons</dt>
                    <dd className="mt-0.5 font-medium text-[#171717] dark:text-[#f0f0f0]">
                      {phase.lessons}
                    </dd>
                  </div>
                </dl>
              </motion.article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
