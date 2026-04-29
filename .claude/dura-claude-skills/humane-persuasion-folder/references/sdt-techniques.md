# Self-Determination Theory — Tier 1 Techniques

Autonomy-supportive behavior-change techniques. These are the default
recommendations. They produce sustained change without compliance cost.
The skill recommends Tier 1 freely and Tier 2 only with explicit
justification (see `cialdini-with-costs.md`).

---

## The Theory

Edward Deci and Richard Ryan's Self-Determination Theory (1985, ongoing)
identifies three intrinsic motivators that produce durable, voluntary
behavior change:

```
┌─────────────────────────────────────────────────────────────────┐
│  AUTONOMY      The sense of choosing freely, of acting from     │
│                one's own values rather than external pressure.   │
│                                                                  │
│  COMPETENCE    The sense of growing capable, of mastery over     │
│                challenges, of effective action.                  │
│                                                                  │
│  RELATEDNESS   The sense of meaningful connection to others,     │
│                of belonging, of being seen and valued.           │
└─────────────────────────────────────────────────────────────────┘
```

When design supports these three needs, behavior change persists. When
design bypasses or undermines them, behavior change requires constant
reinforcement and degrades when the reinforcement stops.

### The empirical evidence

Decades of research (Deci, Ryan, Vansteenkiste, and many others) shows:

- **Extrinsic rewards undermine intrinsic motivation.** Pay people to do
  something they'd do for free, and they'll stop doing it for free.
- **Autonomy-supportive interventions produce stronger long-term
  outcomes** than control-based interventions across health behavior
  change, education, workplace performance, and addiction recovery.
- **Self-determined motivation correlates with subjective wellbeing,
  vitality, and life satisfaction.** Compliance-driven motivation does
  not.

The implication for product design: techniques that support autonomy,
competence, and relatedness produce users who genuinely want to use the
product. Techniques that bypass these produce users who feel manipulated
and eventually leave (or stay resentfully).

---

## The Tier 1 Toolkit

These techniques are recommended without restriction. Each maps to one
or more of the three SDT needs.

### Technique 1 — Tiny Habits (Fogg)

**SDT mapping:** Autonomy + Competence

Make the behavior so small it requires almost no motivation. Anchor to
existing routine. Celebrate immediately.

**When to use:** Habitual behaviors. Daily/weekly recurring actions.

**Example:**

> "After I [existing morning routine], I'll [tiny goal-aligned action]."

**Why it's autonomy-supportive:** the user picks every element. The
platform offers the structure; the user fills in the content.

See `fogg-behavior-model.md` for the full Tiny Habits methodology.

---

### Technique 2 — Implementation Intentions (Gollwitzer)

**SDT mapping:** Autonomy + Competence

The user pre-commits to a specific if-then plan. "I will do X when Y
happens." Empirically, implementation intentions improve follow-through
by 2-3x compared to general intentions.

**When to use:** Episodic behaviors with known triggers. Behaviors that
require advance planning.

**Example:**

> "When I see an event near me on Sunday, I will register before Monday
> 9pm if it fits my calendar."

**How to design for it:**

- Provide a structured way for the user to write their if-then plan
- Don't write it for them — the plan is owned by the user
- Reference it back at the trigger moment ("you said you'd register if
  it fits your calendar — does this one fit?")

**Why it's autonomy-supportive:** the user authors the rule. The platform
helps them keep the commitment they made to themselves.

---

### Technique 3 — Make the Right Thing Easy

**SDT mapping:** Competence

The most underused intervention in product design. Most behavior failures
are ability problems, not motivation problems. Reducing friction on the
user-aligned path is almost always the highest-leverage intervention.

**When to use:** Always. This is the default first move.

**Examples:**

- Reduce form fields from 12 to 4
- Pre-fill known information
- Single-click critical actions; confirm only when reversal is hard
- Sensible defaults (the default that's best for the user, not the platform)
- Mobile-first design that respects touch ergonomics

**Why it's autonomy-supportive:** the user is choosing freely; the
platform is reducing the cost of executing that choice.

---

### Technique 4 — Make the Wrong Thing Visible (Not Hard)

**SDT mapping:** Autonomy

The opposite of dark patterns. When a choice has consequences the user
should know about, surface them — but don't add friction designed to
bias the choice. Transparency, not coercion.

**When to use:** When the user is making a choice with downstream
consequences they may not fully understand.

**Examples:**

- "If you cancel now, you'll lose access on [date]" (factual, not guilt)
- "This subscription auto-renews on [date] for [amount]" (clear, not buried)
- "Choosing this option means [tradeoff]" (informed)

Compare to dark pattern equivalents:

- "Are you SURE you want to leave? [sad face emoji]"
- Auto-renew terms hidden three menus deep
- Tradeoffs unmentioned until after the choice

**Why it's autonomy-supportive:** the user has the information needed to
choose freely. The platform doesn't bias toward its preferred outcome
through artificial friction or guilt.

---

### Technique 5 — Reflective Prompts

**SDT mapping:** Autonomy + Competence

Questions that invite the user to check in with their own values, rather
than push them toward the platform's preference.

**When to use:** Decision points where the user might benefit from a
moment of intentional reflection.

**Examples:**

- "What would make this event worth your time?" (before registration)
- "How did this match your goal?" (after completion)
- "Is this still valuable to you?" (annual subscription review prompts)

Compare to engagement-driven equivalents:

- "Don't miss out!" (FOMO push)
- "Your friends are doing X" (social pressure)
- "Last chance!" (manufactured urgency)

**Why it's autonomy-supportive:** the user is invited to think, not
prodded to act.

---

### Technique 6 — Progress Visualization

**SDT mapping:** Competence

Show the user what they're building, what they've accomplished, what's
ahead. Honest progress, not gamified vanity metrics.

**When to use:** Multi-step processes, skill development, long-term goals.

**Examples:**

- A driver's history of events showing actual skill progression
- An organizer's revenue and event count over time, with patterns
  visible
- A user's saved articles showing reading streaks they care about
- Honest progress bars that reflect actual completion (not engineered
  to feel near-done)

Compare to gamification anti-patterns:

- Streak counters designed to create loss-aversion if broken
- Achievement badges for engagement (not actual user-valued accomplishment)
- Progress bars engineered to seem near-complete to drive completion

**Why it's autonomy-supportive:** the user sees real growth and chooses
what to do with the information. The platform doesn't manipulate them
into protecting a manufactured streak.

---

### Technique 7 — Just-in-Time Information

**SDT mapping:** Competence + Autonomy

Provide what the user needs at the moment they need it — and then get
out of the way.

**When to use:** Onboarding, complex decisions, contextual help.

**Examples:**

- Tooltips that appear on first encounter with a feature, dismissable
  forever
- Contextual help that shows up at decision points, not as a banner that
  follows the user
- Pre-filled defaults that explain themselves: "We pre-filled your home
  track based on your previous registrations. Change if needed."

Compare to engagement-driven equivalents:

- Persistent onboarding tours that won't dismiss
- "Tips" that interrupt user flow
- Help systems designed to keep users in the help system rather than
  resolve their question

**Why it's autonomy-supportive:** the user gets what they need to act
competently and is left to act.

---

### Technique 8 — Empowering Menus (Edelman / Harris)

**SDT mapping:** Autonomy

When presenting choices, expand the user's options rather than constrain
them. This is Tristan Harris's positive doctrine for choice architecture.

**When to use:** Anywhere the user makes a decision.

**Examples:**

In an email client, instead of just "what do you want to type back?":

- Reply
- Schedule a call
- Forward to someone better suited
- Decline politely
- Save for later thinking
- Mark as not requiring response

In a registration flow, instead of just "register now":

- Register
- Save for later decision
- Set reminder for [day before]
- Decline with feedback (helps the platform understand)
- Suggest to a friend who might be better suited

Compare to constrained menus:

- "Type your reply" (forces the engagement-driving path)
- "Register or close" (binary forces a choice the user may not be ready
  to make)

**Why it's autonomy-supportive:** the user's options reflect what they
might actually want, not what the platform wants from them.

---

### Technique 9 — Voluntary Connection

**SDT mapping:** Relatedness

The relatedness dimension of SDT is real — people genuinely want
meaningful connection. The autonomy-supportive way to design for this
is voluntary, not engineered.

**When to use:** Social features, community, multi-user contexts.

**Examples:**

- The user finds and follows others; the platform doesn't surface
  "people you might know" with engagement-driving urgency
- Connection is opt-in symmetric: both users explicitly choose to
  connect, no one-sided "X is your friend now" surprises
- Communication tools without engineered obligation (no read receipts
  by default, no typing indicators by default)
- Communities built around shared interests the users opted into, not
  algorithmically clustered for engagement

Compare to engineered social mechanics:

- Friend suggestions optimized for reciprocity (Hijack #5)
- Read receipts driving response obligation (Hijack #4)
- "X is online" creating attention pressure (Hijack #4)

**Why it's autonomy-supportive:** connection is meaningful when chosen.
Engineered connection produces obligation, not relatedness.

---

### Technique 10 — Honest Defaults

**SDT mapping:** Autonomy

Defaults are powerful — most users accept them. The autonomy-supportive
default is the one that's genuinely best for THIS user, not the one
that maximizes platform metrics.

**When to use:** Anywhere the platform pre-selects an option.

**Examples:**

- Privacy settings default to most-private
- Notification settings default to least-disruptive (off, or daily digest)
- Subscription tiers default to the smallest plan that meets stated
  needs (not the most expensive)
- Auto-renew defaults to OFF, with clear opt-in
- Data sharing defaults to OFF

The test: if the user understood every default, would they keep them?
If yes, the defaults are honest. If no, they're a dark pattern.

Compare to engagement-driven defaults:

- Public profiles default to PUBLIC ("everyone can see" is the platform
  preference)
- Notifications default to "all notifications on" (drives engagement)
- Marketing emails default to "subscribed"
- Auto-renew defaults to ON

**Why it's autonomy-supportive:** the default IS the user's interest.
The platform serves the user, not the other way around.

---

## How to Recommend Tier 1 Techniques

When producing a design output, the skill:

1. Identifies the Fogg diagnosis (M, A, or P missing)
2. Lists the Tier 1 techniques that address the diagnosis
3. Prioritizes by SDT need (autonomy → competence → relatedness)
4. Picks 1-3 techniques (not all 10 — design has to be specific)
5. Specifies the implementation in the user's project context
6. Includes Tier 1 techniques in the disclosure with their SDT mapping

**Default recommendation pattern:**

> "For this behavior change, I recommend [technique 1] as the primary
> intervention because [diagnosis fit + SDT mapping]. Supplemented with
> [technique 2] for [specific moment]. This addresses the [M/A/P] gap
> identified in the diagnosis."

The Tier 1 default is the answer to most behavior-change problems. Tier
2 is the exception, not the rule.

---

## When Tier 1 Isn't Enough

Sometimes the user-benefit case is real, the diagnosis points at
motivation, and Tier 1 techniques are insufficient. In those cases the
skill considers Tier 2 — but only with explicit justification and
autonomy-cost disclosure.

See `cialdini-with-costs.md` for the Tier 2 protocol.

If a behavior genuinely cannot be supported with Tier 1 techniques, the
skill should also question whether the platform should be driving this
behavior at all. Sometimes the right answer is: this is not a behavior
we should be persuading users into. The user's motivation is correctly
low because the behavior isn't aligned with their values. Don't push.

---

_Sources: Edward Deci & Richard Ryan, Self-Determination Theory; B.J.
Fogg, Tiny Habits; Peter Gollwitzer, implementation intentions; Joe
Edelman, empowering design; Tristan Harris, positive doctrine for choice
architecture._
