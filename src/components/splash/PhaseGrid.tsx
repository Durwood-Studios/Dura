"use client";

import { motion } from "motion/react";
import {
  Sprout,
  Code2,
  Cpu,
  Database,
  Globe,
  Layers,
  Boxes,
  Cloud,
  Shield,
  Crown,
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
    title: "Foundations",
    subtitle: "Computing literacy & first principles",
    hours: 120,
    modules: 8,
    lessons: 64,
  },
  {
    number: 1,
    color: "#93c5fd",
    icon: <Code2 className="h-5 w-5" />,
    title: "Programming",
    subtitle: "Syntax, semantics, problem solving",
    hours: 240,
    modules: 12,
    lessons: 96,
  },
  {
    number: 2,
    color: "#c4b5fd",
    icon: <Cpu className="h-5 w-5" />,
    title: "Systems",
    subtitle: "Memory, processes, the machine",
    hours: 280,
    modules: 14,
    lessons: 112,
  },
  {
    number: 3,
    color: "#fda4af",
    icon: <Layers className="h-5 w-5" />,
    title: "Data Structures & Algorithms",
    subtitle: "The vocabulary of computation",
    hours: 320,
    modules: 16,
    lessons: 128,
  },
  {
    number: 4,
    color: "#fdba74",
    icon: <Database className="h-5 w-5" />,
    title: "Databases",
    subtitle: "Modeling, querying, persistence",
    hours: 260,
    modules: 12,
    lessons: 100,
  },
  {
    number: 5,
    color: "#f0abfc",
    icon: <Globe className="h-5 w-5" />,
    title: "Web & Networks",
    subtitle: "Protocols, browsers, the wire",
    hours: 280,
    modules: 14,
    lessons: 112,
  },
  {
    number: 6,
    color: "#67e8f9",
    icon: <Boxes className="h-5 w-5" />,
    title: "Software Engineering",
    subtitle: "Design, testing, collaboration",
    hours: 300,
    modules: 14,
    lessons: 116,
  },
  {
    number: 7,
    color: "#fcd34d",
    icon: <Cloud className="h-5 w-5" />,
    title: "Cloud & DevOps",
    subtitle: "Ship, scale, observe",
    hours: 280,
    modules: 12,
    lessons: 100,
  },
  {
    number: 8,
    color: "#a3e635",
    icon: <Shield className="h-5 w-5" />,
    title: "Security & Reliability",
    subtitle: "Trust, threat models, resilience",
    hours: 280,
    modules: 12,
    lessons: 100,
  },
  {
    number: 9,
    color: "#f472b6",
    icon: <Crown className="h-5 w-5" />,
    title: "Leadership",
    subtitle: "Architecture, teams, judgment",
    hours: 290,
    modules: 12,
    lessons: 96,
  },
];

export function PhaseGrid(): React.ReactElement {
  return (
    <section className="bg-[#F5F5F4] px-6 py-24 sm:py-32 dark:bg-[#0a0a0f]">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-semibold tracking-tight text-[#171717] sm:text-5xl dark:text-[#f0f0f0]">
            Ten phases. One path.
          </h2>
          <p className="mt-4 text-lg text-[#525252] dark:text-[#a0a0a8]">
            A complete arc from first keystroke to engineering leadership.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PHASES.map((phase, i) => (
            <motion.article
              key={phase.number}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.05, ease: "easeOut" }}
              className="group relative overflow-hidden rounded-xl border border-[#E5E5E5] bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-shadow duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] dark:border-white/8 dark:bg-white/[0.03] dark:shadow-none dark:hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
            >
              {/* Color bar */}
              <div
                aria-hidden
                className="absolute inset-x-0 top-0 h-1"
                style={{ background: phase.color }}
              />

              <div className="flex items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-[#171717] dark:text-[#f0f0f0]"
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

              {/* "Explore" slide-in on hover */}
              <div className="mt-3 h-5 overflow-hidden">
                <span
                  className="inline-flex translate-x-[-10px] items-center gap-1 text-sm font-medium opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 motion-reduce:transition-none"
                  style={{ color: phase.color }}
                >
                  Explore
                  <span
                    aria-hidden
                    className="transition-transform duration-200 group-hover:translate-x-0.5"
                  >
                    &rarr;
                  </span>
                </span>
              </div>

              <dl className="mt-3 flex gap-0 overflow-hidden rounded-lg border-t border-[#F0F0F0] pt-0 font-mono text-xs text-[#525252] dark:border-white/5 dark:text-[#a0a0a8]">
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
          ))}
        </div>
      </div>
    </section>
  );
}
