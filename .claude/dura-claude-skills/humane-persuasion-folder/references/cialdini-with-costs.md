# Cialdini with Costs — Tier 2 Techniques

Compliance-engineering techniques. These work — empirically, robustly —
but they cost user autonomy. The skill recommends them only when:

1. The user-benefit case is explicit and defensible
2. Tier 1 alternatives were considered and ruled out for stated reasons
3. The autonomy cost is disclosed in the design output
4. The team has explicitly accepted the trade-off

Most product requests should be served by Tier 1. Tier 2 is the exception.

---

## Why "With Costs"

Robert Cialdini's _Influence_ (1984) catalogued six principles of
compliance: reciprocity, commitment/consistency, social proof, authority,
liking, and scarcity. The principles are real. They work. They've been
deployed across billions of user-facing interactions in the last two
decades.

The cost of using them: each one bypasses some portion of the user's
deliberate decision-making. The user complies — but they comply through
an exploited cognitive bias, not through a fully reflective choice.

Sometimes that's acceptable. A health intervention reminding patients of
similar others completing treatment may save lives even if the social
proof bypasses pure deliberation. A safety warning leveraging authority
may prevent harm.

But the techniques are dangerous because they work. Used carelessly,
they produce manipulation at scale — which is exactly what the Stanford
PTL alumni built and Tristan Harris later disowned.

The skill's posture: yes, these tools exist; no, they're not the
default; every use comes with disclosure.

---

## The Six Principles, With Their Autonomy Costs

### Principle 1 — Reciprocity

**The mechanism:** humans feel obligation to return favors. Give
something first; the recipient feels pressure to give back.

**The autonomy cost:** the recipient's "yes" is partly produced by
obligation, not by reflective evaluation of whether they want to give.
At scale, this produces a population of users feeling indebted to
platforms — a relational dynamic the platforms exploit.

**Acceptable uses (with disclosure):**

- Free educational content given without explicit ask for return
- Genuine value provided before subscription pitches (sample chapters,
  free trials with no auto-charge)

**Refused uses:**

- Engineered "thank you" prompts after platform-initiated favors
- "We did X for you, now do Y for us" obligation chains
- Faux-personal gestures designed to trigger reciprocity responses

**Disclosure language:**

> "This design uses reciprocity. We provide [free thing]; users feel
> some obligation to [return action]. The autonomy cost is moderate —
> users may comply through felt obligation rather than reflective
> choice. Acceptable here because the free thing has standalone value."

---

### Principle 2 — Commitment and Consistency

**The mechanism:** humans want to be consistent with prior commitments.
Get a small commitment first; later asks for related larger commitments
are more likely to succeed.

**The autonomy cost:** the user's later "yes" is partly produced by
commitment to consistency, not by independent evaluation of the larger
ask. Foot-in-the-door techniques exploit this.

**Acceptable uses (with disclosure):**

- The user explicitly states a goal; later prompts reference that
  stated goal honestly
- The user opts into accountability ("remind me if I miss this")
- Public commitment when the user voluntarily chose to make it public

**Refused uses:**

- Engineered initial commitments designed to set up later asks
- "Foot-in-the-door" sales tactics (small ask, then bigger ask, then
  bigger)
- Sunk-cost framing ("you've already done X, you might as well do Y")

**Disclosure language:**

> "This design uses commitment-consistency. The user stated [goal];
> later prompts reference that goal. Autonomy cost is low if the original
> commitment was freely given; moderate if the original commitment was
> engineered. Acceptable here because the user explicitly opted into
> goal-tracking."

---

### Principle 3 — Social Proof

**The mechanism:** humans look to others' behavior to inform their own,
especially in uncertainty. "X% of users do Y" influences whether the
viewer does Y.

**The autonomy cost:** the viewer's choice is partly produced by
conformity pressure, not by independent evaluation. Bandwagon effects
override individual judgment.

**Acceptable uses (with disclosure):**

- Real data from similar others, with the similarity disclosed
  ("organizers your size typically choose X")
- Reviews from verified users, in their own words
- Aggregate statistics offered as information, not pressure

**Refused uses:**

- Fabricated social proof ("123 people are looking at this right now")
- Manufactured FOMO ("everyone's signing up!" when they aren't)
- Vague social proof divorced from the user's actual peer group
- Real-time activity tickers engineered to drive urgency

**Disclosure language:**

> "This design uses social proof. We show [real data] from [similar
>
> > users]. Autonomy cost is low — the data is accurate and helps users
> > make informed comparisons. Would be moderate if the comparison group
> > were less similar; would be high (refused) if fabricated."

---

### Principle 4 — Authority

**The mechanism:** humans defer to perceived authority. Endorsements
from experts, credentials, formal-sounding language all increase
compliance.

**The autonomy cost:** the user's "yes" is partly produced by deference,
not by independent evaluation of the underlying claim. At scale, this
produces credulity rather than informed consent.

**Acceptable uses (with disclosure):**

- Expert endorsements from genuinely-credentialed sources, disclosed
- Safety warnings sourced from regulatory bodies
- Medical/legal information sourced from actual professionals

**Refused uses:**

- Faux-authority signals (formal-looking badges with no actual
  certification)
- Misleading expert credentials
- "Studies show" without actual citation
- Authority framing for opinions that should be the user's call

**Disclosure language:**

> "This design uses authority. We cite [actual expert/credential].
> Autonomy cost is low when the authority is genuine and the user can
> verify; high (refused) when the authority is manufactured."

---

### Principle 5 — Liking

**The mechanism:** humans comply more with people they like. Similarity,
attractiveness, compliments, association with positive things all
increase compliance.

**The autonomy cost:** the user's choice is partly produced by affinity,
not by evaluation of the actual offer. This becomes especially dangerous
in AI contexts (anthropomorphic AI).

**Acceptable uses (with disclosure):**

- Voice and tone that respects the user's intelligence and time
- Visual design that's pleasant without being manipulative
- Genuine warmth in human-to-human contexts (customer service)

**Refused uses:**

- Engineered AI personalities designed to foster bond (see refusal list)
- Manipulative tone shifting based on user emotional state
- Faux-friendliness designed to lower defenses against upsell

**Disclosure language:**

> "This design uses liking. The interface is friendly and the copy is
> warm. Autonomy cost is low when the warmth is honest; would be moderate
> if engineered to manipulate; would be high (refused) if used to bypass
> user defenses against unwanted asks."

---

### Principle 6 — Scarcity

**The mechanism:** humans value scarce things more than abundant ones.
Limited time, limited quantity, limited access all increase compliance.

**The autonomy cost:** the user's choice is partly produced by urgency
that overrides reflection. Scarcity is the most-abused Cialdini
principle in modern product design.

**Acceptable uses (with disclosure):**

- Real scarcity disclosed honestly ("12 spots remaining at this event")
- Time-bounded offers when the time bound is real ("registration closes
  Friday because the event is Saturday")
- Capacity limits that exist for genuine reasons

**Refused uses:**

- Manufactured scarcity ("only 3 left!" when stock is unlimited)
- Fake countdown timers
- Engineered urgency on decisions the user could safely take longer on
- Scarcity framing on subscription offers ("price goes up tomorrow!"
  when it doesn't)

**Disclosure language:**

> "This design uses scarcity. The scarcity is [real reason]. Autonomy
> cost is low when the scarcity is genuine and disclosed; high (refused)
> when manufactured."

---

## Loss Aversion (Kahneman/Tversky)

Not strictly Cialdini, but in the same Tier 2 category.

**The mechanism:** losses loom roughly 2x larger than equivalent gains.
Framing a choice as preventing a loss vs. acquiring a gain produces
different choices.

**The autonomy cost:** loss-aversion framing exploits a documented
cognitive bias. The user makes a less reflective choice than they would
without the framing.

**Acceptable uses (with disclosure):**

- Preserving a state the user has already chosen ("you'll lose access on
  X if you don't renew" — factual, the loss is real)
- Reminding the user of progress they've made ("you've built a 6-month
  habit; here's what changes if you stop")

**Refused uses:**

- Loss framing on fresh choices the user hasn't yet committed to
- Manufactured loss ("you'll miss out on Y!" where Y wasn't promised)
- Sunk-cost manipulation
- Endowment effect manipulation (treating temporary access as something
  the user "owns")

**Disclosure language:**

> "This design uses loss aversion. The loss being framed is [real loss].
> Autonomy cost is moderate — exploits a documented bias. Acceptable
> here because the loss is genuine and the user already chose this state."

---

## When to Recommend Tier 2

The skill recommends a Tier 2 technique when:

1. ✅ The Fogg diagnosis points at motivation (not just ability or
   prompt)
2. ✅ Tier 1 techniques have been considered and judged insufficient
3. ✅ The user-benefit case is explicit and defensible
4. ✅ The technique used is the smallest-cost option that achieves the
   goal
5. ✅ The autonomy cost is disclosed
6. ✅ The team has explicitly accepted the trade-off

If any of these are missing, recommend Tier 1 only.

---

## When to Refuse Tier 2

Some uses of Cialdini principles are refused outright regardless of the
disclosure. These map to the hijacks list (`the-ten-hijacks.md`):

- Manufactured social proof → refused
- Manufactured scarcity → refused
- Faux authority → refused
- Engineered reciprocity → refused
- Loss framing on fresh choices → refused
- Foot-in-the-door manipulation → refused
- Anthropomorphic liking exploitation → refused

The skill names the refusal and offers a Tier 1 alternative.

---

## The Disclosure Discipline

Every Tier 2 technique that ships gets disclosed in the design output.
This is non-negotiable. The disclosure is the discipline.

```
TIER 2 TECHNIQUES USED
- [Technique]: [where, why, and what autonomy cost it carries]
- [Technique]: [where, why, and what autonomy cost it carries]

USER-BENEFIT CASE FOR EACH
- [Why this technique serves the user, not just the platform]

ALTERNATIVES CONSIDERED
- [Tier 1 techniques evaluated and reasons each was insufficient]
```

The disclosure goes to the team's record. It exists so:

- Future ethics review can audit the design
- The team is honest with itself about what it built
- A journalist asking "did you knowingly use manipulation techniques?"
  can be answered with a documented record showing what was used,
  considered, and disclosed

This is the design equivalent of clinical trial disclosure. It's slower.
It's also how the field grows up.

---

_Sources: Robert Cialdini, Influence (1984); Daniel Kahneman & Amos
Tversky, prospect theory and loss aversion; Center for Humane Technology
critique of Cialdini-driven product design; Tristan Harris, How
Technology Hijacks People's Minds — which named the cumulative effect
of these principles deployed at scale as "hijacking."_
