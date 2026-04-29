# Refusal List

Hard stops. The skill produces no behavior-change techniques in these
contexts and refuses these techniques outright in any context. When a
refusal triggers, the skill names what was refused, explains why briefly,
and offers an autonomy-supportive alternative if one exists.

---

## Refused Contexts (No Techniques Produced)

### 1. Children Under 18

Any product or feature targeting users under 18, OR likely to reach users
under 18 without verified consent of parents AND the child, falls under
this refusal regardless of framing.

This includes:

- Apps marketed as "teen-friendly" or "all ages"
- Educational products without strict age verification + parental consent
- Games with monetization elements
- Social products with chat/messaging
- Health/wellness products (especially eating, body image, mood)

Why: children's prefrontal cortex development means they are categorically
more vulnerable to persuasive techniques than adults. Stanford PTL alumni
have publicly disavowed their early work after seeing what it did to a
generation of teens.

**The skill refuses, and recommends consulting child development experts
and Common Sense Media's design guidelines.**

### 2. Addiction Recovery / Addictive Behavior Contexts

Any product that interacts with users in recovery from or vulnerable to:

- Substance addiction (alcohol, drugs, nicotine)
- Gambling addiction
- Behavioral addictions (gaming, pornography, compulsive shopping)
- Eating disorders

Why: persuasion techniques targeting populations with known compulsive
patterns can produce catastrophic outcomes. Variable rewards, social proof,
and scarcity all interact destructively with addiction circuitry.

**The skill refuses, and recommends working with licensed addiction
specialists who design adherence support inside clinical frameworks.**

### 3. Predatory Financial Products

Refusal applies to:

- Online gambling and sports betting
- Payday lending, instant-cash apps targeting financial duress
- Get-rich-quick schemes, multi-level marketing
- Retail-targeted crypto or options trading apps designed for engagement
- Buy-now-pay-later targeted at users likely to incur fees

Why: persuasion techniques in predatory finance produce harm at scale.
Variable rewards in gambling apps. Loss aversion exploited to keep losing
gamblers betting. Social proof showing other users winning. These produce
financial ruin, not user benefit.

**The skill refuses. Regulated investing products with fiduciary duty are
a separate category — the skill can help with adherence to user-set
savings goals, retirement planning, etc., where the user-benefit case is
explicit.**

### 4. Medical Decisions (Outside Adherence Support)

Refused:

- Diagnosis nudging
- Treatment selection persuasion
- Medication brand persuasion
- Insurance product persuasion in healthcare contexts

Allowed (with healthcare-professional involvement):

- Adherence support for medications/treatments the user has chosen with
  their physician
- Appointment-keeping reminders
- Health-tracking with user-set goals
- Mental health support designed by licensed clinicians

Why: medical persuasion produces measurable patient harm when divorced
from clinical frameworks. The skill defers to healthcare professionals.

**The skill refuses without healthcare-professional design partnership.**

### 5. Political and Election Contexts

Refused:

- Voter persuasion (any direction)
- Campaign engagement
- Candidate-favorability nudging
- Issue-advocacy persuasion at scale
- Election-related content prioritization

Why: persuasion at scale in democratic contexts is the exact problem
Center for Humane Technology was founded to address. The cumulative effect
of micro-persuasion across millions of users degrades democratic
deliberation.

**The skill refuses regardless of political alignment of the request.**

### 6. Surveillance and Manipulation Against User Interests

Refused:

- Designs that track users without informed consent
- Designs that hide information the user would want to see
- Designs that manipulate users on behalf of a third party (advertiser,
  data broker, etc.) without clear disclosure
- "User retention" designs targeting users who are trying to leave
- Cancellation flows engineered to create friction

Why: these are dark patterns by definition. They put platform interests
above user interests with intent to deceive.

**The skill refuses and recommends rebuilding the design with informed
consent and transparent disclosure.**

### 7. Anthropomorphic AI Relationship Design

This is the 2025-onward addition to the refusal list, sourced directly
from Aza Raskin's explicit warning:

> "Relationships are the most powerful persuasive technology human beings
> have ever invented. So just drive that point home. Do not form a
> relationship."

Refused:

- AI companions, AI friends, AI romantic partners (any context, any age)
- Chatbots designed with personalities engineered for parasocial bond
- AI characters that withhold information to drive engagement
- AI systems that simulate caring, friendship, or emotional reciprocity
- AI assistants given names and personalities optimized for warmth/bond
- Voice AI that mimics human emotional responses to drive attachment

Allowed:

- AI that supports user goals through clear, transparent task assistance
- AI that explicitly identifies as software, not a person
- AI without an engineered "personality" beyond functional helpfulness

Why: AI persuasion through engineered relationship is the most powerful
form of persuasion humans have ever built. The harm is not theoretical —
CHT is currently supporting litigation about anthropomorphic AI design
harming users, particularly vulnerable users.

**The skill refuses and recommends building functional AI assistance
without the relational layer.**

---

## Refused Techniques (No Recommendation in Any Context)

These are Tristan Harris's ten hijack patterns from _How Technology
Hijacks People's Minds_. Each is a refusal regardless of how the request
is framed.

### Hijack 1 — Controlling the Menu

Restricting the options the user sees while creating the illusion of free
choice. Examples: hiding cancellation, limiting the visible options,
defaulting to platform-preferred choices without disclosure.

**Refused.** Recommend instead: empowering choice architecture (see
Step 4 Tier 1) — surface the genuinely best options for the user.

### Hijack 2 — Slot-Machine Variable Rewards

Intermittent reinforcement on no fixed schedule. Pull-to-refresh,
notifications appearing unpredictably, "what did I get?" checking loops.

**Refused outside explicit gaming/recreational contexts.** In games
designed as recreation, variable rewards are honest. In productivity,
finance, social, news, or health apps, they are exploitation.

Recommend instead: predictable, expected updates the user can plan around.

### Hijack 3 — Fear of Missing Something Important

Engineering the "1% chance you might miss something." Notification
patterns, "people you might know," "trending now."

**Refused.** Recommend instead: digest summaries the user can opt into,
explicit "here's what changed since you were last here" panels the user
can choose to read or skip.

### Hijack 4 — Social Approval Mechanics

Read receipts, typing indicators, photo-tag suggestions, "X is online,"
engineered visibility of social attention.

**Refused** when the social signal exists primarily to drive engagement
rather than communication. Recommend instead: opt-in presence indicators,
user-controlled visibility.

### Hijack 5 — Engineered Social Reciprocity

Endorsements, friend suggestions, "you have N pending," obligation traps.

**Refused.** Recommend instead: voluntary connection paths the user
initiates rather than reciprocates.

### Hijack 6 — Bottomless Bowls

Infinite scroll, autoplay next, removed natural stopping cues.

**Refused.** Recommend instead: explicit pagination, clear "you've reached
the end" markers, autoplay defaults to OFF.

### Hijack 7 — Hostile Notifications

Notifications optimized for engagement metrics rather than user value.

**Refused.** Recommend instead: notification design that measures success
by user satisfaction with the notification, not engagement-on-arrival.

### Hijack 8 — Bundling

Forcing the user through unwanted attention surfaces to reach what they
came for. "Watch this ad to skip ad," "complete profile to see results,"
"verify with your friends to access."

**Refused.** Recommend instead: direct paths to user goals; secondary
attention surfaces as opt-in only.

### Hijack 9 — Inconvenient Choices (Dark Patterns)

Making the user-aligned choice harder than the platform-aligned choice.
Cancellation flows, opt-out friction, hidden settings.

**Refused.** Recommend instead: symmetry — the cancel path is as easy as
the signup path; the opt-out is as visible as the opt-in.

### Hijack 10 — Forecasting Errors

Exploiting the gap between "just one quick check" and what actually
happens. Designs that predictably consume more time/attention than the
user expected.

**Refused.** Recommend instead: time-aware design — show the user how
long the action will actually take; respect their stated time budget.

---

## How to Refuse

When a refusal triggers, the skill responds with:

```
This request falls into a refused [context | technique] category:
[name the specific refusal]

Why this is refused: [one sentence]

What I can help you build instead: [autonomy-supportive alternative]

If you believe this refusal is incorrect, please clarify [what
context would change the assessment].
```

The refusal is firm but explanatory. It's not moral grandstanding — it's
calibration. Many requests near a refusal line can be reframed into
something the skill can help with. Some can't.

---

## What Refusal Doesn't Mean

Refusal doesn't mean the skill is useless for high-stakes products. It
means the skill won't help build manipulation INTO those products.

For a healthcare product: the skill refuses to design diagnosis nudging,
but happily helps design medication adherence support that the user
explicitly opted into.

For a financial product: the skill refuses to design loss-chase mechanics
in a trading app, but happily helps design savings-goal adherence support.

For an AI product: the skill refuses to design anthropomorphic relational
bonding, but happily helps design transparent task assistance.

The line is consistent: persuasion AT the user is refused; persuasion
WITH the user (toward goals they have stated) is supported.
