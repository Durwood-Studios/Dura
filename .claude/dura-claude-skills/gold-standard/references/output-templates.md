# Output Templates — Gold Standard Document Structure

## The Standard Document (full format)

Use this structure for every gold standard produced.
Sections marked [REQUIRED] must be present.
Sections marked [CONDITIONAL] are required when applicable.

---

```markdown
# [Domain] Gold Standard

**Version:** v1.0  
**Date:** [YYYY-MM-DD]  
**Scope:** [One sentence: what this standard governs]  
**Status:** Active

---

## Purpose [REQUIRED]

[2-3 sentences: what problem this standard solves, for whom, and
what becomes possible when it's followed that isn't possible without it.]

**This standard does NOT cover:** [explicit scope exclusions — prevents misapplication]

---

## Principles [REQUIRED]

Principles are non-negotiable. Violating any principle means the
implementation does not conform to this standard, regardless of
how well it follows the recommendations.

**P1 — [Name]**  
[One sentence statement of the principle.]  
_Rationale: [Why this is non-negotiable — what breaks without it.]_

**P2 — [Name]**  
[One sentence statement of the principle.]  
_Rationale: [Why this is non-negotiable.]_

[3-7 principles total. More than 7 means the standard is too broad
or the principles aren't at the right level of abstraction.]

---

## Requirements [REQUIRED]

Requirements define conformance. Each is binary: pass or fail.
A conforming implementation satisfies ALL requirements.

**R1 — [Short label]**  
[Testable statement. A new team member can verify this in < 5 minutes.]  
_Verifiable by: [how to check — tool, review, test, inspection]_

**R2 — [Short label]**  
[Testable statement.]  
_Verifiable by: [how to check]_

[Requirements map to Principles. Each Principle should have 1-3 Requirements.]

---

## Recommendations [REQUIRED]

Recommendations are best practices. Conforming implementations SHOULD
follow these but are not disqualified if they don't.

- **[Label]:** [Recommendation statement.] _Reason: [why this helps]_
- **[Label]:** [Recommendation statement.] _Reason: [why this helps]_

---

## Anti-Patterns [REQUIRED]

Specific failure modes this standard exists to prevent.
Each anti-pattern is named, described, and consequenced.

**✗ [Anti-pattern Name]**  
_What it looks like:_ [concrete description in the wild]  
_Why it happens:_ [the well-intentioned reason people do this]  
_Consequence:_ [what goes wrong]  
_Standard violation:_ [which Principle this violates]

---

## Application [REQUIRED — project-specific section]

How to apply this standard in [PROJECT NAME].

**Current state:** [What exists today that this standard addresses]  
**Gap analysis:** [Where the current implementation deviates from the standard]  
**Priority actions:**

1. [First thing to change, ranked by impact]
2. [Second thing]
3. [Third thing]

**Implementation checklist:**

- [ ] [Specific action tied to R1]
- [ ] [Specific action tied to R2]

---

## Provenance [REQUIRED]

**Synthesizes:**

- [Standard A] — contributed [specific principles/requirements]
- [Standard B] — contributed [specific principles/requirements]

**Supersedes:** [Any standard this replaces, or "None — novel standard"]

**Departs from:**

- [Standard C], [section/principle]: [why this standard makes a different choice]

**Novel contributions** (not found in existing standards):

- [What this standard adds that didn't exist before]

---

## Version History [REQUIRED]

| Version | Date   | Changes          |
| ------- | ------ | ---------------- |
| v1.0    | [date] | Initial standard |

---

## Review Schedule [CONDITIONAL — include for living standards]

This standard should be reviewed when:

- A major dependency (technology, regulation, platform) changes
- A Principle is violated in practice at significant scale
- [Specific trigger relevant to this domain]

Next scheduled review: [date or event trigger]
```

---

## Abbreviated Format (for fast-moving projects)

Use when: rapid iteration required, standard will be formalized later.

```markdown
# [Domain] Gold Standard — Draft

**Version:** v0.1  
**Date:** [date]  
**Status:** Draft — not yet pressure-tested

## Non-Negotiables (Principles)

1. [One-line principle]
2. [One-line principle]
3. [One-line principle]

## Pass/Fail Tests (Requirements)

- [ ] [Binary check]
- [ ] [Binary check]
- [ ] [Binary check]

## Don't Do These (Anti-patterns)

- **[Name]:** [One-line description] → [consequence]

## In This Project ([PROJECT NAME])

[2-3 sentences on application]

## Sources

[Bullet list of standards consulted]
```

---

## Skill Package Format (for skill-forge handoff)

When the user requests skill-forge packaging, deliver:

```
SKILL-FORGE HANDOFF
───────────────────
Skill name: [domain]-standard
Skill type: Domain expert (encodes specialized knowledge)
Source: Gold Standard v[X.X] produced in this conversation
Project scope: User will configure in their project — skill is project-agnostic

Content for SKILL.md:
[The Principles and Requirements sections — lean, instructional]

Content for references/[domain]-standard.md:
[The full standard document]

Companion skills: bounded-research, audit, steelman
Trigger phrases: [domain] standard, [domain] gold standard, how should I [domain verb]
```
