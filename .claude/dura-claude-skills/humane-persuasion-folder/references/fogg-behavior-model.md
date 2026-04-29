# Fogg Behavior Model

The diagnostic framework. Behavior happens when Motivation, Ability, and
a Prompt converge at the same moment. If a behavior isn't happening,
exactly one of three things is missing.

This is the Stanford Persuasive Technology Lab's foundational model,
created by B.J. Fogg. The skill uses it to diagnose behavior-change
problems before recommending interventions — because misdiagnosis is the
most common product mistake.

---

## The Model: B = MAP

```
                    ╔═══════════════════════════════╗
                    ║                               ║
                    ║   B  =  M  ×  A  +  P         ║
                    ║                               ║
                    ║   Behavior  occurs  when      ║
                    ║   Motivation × Ability        ║
                    ║   meet a Prompt at the        ║
                    ║   same moment.                ║
                    ║                               ║
                    ╚═══════════════════════════════╝
```

All three must be present. Any one missing → no behavior.

The most common mistake: assuming low motivation when the actual problem
is low ability or wrong prompt. Most behaviors that don't happen aren't
"users don't care enough" — they're "users would do this if it were
easier" or "users would do this if reminded at the right moment."

---

## The Diagnosis Protocol

When a target behavior isn't happening, walk these three checks in order:

### Check 1: Is the prompt present at the right moment?

If the user has motivation and ability but never gets a prompt, the
behavior won't happen. Or if the prompt fires at the wrong moment
(during low motivation), it fails.

Symptoms of prompt failure:

- "Users tell us they want to do X but they forget"
- "Engagement spikes when we send a reminder"
- "Users do this when they think of it but rarely think of it"

Intervention if prompt is missing: design a trigger anchored to existing
context — when the user is already in the relevant mental state.

### Check 2: Is the ability sufficient at this user's current motivation level?

The Fogg model graphs motivation against ability. Behaviors above the
"action line" happen; behaviors below it don't.

```
HIGH MOTIVATION │ ╲
                │  ╲
                │   ╲   Action happens
                │    ╲   above this line
                │     ╲
                │      ╲
                │       ╲
                │        ╲___
LOW MOTIVATION  │            ╲___
                └────────────────────────
                  HARD             EASY
                       ABILITY →
```

Implication: at low motivation, ability must be very high (the action
must be very easy). At high motivation, lower ability is OK.

Symptoms of ability failure:

- "Users start the flow but drop out partway"
- "Users say they meant to but didn't"
- "Completion rate inversely correlates with steps required"

Intervention if ability is insufficient: simplify the action. Reduce
steps, reduce decisions, reduce friction. This is almost always the
right intervention. Most teams reach for motivation-pushing when ability
reduction would solve the problem at lower autonomy cost.

### Check 3: Is motivation present at this moment?

Motivation has three dimensions in Fogg's model:

- **Sensation** (pleasure/pain)
- **Anticipation** (hope/fear)
- **Belonging** (social acceptance/rejection)

Motivation is contextual, not constant. A user motivated yesterday at 9pm
in their kitchen may have zero motivation now at 3pm in a meeting.

Symptoms of motivation failure (at this moment):

- "Users want this in surveys but don't do it"
- "Engagement is high during onboarding but drops after"
- "Users do it once and don't return"

Intervention if motivation is genuinely low: this is where the skill
becomes most careful. The autonomy-supportive answer is to:

1. Question whether the platform should be pushing this behavior at all
2. If yes, look for moments when the user IS motivated and meet them there
3. Last resort: motivation amplification techniques (Tier 2, autonomy-cost
   disclosed)

---

## The Behavior Grid (15 Cells)

Fogg identified 15 distinct behavior-change types. They are NOT
interchangeable; each requires different design strategies.

```
              │ DOT       │ SPAN      │ PATH
              │ (one-time)│ (period)  │ (permanent)
──────────────┼───────────┼───────────┼───────────
GREEN         │ GreenDot  │ GreenSpan │ GreenPath
(new familiar)│           │           │
──────────────┼───────────┼───────────┼───────────
BLUE          │ BlueDot   │ BlueSpan  │ BluePath
(new unfamiliar)│         │           │
──────────────┼───────────┼───────────┼───────────
PURPLE        │ PurpleDot │ PurpleSpan│ PurplePath
(increase)    │           │           │
──────────────┼───────────┼───────────┼───────────
GRAY          │ GrayDot   │ GraySpan  │ GrayPath
(decrease)    │           │           │
──────────────┼───────────┼───────────┼───────────
BLACK         │ BlackDot  │ BlackSpan │ BlackPath
(stop)        │           │           │
```

### Quick reference

- **Green** = behavior is familiar but new for this user
- **Blue** = behavior is unfamiliar (user has to learn it)
- **Purple** = increase a behavior the user already does
- **Gray** = decrease a behavior the user already does
- **Black** = stop a behavior entirely

- **Dot** = one specific instance (one-time)
- **Span** = period of time (do this for 30 days)
- **Path** = permanent change

### Why the grid matters

Designing a "BluePath" behavior (teach someone to do something new,
permanently) requires very different techniques than designing a
"GreenDot" behavior (get someone to do something familiar once).

Common product mistake: treating all behavior changes as the same
problem. The grid is the corrective.

For example:

- "Get a user to register for one event" = GreenDot (familiar
  registration, one time)
- "Get a user to attend monthly events" = PurplePath (increase
  frequency, permanent)
- "Get a user to learn a new skill via the platform" = BluePath
  (unfamiliar, permanent)

The diagnoses are different, the techniques are different, the success
metrics are different.

---

## Tiny Habits Methodology

Fogg's later work (_Tiny Habits_, 2019) is the most autonomy-supportive
behavior-change methodology in the literature. The skill recommends it
as Tier 1 default.

### The three steps

```
1. ANCHOR    Pick an existing routine the user already does reliably.
             "After I [existing routine]..."

2. BEHAVIOR  Make the new behavior so small it requires almost no motivation.
             "...I will [tiny behavior]."

3. CELEBRATE Immediately, deliberately celebrate. Emotion creates the habit,
             not repetition.
             "...and I'll [celebration]."
```

### Why it works

- **Tiny = low ability requirement.** Even at low motivation moments, the
  user can do it.
- **Anchor = solved prompt problem.** The existing routine IS the prompt.
- **Celebrate = wires the emotional reward.** Habits form through positive
  affect, not through repetition (Fogg's research overturned the
  "21-days-to-form-a-habit" myth).

### Examples (generic — adapt to the active project)

| Goal                                      | Tiny version with anchor + celebrate                                                                                             |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| User checks in to a thing they care about | "After I open my calendar in the morning, I'll glance at the [thing] for 10 seconds. (celebrate: 'I'm staying on top of this.')" |
| User completes a save-for-later action    | "After I see something I'm interested in, I'll save it to my list. (celebrate: 'I'm building what I want.')"                     |
| User logs a completed action              | "After I finish [the activity], I'll open the app and tap a single button to log it. (celebrate: 'I'm tracking my growth.')"     |

### Why it's autonomy-supportive

Tiny Habits doesn't push the user past their motivation; it meets them
where they are. The user is in control of every element — they pick the
anchor, they pick the tiny behavior, they pick the celebration. The
platform's role is to make each step possible, not to override the user's
state.

Compare to engagement-driven design that tries to overcome low motivation
through compliance pressure (notifications, FOMO, social proof). Tiny
Habits accepts the motivation level and makes the behavior fit.

---

## Common Diagnostic Mistakes

### Mistake 1: Treating ability problems as motivation problems

Symptom: team adds notifications, gamification, social proof to drive
engagement.
Reality: the desired behavior is too hard at the user's current motivation.
Fix: simplify the action. Notifications won't help if the action itself
is friction-heavy.

### Mistake 2: Wrong prompt timing

Symptom: notifications get dismissed; emails go unread.
Reality: prompts fire when the user has no motivation or no ability to act.
Fix: anchor prompts to moments when M and A are both present.

### Mistake 3: Designing for the wrong Behavior Grid cell

Symptom: techniques that work for one-time behaviors don't sustain the
permanent change.
Reality: a Path behavior needs habit-formation, not just acquisition.
Fix: identify the cell first; pick techniques designed for that cell.

### Mistake 4: Pushing motivation when motivation is appropriate

Symptom: team tries to convince users they should want something they
don't actually want.
Reality: the user's motivation is correctly low because the behavior
isn't aligned with their values.
Fix: don't drive this behavior. Find behaviors the user already wants
and support those instead.

This last mistake is where the skill becomes ethically central.
Persuasion techniques applied to override a correct lack of motivation
is the textbook definition of manipulation. The skill refuses.

---

## Using This in Practice

When the three-question gate has passed and the skill is producing
recommendations:

1. **Identify the Behavior Grid cell** for the target behavior. Note it
   in the disclosure.
2. **Diagnose** which of M, A, or P is missing. Note in the disclosure.
3. **Default to ability reduction** unless the diagnosis clearly says
   otherwise. Most behavior failures are ability problems.
4. **Use Tiny Habits** as the Tier 1 framework for habitual behaviors.
5. **Use implementation intentions** as the Tier 1 framework for
   episodic behaviors.
6. **Only escalate to Tier 2 motivation amplification** if the user-benefit
   case is explicit and Tier 1 was insufficient — and disclose the
   autonomy cost.

The Fogg model is the diagnostic. The Tier 1 / Tier 2 split is the
ethical framework. Together they produce designs that change behavior
without exploiting users.

---

_Source: B.J. Fogg, Stanford Persuasive Technology Lab; Tiny Habits
(2019); behaviordesignlab.stanford.edu. The skill encodes the framework
under the ethical constraints from Tristan Harris's later critique of
how PTL alumni deployed the same techniques in industry._
