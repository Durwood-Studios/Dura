"use client";

import { useEffect, useRef, useState } from "react";
import { useAnimate, motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { ArrowRight, RotateCcw, Wifi, WifiOff } from "lucide-react";
import { useDojoStore } from "@/stores/dojo";
import { SPRINGS } from "@/lib/motion/springs";
import { useMotionPreference } from "@/hooks/use-reduced-motion";
import { haptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";
import { track } from "@/lib/analytics";

// ── Score color mapping (DLS-2.0 §Signature 5) ──────────────────────────────
function scoreColor(score: number): string {
  if (score >= 9) return "oklch(65% 0.18 250)"; // --color-rating-easy (blue)
  if (score >= 7) return "oklch(68% 0.18 145)"; // --color-rating-good (green)
  if (score >= 5) return "oklch(72% 0.18 75)"; // --color-rating-hard (amber)
  return "oklch(65% 0.2 25)"; // --color-rating-again (red)
}

// ── Inference status indicator (P16 — the one glass surface) ────────────────
function InferenceStatus(): React.ReactElement {
  const tier = useDojoStore((s) => s.tier);
  const tierProbed = useDojoStore((s) => s.tierProbed);

  if (!tierProbed) return <></>;

  return (
    <div
      className="inference-status-glass fixed top-4 right-4 z-[60] flex items-center gap-2 text-xs"
      aria-label={tier === "T1" ? "Ollama connected" : "Offline mode"}
    >
      <span
        className={cn("h-2 w-2 rounded-full", tier === "T1" ? "bg-emerald-400" : "bg-neutral-500")}
        aria-hidden
      />
      {tier === "T1" ? (
        <span className="text-[var(--color-text-secondary)]">Ollama · phi3.5:mini</span>
      ) : (
        <span className="text-[var(--color-text-muted)]">Offline · Question Bank</span>
      )}
    </div>
  );
}

// ── READY state — P17 "The Bell" + P19 ambient breath ───────────────────────
function DojoReady(): React.ReactElement {
  const { shouldAnimate } = useMotionPreference();
  const [wrapScope, animateWrap] = useAnimate();
  const [titleScope, animateTitle] = useAnimate();
  const [promptScope, animatePrompt] = useAnimate();
  const [indicatorScope, animateIndicator] = useAnimate();
  const ran = useRef(false);
  const beginQuestion = useDojoStore((s) => s.beginQuestion);
  const questions = useDojoStore((s) => s.questions);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    if (!shouldAnimate) return;

    // P17 Phase 1 (0–200ms): chrome fades, background desaturates
    void animateWrap(
      wrapScope.current,
      { filter: ["saturate(1)", "saturate(0.2)"] },
      { duration: 0.2, ease: "easeOut" }
    );

    // P17 Phase 2 (200–400ms): mode title enters
    void animateTitle(
      titleScope.current,
      { opacity: [0, 1], y: [-12, 0] },
      { ...SPRINGS.settle, duration: undefined, delay: 0.2 }
    );

    // P17 Phase 4 (600–800ms): prompt + indicator
    void animatePrompt(promptScope.current, { opacity: [0, 1] }, { duration: 0.2, delay: 0.6 });
    void animateIndicator(
      indicatorScope.current,
      { opacity: [0, 1] },
      { duration: 0.2, delay: 0.65 }
    );

    // P17 Phase 4 haptic
    const t = setTimeout(() => haptic("sessionStart"), 650);

    // P19: 8-second ambient breath
    void animateWrap(
      wrapScope.current,
      {
        background: [
          "radial-gradient(ellipse at 50% 100%, oklch(6% 0 0) 0%, oklch(4% 0 0) 100%)",
          "radial-gradient(ellipse at 50% 100%, oklch(8% 0.02 250) 0%, oklch(4% 0 0) 100%)",
          "radial-gradient(ellipse at 50% 100%, oklch(6% 0 0) 0%, oklch(4% 0 0) 100%)",
        ],
      },
      { duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.8 }
    );

    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBegin = (): void => {
    haptic("sessionStart");
    beginQuestion();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.code === "Space") {
        e.preventDefault();
        handleBegin();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={wrapScope}
      className="flex min-h-[70vh] flex-col items-center justify-center text-center"
    >
      <p
        ref={titleScope}
        className="font-mono text-xs tracking-[0.25em] text-[var(--color-text-muted)] uppercase"
        style={{ opacity: shouldAnimate ? 0 : 1 }}
      >
        DOJO SESSION — {questions.length} QUESTIONS
      </p>
      <h1 className="mt-4 text-5xl font-bold tracking-tight text-[var(--color-text-primary)]">
        Ready?
      </h1>
      <p
        ref={promptScope}
        className="mt-6 text-sm text-[var(--color-text-secondary)]"
        style={{ opacity: shouldAnimate ? 0 : 1 }}
      >
        Press{" "}
        <kbd className="rounded border border-[var(--color-border)] px-1.5 py-0.5 font-mono text-xs">
          Space
        </kbd>{" "}
        to begin
      </p>
      <button
        ref={indicatorScope}
        type="button"
        onClick={handleBegin}
        className="mt-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-6 py-3 text-sm font-semibold text-[var(--color-text-primary)] transition hover:bg-[var(--color-bg-subtle)]"
        style={{ opacity: shouldAnimate ? 0 : 1 }}
      >
        Begin session
      </button>
    </div>
  );
}

// ── QUESTION state ───────────────────────────────────────────────────────────
function DojoQuestion(): React.ReactElement {
  const { shouldAnimate } = useMotionPreference();
  const [cardScope, animateCard] = useAnimate();
  const question = useDojoStore((s) => s.questions[s.currentIndex]);
  const currentIndex = useDojoStore((s) => s.currentIndex);
  const totalQuestions = useDojoStore((s) => s.questions.length);
  const answer = useDojoStore((s) => s.answer);
  const setAnswer = useDojoStore((s) => s.setAnswer);
  const submitAnswer = useDojoStore((s) => s.submitAnswer);
  const ran = useRef(false);

  useEffect(() => {
    ran.current = false;
  }, [currentIndex]);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    if (!shouldAnimate || !cardScope.current) return;
    // P17 Phase 3: card materializes (scale + opacity + blur)
    void animateCard(
      cardScope.current,
      { scale: [0.94, 1], opacity: [0, 1], filter: ["blur(8px)", "blur(0px)"] },
      { ...SPRINGS.fluid, duration: undefined }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, shouldAnimate]);

  if (!question) return <></>;

  return (
    <div className="mx-auto max-w-2xl py-12">
      <div className="mb-6 flex items-center justify-between text-xs text-[var(--color-text-muted)]">
        <span className="font-mono">
          {currentIndex + 1} / {totalQuestions}
        </span>
        <span className="rounded-full border border-[var(--color-border)] px-2.5 py-0.5">
          Phase {question.phase}
        </span>
      </div>

      <div
        ref={cardScope}
        className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-8"
        style={{ opacity: shouldAnimate ? 0 : 1 }}
      >
        <p className="mb-1 font-mono text-[10px] tracking-widest text-[var(--color-text-muted)] uppercase">
          Question
        </p>
        <h2 className="text-xl leading-relaxed font-semibold text-[var(--color-text-primary)]">
          {question.text}
        </h2>

        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Type your answer…"
          rows={5}
          className="mt-6 w-full resize-none rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] focus:outline-none"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && answer.trim()) {
              void submitAnswer();
            }
          }}
        />
        <p className="mt-1 text-[10px] text-[var(--color-text-muted)]">⌘↵ to submit</p>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={() => void submitAnswer()}
          disabled={!answer.trim()}
          className={cn(
            "rounded-xl px-5 py-2.5 text-sm font-semibold transition",
            answer.trim()
              ? "bg-[var(--color-accent)] text-white hover:opacity-90"
              : "cursor-not-allowed bg-[var(--color-bg-subtle)] text-[var(--color-text-muted)]"
          )}
        >
          Submit
        </button>
      </div>
    </div>
  );
}

// ── EVALUATING state ─────────────────────────────────────────────────────────
function DojoEvaluating(): React.ReactElement {
  const streamedText = useDojoStore((s) => s.streamedText);
  const tier = useDojoStore((s) => s.tier);
  const [showCursor, setShowCursor] = useState(true);

  // Blinking cursor
  useEffect(() => {
    const id = setInterval(() => setShowCursor((v) => !v), 530);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="mx-auto max-w-2xl py-12">
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-8">
        <p className="mb-4 font-mono text-[10px] tracking-widest text-[var(--color-text-muted)] uppercase">
          {tier === "T1" ? "Evaluating…" : "Scoring…"}
        </p>
        {tier === "T1" ? (
          <div className="min-h-[80px] text-sm leading-relaxed text-[var(--color-text-secondary)]">
            {streamedText}
            {/* DLS-2.0 §Signature 5 Phase 1: blinking cursor follows text */}
            <span
              className="ml-px inline-block h-4 w-0.5 translate-y-0.5 bg-[var(--color-accent)] align-middle"
              style={{ opacity: showCursor ? 1 : 0, transition: "opacity 100ms" }}
              aria-hidden
            />
          </div>
        ) : (
          <div className="flex items-center gap-3 text-sm text-[var(--color-text-secondary)]">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-accent)]" />
            Scoring your answer…
          </div>
        )}
      </div>
    </div>
  );
}

// ── SCORED state — P18 "The Verdict" ────────────────────────────────────────
function DojoScored(): React.ReactElement {
  const { shouldAnimate } = useMotionPreference();
  const grade = useDojoStore((s) => s.currentGrade);
  const nextQuestion = useDojoStore((s) => s.nextQuestion);
  const [badgeScope, animateBadge] = useAnimate();
  const [gapScope, animateGap] = useAnimate();
  const [nextScope, animateNext] = useAnimate();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current || !grade) return;
    ran.current = true;

    if (!shouldAnimate) {
      haptic("ratingGood");
      return;
    }

    // Phase 3: cursor blinked 3x then dissolved — handled in parent
    // Phase 3: score badge enters (SPRINGS.bounce — the one use)
    void animateBadge(
      badgeScope.current,
      { scale: [0.6, 1], opacity: [0, 1] },
      { ...SPRINGS.bounce, duration: undefined }
    );

    // Phase 4: gap sentence rises (300ms delay)
    void animateGap(
      gapScope.current,
      { opacity: [0, 1], y: [4, 0] },
      { ...SPRINGS.fluid, duration: undefined, delay: 0.3 }
    );

    // Phase 5: next prompt (600ms delay)
    void animateNext(nextScope.current, { opacity: [0, 1] }, { duration: 0.2, delay: 0.6 });

    haptic("ratingGood");
    void track("dojo_question_graded", { score: grade.score, tier: grade.tier });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "n" || e.key === "N" || e.key === "ArrowRight") {
        e.preventDefault();
        nextQuestion();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [nextQuestion]);

  if (!grade) return <></>;

  const color = scoreColor(grade.score);

  return (
    <div className="mx-auto max-w-2xl py-12">
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-8">
        {/* Score badge */}
        <div className="mb-6 flex items-center gap-4">
          <div
            ref={badgeScope}
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 font-mono text-lg font-bold"
            style={{
              borderColor: color,
              color,
              opacity: shouldAnimate ? 0 : 1,
            }}
          >
            {grade.score}
          </div>
          <div ref={gapScope} className="flex-1" style={{ opacity: shouldAnimate ? 0 : 1 }}>
            <p className="text-sm text-[var(--color-text-secondary)]">{grade.gap}</p>
          </div>
        </div>

        {/* Full feedback */}
        <div className="rounded-xl bg-[var(--color-bg-subtle)] p-4">
          <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
            {grade.feedback}
          </p>
          {grade.tier === "T3" && (
            <p className="mt-2 flex items-center gap-1.5 text-[10px] text-[var(--color-text-muted)]">
              <WifiOff className="h-3 w-3" aria-hidden />
              Offline scoring — start Ollama for AI feedback
            </p>
          )}
        </div>

        {/* Next prompt */}
        <div
          ref={nextScope}
          className="mt-6 flex items-center justify-between"
          style={{ opacity: shouldAnimate ? 0 : 1 }}
        >
          <span className="text-xs text-[var(--color-text-muted)]">
            Press{" "}
            <kbd className="rounded border border-[var(--color-border)] px-1.5 py-0.5 font-mono text-[10px]">
              N
            </kbd>{" "}
            or{" "}
            <kbd className="rounded border border-[var(--color-border)] px-1.5 py-0.5 font-mono text-[10px]">
              →
            </kbd>{" "}
            to continue
          </span>
          <button
            type="button"
            onClick={nextQuestion}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Next <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── COMPLETE state ───────────────────────────────────────────────────────────
function DojoComplete(): React.ReactElement {
  const results = useDojoStore((s) => s.results);
  const reset = useDojoStore((s) => s.reset);
  const startSession = useDojoStore((s) => s.startSession);

  const avgScore =
    results.length > 0
      ? Math.round((results.reduce((sum, r) => sum + r.grade.score, 0) / results.length) * 10) / 10
      : 0;

  const weakest = results
    .slice()
    .sort((a, b) => a.grade.score - b.grade.score)
    .slice(0, 1)[0];

  return (
    <div className="mx-auto max-w-xl py-16 text-center">
      <p className="font-mono text-[10px] tracking-widest text-[var(--color-text-muted)] uppercase">
        Session Complete
      </p>
      <p className="mt-4 text-5xl font-bold" style={{ color: scoreColor(avgScore) }}>
        {avgScore}
        <span className="text-2xl text-[var(--color-text-muted)]">/10</span>
      </p>
      <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
        Average score across {results.length} question{results.length !== 1 ? "s" : ""}
      </p>

      {weakest && (
        <div className="mx-auto mt-6 max-w-sm rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4 text-left">
          <p className="text-[10px] font-medium tracking-widest text-[var(--color-text-muted)] uppercase">
            Focus area
          </p>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{weakest.grade.gap}</p>
        </div>
      )}

      <div className="mt-8 flex justify-center gap-3">
        <button
          type="button"
          onClick={() => {
            reset();
            startSession();
          }}
          className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-4 py-2.5 text-sm font-medium text-[var(--color-text-primary)] transition hover:bg-[var(--color-bg-subtle)]"
        >
          <RotateCcw className="h-4 w-4" />
          New session
        </button>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Dashboard <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

// ── Setup / phase picker ─────────────────────────────────────────────────────
const PHASE_OPTIONS = [
  { value: undefined, label: "Mixed (all phases)" },
  { value: "0", label: "Phase 0 — Digital Literacy" },
  { value: "1", label: "Phase 1 — Programming Fundamentals" },
  { value: "2", label: "Phase 2 — Web Development" },
  { value: "3", label: "Phase 3 — CS Fundamentals" },
  { value: "4", label: "Phase 4 — Backend Engineering" },
  { value: "5", label: "Phase 5 — Systems Engineering" },
  { value: "6", label: "Phase 6 — AI/ML Engineering" },
  { value: "7", label: "Phase 7 — Advanced Systems" },
  { value: "8", label: "Phase 8 — Professional Practice" },
  { value: "9", label: "Phase 9 — CTO Track" },
];

function DojoSetup(): React.ReactElement {
  const [phase, setPhase] = useState<string | undefined>(undefined);
  const probeTier = useDojoStore((s) => s.probeTier);
  const startSession = useDojoStore((s) => s.startSession);
  const tier = useDojoStore((s) => s.tier);
  const tierProbed = useDojoStore((s) => s.tierProbed);

  useEffect(() => {
    void probeTier();
  }, [probeTier]);

  return (
    <div className="mx-auto max-w-lg py-16">
      <h1 className="text-4xl font-bold tracking-tight text-[var(--color-text-primary)]">Dojo</h1>
      <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
        Open-ended questions graded by AI. Answer in your own words.
      </p>

      {/* Tier status */}
      <div className="mt-4 flex items-center gap-2 text-xs">
        {tierProbed ? (
          tier === "T1" ? (
            <>
              <Wifi className="h-3.5 w-3.5 text-emerald-500" aria-hidden />
              <span className="text-[var(--color-text-secondary)]">
                Ollama · phi3.5:mini connected — AI grading active
              </span>
            </>
          ) : (
            <>
              <WifiOff className="h-3.5 w-3.5 text-[var(--color-text-muted)]" aria-hidden />
              <span className="text-[var(--color-text-muted)]">
                Ollama not found — rule-based scoring.{" "}
                <code className="font-mono">ollama run phi3.5:mini</code> to enable AI grading.
              </span>
            </>
          )
        ) : (
          <span className="text-[var(--color-text-muted)]">Checking Ollama…</span>
        )}
      </div>

      <div className="mt-8">
        <label
          htmlFor="dojo-phase-select"
          className="block text-sm font-medium text-[var(--color-text-primary)]"
        >
          Phase
        </label>
        <select
          id="dojo-phase-select"
          value={phase ?? ""}
          onChange={(e) => setPhase(e.target.value || undefined)}
          className="mt-1.5 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-accent)] focus:outline-none"
        >
          {PHASE_OPTIONS.map((o) => (
            <option key={o.label} value={o.value ?? ""}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        onClick={() => startSession(phase)}
        className="mt-6 w-full rounded-xl bg-[var(--color-accent)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
      >
        Start session
      </button>
    </div>
  );
}

// ── Root component ───────────────────────────────────────────────────────────
export function DojoClient(): React.ReactElement {
  const flowState = useDojoStore((s) => s.flowState);
  const questions = useDojoStore((s) => s.questions);

  // P20: Classroom ↔ Dojo transition handled by PageTransition at the layout
  // level (Dojo route is /dojo, not /paths/…, so it triggers naturally).

  return (
    <>
      <InferenceStatus />
      <AnimatePresence mode="wait">
        {questions.length === 0 ? (
          <motion.div
            key="setup"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <DojoSetup />
          </motion.div>
        ) : flowState === "READY" ? (
          <motion.div
            key="ready"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <DojoReady />
          </motion.div>
        ) : flowState === "QUESTION" || flowState === "CONTINUING" ? (
          <motion.div
            key={`question-${useDojoStore.getState().currentIndex}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <DojoQuestion />
          </motion.div>
        ) : flowState === "EVALUATING" ? (
          <motion.div
            key="evaluating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
          >
            <DojoEvaluating />
          </motion.div>
        ) : flowState === "SCORED" ? (
          <motion.div
            key={`scored-${useDojoStore.getState().currentIndex}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
          >
            <DojoScored />
          </motion.div>
        ) : (
          <motion.div
            key="complete"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ ...SPRINGS.settle, duration: undefined }}
          >
            <DojoComplete />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
