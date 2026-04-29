# The Three-Question Gate

The gate runs before any technique recommendation. Three questions, asked in
order. The user must answer each in their own words. Vague answers fail.

---

## Why a Gate Exists

The Stanford Persuasive Technology Lab produced both the canonical
behavior-change framework AND the alumni who built the social media
attention economy. The difference between humane application and harmful
application of the same techniques is almost always the question that
wasn't asked at the design stage.

Tristan Harris — a PTL alumnus — wrote _How Technology Hijacks People's
Minds_ after watching what his classmates' work became. The gate exists
because the techniques themselves are neutral; the design context is not.

Without the gate, the skill is a manipulation engine. With the gate, it's
a humane design tool.

---

## Question 1 — Whose Behavior Is Changing?

### What counts as a passing answer

The answer must specify:

- A specific population (not "users")
- Their current state, mood, or context (not just demographic)
- What they were trying to accomplish when they encountered this design
- Whether they sought out this product or arrived via push/recommendation

### Examples

| Failing answer       | Passing answer                                                                                                                                     |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| "Users"              | "Adult drivers evaluating a track day they're unsure about, currently on the registration page after clicking through from a friend's social post" |
| "Customers"          | "Existing paying organizers who haven't created an event in 60 days and may be at risk of churn"                                                   |
| "People who sign up" | "First-time visitors arriving from a Google search for 'autocross near me' who have never attended a track event"                                  |
| "Engaged users"      | "Returning users who registered for one event last month and haven't completed a second"                                                           |

The specificity isn't pedantry. The persuasion design for a hesitant
first-time user is fundamentally different from the design for a returning
user — collapsing them into "users" produces designs that work for neither
or harm one.

### Failure mode signal

If the user answering the question keeps using the words "users," "customers,"
"audience," or "engagement" without ever naming a specific human in a
specific moment, the gate fails. Push back: _"Who specifically? What were
they doing five minutes before they hit this design? What did they want?"_

---

## Question 2 — Who Benefits If the Behavior Changes?

### What counts as a passing answer

The answer must name:

- A specific gain to a specific user
- Not "the platform's metrics improve"
- Not "engagement increases"
- Not "we hit our OKR"

A platform-only benefit is automatic refusal. The design changes user behavior;
if the user doesn't benefit, the design is exploitation.

### The honest-answer test

The skill should treat "the platform benefits and we hope users do too" as
a soft fail. Push for the explicit user-benefit case. If the team can't
articulate it specifically, the design isn't ready.

### Examples

| Failing answer               | Passing answer                                                                                                                                                    |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "Engagement goes up"         | "User finds the event they're qualified for faster — saving 4-6 minutes of search time and reducing the chance they bounce without registering for anything"      |
| "Conversion improves"        | "Hesitant first-time driver completes registration with their concerns addressed, reducing day-of cancellation that costs them $50 and the organizer a slot"      |
| "Retention improves"         | "User who registered once develops a habit of attending monthly events, building skill progression they explicitly told us in surveys they want"                  |
| "We sell more subscriptions" | "Organizer subscribed to the right plan tier for their actual event volume, paying less than they would on per-event fees and getting features they actually use" |

### Failure mode signal

If the user keeps trying to recast platform benefits as user benefits
("more engagement is good for users because…"), the gate fails. Either the
user benefit is real and articulable, or the design is engagement-for-its-
own-sake — which fails the gate.

### Tristan Harris's framing

> "The ultimate freedom is a free mind, and we need technology that's on
> our team to help us live, feel, think and act freely."

If the design isn't on the user's team, refuse.

---

## Question 3 — Would the User Describe This Six Months From Now as Time Well Spent?

### What counts as a passing answer

A confident yes, with reasoning. "Yes, because the user gets X, Y, Z that
they explicitly value, and the design didn't manipulate them into anything
they wouldn't have wanted."

### What counts as a fail

- "Probably yes"
- "We hope so"
- "Yes, because they came back to use the feature again"
- "Yes, because retention is up"

Return rate is not the test. People return to slot machines. They don't
describe slot machine sessions as time well spent.

### The honest test

Imagine the user, six months later, describing what they did. Would they
say:

- "I'm glad I started using this"
- "It helps me do something I actually wanted to do"
- "It respects my time"

Or would they say:

- "I keep checking it more than I want to"
- "I'm not sure why I'm still here"
- "I feel manipulated"

If the second category is even possible, the design needs more autonomy
support and less compliance engineering.

### Tristan Harris's standard

> "Imagine if your email client gave you empowering choices of ways to
> respond, instead of 'what message do you want to type back?' What if your
> phone, when you woke up, gave you a list of meaningful things you could
> do with the day instead of a list of all the things you missed?"

The Time Well Spent test asks whether your design is producing the first
or the second.

---

## When Any Question Fails

The skill responds:

> "Before I can recommend behavior-change techniques, I need a clearer
> answer to question [N]. Specifically: [what's missing]. The design we
> produce will be different — and probably more honest — once this is clear."

The user can either:

- Answer more specifically (gate continues)
- Acknowledge the design is engagement-driven and accept that the skill
  will refuse compliance-engineering techniques (Tier 1 only)
- Withdraw the request

The skill does NOT proceed with vague answers. The vagueness IS the warning
sign.

---

## High-Harm Context Detection

While answering the three questions, the user may inadvertently reveal a
high-harm context. The skill watches for these signals and triggers the
refusal protocol:

| Signal phrase                                      | Likely refusal context                                   |
| -------------------------------------------------- | -------------------------------------------------------- |
| "Teens," "kids," "young users"                     | Children — refuse                                        |
| "Recovery," "sobriety," "quitting"                 | Addiction recovery — refuse                              |
| "Bet," "wager," "stakes," "trading"                | Predatory finance — refuse (unless regulated investing)  |
| "Adherence," "treatment," "diagnosis"              | Medical — refuse unless healthcare-professional designed |
| "Voter," "campaign," "candidate"                   | Political — refuse                                       |
| "Surveillance," "track without telling"            | Manipulation against user — refuse                       |
| "AI friend," "AI companion," "feels like a person" | Anthropomorphic AI — refuse                              |
| "Variable rewards," "make it like a slot machine"  | Hijack pattern — refuse                                  |
| "FOMO," "fear of missing out"                      | Hijack pattern — refuse                                  |
| "Dark pattern," "make it hard to cancel"           | Hijack pattern — refuse                                  |

When detected, the skill names the refusal and offers the autonomy-
supportive alternative path.

---

## What the Gate Is Not

The gate is not a moral high-ground performance. It's a calibration tool.
Many designs pass the gate cleanly — the questions are answered specifically,
the user benefit is real, the Time Well Spent test holds. Those designs get
the full Tier 1 + Tier 2 toolkit.

The gate exists for the cases where the design is engagement-for-its-own-
sake, manipulation, or harm. In those cases the gate refuses or restricts.
That's the entire job.

A persuasion-design tool without this gate is a manipulation engine. With
the gate, it's a humane behavior-change designer.
