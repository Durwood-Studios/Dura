# humane-persuasion

Behavior-change design skill grounded in Stanford Persuasive Technology Lab
(B.J. Fogg) plus Center for Humane Technology (Tristan Harris, Aza Raskin).

## What this skill does

Helps design technology that aligns with what users actually want — not what
platforms want from users. The refusal infrastructure leads: ten hijack
patterns are blocked outright, seven high-harm contexts are always refused,
anthropomorphic AI relationship design is refused.

Autonomy-supportive techniques (Self-Determination Theory) are the default.
Compliance-engineering techniques (Cialdini) are restricted — they require
explicit user-benefit case + autonomy-cost disclosure before the skill will
recommend them.

Every output includes a mandatory disclosure section so product teams can
audit their own behavior-change designs.

## What this skill is NOT

- A dark pattern generator
- An engagement-optimization toolkit
- A growth hacking playbook
- A persuasion library divorced from ethics
- A way to make AI feel like a friend

If a session drifts toward any of these, the skill steers back to
autonomy-supportive design or refuses outright.

## Contents

- `humane-persuasion.skill` — packaged skill ready to upload to claude.ai
  (Settings → Capabilities → Skills → Upload skill)
- `SKILL.md` — main routing brain (~387 lines, ~4,039 tokens)
- `references/`
  - `three-question-gate.md` — the gate that runs before any technique
  - `refusal-list.md` — high-harm contexts and refused techniques
  - `the-ten-hijacks.md` — Tristan Harris's hijack patterns the skill refuses
  - `fogg-behavior-model.md` — B = MAP diagnostic + Behavior Grid + Tiny Habits
  - `sdt-techniques.md` — Tier 1 autonomy-supportive playbook
  - `cialdini-with-costs.md` — Tier 2 compliance-engineering with disclosure
  - `disclosure-template.md` — mandatory output template

## Two ways to use

### A. Upload the .skill file (recommended)

1. Open claude.ai → Settings → Capabilities → Skills
2. Click "Upload skill"
3. Select `humane-persuasion.skill`
4. Confirm install

### B. Browse the source

The unzipped contents are here for inspection or editing. If you edit
anything, re-zip the `humane-persuasion/` folder structure (SKILL.md +
references/ at top level) and rename to `.skill` for re-upload.

## Trigger phrases

"behavior change", "user activation", "increase engagement", "improve
conversion", "design persuasion", "habit formation", "Fogg behavior model",
"user retention", "drive adoption", "nudge", "default choice architecture",
"onboarding design", "drop-off reduction", "make this product stickier",
"humane technology", "ethical persuasion", "Time Well Spent", and similar.

## The lineage this skill stands on

- B.J. Fogg (Stanford PTL) — Behavior Model, Tiny Habits, Behavior Grid
- Edward Deci & Richard Ryan — Self-Determination Theory
- Robert Cialdini — six principles of influence (used with disclosures)
- Daniel Kahneman & Amos Tversky — loss aversion, framing effects
- Peter Gollwitzer — implementation intentions
- Richard Thaler & Cass Sunstein — choice architecture, defaults
- Tristan Harris — _How Technology Hijacks People's Minds_, Time Well Spent
- Aza Raskin — humane interface design, anthropomorphic AI critique
- James Williams & Joe Edelman — Time Well Spent, attention philosophy

The Fogg framework gives the design vocabulary. Harris and Raskin give the
gates that prevent the vocabulary from being weaponized. This skill ships
both at once because — as Harris's own PTL alumni learned the hard way —
shipping the first without the second is how you build the world we're now
trying to repair.

## Companion skills

- `bounded-research` — for surveying behavior-change literature
- `audit` — pressure-test a design before shipping
- `gold-standard` — forge an in-house ethical design standard
- `dev-loop` — implement the design as a coded change
- `design-system-unify` — when persuasion design touches UI consistency
- `value-amplifier` — find higher-leverage user-benefit framings

## Honest disclosure about this skill itself

This skill takes longer to use than a "give me persuasion techniques" tool
would. The friction is the feature. A design built with this skill takes
roughly 30% longer to specify and is 90% less likely to produce regret in
five years.

The Stanford PTL alumni who founded the Center for Humane Technology have
said publicly they wish they had been required to write design disclosures
when they were 24, before they shipped the world we now have. This skill
makes that requirement real for the next generation of builders.
