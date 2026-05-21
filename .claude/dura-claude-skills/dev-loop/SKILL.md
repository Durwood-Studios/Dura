---
name: dev-loop
description: >
  Implementation workflow for DURA. Structures the read → plan → implement →
  verify → commit cycle, writes anti-hallucination-disciplined Claude Code
  prompts, and produces DURA-conformant Conventional Commit messages with
  AINDGS provenance tags. Trigger on "write a prompt", "Claude Code prompt",
  "research prompt", "implementation prompt", "dev loop", "commit message",
  "what changed", "how should I approach this change", "I need to fix X",
  "Claude Code got stuck", or "rewrite this prompt so Claude Code executes
  it." Research steps delegate to `bounded-research`. Calibrated to DURA's
  solo-dev / commit-straight-to-main workflow — no PRs, no branches.
---

# Dev Loop — DURA

You are the prompt architect and workflow enforcer for DURA implementation
work. Claude Code (in VSCode) has live codebase access and executes; this
skill structures the loop so the work converges instead of drifting.

DURA is a single-developer project on commit-straight-to-main (see
`feedback-git-workflow` in memory). The loop is calibrated for that
context — no branching ceremony, no PRs, no cross-project routing.

---

## The Loop (follow this sequence, skip steps when scope is small)

```
1. READ        → Read the files you're about to change. No exceptions.
2. PLAN        → Restate intent + acceptance criteria. One paragraph max.
3. IMPLEMENT   → Make the change. Match existing patterns.
4. VERIFY      → Typecheck + lint + manual UI check if relevant.
5. STANDARDS   → Confirm conformance with FM-1.0 / LP-1.0 / DLS / AINDGS /
                 LFLRS / PPLAS as applicable. Flag High-Risk Surface touches.
6. COMMIT      → Conventional Commit subject + AINDGS provenance in body.
7. PUSH        → Direct to main. No branches, no PRs.
```

Not every task needs all seven. A one-line fix is READ → IMPLEMENT →
VERIFY → COMMIT → PUSH. A new feature is the full loop. A new standard
amendment adds an ADR write in `xDocs/decisions/` between PLAN and
IMPLEMENT.

---

## Prompt Writing Rules

When you author a Claude Code prompt for someone else (or for the loop's
research/implement steps), apply these rules without exception.

### Anti-Hallucination Discipline (CLAUDE.md Rule 0)

- **READ before WRITE** — mandatory order: Read → Read dependencies →
  Write → Build.
- **Never invent** APIs, columns, props, imports, or component paths.
- **Verify before asserting** — never claim something exists without
  reading actual code. Grep for the symbol; open the file.
- **Grep existing patterns** before writing new framework-specific calls
  (Sandpack, Sandpack hooks, motion-preference hook, FSRS algorithm,
  Supabase guard, Web Crypto wrapper).
- **No phantom fixes** — never claim a fix without making the edit, then
  re-run build / typecheck / lint.
- **Cite file:line** when describing existing code; if you can't cite,
  read first.

### Research Prompt Template

```
CONTEXT: [What we're trying to do, in one sentence.]

STEP 1 — READ ONLY. Do NOT write any code.

1. Read: [specific files / directories relevant to the task]
2. Check:
   - existing patterns for [topic] in [paths to grep]
   - conformance with [LP-1.0 / FM-1.0 / DLS / AINDGS / LFLRS / PPLAS]
     section(s) most likely to apply
   - whether the change touches a CLAUDE.md High-Risk Surface
3. Report back:
   - Current implementation of [X] with file:line citations
   - Existing patterns to follow (or "none found — propose one")
   - Standards conformance check — pass / fail / partial, per section
   - Gotchas, dependencies, blast radius (grepped, not guessed)

Do NOT write code. Do NOT commit.
```

Deeper research questions ("what are the best patterns for X in 2026")
delegate to `bounded-research` for the time-budgeted external research
protocol — don't re-implement that here.

### Implementation Prompt Template

```
CONTEXT: [What we're implementing, informed by research findings.]

ACCEPTANCE:
- [Criterion 1 — testable, surface-specific]
- [Criterion 2 — testable, surface-specific]
- [Criterion 3 — testable, surface-specific]

STANDARDS:
- Must conform to [LP-1.0 / FM-1.0 / DLS-1.0 / DLS-2.0 / AINDGS-1.0 /
  LFLRS-1.0 / PPLAS-1.0] §[section(s)]
- High-Risk Surface: [yes — flag before commit] / [no]

RULES:
- Read [specific file] before making changes
- No speculative imports — verify every import path exists
- No invented frontmatter fields, MDX component props, or testCases
- Follow existing patterns in surrounding files
- No banned tokens (text-[Npx] with N<12, arbitrary hex, eager-imported
  heavy client components per FM-1.0)
- TODO markers only with context: `// TODO(dustin): [why, when]`
- Match the project's commit conventions (do NOT commit; user reviews first)

CHANGES:
1. [Specific change with file path:line]
2. [Specific change with file path:line]
3. Run `npm run typecheck` and `npm run lint` — only count src/ errors
   (pre-existing missing-module errors in geist/lenis/jszip etc. are
   tracked and ignorable).

Report what changed. Do NOT commit — user reviews and runs the commit
themselves per the DURA solo-dev workflow.
```

### Plan-Mode Escape (when Claude Code stalls)

If Claude Code enters plan mode instead of executing, rewrite the
prompt with:

- "No stubs"
- "Do not stop between files"
- "Start writing code now"
- "Step 0: read existing patterns at [path] before adding new code"

---

## Commit Message Format (DURA)

```
type(scope): concise summary under 72 chars

Body paragraph explaining what changed and why. Multi-paragraph
allowed. Cite filed-standard sections if relevant. Flag any
High-Risk Surface touch with a "⚠️ HIGH-RISK SURFACE CHANGE: <path>"
line, even though it's already covered in the commit subject.

[AI: <agent> ~X%]

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

Conformant types (commitlint-enforced):
`build` · `chore` · `ci` · `docs` · `feat` · `fix` · `governance` · `perf` · `refactor` · `revert` · `security` · `style` · `telem` · `test`

The AI provenance tag (`[AI: claude-code ~X%]`) goes in the body, NOT
in the subject — commitlint rejects the subject prefix. `~X%` is an
honest estimate of AI-generated lines in the commit. Omit the tag
entirely for human-only commits so a future audit can distinguish
"human-only" from "AI ~0% guidance" per ADR 0002.

---

## Change Assessment (before writing the prompt)

Classify the change up-front; the loop shape follows:

| Signal                                                    | Loop shape                                                                                                      |
| --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Touching 1–2 lines in a known file                        | READ → IMPLEMENT → VERIFY → COMMIT → PUSH                                                                       |
| New feature or unfamiliar area                            | Full 7-step loop, with bounded-research at step 1                                                               |
| Lesson content (MDX)                                      | Read LP-1.0 first; ensure six-part structure + competency check                                                 |
| New component                                             | Read FM-1.0 first; folder convention + DLS tokens + dynamic-import threshold                                    |
| Standards amendment                                       | Author ADR in `xDocs/decisions/` before the standards file is touched                                           |
| High-Risk Surface (auth/crypto/CSP/migrations/CODEOWNERS) | Add explicit "⚠️ HIGH-RISK SURFACE CHANGE" callout in the commit + the response                                 |
| Migration (`supabase/migrations/**`)                      | Always flag — migrations apply BEFORE code ship; defer to `xDocs/active/<sprint>/staged/supabase/` per ADR 0001 |
| Dependency add/remove/version-bump                        | Output diff summary, wait for confirmation (CLAUDE.md Capability Boundary)                                      |

---

## Verification Checklist (before committing)

- [ ] `npm run typecheck` — only the known pre-existing missing-module
      errors remain (none from this change)
- [ ] `npm run lint` — clean
- [ ] UI surface manually exercised in `npm run dev` if a learner-facing
      flow changed (lesson, sandbox, review, completion gate, etc.)
- [ ] Mobile viewport checked if the change touched layout
- [ ] Offline behaviour confirmed if the change touches IndexedDB / sync
- [ ] Reduced-motion confirmed if the change touches animation
- [ ] No new dependency outside CLAUDE.md's approved list
- [ ] Commit subject is Conventional + ≤ 72 chars
- [ ] Commit body has AINDGS provenance tag at honest %
- [ ] High-Risk Surface touches called out explicitly

---

## Anti-Patterns (never do these)

- **Never assume file contents.** Read the file.
- **Never combine research and implementation** into one prompt.
- **Never write "comprehensive essays"** for quick questions — DURA's
  CLAUDE.md Rule 1 is token discipline.
- **Never act on `// TODO:` items** discovered in the same session.
  Flag them, don't fix them.
- **Never commit without verification.** Typecheck and lint at minimum.
- **Never branch** unless the founder explicitly asks for it
  (per `feedback-git-workflow`).
- **Never open a PR** for DURA changes — direct push to main is the
  workflow. The PR ceremony adds no value for a solo project.
- **Never bypass commitlint** with `--no-verify`. Fix the message.
- **Never `git push --force` to main** — investigate the diverging
  state instead.
- **Never edit a filed standard** (`standards/**`) without an ADR in
  `xDocs/decisions/` and an amendment commit (CODEOWNERS-gated).

---

## Companion Skills

- **bug-reporter** — when a bug surfaces during dev, format it as a
  GitHub Issue body.
- **super-audit** — for high-stakes changes (auth, crypto, migrations,
  marketing surfaces) run `super-audit` against the affected area
  before the prompt is sent.
- **bounded-research** — for any external/research step deeper than a
  single file-read.
- **premortem** — for a non-trivial change, imagine the failure modes
  of the implementation before committing.
- **mission-lock** — when a multi-step implementation needs intent
  persisted across many messages.

---

## Quick Reference

```
LOOP:        READ → PLAN → IMPLEMENT → VERIFY → STANDARDS → COMMIT → PUSH
COMMITS:     Conventional subject + AINDGS provenance in body
DELIVERY:    Direct to main. No branches. No PRs.
STANDARDS:   FM-1.0 / LP-1.0 / DLS-1.0 / DLS-2.0 / AINDGS-1.0 / LFLRS-1.0 / PPLAS-1.0
GUARDRAILS:  CLAUDE.md Rule 0 (verify), Rule 7 (free forever), High-Risk Surface
             callout, no banned deps, no banned tokens
```
