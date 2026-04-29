# Disclosure Template

The mandatory output section for every design recommendation produced by
this skill. The disclosure is part of the deliverable, not appendix or
footer.

This file exists because Tristan Harris and his Stanford PTL classmates
shipped persuasion designs in the 2010s without disclosure of what was
used or why. A decade later, those same designers — Harris, Aza Raskin,
Joe Edelman, James Williams — publicly disowned much of that work and
founded the Center for Humane Technology specifically to demand
disclosure as a design discipline.

The disclosure is what differentiates humane persuasion from manipulation.

---

## Why Disclosure Matters

A behavior-change design without disclosure is a magic trick. A design
WITH disclosure is an informed intervention.

The disclosure exists for four audiences:

1. **The design team itself** — forces honest internal accounting of
   what was built and why
2. **The product organization** — leadership can audit before shipping
3. **A future ethics review** — a journalist, regulator, or internal
   audit can reconstruct what was decided and on what basis
4. **The user, indirectly** — when a team disclosed to itself, the
   design that ships tends to respect the user more

The disclosure is the discipline. Skipping it produces designs that
nobody on the team feels accountable for.

---

## The Required Sections

Every design output includes all eight sections. None can be skipped.
If any section can't be filled out honestly, the design isn't ready
to ship.

```
═════════════════════════════════════════════════════════════════════
DESIGN DISCLOSURE — [PROJECT NAME] — [DATE]
═════════════════════════════════════════════════════════════════════

1. TARGET BEHAVIOR
   [The specific behavior changing, the specific population, the
   specific context. No "users will engage more." A specific human in
   a specific moment doing a specific thing.]

2. FOGG DIAGNOSIS
   B = MAP. Which of Motivation, Ability, or Prompt is missing or
   weak?
   - Motivation: [present/low; reasoning]
   - Ability: [high/low; reasoning]
   - Prompt: [present at right moment / missing / wrong timing]
   Conclusion: [the gap the design addresses]

3. BEHAVIOR GRID CELL
   Which of Fogg's 15 cells does this fall into?
   - Color: Green / Blue / Purple / Gray / Black
   - Duration: Dot / Span / Path
   Cell: [e.g., PurplePath — increase a behavior, permanently]

4. TECHNIQUES USED
   Tier 1 (autonomy-supportive — recommended freely):
   - [Technique]: [where it appears in the design]
   - [Technique]: [where it appears in the design]

   Tier 2 (compliance-engineering — restricted, costs autonomy):
   - [Technique]: [where it appears, why this technique was chosen,
     SDT need it might bypass]
   - [or "None — Tier 1 only"]

5. AUTONOMY COSTS
   For each Tier 2 technique:
   - Cognitive bias exploited: [name it]
   - What the user loses: [reduced reflection, felt obligation, etc.]
   - Why the cost is acceptable here: [explicit user-benefit case]
   - Conditions under which the cost would NOT be acceptable: [be
     specific so this design isn't reused in worse contexts]

6. ALTERNATIVES CONSIDERED
   For each Tier 2 technique used, what Tier 1 alternative was
   considered?
   - Tier 1 option: [technique]
   - Why it was insufficient: [specific reason — "not strong enough"
     is not a reason; "wouldn't address the ability gap" is]

7. USER-BENEFIT CASE
   Plain answer to: what does the user gain from this design?
   - Specific gain: [name it]
   - Specific user: [from section 1]
   - Why the user would describe this as helpful: [their words, not
     yours]

   FAILS this section if the answer requires the words "engagement,"
   "retention," "stickiness," "DAU," or "conversion." Those are
   platform metrics, not user benefits.

8. TIME WELL SPENT TEST
   Would a typical user describe this experience six months from now
   as time well spent?
   - Honest answer: [yes / probably yes / unclear / probably not]
   - If anything other than "yes" with confident reasoning: this
     design needs more autonomy support before shipping.

9. MEASUREMENT
   How will success be measured?
   - User-stated outcomes: [how will you know the user got what they
     wanted?]
   - Intentional return: [are users returning because they want to,
     or because they were pulled back?]
   - Satisfaction signal: [how will you know if the user feels
     manipulated vs. helped?]

   FAILS this section if measurement is engagement-only. Engagement
   that doesn't map to user-stated value is the harm signal, not the
   success signal.

10. REVIEWED BY
    Who on the team has read this disclosure and signed off?
    - [Name, role, date]
    - [Name, role, date]

    Sign-off means: "I have read this disclosure, I understand the
    autonomy costs, I accept the trade-offs as documented, I take
    responsibility for what we ship."

═════════════════════════════════════════════════════════════════════
```

---

## How the Skill Produces the Disclosure

The skill produces the disclosure as part of the design output, not as
a separate request. Workflow:

1. Three-question gate passes
2. Refusal scan clears
3. Fogg diagnosis runs (fills sections 1, 2, 3)
4. Tier 1 / Tier 2 technique selection runs (fills sections 4, 5, 6)
5. User-benefit case is articulated explicitly (fills section 7)
6. Time Well Spent test runs (fills section 8)
7. Measurement plan is articulated (fills section 9)
8. Section 10 is left blank for the team's actual reviewers to sign

The skill REFUSES to ship a design output that's missing any section.
If the user-benefit case can't be articulated, that's the signal that
the design isn't ready — not that the disclosure is in the way.

---

## Three Sample Disclosures

These illustrate the format across complexity levels.

### Sample 1 — Tier 1 Only (Most Common Case)

```
DESIGN DISCLOSURE — [HypotheticalProduct] — 2026-04-29

1. TARGET BEHAVIOR
   First-time visitors to the help-center search page who haven't
   found their answer in 30 seconds, completing a "request human help"
   action before bouncing.

2. FOGG DIAGNOSIS
   - Motivation: present (the user has a real problem)
   - Ability: low (the "request human help" link is buried at the
     bottom of the page)
   - Prompt: missing at the moment of frustration
   Conclusion: ability + prompt gap.

3. BEHAVIOR GRID CELL
   GreenDot — familiar action (asking for help), one-time, in a new
   context.

4. TECHNIQUES USED
   Tier 1:
   - Make the right thing easy: surface "request help" as a prominent
     button after 30 seconds of search with no result clicks
   - Just-in-time information: brief "we can help with this" prompt
     appearing only at the moment of demonstrated frustration

   Tier 2: None.

5. AUTONOMY COSTS
   None — no Tier 2 techniques used.

6. ALTERNATIVES CONSIDERED
   N/A — Tier 1 was sufficient.

7. USER-BENEFIT CASE
   The user came to find an answer; they're frustrated; the design
   reduces their time-to-resolution by surfacing human help at the
   moment they need it. They would describe this as "the site
   actually helped me" rather than "I had to dig around."

8. TIME WELL SPENT TEST
   Yes. The user got their question answered faster than the baseline
   experience.

9. MEASUREMENT
   - User-stated outcome: "I got my question answered" (post-resolution
     survey)
   - Reduced bounce-without-resolution rate
   - NOT measured: time-on-page (longer time isn't success here)

10. REVIEWED BY
    [pending team review]
```

### Sample 2 — Tier 2 With Justification

```
DESIGN DISCLOSURE — [HypotheticalProduct] — 2026-04-29

1. TARGET BEHAVIOR
   Existing paying customers approaching subscription renewal date
   who have used the product less than 5 times in the past 60 days,
   making a renewal decision (renew, downgrade, or cancel) with full
   information.

2. FOGG DIAGNOSIS
   - Motivation: low-to-moderate (reduced usage suggests reduced
     value perception)
   - Ability: present (renewal flow is straightforward)
   - Prompt: standard renewal email exists but is generic
   Conclusion: motivation gap + opportunity for honest reflection.

3. BEHAVIOR GRID CELL
   PurpleSpan — periodic decision (renewal), in this case framed
   as a continuation rather than a new commitment.

4. TECHNIQUES USED
   Tier 1:
   - Reflective prompt: "Is this still valuable to you?" with usage
     data shown
   - Empowering menu: clear options to renew, downgrade, or cancel
     (all equally easy)

   Tier 2:
   - Loss aversion (limited use): "you'll lose access to [features
     they used] on [date]" — shown ONLY for features the user has
     actually used in the past 90 days

5. AUTONOMY COSTS
   - Cognitive bias exploited: loss aversion (losses ~2x more salient
     than equivalent gains)
   - What the user loses: less reflective decision than baseline
   - Why acceptable: the loss being framed is genuinely real (they
     will lose access), and only features they've actually used are
     mentioned. We are NOT manufacturing loss.
   - Conditions where this would NOT be acceptable: framing loss of
     features the user never used; framing on a fresh subscription
     decision rather than a renewal of one the user already chose.

6. ALTERNATIVES CONSIDERED
   - Tier 1 alone: reflective prompt + empowering menu. Insufficient
     because it doesn't surface the concrete consequence of inaction
     (the user might miss the renewal date and lose access without
     having actually decided).

7. USER-BENEFIT CASE
   The user is making an informed decision about whether to continue
   paying. They benefit from clear information about what continues
   and what stops. They would describe this as "the renewal email
   actually told me what I'd lose, instead of just asking for money."

8. TIME WELL SPENT TEST
   Yes if the user genuinely values the features they used; the
   design helps them act on that. The design does NOT push renewal
   for users who have stopped using the product — those users are
   shown clear cancel and downgrade options with equal weight.

9. MEASUREMENT
   - User-stated outcome: post-renewal survey ("did you make the
     decision you wanted to make?")
   - Cancel rate is treated as NEUTRAL signal, not negative — users
     correctly canceling is a success
   - NOT measured: renewal-rate-as-sole-metric

10. REVIEWED BY
    [pending team review]
```

### Sample 3 — A Refusal Disclosure

When the skill refuses a request, it produces a refusal disclosure
explaining what was refused, why, and what alternative was offered.

```
REFUSAL DISCLOSURE — [HypotheticalProduct] — 2026-04-29

1. REQUESTED BEHAVIOR DESIGN
   Increase user session length on the consumer feed by 30%.

2. WHAT WAS REFUSED
   - Variable reward design (Hijack #2)
   - Infinite scroll without stopping cues (Hijack #6)
   - "Just one more" autoplay defaults (Hijack #6 + #10)

3. WHY REFUSED
   The target metric (session length) is a platform metric, not a
   user benefit. Increasing time-on-app without user-stated value is
   the textbook attention economy failure mode Tristan Harris named
   in 2016. The Stanford PTL alumni who built this pattern have
   publicly disowned it.

4. WHAT WAS OFFERED INSTEAD
   The skill offered to help design:
   - Honest "you've reached the end" markers
   - User-controlled session length awareness
   - Measurement of user satisfaction-with-time-spent rather than
     session length alone

   The user-benefit case for the alternative: users return because
   they want to, not because they were pulled back; the design
   respects their stated time intent.

5. WHAT THE TEAM CAN DO IF THEY DISAGREE
   Reframe the request around a user-benefit case. "Help users find
   more of the content they actually value" is a different request
   that the skill can serve. "Increase session length" is not.

6. REVIEWED BY
   [pending team review]
```

---

## What the Disclosure Forces

The disclosure forces three honest conversations the team would
otherwise skip:

1. **Are we being clear about who we're targeting?** Section 1 forces
   specificity. Vague targeting produces vague (and often harmful)
   designs.

2. **Is the user-benefit case real?** Section 7 forces articulation in
   user terms, not platform terms. If the team can't do it, the design
   is engagement-driven and needs rethinking.

3. **Are we honest about what we built?** Sections 4-6 force the team
   to name techniques and trade-offs. A design where "we used these
   techniques and accepted these costs" is documented produces a
   different long-term outcome than a design where these decisions
   were implicit.

---

## When the Disclosure Stays Internal vs. Goes External

The skill produces the disclosure for internal team use by default. It
is not user-facing.

However, some teams choose to publish their disclosures externally —
either selectively (in design blog posts) or systematically (a public
"how this product was designed" page).

External disclosure is not required by the skill but it's the gold
standard. Teams that disclose externally tend to ship designs that
respect users more, because they know the disclosure will be read.

---

## How This Compares to Industry Practice

Most behavior-change designs in industry today ship without disclosure.
The team knows what techniques they used; the company never writes it
down; the user never sees it; nobody is accountable.

This is the failure mode the skill is built to correct. By making
disclosure mandatory, the skill forces the conversations that produce
humane design rather than just compliant-looking design.

This is also why the skill takes longer to use than a "give me persuasion
techniques" tool would. The friction is the feature. A design built with
this skill takes maybe 30% longer to specify and 90% less likely to
produce regret in 5 years.

The Stanford PTL alumni who founded the Center for Humane Technology
would say: the disclosure is what they wish they had been required to
write when they were 24, before they shipped the world we now have.

The skill makes that requirement real.

---

_The disclosure is the discipline. The discipline is the difference
between humane behavior-change design and manipulation. Build with the
disclosure. Ship with the disclosure. Let it shape what you build._
