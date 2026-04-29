# The Ten Hijacks

Tristan Harris's "How Technology Hijacks People's Minds" (2016) named ten
ways technology exploits psychological vulnerabilities. This reference
expands each so the skill can recognize them when a user request would
produce them — even when the user doesn't realize what they're asking for.

These are the canonical patterns the skill refuses to design. Reading this
file gives the skill the vocabulary to identify the hijack inside the
request.

Source: Tristan Harris, _How Technology Hijacks People's Minds — from a
Magician and Google's Design Ethicist_, originally published Medium 2016,
later in The Atlantic. Foundational text of the Center for Humane
Technology.

---

## Hijack 1 — Controlling the Menu (Illusion of Choice)

### What it looks like

The user is presented with a menu of options that appears comprehensive
but is actually curated to serve the platform. The user feels they chose
freely; they chose from a constrained set.

Examples Harris named:

- "Restaurants near me" showing only paid placements
- Friend suggestions optimized for engagement, not the user's actual social graph
- Search results subtly weighted by platform interests
- Notification settings that appear granular but hide the most-impactful toggle

### How to recognize it in a request

- "Show users only the [N] best options"
- "Hide [option that's user-aligned but platform-misaligned]"
- "Default to [platform-preferred choice]"
- "Only surface [content type that drives engagement]"

### What to recommend instead

**Empowering menus** (Joe Edelman's framing). The menu the technology
offers should be:

- Comprehensive: include the genuinely best paths for the user, even ones
  that lead off the platform
- Transparent: when the menu IS curated, disclose the curation
- Reversible: the user can easily access the un-curated version

Harris's example: an email client that offered "ways to respond"
(call, schedule, decline politely, ask for clarification) instead of
just "type your reply" — expanding the user's options, not constraining
them to the typing path that drives engagement.

---

## Hijack 2 — Slot-Machine Variable Rewards

### What it looks like

The technology delivers rewards on no fixed schedule. The unpredictability
is the engagement mechanism — the user checks compulsively to find out
"what did I get?"

Examples Harris named:

- Pull-to-refresh on email/social feeds
- Notification batches that arrive irregularly
- "Likes" appearing one at a time over hours
- Tinder-style swipe interactions where match outcomes are unpredictable
- Slot machines on phones, literally

The neuroscience: variable reinforcement schedules produce the strongest
compulsion patterns in animal models. They are the most addictive form
of conditioning.

### How to recognize it in a request

- "Make it feel like a slot machine"
- "Variable rewards"
- "Unpredictable [reward type]"
- "Random [drops, surprises, bonuses]"
- "Make users come back to check"

### What to recommend instead

**Predictable, expected updates** that the user can plan around:

- Daily digest emails at a chosen time
- "Here's what changed" panels the user opens deliberately
- Achievement systems with explicit, knowable progress (not random drops)
- Reward schedules the user can predict

The exception: explicit gaming/recreational contexts where the user has
opted into a game-like experience and the variable rewards are part of
the entertainment, not embedded in productivity/finance/social/news/health
contexts.

---

## Hijack 3 — Fear of Missing Something Important

### What it looks like

The platform engineers the perception that the user might miss something
critical if they don't keep checking. The "1% chance" of an important
update creates compulsive checking even when 99% of checks find nothing
important.

Examples Harris named:

- "You have N unread notifications" badges
- "People you might know" suggestions
- "Trending now" lists
- Email subject lines designed to trigger "what if this is urgent"
- App icons with persistent badge counts

### How to recognize it in a request

- "FOMO," "fear of missing out"
- "Make users worried they'll miss something"
- "Urgent-feeling notifications"
- "Always-fresh content stream"
- "What's new since last visit" framing

### What to recommend instead

**Opt-in information surfacing**:

- Digests the user opts into, delivered at predictable times
- Search-on-demand instead of push-driven discovery
- "Here's what's new since you last visited" as a deliberate panel the
  user opens, not a constant notification stream
- Empty state design that's calm rather than anxious

---

## Hijack 4 — Social Approval Mechanics

### What it looks like

The platform engineers visibility of social attention to drive engagement.
The user feels obligated to respond to perceived social signals even when
those signals are platform-engineered, not user-initiated.

Examples Harris named:

- Read receipts (creates obligation to respond)
- Typing indicators (creates obligation to wait)
- Photo-tag suggestions (creates social work for the user)
- "Your friend X just started using this" (engineered FOMO)
- Comparison metrics (likes, follower counts) prominently displayed

### How to recognize it in a request

- "Show users when others are reading/typing/online"
- "Make social signals more visible"
- "Drive engagement through social pressure"
- "Public engagement metrics"

### What to recommend instead

**User-controlled visibility**:

- Read receipts opt-in per conversation
- Online status user-controlled
- Photo tagging requires user consent (not auto-suggested)
- Engagement metrics visible to the creator only, not the audience
- Social signals user-initiated, not engineered

---

## Hijack 5 — Engineered Social Reciprocity

### What it looks like

The platform creates obligations to respond, endorse, or reciprocate
social actions. LinkedIn endorsements were Harris's canonical example —
the platform shows you "X endorsed your skill," creating obligation to
endorse them back, which neither person actually wanted to do.

Examples Harris named:

- LinkedIn endorsements
- "X friended you, friend them back?"
- "X recommends you, recommend them?"
- Birthday reminders pushing pre-formatted messages
- "Thank X for their post" prompts

### How to recognize it in a request

- "Reciprocal engagement loops"
- "Drive mutual interaction"
- "Social obligation triggers"
- "Friend-request mechanics"

### What to recommend instead

**Voluntary connection**:

- Connection requests the user initiates because they want to, not because
  they were prompted
- No reciprocity counters or visible "you owe X a response"
- Communication tools that don't track or surface response obligations

---

## Hijack 6 — Bottomless Bowls (Infinite Scroll, Autoplay)

### What it looks like

The platform removes natural stopping cues. Without a "you're done" signal,
users consume past the point of satiation.

Examples Harris named:

- Infinite scroll on social feeds
- Autoplay next video
- Endless feed of news articles
- Email inboxes without "you've read everything" markers

The metaphor: bottomless soup bowls in psychology research — when people
ate from bowls that secretly refilled, they ate 73% more without realizing
it. The same mechanism in feeds and video.

### How to recognize it in a request

- "Infinite scroll"
- "Autoplay next"
- "Keep users engaged longer"
- "Remove friction at the end of [content unit]"
- "Continuous content stream"

### What to recommend instead

**Explicit stopping cues**:

- Pagination with "you've reached the end" markers
- Autoplay default OFF (opt-in per session if at all)
- "You've caught up" empty states celebrated as success, not failure
- Time-spent indicators the user can see while consuming

---

## Hijack 7 — Hostile Notifications

### What it looks like

Notifications optimized for engagement metrics rather than user value.
The platform interrupts the user because the interruption drives sessions,
not because the information was urgent.

Examples Harris named:

- Push notifications for non-urgent updates
- Email subject lines engineered for opens
- Badge counts on app icons
- Notification grouping designed to drive batch-checking

### How to recognize it in a request

- "Increase notification engagement"
- "Re-engage dormant users via notification"
- "Push notification optimization"
- "Notification timing for max opens"

### What to recommend instead

**User-respecting notifications**:

- Default to NO push notifications; require explicit opt-in per type
- Notification preferences granular by category and urgency
- Quiet hours respected and easily configured
- Success metric: user reports notification was useful AFTER receiving it,
  not engagement-on-arrival
- "Was this notification helpful?" feedback loops that adjust frequency

---

## Hijack 8 — Bundling (Forcing Through Unwanted Surfaces)

### What it looks like

The user wants to do X. The platform makes them do Y first. Y is the
attention surface the platform wants; X is what the user came for.

Examples Harris named:

- "Watch this ad to skip the ad"
- "Verify your account to see your messages"
- "Add 5 friends to use this feature"
- "Complete your profile to access [user-aligned thing]"
- News sites that bury the article under modal popups

### How to recognize it in a request

- "Force users through [secondary surface] before [primary goal]"
- "Required steps before [user goal]"
- "Profile completion gate"
- "Verification wall"
- "Email signup before content"

### What to recommend instead

**Direct paths to user goals**:

- The user gets what they came for; secondary surfaces are optional
- Account creation deferred until the user has experienced enough value
  to want it
- Verification only at the moment it's actually needed (security/payment)
- "Optional profile completion" with clear benefits, not gates

---

## Hijack 9 — Inconvenient Choices (Dark Patterns)

### What it looks like

The user-aligned choice is harder than the platform-aligned choice.
Cancellation flows are notorious. So are opt-outs.

Examples Harris named (and which now have a whole industry of
dark-pattern documentation):

- Cancellation requiring phone calls when signup was one-click
- Unsubscribe links that take 5 clicks to actually unsubscribe
- Cookie banners where "accept all" is one click and "reject all" is
  buried under three menus
- Default-checked "subscribe me to marketing" boxes
- "Are you sure you want to leave? You'll lose your progress!" guilt prompts

### How to recognize it in a request

- "Reduce churn / cancellations"
- "Make it harder to leave"
- "Friction in the cancel flow"
- "Opt-out should require [extra steps]"
- "Default to the higher-value subscription"

### What to recommend instead

**Symmetric paths**:

- Cancel is as easy as sign up
- Opt-out is as visible as opt-in
- Defaults serve the user's stated preference, not the platform's
- Exit prompts inform without guilt-tripping
- Refunds work the way the user expects

A useful test: would the user describe the cancellation flow as "fair"?
If not, the flow is a dark pattern.

---

## Hijack 10 — Forecasting Errors ("Just One Quick Check")

### What it looks like

The user predicts they'll spend 30 seconds; they spend 30 minutes. The
platform is designed to consume more time and attention than the user
expected, exploiting the gap between forecast and outcome.

Examples Harris named:

- "Quick check" of social feed → 20-minute scroll
- "One YouTube video" → autoplay rabbit hole
- "Just respond to this one email" → hour in inbox
- News notifications that lead to article that leads to related articles

The mechanism: humans are bad at predicting time consumption when stopping
cues are absent and intermittent rewards are present.

### How to recognize it in a request

- "Increase session length"
- "Time spent in app"
- "Reduce bounce rate"
- "Keep users in the experience"
- "Smooth scroll between [content units]"

### What to recommend instead

**Time-aware design**:

- Show the user how long the action will actually take
- Respect their stated time budget
- "You've been here 15 minutes" gentle markers (default ON, can be
  disabled by intentional choice)
- Session-length metrics that the team measures alongside satisfaction —
  not in isolation
- Stopping cues that respect the user's likely intent

---

## How the Skill Uses This List

When a user request comes in, the skill scans for hijack patterns. If
the request maps to any of the ten:

1. The skill names the hijack: _"This request maps to Hijack #N: [name]"_
2. Briefly explains why it's refused
3. Offers the autonomy-supportive alternative
4. Asks if the user wants to proceed with the alternative

Most users don't realize they're requesting a hijack. They think they're
asking for "engagement optimization" or "user activation" or "retention
improvement." Naming the pattern is the first step in showing them what
they've been trained to ask for vs. what they actually want to build.

---

## The Magician's Insight

Harris was a magician before he was an ethicist. The whole essay turns on
the parallel:

> "Magicians start by looking for blind spots, edges, vulnerabilities
> and limits of people's perception, so they can influence what people
> do without them even realizing it. Once you know how to push people's
> buttons, you can play them like a piano. And this is exactly what
> product designers do to your mind."

The ten hijacks above are the magician's tricks of digital product
design. The skill refuses to perform them. The Tier 1 techniques in the
SDT playbook are the alternative — design that helps people do what they
actually want to do, with their full perception engaged.

That's the entire difference. The techniques look similar at the surface
level. The intent and the user-experience outcome are opposite.
