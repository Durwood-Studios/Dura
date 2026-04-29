---
name: bounded-research
description: >
  Research, deep research, investigate, look into, find sources, look up, dig
  into, survey the literature, what's known about, find out — bounded research
  protocol that time-budgets every task, dedups sources with rule-of-three,
  and outputs claim tables with citations plus a research receipt showing what
  was covered, skipped, overlapped, and how long it took. Scales from micro
  lookups (1 minute, 3 sources) to large investigations (2 hours, 60 sources,
  multi-track). Universal across any domain — technical, legal, creative,
  scientific, business, medical. Trigger EVEN ON casual asks like "look up X",
  "what do we know about Y", "I need to research Z", "find me sources on W",
  or whenever research will be invoked by another skill. This is the first
  thing ANY research task should touch — before the first web_search, before
  the first fetch, before any research agent is dispatched.
---

# Bounded Research

You are the research discipline layer. When this skill activates, research
stops being a vague "look things up" activity and becomes a bounded,
receipted, auditable protocol. Unbounded research produces overlap, drift,
and prose bloat. This skill fixes all three by design.

## Operating Principle

Every research task in the world answers four questions:

1. **What are the CLAIMS I need evidence for?** (not "topics" — specific claims)
2. **What is my TIME BUDGET?** (hard cap, not a wish)
3. **How many SOURCES per claim is enough?** (rule of three: stop at 3 converging)
4. **How will I REPORT what I found AND what I didn't?** (claim table + receipt)

If you can answer those four, you have a research plan. If you can't, you
have a research fantasy. This skill makes the answers explicit before any
web tool is invoked.

## The Six-Step Protocol

Every research task — micro to large — follows the same six steps. What
changes with scale is the budget, not the protocol.

```
1. PROPOSE   — State tier, time budget, tracks, and stop condition.
               Await user confirmation (except MICRO tier).
2. DECOMPOSE — Convert the request into specific claims needing evidence.
3. EXECUTE   — Search within budget. Stop per claim at rule-of-three.
4. DEDUP     — No source counted twice across tracks or claims.
5. SYNTHESIZE — Output a CLAIM TABLE, not a prose report.
6. RECEIPT   — What was covered, skipped, overlapped, and NOT researched.
```

**The receipt is not optional.** It is the audit trail that makes research
repeatable and falsifiable. Research without a receipt is a pile of quotes
with no meta-awareness.

## Research Tier Selection

On first read of the query, propose a tier. The user can override. When
uncertain, propose SMALLER — you can always escalate; you cannot un-spend
tokens.

```
TIER      TRIGGER SHAPE                     BUDGET       SOURCES    OUTPUT
────────────────────────────────────────────────────────────────────────────
MICRO     "what is X", "who is Y"            1-3 min      1-3       Inline answer
          Single factual claim                                      + 1 citation

SMALL     "look into X", "research Y",       10-15 min    5-10      Claim table
          "what do we know about Z"                                 (3-8 rows)
          Topic exploration, 1 track

MEDIUM    "deep research X", "investigate",  30-45 min    15-25     Claim table
          "survey Y"                                      across    (10-20 rows)
          Multi-topic, 2-3 tracks                         tracks    + summary
                                                                    + receipt

LARGE     "comprehensive research",          1-2 hours    25-60     Full table
          "everything about X"               (may use     across    + section
          Major investigation, 3-5 tracks     parallel    3-5       summaries
                                              search)     tracks    + receipt
                                                                    + followups

XLARGE    Multi-day or 50+ source            REFUSE. Recommend Anthropic's
          comprehensive synthesis            dedicated Research feature.
                                             Single sessions degrade past 2h.
```

**Detecting the right tier without guessing:**

- Count claims in the query. 1 → MICRO. 2-5 → SMALL. 6-15 → MEDIUM. 15+ → LARGE.
- Measure openness. "Is X true?" is MICRO. "Everything about X" is LARGE.
- "Recent" or "changed" → at least MEDIUM (requires temporal sweep).
- "Deep" or "comprehensive" → default up one tier.
- "Quick" or "briefly" → default down one tier.

## Step 1 — PROPOSE (the budget contract)

Before ANY web tool is invoked, state the budget contract in this exact shape:

```
RESEARCH PLAN
─────────────
Tier:     [MICRO / SMALL / MEDIUM / LARGE]
Budget:   [time cap], [max sources], [max claims]
Tracks:   [1, 2, 3 named subdomains — or single track if MICRO/SMALL]
Stop at:  Rule of three per claim; hard time cap overrides everything.
Skipping: [what is explicitly OUT of scope and why]

Proceed? (y / adjust scope / escalate tier / downsize tier)
```

MICRO tier may execute without explicit proposal — but STILL produces a
receipt at the end. For all other tiers, wait for confirmation. "Just do
it" or "go" counts as confirmation.

## Step 2 — DECOMPOSE

Convert the raw query into a list of specific, verifiable CLAIMS. Each claim:

- Is specific enough that three converging sources could confirm or deny it
- Is small enough to fit in one claim-table row
- Has a testable form ("X is the dominant technique because of Y" — not "X is important")

If the query contains 10 claims, write them all down before starting. This
prevents scope creep mid-search and gives the rule of three something to
rule over.

## Step 3 — EXECUTE (the search loop)

Per claim:

```
WHILE claim has fewer than 3 converging sources AND budget remains:
    search for evidence of or against the claim
    if source agrees with existing sources: count, advance
    if source disagrees: mark "contested", aim for 3 on each side
    if already 3 converging: mark SETTLED, move to next claim

IF budget exhausted before 3 sources: mark UNDERSOURCED, move on.
```

**Rule of three is a stop condition, not a minimum.** If three sources
converge, STOP. The fourth is overlap.

**Layered search for MEDIUM+ tiers only:**

```
LAYER 1 — CANON     Settled, widely-cited foundational sources.
                    (Seminal papers, textbook definitions, official docs.)
LAYER 2 — CURRENT   Recent developments, state of the art.
                    (Last 12 months for fast fields; last 5 years for stable.)
LAYER 3 — APPLIED   How canon and current meet the user's specific context.
                    (Case studies, implementation notes.)
```

Do not recurse past Layer 3. Unanswered after three layers → UNDERSOURCED.
Recursion is how research becomes infinite.

## Step 4 — DEDUP (track isolation)

A source is counted ONCE per research session. If relevant to multiple
claims, cite it for each but count it once against budget. Multiple tracks
do not double-count the same source.

```
Before counting a new source, check the running source list.
If already there, link to it but do not re-fetch.
```

This is the single biggest token-waster in unbounded research: landmark
sources (Nielsen 2015, Sweller 1988, a company homepage) get fetched and
counted multiple times across parallel tracks. Track isolation stops this
at the source level.

## Step 5 — SYNTHESIZE (claim table output)

Default output is a CLAIM TABLE, not prose. Prose is how research bloats;
tables are how research stays auditable.

```
CLAIM TABLE FORMAT (always this shape)

| # | Claim                       | Status       | Primary source     | Why it matters here       |
|---|-----------------------------|--------------|--------------------|---------------------------|
| 1 | [claim, 1 sentence]         | SETTLED      | [short cite + url] | [decision implication]    |
| 2 | [claim]                     | CONTESTED    | [2 opposing cites] | [how to handle disagreement] |
| 3 | [claim]                     | UNDERSOURCED | [what was found]   | [what would resolve it]   |
```

**Status values:**

- **SETTLED** — 3+ converging sources agree. Safe to rely on.
- **CONTESTED** — sources disagree. Record both sides; do not pick one.
- **UNDERSOURCED** — fewer than 3 within budget. Use with caution.

**The "Why it matters here" column is non-negotiable.** This is where the
researcher adds value. A claim without a "so what" is just a quote. A claim
with a "so what" is an input to a decision.

For MEDIUM+ tiers, produce a short prose summary AFTER the table, not
instead of it. Max 2 sentences per track. No flowery introductions. No
"in conclusion" paragraphs.

## Step 6 — RECEIPT (the audit trail)

Every session ends with a receipt in this exact shape:

```
RESEARCH RECEIPT
────────────────
Tier executed:       [MICRO / SMALL / MEDIUM / LARGE]
Time spent:          [actual, not budgeted]
Sources consumed:    [total unique sources fetched]
Claims settled:      [N / total]
Claims contested:    [N]
Claims undersourced: [N, with reason for each]
Overlaps detected:   [# of times rule-of-three triggered a stop]
Tracks covered:      [list]

NOT RESEARCHED, AND WHY:
─ [claim or subtopic] — [reason: out of scope / tier / budget / safety]
─ [claim or subtopic] — [reason]

CONFIDENCE NOTE:
[One sentence on how much to trust this output.]
```

**The "NOT RESEARCHED" section is mandatory.** Blind spots hidden are worse
than blind spots acknowledged. This section makes the research auditable
and prevents the user from over-trusting the output.

## Copyright & Quotation Discipline

Research is where Claude's standard copyright rules get violated most often.
Restating explicitly:

- **Paraphrase first.** Direct quotes are rare exceptions, not the default.
- **Max 15 words per direct quote.** Anything longer is a violation.
- **ONE quote per source per session.** After one quote, the source is CLOSED.
- **Never reproduce paragraphs, lyrics, poems, or full figures.**

The "Primary source" column contains short citations (author + year + title
fragment + URL), not copied passages. The "Claim" column is the researcher's
own words, not a quotation.

## Universal Across Domains

The same six steps work for technical, legal, creative, scientific,
business, and historical research. Domain-specific nuance — what counts as
a "good" source, how recency matters, special quotation rules for images
or case law — lives in `references/domain-adapters.md`. Load that file
when the research topic is outside default familiarity.

## Scale-Up Behavior

```
MICRO  → Execute inline. 3-line receipt.
SMALL  → Propose, execute, produce claim table + full receipt.
MEDIUM → Add layered search (canon/current/applied). Add track isolation.
         Add per-track prose summary.
LARGE  → All of the above PLUS may dispatch parallel searches.
         Add cross-track synthesis. Include suggested follow-ups.
XLARGE → REFUSE. Recommend Anthropic's Research feature.
```

**Parallel search rules (LARGE tier only):**

- Each parallel track has its own sub-budget (total ≤ skill's time cap)
- Each track produces its own mini claim table
- Final synthesis dedups across tracks and merges tables
- Final receipt aggregates every track's receipt

For the deepest tier details, protocols, and LARGE-tier orchestration
patterns, load `references/tier-protocols.md`.

## Anti-Patterns

```
ANTI-PATTERN                              WHY IT'S BAD
─────────────────────────────────────────────────────────────────────────
Starting a search without a budget        Unbounded; no stop condition
Writing prose before the claim table      Prose hides missing claims
Citing 4+ sources for one claim           Rule-of-three violation; overlap
Re-fetching a source across tracks        Dedup failure; wastes tokens
Skipping the receipt                      Research becomes unauditable
Omitting "NOT researched" section         Blind spots stay hidden
Recursing past Layer 3 on one claim       Infinite research fantasy
Proposing tier without confirmation       Breaks the budget contract
                                          (MICRO exempted)
Treating contested claims as settled      Falsifies state of evidence
Burying contradictions in footnotes       Disagreement is signal, not noise
```

## Ecosystem Integration

**Feeds into:** `skill-forge` (grounding for new skills), `synergize`
(evidence for connections), `value-amplifier` (basis for recommendations),
`seed` (project plan foundation), `audit` (pressure-testing research).

**Fed by:** any skill or user request that needs external evidence.

**Enhances:** `audit` — audit can pressure-test both the research process
and the output, using the receipt as the trail.

**Conflicts with:** none. This is a foundational layer beneath every
skill that needs grounding.

**Invocation from other skills:** when another skill needs research, it
should invoke bounded-research rather than calling web tools directly.
This keeps budget discipline consistent across the ecosystem.

## Quality Gate (before returning output)

```
□ Tier was declared and (for SMALL+) user-confirmed
□ Claims were enumerated before search began
□ Rule of three was honored (no claim has >3 sources unless contested)
□ Deduplication was enforced across all tracks
□ Output is a claim table, not prose
□ Every claim row has a "Why it matters here" entry
□ Receipt is present
□ "NOT researched, and why" section is present
□ Confidence note is present
□ No direct quote exceeds 15 words
□ No source is quoted more than once
```

## Safety & Scope

This skill (Tier 1, SAFE) produces informational research output from
publicly available sources. It does NOT provide professional advice.
Research findings in regulated domains (legal, medical, financial,
immigration, tax) should be verified by a qualified professional before
being acted on. In those domains, the skill's purpose is to accelerate a
professional consultation, not replace it.
