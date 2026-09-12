# Curriculum conformance inventory

Reviewed 2026-09-12 against the local content tree: **668 lessons, 119 modules, 15 phases**.

## Completed foundation work

All 24 Phase 0 lessons have explicit prerequisites, measurable outcomes, numeric difficulty, threshold flags, guided practice before assessment, and three study outcomes. The 16 existing lessons no longer require unexplained JavaScript to practice terminal, networking, or hardware concepts. Their Bloom level is `understand`, matching their explanation quizzes. Eight new lessons teach reading and testing code through traceable examples, answer reveals, 24 inline quiz questions, and a separate 16-question module assessment bank. Practice is usable offline without an external sandbox.

Content repairs distinguish decimal and binary storage units, avoid claiming TCP guarantees a working network, explain optional editor tooling, separate CI from deployment, and prevent the first-remote exercise from creating conflicting independent histories. Specialty module directories and question banks now resolve to the numeric IDs used by navigation; registry counts reflect every authored lesson.

## Remaining legacy inventory

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

LP-1.0 requires incremental migration; metadata must come from teaching and assessment evidence. Filling hundreds of lessons with generic prerequisites or outcomes would conceal this work. Migrate modules together: inspect prerequisites and unexplained vocabulary, repair the teaching sequence, align each outcome with an assessment, verify runnable examples, then remove resolved baseline entries. Do not regenerate or expand the baseline to admit new failures.

## Module standards mapping review

The standards-alignment script follows LP-1.0: CS2023/SWEBOK arrays are required when applicable, and SFIA is required from Phase 4. Empty arrays make no alignment claim; supplied values must remain well formed. Two pre-existing lessons with no Bloom field remain explicitly reported by the migration baseline; no new missing declarations are accepted.

There are **65 module mappings awaiting semantic review**: 42 historical specialty mappings plus 23 gap-fill modules. Historical specialty rows used letter IDs and some no longer match the current subject (for example, the old manufacturing module 9 row described digital twins, while the authored module teaches IPC rework). Their records are preserved with numeric identities and a pending status, but the lookup helpers withhold them from learner-facing standards claims. New gap-fill rows make no invented mappings. The new reading bridge uses lesson-level CS2023/SWEBOK declarations and makes no additional K-12 alignment claim.

## Automated checks and their limits

Run `npx vitest run tests/standards/lp-1-conformance.test.ts tests/paths/content-reachability.test.ts tests/paths/curriculum-stats.test.ts`.

The structural linter in `src/lib/lesson-conformance.ts` checks required metadata, measurable-outcome wording, opening, mental-model block, practice before assessment, assessment shape, threshold callout, and recap bullets. It reports new findings on any lesson. Every new lesson has an empty allowance, and Phase 0 cannot be grandfathered. Alternate headings or equivalent prose may require deliberate linter improvements rather than content churn.

Reachability checks enumerate all authored content through the actual loader, reject duplicate route identities, compare phase/module totals, resolve foundation prerequisites, compile all foundation MDX, execute new JavaScript examples with fixed expected results, check assessment module references, and follow both sides of the new module boundary. These catch missing registration, silent empty specialty modules, incorrect examples, and completion flows with no assessment bank.

These checks do **not** certify technical accuracy, the meaning of prerequisites, all vocabulary coverage, mastery-test sufficiency, accessibility of every rendered page, or full LP-1.0 conformance. Human pedagogical review remains necessary, especially for advanced and safety-sensitive specialty content. The baseline records debt; it is not a standards badge.
