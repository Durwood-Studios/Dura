"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, Search, Filter, Clock, BookOpen } from "lucide-react";
import { cn, formatMinutes } from "@/lib/utils";
import type { LessonTreeNode, StandardRef } from "@/lib/curriculum";

interface CurriculumBrowserProps {
  tree: LessonTreeNode[];
  standards: StandardRef[];
  totalAuthored: number;
  totalTarget: number;
}

type Framework = StandardRef["framework"];

const FRAMEWORK_LABELS: Record<Framework, string> = {
  cs2023: "ACM CS2023",
  swebok: "SWEBOK v4",
  sfia: "SFIA 9",
  bloom: "Bloom",
  dreyfus: "Dreyfus",
};

export function CurriculumBrowser({
  tree,
  standards,
  totalAuthored,
  totalTarget,
}: CurriculumBrowserProps): React.ReactElement {
  const [query, setQuery] = useState("");
  const [framework, setFramework] = useState<Framework | "all">("all");
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(["0"]));

  const toggle = (key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // Which lessons match the active standards filter?
  const standardLessonIds = useMemo(() => {
    if (!selectedCode) return null;
    const ref = standards.find(
      (s) => (framework === "all" || s.framework === framework) && s.code === selectedCode
    );
    return ref ? new Set(ref.lessonIds) : new Set<string>();
  }, [standards, framework, selectedCode]);

  // Filtered standards list (honors the framework dropdown)
  const visibleStandards = useMemo(() => {
    if (framework === "all") return standards;
    return standards.filter((s) => s.framework === framework);
  }, [standards, framework]);

  // Text search filter
  const lowerQuery = query.trim().toLowerCase();

  const matchesSearch = (text: string) => !lowerQuery || text.toLowerCase().includes(lowerQuery);

  const coverage = totalTarget === 0 ? 0 : Math.round((totalAuthored / totalTarget) * 100);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
      {/* Sidebar filters */}
      <aside className="flex flex-col gap-5 lg:sticky lg:top-20 lg:self-start">
        <div>
          <label className="font-mono text-[10px] text-[var(--color-text-muted)] uppercase">
            Search
          </label>
          <div className="relative mt-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search titles…"
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] py-1.5 pr-2 pl-8 text-xs"
            />
          </div>
        </div>

        <div>
          <label className="font-mono text-[10px] text-[var(--color-text-muted)] uppercase">
            Framework
          </label>
          <select
            value={framework}
            onChange={(e) => {
              setFramework(e.target.value as Framework | "all");
              setSelectedCode(null);
            }}
            className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-2 py-1.5 text-xs"
          >
            <option value="all">All frameworks</option>
            {(Object.keys(FRAMEWORK_LABELS) as Framework[]).map((f) => (
              <option key={f} value={f}>
                {FRAMEWORK_LABELS[f]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="flex items-center gap-1 font-mono text-[10px] text-[var(--color-text-muted)] uppercase">
            <Filter className="h-3 w-3" /> Standards
          </label>
          <div className="mt-1 max-h-[320px] overflow-y-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-1">
            {visibleStandards.length === 0 ? (
              <p className="p-2 text-[11px] text-[var(--color-text-muted)]">
                No standards tagged yet.
              </p>
            ) : (
              <ul className="flex flex-col gap-0.5">
                <li>
                  <button
                    type="button"
                    onClick={() => setSelectedCode(null)}
                    className={cn(
                      "w-full rounded px-2 py-1 text-left text-[11px]",
                      selectedCode === null
                        ? "bg-emerald-50 text-emerald-700"
                        : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]"
                    )}
                  >
                    Any
                  </button>
                </li>
                {visibleStandards.map((s) => (
                  <li key={`${s.framework}:${s.code}`}>
                    <button
                      type="button"
                      onClick={() => setSelectedCode(s.code)}
                      className={cn(
                        "flex w-full items-center justify-between rounded px-2 py-1 text-left text-[11px]",
                        selectedCode === s.code
                          ? "bg-emerald-50 text-emerald-700"
                          : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]"
                      )}
                    >
                      <span className="truncate">
                        <span className="font-mono text-[9px] text-[var(--color-text-muted)] uppercase">
                          {s.framework}
                        </span>{" "}
                        {s.code}
                      </span>
                      <span className="shrink-0 rounded-full bg-[var(--color-bg-subtle)] px-1.5 font-mono text-[9px] text-[var(--color-text-muted)]">
                        {s.lessonIds.length}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-3">
          <p className="font-mono text-[10px] text-[var(--color-text-muted)] uppercase">Coverage</p>
          <p className="mt-1 text-xl font-semibold text-[var(--color-text-primary)]">
            {totalAuthored} / {totalTarget}
          </p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--color-bg-subtle)]">
            <div
              className="h-full bg-emerald-500 transition-all"
              style={{ width: `${coverage}%` }}
            />
          </div>
          <p className="mt-1 text-[10px] text-[var(--color-text-muted)]">
            {coverage}% of target lessons authored
          </p>
        </div>
      </aside>

      {/* Tree */}
      <section className="flex flex-col gap-3">
        {tree.map((node) => {
          const phaseKey = node.phase.id;
          const isPhaseOpen = expanded.has(phaseKey);

          // Pre-compute which lessons in this phase match current filters
          const filteredModules = node.modules
            .map((m) => {
              const lessons = m.lessons.filter((l) => {
                if (standardLessonIds && !standardLessonIds.has(l.id)) return false;
                return (
                  matchesSearch(l.title) ||
                  matchesSearch(l.description ?? "") ||
                  matchesSearch(m.module.title)
                );
              });
              return { module: m.module, lessons };
            })
            .filter((m) => m.lessons.length > 0 || matchesSearch(m.module.title));

          // Hide phases that have no matching lessons when a filter is active
          const hasFilter = lowerQuery.length > 0 || selectedCode !== null;
          if (hasFilter && filteredModules.length === 0) return null;

          const authoredInPhase = node.modules.reduce((sum, m) => sum + m.lessons.length, 0);

          return (
            <article
              key={phaseKey}
              className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)]"
            >
              <button
                type="button"
                onClick={() => toggle(phaseKey)}
                className="flex w-full items-center gap-3 px-5 py-4 text-left transition hover:bg-[var(--color-bg-subtle)]"
              >
                {isPhaseOpen ? (
                  <ChevronDown className="h-4 w-4 text-[var(--color-text-muted)]" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-[var(--color-text-muted)]" />
                )}
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: node.phase.color }}
                />
                <div className="flex-1">
                  <p className="font-mono text-[10px] tracking-widest text-[var(--color-text-muted)] uppercase">
                    Phase {node.phase.id}
                  </p>
                  <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
                    {node.phase.title}
                  </h3>
                  <p className="text-xs text-[var(--color-text-muted)]">{node.phase.tagline}</p>
                </div>
                <span className="text-[10px] text-[var(--color-text-muted)]">
                  {authoredInPhase}/{node.phase.lessonCount} lessons
                </span>
              </button>

              {isPhaseOpen && (
                <div className="border-t border-[var(--color-border)] px-5 py-4">
                  {(hasFilter
                    ? filteredModules
                    : node.modules.map((m) => ({ module: m.module, lessons: m.lessons }))
                  ).map((modulePair) => {
                    const moduleKey = `${phaseKey}:${modulePair.module.id}`;
                    const isModuleOpen = expanded.has(moduleKey);
                    return (
                      <div key={moduleKey} className="mb-3 last:mb-0">
                        <button
                          type="button"
                          onClick={() => toggle(moduleKey)}
                          className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition hover:bg-[var(--color-bg-subtle)]"
                        >
                          {isModuleOpen ? (
                            <ChevronDown className="h-3 w-3 text-[var(--color-text-muted)]" />
                          ) : (
                            <ChevronRight className="h-3 w-3 text-[var(--color-text-muted)]" />
                          )}
                          <span className="flex-1 text-sm font-medium text-[var(--color-text-primary)]">
                            {modulePair.module.title}
                          </span>
                          <span className="text-[10px] text-[var(--color-text-muted)]">
                            {modulePair.lessons.length}/{modulePair.module.lessonCount}
                          </span>
                        </button>
                        {isModuleOpen && modulePair.lessons.length > 0 && (
                          <ul className="mt-1 ml-5 flex flex-col gap-1 border-l border-[var(--color-border-subtle)] pl-3">
                            {modulePair.lessons.map((lesson) => (
                              <li key={lesson.id}>
                                <Link
                                  href={`/paths/${lesson.phaseId}/${lesson.moduleId}/${lesson.id}`}
                                  className="flex items-center gap-2 rounded-md px-2 py-1 text-xs transition hover:bg-[var(--color-bg-subtle)]"
                                >
                                  <BookOpen className="h-3 w-3 text-emerald-500" aria-hidden />
                                  <span className="flex-1 text-[var(--color-text-primary)]">
                                    {lesson.title}
                                  </span>
                                  <span className="inline-flex items-center gap-1 text-[10px] text-[var(--color-text-muted)]">
                                    <Clock className="h-2.5 w-2.5" />
                                    {formatMinutes(lesson.estimatedMinutes)}
                                  </span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                        {isModuleOpen && modulePair.lessons.length === 0 && (
                          <p className="mt-1 ml-5 text-[10px] text-[var(--color-text-muted)] italic">
                            Lessons not yet authored.
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </article>
          );
        })}
      </section>
    </div>
  );
}
