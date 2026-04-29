# Synthesis Framework — From Research to Gold Standard

## The Synthesis Matrix

Run every reconnaissance finding through this matrix before drafting.

```
DIMENSION          QUESTION                              OUTPUT
──────────────────────────────────────────────────────────────────────
CONSENSUS          Where do 3+ standards agree?          → Core principles
                   (These are load-bearing. Keep them.)

CONFLICT           Where do standards contradict?        → Decision point
                   (Choose one; document the rationale.
                    Never average conflicting standards —
                    averages are weak on both axes.)

GAPS               What do ALL standards leave unaddressed? → Creation target
                   (These are where novel value lives.)

OBSOLESCENCE       What assumptions were valid in [year]  → Modernization
                   but are no longer true?                  opportunity
                   (Technology, culture, regulation change
                    faster than standards bodies do.)

CONSTRAINT LOCK    What does the strongest standard take  → 10x inversion
                   as fixed that could be questioned?      target
```

## Decision Rules for Conflicts

When two or more standards conflict, apply in order:

1. **Recency wins if the older standard's assumption is invalid.**
   GDPR (2018) supersedes older data-handling practices where they conflict,
   not because GDPR is more authoritative but because its threat model
   (modern data collection scale) is current.

2. **Specificity wins over generality.**
   A domain-specific standard beats a general one where they conflict.
   OWASP Top 10 for web security beats ISO 27001's general security controls
   for web application-specific decisions.

3. **Testability wins over aspiration.**
   A requirement that can be verified (binary pass/fail) beats a recommendation
   that must be judged. When two standards conflict, prefer the one whose
   requirement you can test.

4. **Adoption rate is a signal, not a trump.**
   Wide adoption proves fitness, not correctness. Sometimes the widely
   adopted standard is wrong and the novel standard is right.
   Name the conflict explicitly; don't silently pick the popular one.

## The 10x Pressure Test

After synthesis, apply 10x thinking to the strongest surviving standard:

```
IMPLICIT CONSTRAINT FINDER
──────────────────────────
What scale does this standard assume?
  → Standard written for [X] users, [Y] data volume, [Z] team size
  → At 10x: does the standard still hold?

What technology does this standard assume?
  → Standard assumes [technology/architecture]
  → What if that technology didn't exist or was replaced?

What role does this standard assume?
  → Standard assumes [specialist / generalist / org structure]
  → What if the role changed or was eliminated?

What cost does this standard assume is acceptable?
  → Standard allows [process/overhead] as the price of compliance
  → At 10x, that cost is unacceptable — what replaces it?
```

The implicit constraint is the assumption that, if removed, produces
a genuinely different and better standard. The 10x version violates
the constraint by design.

## Novel Standard Creation Protocol

When no standard exists OR when 10x inversion produces something
genuinely new, use this creation protocol:

### Step 1: Name the problem with precision

A standard without a clearly named problem is a style guide.
The problem statement must be:

- Specific (not "build better software")
- Scoped (applies to X doing Y in context Z)
- Falsifiable (you can tell when the problem is solved)

### Step 2: Derive principles from first principles

Don't start from "what do people do?" Start from:

- What does a correct outcome look like?
- What invariants must always be true for that outcome?
- What would make those invariants impossible to violate?

Each invariant becomes a Principle. Principles are constraints on
behavior, not descriptions of behavior.

**Principle quality test:**
"If we violated this, would the outcome be unacceptably worse?"
If yes: it's a principle.
If no: it's a recommendation.

### Step 3: Derive requirements from principles

Requirements are how you know you're following the principles.
Each requirement must be:

- Binary (pass or fail — no partial credit)
- Observable (someone can check it without subjective judgment)
- Necessary (the principle fails if this requirement is violated)

**Requirement quality test:**
"Could a new team member verify this in < 5 minutes?"
If yes: well-formed requirement.
If no: too vague — decompose further.

### Step 4: Identify the failure modes the standard prevents

For each Principle, name the specific bad outcome it prevents.
These become Anti-patterns. Good anti-patterns are:

- Named (given a short, memorable label)
- Described (what it looks like in the wild)
- Consequenced (what goes wrong when it occurs)

### Step 5: Version and date from birth

All novel standards start at v1.0.
Standards that evolve get semantic versioning:

- MAJOR: a principle is added, removed, or fundamentally changed
- MINOR: a requirement or recommendation is added or clarified
- PATCH: editorial corrections only

## Synthesis Quality Tests

Before proceeding to Phase 4, verify:

```
□ Every core principle has a source (existing standard or derived first-principles)
□ Every conflict has an explicit resolution with documented rationale
□ Every gap is named — don't leave gaps unnamed
□ The 10x constraint is named and the standard violates it
□ No principle is actually a recommendation (vagueness test)
□ No requirement is actually a principle (binary test)
□ Novel contributions are clearly labeled as novel (not presented as existing consensus)
```
