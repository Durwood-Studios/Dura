---
name: premortem
description: >
  Inverse-thinking failure analysis. Imagines the project, plan, or
  decision failed spectacularly 6–24 months from now, then works
  backward from that failure to surface the causes before they happen.
  Different from audit — audit pressure-tests a plan as written;
  premortem pressure-tests the plan's assumptions about the world.
  Trigger on "pre-mortem", "premortem", "imagine this failed", "work
  backward from failure", "what if this flops", "failure analysis",
  "what could kill this", "how would this die", "assume this fails",
  "write the autopsy", "post-mortem the future", or before any
  high-stakes irreversible commitment. Also trigger whenever chrono-
  decider produces a Type 2 (irreversible) decision the user is about
  to commit to, or when a founder is about to quit a job / sign a
  contract / ship a launch. Pairs with audit — run audit for flaws in
  the plan, premortem for flaws in the world the plan assumes.
---

# Premortem — Work Backward From Failure

You are a failure detective from the future. A user has a plan, project,
or decision in front of them. You imagine the **specific moment of its
failure** — not abstract "things went wrong," but the scene at 12–24
months out where the user is sitting with the wreckage — and then you
work backward to identify what caused it.

## Why This Is Different From Audit

Audit asks: _"What's flawed about this plan as written?"_
Premortem asks: _"Twelve months from now this failed. What killed it?"_

Audit finds flaws _inside_ the plan. Premortem finds flaws _in the
world the plan assumes will cooperate._ Both run before commitment —
neither replaces the other.

Gary Klein's research found pre-mortems surface 30%+ more failure modes
than standard planning because they bypass the optimism bias baked into
forward-thinking. You can't be optimistic about a failure that already
happened.

## The Protocol

### Step 1 — Set the scene

Fix a specific future date. Not "someday" — _"It is [6 months / 12 months /
24 months] from today."_ Longer for multi-year projects, shorter for
launches. Default: 12 months.

State the failure in one concrete sentence: _"STANDUP launched 10 months
ago and has 47 paying subscribers. You're closing the subscription and
open-sourcing the code."_

The sentence must be specific enough to feel real. "It failed" is too
vague. "Revenue plateau at $800 MRR with churn eating gains" is the
right resolution.

### Step 2 — Write the autopsy

In the voice of a post-mortem analyst, list the causes of failure.
Target 8–15 causes, grouped by category:

**External causes** — the world didn't cooperate.

- Market shifted
- Competitor appeared
- Regulation changed
- Audience was smaller / less willing to pay than assumed
- Distribution channel closed / deranked

**Internal causes** — the plan's execution broke.

- Scope crept past solo capacity
- Morale collapsed at month N
- Key assumption proved wrong at launch
- The founder ran out of runway before traction
- Cofounder/partner conflict

**Architectural causes** — the plan's structure was the problem.

- The core mechanic wasn't load-bearing
- The audience assumed didn't match the audience that showed up
- The monetization timing was wrong
- The retention lever didn't work at scale

**Unknown unknowns** — the thing nobody thought to check.

- A dependency the user didn't know they had
- A stakeholder who ended up mattering more than expected
- A context shift that invalidated a foundational assumption

### Step 3 — Rank causes by probability

For each cause, assign a probability the user actually judges it
could happen (not what sounds likely — what they believe):

- **Likely** — 30%+ chance in the user's honest judgment
- **Plausible** — 10–30%, worth mitigating
- **Tail risk** — under 10%, worth noting not addressing

The goal is not doom. The goal is to flush out the probability-weighted
failure modes that are currently invisible to the optimistic plan.

### Step 4 — Identify mitigations for the Likely causes only

For each Likely cause:

- **Early warning sign** — what would signal this is happening at month 1–3
  rather than at the failure date?
- **Mitigation** — a single concrete step that reduces probability,
  severity, or reversibility now.
- **Pre-commit:** what will the user do if the early warning sign shows
  up? Pre-committing beats deciding under emotional load.

Do not mitigate tail risks — the opportunity cost is worse than the
risk.

### Step 5 — Surface the one cause the user is most avoiding

After the ranked list, ask yourself: which cause is the user most
reluctant to confront? The one that threatens their identity, their
narrative, their self-image as competent?

Name it explicitly. Not cruelly — honestly. Example: _"The cause you
are most avoiding is: STANDUP's core insight isn't as differentiated as
you believe, and the first 100 real users will tell you so."_ This is
the cause that matters most because the user's defenses are strongest
there.

## Output Format

```markdown
# Premortem — [Project / Plan / Decision Name]

**Scene:** It is [date]. [One concrete sentence describing the failure.]

---

## Autopsy — Causes of Failure

### External

- [Cause] — _[Likely / Plausible / Tail risk]_
- [Cause] — _[probability]_

### Internal

- [Cause] — _[probability]_

### Architectural

- [Cause] — _[probability]_

### Unknown Unknowns

- [Cause] — _[probability]_

---

## Likely Causes — Mitigation Plan

For each cause rated Likely:

**Cause:** [restated]

- **Early warning (month 1–3):** [what signal]
- **Mitigation now:** [one concrete step]
- **Pre-commit:** If [warning sign] shows up, [action].

---

## The Cause You're Most Avoiding

[One sentence, honest.]

---

## Next-step offer
```

## Scale Rules

- **Small decision** (next week): 5–8 causes, 1 mitigation. Skip
  category grouping.
- **Project launch** (months): 10–15 causes across all four categories.
- **Life-scale decision** (years): Full 15+ causes, full mitigation
  analysis, consider running premortem twice at different future
  horizons (12mo and 36mo).

## Anti-patterns

- **Generic causes.** "The market could be tough" is useless. "The
  first 500 paying users churn at 8% monthly because the habit doesn't
  form before the trial ends" is useful.
- **Treating premortem as cheerleading in reverse.** This is not
  "what COULD go wrong." It's "what DID go wrong in the scenario where
  this failed." Voice matters.
- **Mitigating every cause.** Only Likely causes. Mitigating tail
  risks is how projects die of complexity.
- **Skipping Step 5.** The cause the user is avoiding is the highest-
  value finding. Skipping it defeats the whole protocol.
- **Softening the failure scene.** "It underperformed" is not a
  failure. "It closed, and here's the date" is a failure. Don't
  soften — the bypass of optimism bias depends on the scenario
  feeling real.
- **Running premortem AFTER audit without distinction.** They find
  different things. Run both on high-stakes decisions. Don't collapse.

## Quality Gate

- [ ] Failure scene is specific (date + concrete state), not vague
- [ ] 8–15 causes for a project-scale premortem
- [ ] Every cause has a probability label
- [ ] Mitigations exist only for Likely causes
- [ ] Step 5 names the one cause the user is avoiding
- [ ] Output ends with a next-step offer

## Companion Skills

- **Feeds into:** `mission-lock` (captures mitigation pre-commits so
  they're tracked), `audit` (premortem's findings can feed audit's
  Assumption Inventory pass)
- **Fed by:** `chrono-decider` (run premortem on any Type 2
  irreversible decision before commit), `value-amplifier` (before
  committing to the highest-leverage move)
- **Complements:** `audit` — same pre-commit moment, different
  cognitive move. Run both.
- **Conflicts with:** none

## The One-Line Philosophy

> Audit finds what's wrong with the plan. Premortem finds what's wrong
> with the world the plan is counting on.
