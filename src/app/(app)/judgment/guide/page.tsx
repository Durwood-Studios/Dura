import type { Metadata } from "next";
import { JudgmentPrintButton } from "@/components/judgment/JudgmentPrintButton";
import { JUDGMENT_CASES, JUDGMENT_RUBRICS, JUDGMENT_SOURCES } from "@/lib/judgment/cases";
export const metadata: Metadata = { title: "Engineering judgment teacher guide — DURA" };
/** Printable facilitation instructions and full rubric, separate from learner self-assessment. */
export default function JudgmentGuidePage(): React.ReactElement {
  return (
    <main className="mx-auto max-w-[850px] space-y-7 px-4 py-10 print:max-w-none print:px-0 print:text-black">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold">Engineering judgment: teacher guide</h1>
        <p>
          Use the case to observe reasoning, not answer-key matching. The learner commits an initial
          decision, receives new evidence, revises, then self-reviews against explicit criteria.
          Instructor evaluation requires your own review of the written evidence and context.
        </p>
        <JudgmentPrintButton />
      </header>
      <section>
        <h2 className="text-xl font-semibold">Facilitation sequence</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5">
          <li>
            Check prerequisites and read the brief. In the guided case, discuss the worked starting
            example.
          </li>
          <li>
            Ask the learner to distinguish observations, assumptions, constraints, and missing
            information. Commit a choice and its rationale before revealing new evidence.
          </li>
          <li>
            Reveal the counterevidence. A justified revision can retain the original option; demand
            a reason for either choice.
          </li>
          <li>
            Compare the revision with the worked example. Use the rubric anchors to discuss what the
            written response demonstrates and what remains unsupported.
          </li>
          <li>
            Record learner self-ratings separately from your own feedback. Ask for an analogous case
            after a delay; seven days is the app default and may be adapted.
          </li>
        </ol>
        <p className="mt-3 text-sm">
          No automatic reasoning score, XP, accreditation, certification, or professional competence
          claim follows from completion. Do not convert self-confidence into a calibrated success
          probability.
        </p>
      </section>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Evidence-anchored self-review rubric</h2>
        {JUDGMENT_RUBRICS.map((rubric) => (
          <article
            key={rubric.id}
            className="break-inside-avoid rounded-lg border border-[var(--color-border)] p-4"
          >
            <h3 className="font-semibold">{rubric.title}</h3>
            <ol start={0} className="mt-2 list-decimal space-y-2 pl-6 text-sm">
              {rubric.anchors.map((anchor) => (
                <li key={anchor}>{anchor}</li>
              ))}
            </ol>
          </article>
        ))}
      </section>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Case notes</h2>
        {JUDGMENT_CASES.map((scenario) => (
          <article
            key={scenario.id}
            className="break-inside-avoid space-y-2 border-t border-[var(--color-border)] pt-4"
          >
            <h3 className="font-semibold">
              {scenario.title} · version {scenario.version}
            </h3>
            <p className="text-sm">{scenario.teacherNotes}</p>
            <p className="text-sm">
              <strong>Transfer prompt:</strong> {scenario.transferPrompt}
            </p>
          </article>
        ))}
      </section>
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Sources and application boundaries</h2>
        {JUDGMENT_SOURCES.map((source) => (
          <div key={source.id} className="break-inside-avoid text-sm">
            <a className="font-semibold underline" href={source.url}>
              {source.title}
            </a>
            <p className="mt-1 break-words">{source.scope}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
