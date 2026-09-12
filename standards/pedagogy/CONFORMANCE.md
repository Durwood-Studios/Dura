# Curriculum conformance inventory

Reviewed 2026-09-12 against the local content tree: **668 lessons, 119 modules, 15 phases**.

## Completed foundation work

All 24 Phase 0 lessons have explicit prerequisites, measurable outcomes, numeric difficulty, threshold flags, guided practice before assessment, and three study outcomes. The 16 existing lessons no longer require unexplained JavaScript to practice terminal, networking, or hardware concepts. Their Bloom level is `understand`, matching their explanation quizzes. Eight new lessons teach reading and testing code through traceable examples, answer reveals, 24 inline quiz questions, and a separate 16-question module assessment bank. Practice is usable offline without an external sandbox.

Content repairs distinguish decimal and binary storage units, avoid claiming TCP guarantees a working network, explain optional editor tooling, separate CI from deployment, and prevent the first-remote exercise from creating conflicting independent histories. Specialty module directories and question banks now resolve to the numeric IDs used by navigation; registry counts reflect every authored lesson.

## Current review result

All **668 lessons across phases 0–14** pass the current static LP audit and compile as MDX. The changes include explicit prerequisites, topic-specific outcomes, mental models, guided reasoning checkpoints, and assessment tasks aligned with their declared Bloom level. Native-language, engineering, and professional tasks use offline written activities with model responses and observable rubrics where browser execution would not verify the intended skill.

The strict current LP test now requires zero findings for every lesson; the immutable legacy baseline cannot excuse a regression. Whole-curriculum MDX compilation is also retained as a test. Runtime assessment-property checks verify supported quiz options, answer indices, and reachable fill-in fields. Compilation alone would not catch those delivery errors.

Actual MDX solution regression tests cover repaired JavaScript examples, including calculator multiplication, heap termination, dependency-first topological ordering, RPN arithmetic, and browser-protocol simulations. Phase 12 additionally compiles six actual C++ lesson blocks under AddressSanitizer and UndefinedBehaviorSanitizer, testing null conditionals, parsing boundaries, arena alignment/exhaustion, pool lifetime, and erased callable behavior. See [core evidence](CORE-MAPPING-REVIEW.md), [advanced mapping scope](ADVANCED-MAPPING-REVIEW.md), [low-latency review](PHASE12-REVIEW.md), and [manufacturing handoff review](PHASE14-HANDOFF-REVIEW.md).

The table below records the **original baseline**, not current outstanding counts. The present result is zero findings under the implemented structural rules, not a claim of exhaustive pedagogical or technical certification.

## Historical starting inventory

The immutable starting findings for each legacy lesson are listed in [`lp-1.0-legacy-baseline.json`](lp-1.0-legacy-baseline.json). A finding is a machine-detectable issue, not a claim that the rest of the lesson is correct. Categories overlap:

| Finding                                                      | Lessons |
| ------------------------------------------------------------ | ------: |
| Missing explicit prerequisites                               |     403 |
| Missing explicit learning outcomes                           |     403 |
| Missing boolean threshold flag                               |     482 |
| Legacy nonnumeric difficulty                                 |     482 |
| Missing visual mental-model block detected                   |     520 |
| Assessment component does not match the declared Bloom level |     545 |
| Missing professional context for evaluate/create             |      82 |
| Missing recognized practice before the assessment            |     166 |
| Missing threshold callout when threshold is true             |      25 |

LP-1.0 requires incremental migration; metadata must come from teaching and assessment evidence. Filling hundreds of lessons with generic prerequisites or outcomes would conceal this work. Migrate modules together: inspect prerequisites and unexplained vocabulary, repair the teaching sequence, align each outcome with an assessment, verify runnable examples, then verify the current findings disappear. Keep the original baseline immutable; do not regenerate or expand it to admit new failures. Every lesson now has a strict zero-findings assertion; historical allowances no longer permit current failures.

## Module standards mapping review

The standards-alignment script follows LP-1.0: CS2023/SWEBOK arrays are required when applicable, and SFIA is required from Phase 4. Empty arrays make no alignment claim; supplied values must remain well formed. The current LP audit requires a valid Bloom declaration for every lesson.

The original **65 pending module mappings have been reviewed for scope**. Core and advanced gap-fill rows now explicitly use lesson metadata only, and specialty mappings have been reviewed against their actual module subjects. This is not a claim that every old standards crosswalk is certified. See [core mapping review](CORE-MAPPING-REVIEW.md) and [advanced mapping review](ADVANCED-MAPPING-REVIEW.md).

Unverified historical AP CSP/CSA labels are preserved separately for review and withheld from current module badges, aggregation, and AP lookup. The old seven-part CSP and ten-unit CSA taxonomies must not be presented as current frameworks. No current AP equivalence was fabricated by renumbering old arrays.

## Automated checks and their limits

Run `npx vitest run tests/standards/lp-1-conformance.test.ts tests/paths/content-reachability.test.ts tests/paths/curriculum-stats.test.ts`.

The structural linter in `src/lib/lesson-conformance.ts` checks required metadata, measurable-outcome wording, opening, mental-model block, practice before assessment, assessment shape, threshold callout, and recap bullets. It rejects current findings on every lesson; no lesson retains a grandfathered allowance. Alternate headings or equivalent prose may require deliberate linter improvements rather than content churn.

Reachability checks enumerate all authored content through the actual loader, reject duplicate route identities, compare phase/module totals, resolve all lesson prerequisites, compile all authored MDX, execute new JavaScript examples with fixed expected results, check assessment module references, and follow both sides of the new module boundary. These catch missing registration, silent empty specialty modules, incorrect examples, and completion flows with no assessment bank.

These checks do **not** certify technical accuracy, the meaning of prerequisites, all vocabulary coverage, mastery-test sufficiency, accessibility of every rendered page, or full LP-1.0 conformance. Human pedagogical review remains necessary, especially for advanced and safety-sensitive specialty content. The baseline records the starting debt; it is not a standards badge.
