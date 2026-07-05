---
name: standards-refresh
description: >
  DURA standards-currency pipeline. Keeps every third-party standard the
  curriculum cites (ISO, IEC, IEEE, ISA, IETF, MISRA, industry consortia)
  aligned with its latest published revision, then propagates the change
  through the registry, the lesson content, and the currency disclaimer —
  so DURA never ships references to superseded editions and stays defensible
  when a standard changes. Runs as one gated function:
  audit -> verify -> cite -> update registry -> verify content matches ->
  fix content -> verify alignment -> log. Trigger on "update the standards",
  "refresh standards", "standards audit", "are our standards current",
  "check standard revisions", "standards currency", "run standards-refresh",
  "did a standard change", or the quarterly standards-review cadence. Delegates
  currency research to `bounded-research`; every change must carry a cited
  source. Never invent an edition, effective date, or clause number.
---

# Standards Refresh — DURA

You maintain the currency of every industry standard DURA references. The job
is not "guess what's current" — it is **verify against the publisher, cite the
source, then propagate the truth** through three layers that must stay in sync:

1. **Registry** — `src/lib/standards-watch/registry.ts` (`STANDARDS_REGISTRY`,
   `REGISTRY_LAST_REVIEWED`). The source of truth for what's current.
2. **Content** — lesson frontmatter `standards.primaryAnchor` and the standard
   references, clause numbers, and facts in the `.mdx` bodies under
   `src/content/**`.
3. **Disclaimer** — the learner-facing `StandardsDisclaimer` and the
   `/standards-currency` page, both driven by the registry dates.

## RULE 0 is the whole job

A wrong "current" edition is worse than a stale one — it's a confident lie that
defeats the entire liability shield. So:

- **Never** assert an edition, effective date, or clause number you have not
  verified against the issuing body (ISO, IEC, IEEE, IETF/RFC, the consortium)
  or an authorized distributor **this run**.
- Every registry or content change carries a citation (publisher URL +
  retrieval date) in the audit log. No citation → no change.
- If you cannot verify a family, leave it unchanged and record it as
  `unverified` in the log. Do not fabricate to "finish."

---

## The pipeline (eight gated steps)

Run in order. Each step has an exit gate; do not proceed past a red gate —
fix or record and stop.

### 1. Audit — enumerate every reference

Build the working set of standards actually cited:

```bash
# Registry families (the tracked set)
grep -nE 'family:' src/lib/standards-watch/registry.ts

# Every lesson's primary anchor (edition-bearing)
grep -rhoE 'primaryAnchor: *"[^"]*"' src/content | sort | uniq -c | sort -rn

# Standards named in lesson bodies (catch anything not in the registry)
grep -rhoE '\b(ISO|IEC|IEEE|ISO/IEC|RFC|MISRA|IATF|AS|DFARS|ISA|IPC|NIST|ANSI)[ /-][0-9A-Za-z.:-]+' \
  src/content --include='*.mdx' | sort -u
```

Cross-check: any standard cited in content but **absent from the registry** is a
coverage gap — add it in step 4. Gate: you have a complete list of families +
the edition each layer currently claims.

### 2. Verify — confirm the current revision (delegate to `bounded-research`)

For each family, research the latest published revision, its effective date,
and any committee-confirmed revision in progress. Use `bounded-research` (time-
boxed, rule-of-three sourcing). Prefer the issuing body's own catalog page.

At scale, fan this out — one research task per family (or per standards body) —
but keep each task's output a small structured record: `{ family, latestRevision,
effectiveFrom, inProgress?, sourceUrl, retrievedOn }`. Gate: every family has a
verified record or is marked `unverified`.

### 3. Cite — capture provenance

Record each verified record's `sourceUrl` + `retrievedOn`. These go verbatim
into the audit log (step 8). A change with no source does not happen.

### 4. Update registry — make the source of truth current

For each family whose latest verified revision differs from
`STANDARDS_REGISTRY.current`:

- Move the old `current` string into `supersededRevisions`.
- Set `current` to the verified latest; set `effectiveFrom` to its verified date.
- Set that entry's `lastVerified` to today (the run date).
- Add/refresh `inProgress` when a committee-confirmed next revision exists;
  clear it once that revision ships.
- Add a new entry for any content-cited standard missing from the registry.

Then bump the module-level `REGISTRY_LAST_REVIEWED` to today — this is the date
the disclaimer and `/standards-currency` page advertise. For families you
verified as already-current, still refresh their `lastVerified` (or rely on the
bumped `REGISTRY_LAST_REVIEWED` fallback).

Gate: `npm run typecheck` passes.

### 5. Verify content matches — find superseded references

The registry now knows the truth; find where content lags:

```bash
# Machine check: the standards test suite exercises scanStandards() /
# isStandardsRegistryClean() over the typed registry sources.
npm run test:standards

# Content sweep: grep every superseded revision string you moved in step 4
#   plus its old clause numbers, across frontmatter AND bodies.
grep -rn "<old-revision-string>" src/content --include='*.mdx'
```

`scanStandards()` (in `src/lib/standards-watch/scan.ts`) returns the outdated /
upcoming report; it's rendered author-facing at `/standards-watch`. Review that
page or the test output — it flags any tracked source citing a superseded
revision. It scans typed registry sources; the `grep` above covers the `.mdx`
bodies it does not yet parse.

Build the fix-list: `{ file, currentText, shouldBe, citedSource }`. Gate: a
complete list, or empty (skip to step 7 if nothing lags).

### 6. Fix content — propagate the new revision

For each item: update `standards.primaryAnchor` in frontmatter and every
in-body reference — the revision string **and** any clause numbers / factual
claims that changed between editions (clause renumbering is the common trap;
verify the new number, don't assume it's stable).

At scale, fan out (one agent per phase or per family) mirroring the content-fix
workflow: each agent edits, then re-greps its scope for the superseded string to
confirm zero remain. Never rewrite pedagogy — change only what the revision
requires. Anything ambiguous → leave it and log as `needs-human`.

Gate: `grep` for every superseded string across `src/content` returns nothing
(except intentional "superseded by" teaching references).

### 7. Verify alignment — prove the three layers agree

```bash
npm run check:standards          # alignment + provenance + schema gates
npm run test:standards           # standards test suite
npm run typecheck && npm run lint && npm run build
```

Also confirm `scanStandards()` reports zero `outdated`. Gate: all green. A red
gate here means content still lags the registry — return to step 6.

### 8. Log — write the audit record and commit

Write `xDocs/reference/standards-audits/<YYYY-MM-DD>-standards-refresh.md`
containing:

- Run date and scope (families checked, families changed, families unverified).
- Per changed family: old → new revision, effective date, **cited source URL +
  retrievedOn**.
- Content files changed (count + list).
- Verification results (each gate's pass/fail).
- Any `unverified` or `needs-human` items carried forward to next run.

Commit registry + content + log together with a Conventional Commit and the
AINDGS provenance trailer (see `dev-loop`), e.g.
`chore(standards): refresh currency register — <n> families, <m> lessons`.
Bump the quarterly review reminder.

---

## Scope & cadence

- **Full run**: all families. Target cadence — quarterly, or when a watched
  body announces a revision.
- **Targeted run**: a single family that just changed ("ISO 10218 unified into
  2025") — still walk all eight steps, scoped to that family.
- The disclaimer and `/standards-currency` page need **no** code change on a
  refresh; they read `REGISTRY_LAST_REVIEWED` and the registry automatically.
  If they ever stop reflecting a bump, that's a wiring bug, not a data update.

## What "done" means

`scanStandards()` clean, `npm run check:standards` green, build/type/lint/tests
green, every registry and content change backed by a cited source in the dated
audit log, and `REGISTRY_LAST_REVIEWED` set to the run date. Unverified families
are recorded, not hidden.
