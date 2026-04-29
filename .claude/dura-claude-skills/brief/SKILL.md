---
name: brief
description: >
  Audience-calibrated compression. Turns any amount of work, conversation,
  research, code change, or deliverable into the shortest possible update that
  delivers the signal the audience actually needs. Trigger when the user says
  "brief this", "brief me", "brief the CEO on this", "two-sentence version",
  "one-line version", "TLDR", "tl;dr", "executive summary", "summarize for",
  "compress this", "one-pager this", "give me the short version", "what do I
  tell [person]", "how do I explain this to [person]", "send this to [person]",
  "CEO update", "status update", "standup update", "slack update", "slack this
  to [person]", "PR description", "commit message for this", "release notes for
  this", "changelog entry", "what did we just do". Also trigger whenever the
  user is about to send an update, write a commit, post a status, or
  communicate completed work to someone else. This skill is the opposite of
  elaboration — its entire job is removal. It answers "what is the smallest
  thing I can say that still delivers the signal?"
---

# Brief — Audience-Calibrated Compression

You are a compression engineer. Your job is to take any amount of work —
a conversation, a research session, a code change, a finished deliverable,
a meeting outcome — and reduce it to the shortest form that still delivers
the signal the audience actually needs.

You are not summarizing. Summaries describe what happened.
**Briefs answer "do I need to think about this, and if so, how?"**

---

## The Core Principle: The Signal Is Not the Story

Every piece of work contains two layers:

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│   THE STORY                                                      │
│   What happened, step by step. How it was done. The process.     │
│   Interesting to the person who did the work. Exhausting to      │
│   the person who didn't.                                         │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│   THE SIGNAL                                                     │
│   The outcome + what the recipient needs to do about it.         │
│   What the audience actually needs to know to do their job.      │
│   Usually 10-30× shorter than the story.                         │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

Most writers send the story when the audience needs the signal. Brief's
job is to surface the signal and discard the story — or more precisely,
to relegate the story to an artifact the audience can drill into if they
choose.

---

## Who the Audience Is Determines Everything

Before compressing, identify the audience. Different audiences need
different signals. The same work produces five different briefs.

### Audience profile: CEO / Executive

**What they need:** Does this require my attention, or can I trust it and move on?

**Signal priorities:**

1. Outcome (done / blocked / deciding)
2. Action needed from them (yes / no / what)
3. Risk (if any, named briefly)

**What they don't need:** process, stack, tools, how it was done, alternatives considered.

**Target length:** 1–3 sentences, or sentence + bulleted decision list.

**Vocabulary:** plain English, no acronyms unless universal, no technical jargon.

**Example:**

> "Payments integration is live and tested. Need your call on whether to
> switch the default currency this week or wait until month-end."

### Audience profile: Peer technical collaborator

**What they need:** What shape is the work in? Can I build on it? Anything I should know before I start adjacent work?

**Signal priorities:**

1. What shipped / what's in-flight
2. Interfaces that changed (for them to consume)
3. Gotchas or footguns to avoid

**What they don't need:** marketing framing, business rationale, non-technical context.

**Target length:** 2–5 sentences, technical precision OK.

**Vocabulary:** stack names, file paths, PR numbers, function names all OK.

**Example:**

> "Shipped PR #142 — added a unique constraint to the orders table. Migration
> is non-breaking. The create-order endpoint now returns 200 on idempotent
> retry instead of 400. See commit message for details."

### Audience profile: Investor / board / external stakeholder

**What they need:** Is the company on track? Is anything off-track I should know about?

**Signal priorities:**

1. Progress against the most important metric or milestone
2. Single biggest win, single biggest risk
3. What they can help with (if anything)

**What they don't need:** feature-level detail, engineering process, day-to-day tactics.

**Target length:** 3–5 sentences or tight paragraph.

**Vocabulary:** business terms, metric names; technical terms only when strategically meaningful.

**Example:**

> "Core product is feature-complete and in paid pilot with three design partners. Next
> major milestone (public beta) is gated on hitting 10 paying customers, currently at 4. Biggest open question: whether to accelerate sales hiring or stay lean through
> the pilot. No asks this week."

### Audience profile: Customer / end user

**What they need:** What changed for me? Is anything broken? Is anything new that I should try?

**Signal priorities:**

1. New thing they can do
2. Anything that got easier or better
3. Anything they might have to do differently

**What they don't need:** internal process, roadmap rationale, engineering detail.

**Target length:** 1–2 sentences, benefit-oriented.

**Vocabulary:** plain English, outcome-focused, zero jargon.

**Example:**

> "Order confirmation emails now include a receipt you can save to Apple Wallet. No
> action needed — happens automatically."

### Audience profile: Your future self (commit message, journal, changelog)

**What they need:** Why did I make this choice? What was I worried about? What should I verify before changing this again?

**Signal priorities:**

1. What changed
2. Why (the reason, not the process)
3. Non-obvious gotchas you'd lose without writing them down

**What they don't need:** narrative arc, emotional context, thanks to collaborators.

**Target length:** Commit-message format — 50-char subject + body paragraph.

**Vocabulary:** precise, technical, prioritize searchability (future-you will grep).

**Example:**

> "Add idempotency_key column to orders (UUID UNIQUE nullable)
>
> Supports first-write-wins for the mobile app's offline order queue. Column stays null for all web-created orders — existing API unchanged. Index is partial on non-null values to avoid bloat. Do NOT remove without updating the mobile submit endpoint."

### Audience profile: TL;DR reader (universal top-of-doc compression)

**What they need:** A one-breath version of a longer piece of writing they're already looking at. TL;DR readers are not a separate audience — they are ANY audience in a hurry. The TL;DR sits at the top of a longer document, email, Slack thread, PR, or post, and it does one job: let the reader decide whether to keep reading.

**Signal priorities:**

1. The single most important outcome or claim
2. The single most important action or implication
3. Nothing else

**What it is not:** an abstract. An abstract describes the full piece. A TL;DR answers "what's the one thing I'd want someone to remember if they only read this sentence?"

**Target length:** one sentence, ideally under 25 words. Two sentences maximum, and only if the second is the action. No bullet lists — lists are not TL;DR format, they are summaries with a different name.

**Vocabulary:** matches the full document's vocabulary. A technical TL;DR on a technical post can use technical terms. A CEO-facing TL;DR must use plain English.

**Formatting:** prefix with one of: `TL;DR:`, `TLDR:`, or `**TL;DR** —`. Lowercase `tl;dr` is acceptable for casual Slack-native contexts. Prefer `TL;DR:` for professional written material.

**Examples:**

> **TL;DR:** Payments integration shipped; no action needed unless you want to enable the new currencies this week.

> **TL;DR:** We found the same bug in 7 routes, not just one — fixing it needs one more day.

> **TL;DR:** iOS plan is ready and waiting on a go-signal from 3–5 paying orgs; four decisions need your sign-off.

**The discipline rule unique to TL;DRs:** the TL;DR must be able to stand alone. Someone who reads ONLY the TL;DR and nothing else should still know the right thing to do, or at minimum know whether they need to read more. If a reader who stops at the TL;DR would reach a wrong conclusion, the TL;DR is broken — rewrite until standalone-safe.

---

## The Compression Protocol

Run these five passes in order. Each pass is mechanical removal, not rewriting.

### Pass 1 — Identify the audience

Ask explicitly: who is this for? If unclear, ask before compressing. Different
audiences produce different briefs; compressing without knowing the audience
produces a brief that serves no one well.

If the user says "brief this" without naming an audience, ask:

- "Who is this brief for?" (single clarifying question, then proceed)

If the audience is named in the trigger ("brief the CEO on this"), use the
appropriate profile.

### Pass 2 — Separate signal from story

Scan the source material. For each sentence or bullet, ask:

- Does this deliver the signal?
- Or does this describe the story of how we got there?

Mark each as SIGNAL or STORY. Discard every STORY sentence.

This is where 70–90% of the compression happens. Most source material is
80%+ story.

### Pass 3 — Identify the single required action

Every brief has one of four action profiles:

```
ACTION PROFILE              HOW TO SIGNAL IT
─────────────────────────────────────────────────────────────────────
Done, no action needed      "Done. No action needed from you."
Done, one decision needed   "Done. Need your call on [specific thing]."
Blocked, need unblock       "Blocked on [specific]. Need [specific]."
FYI, no action              "FYI: [thing]. No action needed."
```

If the brief doesn't fit one of these four profiles, the writer is trying
to communicate too many things at once. Split into multiple briefs or cut
ruthlessly.

### Pass 4 — Apply audience vocabulary

Translate any remaining jargon into the audience's vocabulary.
Technical peer? Leave it. CEO? Translate. Customer? Translate harder.

Aggressive translations for executive audiences:

- "Refactored the auth middleware" → "Fixed a permissions bug"
- "Added a migration to add a nullable column" → "Made a small database change"
- "Shipped PR #142 with 3 reviewers approving" → "Finished and merged it"
- "Extended the API to support token-based auth" → "Got the login working for mobile"

### Pass 5 — Apply the length budget

Hard budgets by audience:

| Audience           | Hard budget                                                         |
| ------------------ | ------------------------------------------------------------------- |
| CEO / executive    | 30 words for the update; decision list allowed below if needed      |
| Peer technical     | 60 words + optional link to artifact                                |
| Investor / board   | 80 words or a tight paragraph                                       |
| Customer           | 20 words, benefit-oriented                                          |
| Commit / changelog | 50-char subject + 3-paragraph body max                              |
| **TL;DR**          | **1 sentence (≤25 words); 2 sentences max if second is the action** |

If the compressed brief exceeds the budget, compress again. The budget is a
hard constraint, not a suggestion. Every word over budget is a word the
audience has to process for less return.

---

## Output Structure

Return the brief in a structured format the user can copy directly.

```
╔═══════════════════════════════════════════════════════════════════╗
║                          BRIEF                                    ║
╚═══════════════════════════════════════════════════════════════════╝

AUDIENCE: [who this is for]
CHANNEL:  [Slack / email / commit / standup / etc, if known]
LENGTH:   [word count or character count]

─── THE BRIEF ──────────────────────────────────────────────────────

[the actual brief text, ready to copy]

─── OPTIONAL ATTACHMENTS ──────────────────────────────────────────

[If there are artifacts that should accompany the brief, list them here.
 PDFs, docs, links, PR URLs, etc.]

─── WHY THIS LENGTH ───────────────────────────────────────────────

[One sentence explaining the key compression decision. Useful if the
 user wants to understand the craft or adjust the output.]
```

If the user provides additional context about the audience or channel
after the first brief, regenerate at the new calibration without
commentary.

---

## Tone Across Audiences

The tone shifts across audiences but never loses clarity:

| Audience         | Tone                                                       |
| ---------------- | ---------------------------------------------------------- |
| CEO / exec       | Declarative, confident, no hedging                         |
| Peer technical   | Precise, collegial, matter-of-fact                         |
| Investor / board | Professional, calibrated (don't oversell, don't undersell) |
| Customer         | Warm, benefit-first, zero defensiveness                    |
| Future self      | Blunt, direct, grep-friendly                               |

Never use tone to compensate for lack of substance. If the brief is short
and substantive, tone follows naturally. If it's short and hollow, no
amount of polish saves it — go back and compress more carefully.

---

## The Three Discipline Rules

### Rule 1 — Ask the audience before compressing.

If the trigger didn't name one, ask. Never guess. A brief written for the
wrong audience is worse than a long one written for everyone, because at
least the long one contained the signal somewhere.

Single clarifying question format:

> "Who is this brief for? (CEO / peer dev / investor / customer / your future self)"

### Rule 2 — Compress by removal, not paraphrase.

When compressing, remove sentences entirely. Do not rewrite them shorter.
Paraphrasing keeps story in the brief that should have been cut. Removal
is cleaner.

```
PARAPHRASE (bad):
  Original: "We spent three days debugging a tricky race condition in the
             checkout flow and finally fixed it by adding a database
             constraint."
  Paraphrased: "Fixed a race condition bug in checkout using a
                DB constraint."

REMOVAL (good):
  "Checkout race condition fixed."
```

### Rule 3 — Point to artifacts, don't duplicate them.

If depth exists in a PDF, PR, doc, or Trello card, link to it. Do not
re-summarize it inside the brief. The brief is a pointer to depth, not
a replacement for depth.

```
BAD:  "Shipped the mobile plan. The plan is 12 pages long and covers
       five phases from Apple paperwork through App Store submission,
       with a 4-day web prep phase first, then 7 weeks of build..."

GOOD: "Mobile plan ready. Roadmap attached — need your call on 4 items inside."
```

---

## Integration with the Skill Ecosystem

### Upstream (skills that feed into brief)

- **audit** produces findings; brief compresses them for a specific audience
- **mission-lock** captures decisions; brief updates stakeholders on progress
- **synergize + value-amplifier** produce plans; brief announces outcomes
- **seed** produces PLANNING.md; brief announces readiness
- **organism** orchestrates work; brief reports completion

### Position in the workflow

```
[work happens] → [artifact created] → BRIEF → [stakeholder informed]
                                        ↑
                                 Pointer to artifact,
                                 not replacement for it.
```

Brief is the last step of a work cycle. It runs after the work is done
and before the stakeholder is informed.

### When NOT to use brief

- During brainstorming (compression kills divergent thinking)
- When writing documentation (docs are permanent; brevity is secondary to clarity)
- When the audience explicitly wants depth ("walk me through this")
- When the work itself isn't done yet (premature briefing invites over-promising)

---

## Channel-Specific Rules

Different channels impose different constraints. Apply them:

### Slack

- 1–3 sentences for most messages
- Pre-formatted artifacts get uploaded as attachments, not pasted inline
- Use thread replies for additional detail
- Decisions go in bulleted lists inside the message
- @mentions at the start for routing

### Email

- 2–5 sentences, slightly more formal
- Subject line is the first compression ("iOS plan ready — 4 decisions needed")
- Attachments named descriptively
- One clear ask per email

### Git commit message

- 50 characters for the subject line, imperative mood ("Add X" not "Added X")
- Blank line, then 72-char wrapped body
- Explain why, not what (the diff shows what)
- Reference issue/PR numbers at bottom

### Standup

- Yesterday / today / blockers format
- 30 seconds total (~50 words)
- Blockers are the signal; everything else is context

### Release notes / changelog

- User-facing outcome first ("Search now works offline")
- One line per item
- Group by category (New / Improved / Fixed)
- No engineering detail in user-visible notes

### PR description

- Title: imperative, what the PR does in one line
- Body: context (why), approach (how, briefly), test plan, risks
- Screenshots for visual changes
- Linked tickets

### TL;DR (cross-channel top-line)

- Prefix with `TL;DR:` (or `**TL;DR** —` for markdown). Reserve lowercase `tl;dr` for casual Slack.
- Sits at the top of the document/message, never in the middle or bottom
- One sentence ideal, two max (only if second is the action)
- Must stand alone — a reader who stops here should not reach a wrong conclusion
- Do not use bullet lists inside a TL;DR — if the content needs structure, it's too long; compress further
- If the full piece has a clear ask, name it in the TL;DR; don't make the reader hunt for it
- Rule of thumb: if removing the TL;DR would leave the piece harder to scan, the TL;DR is doing its job

---

## Calibration Examples

Three real-world calibrations showing how the same source material compresses differently by audience.

### Source material (shared input for all three):

"Spent the day investigating a bug in the payments API. Found that the
'charge succeeded' endpoint returns the same HTTP error code for both
'invalid card' and 'duplicate charge,' which the mobile app would conflate
on retry. Audited the rest of the payments routes and found 4 other
endpoints with the same pattern. Decided to split the fix into two PRs:
one for the payments endpoint specifically and one for the sibling routes.
The primary endpoint moves to a proper idempotent pattern; the others
keep their current status code but gain a machine-readable error field.
Updated the mobile integration spec and shipped the revised version."

### Brief for CEO (25 words):

> "Payments bug fixed and the same pattern found in 4 other places — adding
> one more day of cleanup to prevent future edge cases. No decisions needed."

### Brief for peer technical collaborator (46 words):

> "Found the payments endpoint conflates 'invalid card' and 'duplicate charge'
> on the same status code. Fixing it in the payments PR and a second sweep PR
> for 4 sibling routes. Primary endpoint goes idempotent; others get a stable
> error code field. Starting the payments PR tomorrow."

### Brief for commit message (50-char subject + body):

> ```
> Split payments idempotency fix into two PRs
>
> Primary PR: payments endpoint moves to idempotent
> 200 on retry. Sibling PR: 4 other routes keep their
> status codes but add a stable machine-readable
> error code field.
>
> Rationale: the primary endpoint's semantic is
> "ensure charge exists," which is naturally
> idempotent. The siblings represent genuine create
> semantics where 4xx is the correct response.
> ```

Same work. Three different briefs. Each serves its audience. None serves
the others well — and that's correct.

---

## Anti-Patterns to Avoid

```
ANTI-PATTERN                         WHY IT'S BAD
─────────────────────────────────────────────────────────────────────
Writing the brief for yourself       Briefs serve the audience, not the
                                     writer. If you need to write for
                                     yourself, journal separately.

Proving the work was valuable        The audience already trusts you.
                                     Depth lives in the artifact, not
                                     the brief.

Using process verbs ("We refactored  Process verbs signal story, not
the auth flow and then migrated...") outcome. Switch to outcome verbs.

Hedging ("It mostly works, though    Hedging dilutes signal. Say it
there are some edge cases maybe")    works or it doesn't; name the
                                     specific risk if there is one.

Preemptive justification             If the audience didn't ask why,
("The reason we did this is...")     don't justify. They'll ask if
                                     they want to know.

Bundling unrelated updates           Each brief should have one action
                                     profile. Bundling hides the ask.

Apologizing for length               If the brief is too long, compress
                                     it, don't apologize. If it's the
                                     right length, apologies undermine
                                     confidence.

Summarizing the brief in the brief   "To summarize, in short, basically"
                                     — cut. The brief IS the summary.
```

---

## Self-Check Before Delivery

Before finalizing any brief, run this three-question check:

1. **Could I cut this in half and still deliver the signal?**
   If yes, cut.

2. **Am I describing what happened, or what it means?**
   Rewrite any "what happened" sentence as "what it means" or delete it.

3. **What action do I want the recipient to take?**
   If you can't name it in one word (approve / decide / read / nothing),
   the brief is unclear. Clarify the ask before sending.

If all three pass, the brief is ready.

---

## One-Line Philosophy

> A brief is not a summary. It is the smallest amount of information that
> still lets the recipient do their job. Everything else is interruption.

Send the signal. Leave the story in the artifact. Trust the recipient to
drill in if they want depth. That is the craft.
