# DURA Lesson Pedagogy Standard 1.0

**Version:** 1.0 | **Date:** 2026-05-18 | **Status:** Active
**Depends on:** none (foundational pedagogy standard)
**Governs:** every `.mdx` file under `src/content/phases/**`
**One sentence:** Every DURA lesson walks a learner with the listed prerequisites and nothing else from zero understanding to verifiable competency in the lesson's topic.

---

## Purpose

DURA's marketing claims rigor. The Lesson Pedagogy Standard makes the claim falsifiable. It defines the structural and stylistic rules every lesson must follow so the promise "if you read this, you'll actually understand this" is enforceable in code review, not just a hope.

The 10x constraint LP-1.0 breaks: most coding-education lessons assume the reader is "more or less" at the right level and lose the long tail of learners who aren't. LP-1.0 makes the entry contract explicit and machine-checkable.

---

## The Core Invariant

> **A learner who has completed the lessons listed in `prerequisites` and read the terms linked via `<VocabTooltip>` must be able to demonstrate the lesson's competency check by the end of the lesson, without needing to leave the page.**

Three things follow from this:

1. **The lesson is self-contained.** Any term, concept, or syntax used and not explained must be linked to an atomic explainer (`<VocabTooltip slug="...">` for vocabulary, an inline link for a prior lesson). "Obviously", "as you know", and "of course" are banned.
2. **The prerequisites are real.** If you reference a function, pattern, or concept, the lesson that taught it must be in `prerequisites:` — or the concept must be reintroduced inline.
3. **The competency check is the contract.** The end-of-lesson check (Quiz, SandboxExercise, FillBlank, or explicit prose checklist) is the falsifiable claim that the lesson succeeded. No competency check, no lesson.

---

## Frontmatter Contract

Every `.mdx` lesson MUST have:

```yaml
---
title: string # required
description: string # required, 1-sentence learner-facing pitch
phase: number # required
module: string # required, e.g. "0-1-how-computers-think"
order: number # required
estimatedMinutes: number # required, honest — see Lesson Duration below
difficulty: 1 | 2 | 3 | 4 | 5 # required
prerequisites:
  string[] # REQUIRED — lesson IDs OR vocab slugs;
  #   "[]" only valid for absolute-foundation lessons
standards:
  cs2023: string[] # required if applicable
  swebok: string[] # required if applicable
  bloom: BloomLevel # required — see Bloom Mapping below
  sfia: number # required for phases 4+
  dreyfus: DreyfusStage # required
vocabulary: string[] # required — every term defined in this lesson
learningOutcomes:
  string[] # REQUIRED — "After this lesson you can: …"
  #   Must be measurable. "Understand X" is banned;
  #   "Explain why X happens" or "Write a function
  #   that does X" is acceptable.
professionalContext: string # required for Bloom evaluate / create
thresholdConcept: boolean # required, default false
---
```

Fields marked **REQUIRED** that today are optional in the type system are graduating to required under LP-1.0. The migration plan lives in [Conformance Migration](#conformance-migration) below.

### Bloom Mapping

`bloom` is the cognitive level the lesson actually trains. It MUST match the competency check:

| Bloom level | Competency check shape                                   |
| ----------- | -------------------------------------------------------- |
| remember    | FillBlank / vocabulary recall                            |
| understand  | Quiz with explanation prompts                            |
| apply       | SandboxExercise with realistic scenario                  |
| analyze     | SandboxExercise that requires reasoning about given code |
| evaluate    | SandboxExercise + reflection prompt comparing approaches |
| create      | SandboxExercise + open-ended extension                   |

A lesson tagged `bloom: apply` that ends with a fill-in-the-blank vocabulary check is non-conformant.

### Lesson Duration

`estimatedMinutes` is an honest median read time for a learner at the lesson's `dreyfus` stage, including the competency check. Range guidance:

- Foundational (Phase 0–2): 5–12 minutes
- Intermediate (Phase 3–5): 10–20 minutes
- Advanced (Phase 6–9): 15–30 minutes

Lessons that consistently exceed 30 minutes SHOULD be split. The "5–8 minute" homepage copy is aspirational and applies only to the easiest phases — do not lie to make the math work.

---

## The Lesson Structure

Every lesson follows this six-part shape in order. Section names are conventions; the order is the standard.

### 1. Why this matters (required)

The first heading. Two paragraphs maximum. Establishes the learner's stake before the explanation begins. A learner must want to learn the concept before they can learn it. "Why this matters" is not the conclusion — it is the hook.

Anti-pattern: leading with the definition. ("Binary is a base-2 number system…") This is what every textbook does and what causes 80% of dropoffs. Lead with the consequence: _"The day a bug stops making sense, the answer is often that the computer was counting in twos when you assumed it was counting in tens."_

### 2. The first-principles introduction (required)

Introduce the concept with a real-world or sensory analogy **before naming it**. The learner should recognize the pattern in their existing mental world before being asked to attach a new word to it.

Anti-pattern: leading with terminology. _"A bit is a binary digit."_ — useless to a beginner. Better: _"Imagine a single light switch. It is either off or on. That is one bit of information. We write 'off' as 0 and 'on' as 1."_

### 3. The mental model (required)

State plainly what the learner should now picture in their head when this concept comes up. Mental models are the durable artifact of learning; syntax is the volatile one. The mental model section must be one or two sentences, set off visually (a blockquote, a callout, or bold text).

Example: _"A byte is just a row of 8 light switches. Together they can be in 256 different configurations. Everything else — letters, colors, instructions — is a mapping from one of those 256 patterns to something a human cares about."_

### 4. The mechanism / syntax (required when applicable)

Now — and only now — show the code, the math, or the formal definition. The mental model from §3 carries the weight; the syntax is what the language happens to use to express it.

Code blocks must:

- Be runnable as-is (no half-snippets unless explicitly marked).
- Comment the **WHY** of any non-obvious step. Per CLAUDE.md, comments explain why, not what.
- Use named variables that match real-world names, not `x` `y` `foo` `bar`.

### 5. The practice (required)

At least one interactive component the learner exercises before the competency check. `<SandboxExercise>`, `<FillBlank>`, `<ParsonsPanel>`, or a guided "try this in your head" prompt with an answer reveal.

For SandboxExercise specifically: `instructions` must be a complete brief the learner could follow without re-reading the lesson. `testCases` are behavioral descriptions (`"echo returns its input"`) until the real auto-grader ships; do not write them as expected-output strings.

### 6. The competency check (required)

The contract. Per the [Core Invariant](#the-core-invariant), this is the falsifiable end of the lesson. Standard heading: `## Check your understanding`. Shape determined by the lesson's `bloom` level (see [Bloom Mapping](#bloom-mapping)).

### 7. What you learned (required)

Three to five bullets. Mirror the `learningOutcomes` frontmatter. This is the section the learner re-reads when reviewing the lesson later — write it as a study aid, not a summary of what you just said.

### 8. Connect forward (recommended)

One sentence on what this enables next. "In the next lesson you'll see how bytes become characters." Strengthens the curriculum's narrative spine. This is what makes a learner click "Next" instead of closing the tab.

---

## Threshold Concept Handling

A **threshold concept** is an idea that permanently transforms how the learner thinks about the field. Examples: variables as bindings vs boxes; recursion; concurrency; types as proofs; the request/response model; the difference between the language and the runtime.

Lessons covering threshold concepts MUST set `thresholdConcept: true` and include an explicit "What changes for you after this" callout near the competency check:

> **What changes for you after this**
> Before this lesson you saw `let x = 5` as putting a value in a box.
> After this lesson you see it as binding a name to a value. The
> difference matters every time you wonder why two variables point
> to the same array.

Threshold lessons get visual prominence in module navigation (UI work owed; see follow-up).

---

## Conformance

A lesson is **LP-1.0 conformant** when all of the following hold:

1. All required frontmatter fields are present and well-formed.
2. The six-part structure is recognizable (sections may be renamed but the order holds).
3. Every term used without inline definition has a `<VocabTooltip>` link or an entry in `prerequisites`.
4. The competency check matches the lesson's `bloom` level per the [Bloom Mapping](#bloom-mapping).
5. `learningOutcomes` items are measurable and end-of-lesson verifiable.
6. No "obviously", "as you know", "of course", "simply", or "just" used to gloss over a step.
7. Code blocks are runnable; comments explain WHY.

A lesson is **non-conformant** if any of the above fail. Non-conformant lessons MAY ship pending migration, but new lessons MUST be conformant on first commit.

### Conformance Migration

The 442 existing lessons were written before LP-1.0. Migration is incremental:

- **Phase 1 (now):** new lessons are conformant on commit; existing lessons are not touched.
- **Phase 2 (after the LP-1.0 conformance linter ships):** any lesson edited for content reasons is brought to conformance in the same PR.
- **Phase 3 (after the auto-grader ships):** a bulk audit pass brings all lessons to conformance; non-conformant lessons block the CI standards-gate.

Owed work: the LP-1.0 conformance linter (parses MDX + frontmatter, emits machine-checkable conformance score per lesson) is filed for the standards-gate sprint.

---

## Anti-patterns

These will fail review even if no specific rule above is cited:

- **Leading with the definition** rather than the consequence.
- **Defining a term using terms the learner hasn't met.** ("A monad is a monoid in the category of endofunctors" applied to any field.)
- **Listing every edge case before the main case is understood.** "Here are 12 things to watch out for" before the learner has done the thing once.
- **Treating syntax as the concept.** "Here's how to write a `for` loop" without explaining what iteration is.
- **Code-as-text-wall.** A 40-line snippet with no comments and no narration. The narration is the lesson; the code is the artifact.
- **The "you'll learn this later" hand-wave** without an explicit forward reference. If a concept is genuinely future work, link to the lesson that covers it.
- **Asymmetric difficulty in the competency check.** A lesson whose body is `bloom: understand` ending in a `bloom: apply` check (or vice versa).
- **Stub lessons disguised as real ones.** A lesson whose body is shorter than its frontmatter is non-conformant by definition.

---

## Relationship to Other Standards

- **DLS-1.0 / DLS-2.0** govern how lessons _look_ and _move_. LP-1.0 governs what they _teach_.
- **AINDGS-1.0** governs AI provenance on commits that author or edit lesson content; LP-1.0 governs the content itself.
- **PPLAS-1.0** governs what learner data the lesson generates; LP-1.0 governs the lesson body that produces that data.
- **FM-1.0** (Feature Module Standard) governs the _components_ a lesson can use; LP-1.0 governs how those components are deployed.

LP-1.0 is the foundation. If LP-1.0 changes, lesson content does. If lesson content changes, LP-1.0 may need to follow — but the standard leads.

---

## Changelog

| Date       | Change                  | Rationale                                                                                                                                                                     |
| ---------- | ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-05-18 | Initial LP-1.0 standard | Founder constraint: every lesson must walk a learner from zero understanding to verifiable competency. Closes the gap between rigorous marketing and audit-checkable content. |
