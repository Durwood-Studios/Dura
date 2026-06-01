import type { Misconception, MisconceptionCatalog } from "./types";

/**
 * The misconception catalog. Each entry is a named, durable concept — when a
 * wrong-answer choice cites a misconception ID, the diagnostic engine looks
 * it up here and produces the rendered "why you picked this" feedback.
 *
 * Adding new entries: choose a kebab-case ID that survives renaming the
 * question (e.g. "off-by-one-indexing", not "phase-0-q4-wrong-b").
 */
const ENTRIES: Misconception[] = [
  {
    id: "off-by-one-indexing",
    name: "Off-by-one on a 0-indexed array",
    description:
      "Treating arr[arr.length] as the last element. In 0-indexed languages the last element lives at arr.length - 1; the bare arr.length slot is one past the end and reads as undefined.",
    remediation: {
      kind: "lesson",
      path: "/paths/0/0-1/01",
      label: "Phase 0 · Arrays & indexing",
    },
  },
  {
    id: "list-vs-array-confusion",
    name: "Confuses list with array",
    description:
      "Reaching for list-like operations (push, pop, splice) on a fixed-size array, or assuming all sequences share the same complexity profile. Lists and arrays have different costs and different APIs.",
    remediation: {
      kind: "lesson",
      path: "/paths/0/0-2/03",
      label: "Phase 0 · Data structures basics",
    },
  },
  {
    id: "string-length-vs-codepoint",
    name: "Counts code units, not characters",
    description:
      "Assumes string.length returns the number of visible characters. In JavaScript it returns the number of UTF-16 code units, so emojis and many CJK characters count as 2.",
    remediation: {
      kind: "reading",
      href: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/length",
      label: "MDN · String.length",
    },
  },
  {
    id: "shallow-vs-deep-copy",
    name: "Treats spread as a deep copy",
    description:
      "Assumes {...obj} or [...arr] produces an independent copy. The spread operator copies one level; nested objects are still shared references, which is how state mutations sneak in across React re-renders.",
    remediation: {
      kind: "lesson",
      path: "/paths/2/2-3/04",
      label: "Phase 2 · Object identity & references",
    },
  },
  {
    id: "n-plus-one-disguised-as-property",
    name: "ORM property access hides a query",
    description:
      "Reads user.posts as a plain property access when it is actually a database round-trip. Hidden under a tight loop this produces the N+1 query bug — the most common backend performance pathology in production code.",
    remediation: {
      kind: "lesson",
      path: "/paths/4/4-2/02",
      label: "Phase 4 · N+1 queries",
    },
  },

  // ─── IEEE 754 floating-point (Phase 1 integration) ──────────────────────
  // Anchored to IEEE 754-2019 (Standard for Floating-Point Arithmetic). These
  // are the three highest-leverage misconceptions a working engineer hits in
  // production code — the canonical 0.1 + 0.2 surprise, the trap of using ==
  // on derived float values, and the NaN-equality counter-intuition.
  {
    id: "assumes-decimal-precision",
    name: "Assumes decimal arithmetic is exact in IEEE 754",
    description:
      "Treats 0.1 + 0.2 as if it equals 0.3 exactly. IEEE 754 binary64 cannot represent 0.1 or 0.2 exactly — both round to the nearest representable double — so the sum is 0.30000000000000004, off by one ULP. This is the most-cited 'gotcha' in float literacy.",
    remediation: {
      kind: "lesson",
      path: "/paths/1/1-3/01",
      label: "Phase 1 · IEEE 754 floating-point",
    },
  },
  {
    id: "float-equality-derived",
    name: "Uses == on derived float values",
    description:
      "Compares two floats with == when at least one was computed (a sum, a product, a transcendental). Even when the mathematical result is identical, the representations may differ. Standard practice is to test |a - b| < epsilon with epsilon chosen by domain — and the choice itself is non-trivial.",
    remediation: {
      kind: "lesson",
      path: "/paths/1/1-3/01",
      label: "Phase 1 · IEEE 754 floating-point",
    },
  },
  {
    id: "nan-equality-comparison",
    name: "Expects NaN to equal itself",
    description:
      "Assumes NaN == NaN is true. IEEE 754 defines NaN as not equal to any value including itself — that's the only way a value can fail a self-equality test. Use Number.isNaN(x) or x !== x to test for NaN; the language-level equality will mislead.",
    remediation: {
      kind: "lesson",
      path: "/paths/1/1-3/01",
      label: "Phase 1 · IEEE 754 floating-point",
    },
  },

  // ─── POSIX / IEEE 1003.1 (Phase 1 integration) ──────────────────────────
  // Anchored to POSIX.1-2024 (Issue 8 / IEEE Std 1003.1-2024). Three real
  // production bugs working systems engineers hit: async-signal-safety
  // violations in signal handlers, fully-buffered stdout when stdout is
  // not a tty, and POSIX-vs-bash shell extensions.
  {
    id: "signal-handler-library-calls",
    name: "Calls non-async-signal-safe functions in a signal handler",
    description:
      "Assumes any libc function can be called from inside a signal handler. POSIX defines a specific list of async-signal-safe functions (write, _exit, kill, sigaction, etc.) and only those are guaranteed reentrant; calling printf, malloc, or pthread_mutex_lock from a handler is undefined behaviour and a common deadlock/heap-corruption source.",
    remediation: {
      kind: "lesson",
      path: "/paths/1/1-4/03",
      label: "Phase 1 · POSIX signals & async-safety",
    },
  },
  {
    id: "stdout-buffering-mode",
    name: "Treats stdout as line-buffered when piped",
    description:
      "Assumes stdout always flushes on '\\n'. POSIX libc switches stdout to fully-buffered when it is NOT connected to a terminal (e.g. when piped to grep or redirected to a file), so output may not appear until the buffer fills or the process exits. The classic 'my logs disappeared' bug. Fix: explicit fflush() or setvbuf() at startup.",
    remediation: {
      kind: "lesson",
      path: "/paths/1/1-4/03",
      label: "Phase 1 · POSIX signals & async-safety",
    },
  },
  {
    id: "posix-vs-shell-extensions",
    name: "Confuses POSIX shell with bash extensions",
    description:
      "Writes a script with #!/bin/sh but uses bash-only constructs ([[ ]], arrays, $'...', process substitution). On Debian, Ubuntu, Alpine, BusyBox the system /bin/sh is dash or ash — not bash — and the script breaks. Either use #!/usr/bin/env bash (and depend on bash) or constrain yourself to POSIX.1 features.",
    remediation: {
      kind: "lesson",
      path: "/paths/1/1-4/03",
      label: "Phase 1 · POSIX signals & async-safety",
    },
  },

  // ─── RFC 2119 / BCP 14 (Phase 2 integration) ────────────────────────────
  // Anchored to RFC 2119 + RFC 8174 (BCP 14). The MUST/SHOULD/MAY vocabulary
  // appears in virtually every IETF spec and leaks into general API docs;
  // engineers misread the gradient daily in PR reviews.
  {
    id: "confuses-rfc2119-vocabulary",
    name: "Reads RFC 2119 keywords as plain English",
    description:
      "Treats 'SHOULD' as either equivalent to 'MUST' (over-strict) or 'MAY' (over-lax). Per RFC 2119, 'SHOULD' means there may exist valid reasons to ignore the requirement, but the implications must be understood and weighed. The vocabulary is normative when in ALL CAPS and conventional English otherwise — and the convention is enforced by RFC 8174.",
    remediation: {
      kind: "reading",
      href: "https://datatracker.ietf.org/doc/html/rfc2119",
      label: "RFC 2119 · BCP 14 normative vocabulary",
    },
  },
  {
    id: "informational-vs-standards-track",
    name: "Treats every RFC as a standard",
    description:
      "Assumes every RFC carries normative weight. IETF RFCs have status categories — Standards Track (Proposed/Internet/Historic), Informational, Experimental, and Best Current Practice (BCP). Cite-by-number without checking status leads to implementing an Experimental draft as if it were a Proposed Standard.",
    remediation: {
      kind: "reading",
      href: "https://datatracker.ietf.org/doc/html/rfc7322",
      label: "RFC 7322 · RFC Style Guide",
    },
  },

  // ─── WHATWG / W3C ownership (Phase 2 integration) ───────────────────────
  // Anchored to the 2019 W3C/WHATWG Memorandum of Understanding. The web
  // platform's ownership split is widely misunderstood; engineers reach for
  // outdated specs when the authoritative document moved.
  {
    id: "html-spec-ownership",
    name: "Assumes W3C still owns the HTML spec",
    description:
      "Treats the W3C HTML 5.x Recommendation as the current source of truth. Since the 2019 W3C/WHATWG MoU, the HTML Living Standard is owned by WHATWG and the W3C versioned snapshots are frozen reference points, not the moving target. For HTML behavior questions, html.spec.whatwg.org is canonical.",
    remediation: {
      kind: "reading",
      href: "https://html.spec.whatwg.org/",
      label: "WHATWG · HTML Living Standard",
    },
  },
  {
    id: "w3c-rec-vs-whatwg-living",
    name: "Confuses W3C Recommendation with the living spec",
    description:
      "Cites a W3C 'Recommendation' status as if it implies currentness. W3C still owns CSS, ARIA, WCAG, WebAuthn — but their REC track and WHATWG's Living Standard process have different freshness contracts. A REC is a stable snapshot; a Living Standard is the continuously-updated current state. Picking the right one for a given question matters.",
    remediation: {
      kind: "reading",
      href: "https://www.w3.org/TR/",
      label: "W3C · Technical Reports index",
    },
  },

  // ─── ECMA TC39 process (Phase 2 integration) ────────────────────────────
  // Anchored to the TC39 staging process (Stage 0-4). Engineers misread
  // stage gates daily, leading to either over-cautious avoidance of
  // shipped features or premature production use of Stage 1 proposals.
  {
    id: "tc39-stage-readiness",
    name: "Assumes a Stage 1-3 proposal is safe to ship",
    description:
      "Reads a 'Stage 2' or 'Stage 3' badge as 'standardized'. Stage 4 is the only stage where ECMA-262 has accepted the proposal and two spec-compliant implementations exist with tests. Prior stages can have breaking semantic changes — a Stage 2 you ship today may not match the Stage 4 that lands.",
    remediation: {
      kind: "reading",
      href: "https://tc39.es/process-document/",
      label: "TC39 · The TC39 Process",
    },
  },
  {
    id: "tc39-cross-runtime",
    name: "Assumes Stage 4 ships everywhere at once",
    description:
      "Treats Stage 4 acceptance as universal availability. ECMA-262 acceptance is the spec-level gate; V8, JavaScriptCore, SpiderMonkey, and runtime targets (Node, Bun, Deno) ship features at independent paces. A feature can be Stage 4 in the spec and still not present in a target browser for years. Compat tables (MDN, caniuse, kangax) are the runtime-availability source of truth.",
    remediation: {
      kind: "reading",
      href: "https://compat-table.github.io/compat-table/es2016plus/",
      label: "ECMAScript compat table",
    },
  },

  // ─── WCAG 2.2 (Phase 2 integration) ─────────────────────────────────────
  // Anchored to WCAG 2.2 (W3C Recommendation, Oct 2023, updated Dec 2024).
  // The accessibility gradient is widely misread — engineers treat axe-clean
  // as conformance, conflate level AA with legal compliance, and miss that
  // the success criteria require human review for most of the standard.
  {
    id: "wcag-conformance-level",
    name: "Treats AA as the universal legal floor",
    description:
      "Assumes 'WCAG AA' is the same legal requirement everywhere. ADA Title II requires WCAG 2.1 AA for US public-sector sites; private-sector lawsuits often cite 2.1 AA by precedent but WCAG 2.2 added 9 new success criteria that may apply contextually. Compliance is jurisdictional and version-specific — 'we hit AA' is a partial answer, not a complete one.",
    remediation: {
      kind: "reading",
      href: "https://www.w3.org/WAI/standards-guidelines/wcag/",
      label: "W3C WAI · WCAG overview",
    },
  },
  {
    id: "wcag-auto-tools-coverage",
    name: "Equates an axe-clean run with WCAG conformance",
    description:
      "Treats a 100% score from axe-core, Lighthouse, or WAVE as evidence the site meets WCAG. Automated tools catch roughly 30-40% of WCAG violations by validity volume — they cannot evaluate keyboard navigation flow, screen reader narration quality, alt-text adequacy, or judgment-based success criteria. Conformance requires manual review on top of automated CI.",
    remediation: {
      kind: "reading",
      href: "https://www.w3.org/WAI/test-evaluate/",
      label: "W3C WAI · Test and evaluate",
    },
  },

  // ─── OWASP Top 10:2025 + ASVS (Phase 3 integration) ─────────────────────
  // Anchored to OWASP Top 10:2025 (RC1 published Nov 6, 2025; final Jan 2026)
  // and OWASP ASVS. Security misconceptions in this group are the most cited
  // in real incident postmortems — engineers anchor on the 2021 list, treat
  // Top 10 as a verification checklist, and underweight the new 2025
  // categories (Software Supply Chain Failures, Mishandling Exceptional
  // Conditions).
  {
    id: "owasp-top10-as-verification",
    name: "Treats OWASP Top 10 as a verification standard",
    description:
      "Treats 'we conform to the OWASP Top 10' as a security verification claim. The Top 10 is explicitly an awareness document — it describes the categories of vulnerability engineers should know about, not a verification catalog. OWASP ASVS (Application Security Verification Standard) is the verification side: 14 control families across 3 levels. Mixing them up means 'security testing' that doesn't actually test anything.",
    remediation: {
      kind: "reading",
      href: "https://owasp.org/www-project-application-security-verification-standard/",
      label: "OWASP · ASVS",
    },
  },
  {
    id: "outdated-owasp-list",
    name: "Anchors on the 2021 Top 10 instead of 2025",
    description:
      "References the 2021 list (Broken Access Control at #1, SSRF as its own category, etc.) without checking the 2025 revision. The 2025 list introduces Software Supply Chain Failures and Mishandling Exceptional Conditions as new categories, absorbs SSRF into Broken Access Control, and re-ranks the prevalence-weighted ordering. Lessons anchored to the 2021 list ship stale on day one.",
    remediation: {
      kind: "reading",
      href: "https://owasp.org/Top10/2025/",
      label: "OWASP Top 10:2025",
    },
  },
  {
    id: "broken-access-control-narrow",
    name: "Reads Broken Access Control as 'missing auth check'",
    description:
      "Treats A01 Broken Access Control as just 'forgot to check the JWT.' The category spans IDOR with privileged operations, force-browse, CORS misconfiguration, JWT signature/claim verification gaps, privilege escalation via parameter tampering — and in the 2025 revision, all of SSRF. A narrow read produces test suites that catch 10% of the actual category.",
    remediation: {
      kind: "reading",
      href: "https://owasp.org/Top10/2025/",
      label: "OWASP Top 10:2025 · A01",
    },
  },
  {
    id: "supply-chain-just-dependencies",
    name: "Reduces Software Supply Chain Failures to 'outdated dependencies'",
    description:
      "Treats the 2025 supply-chain category as 'run npm audit periodically.' The category spans CI/CD pipeline integrity, build environment trust, post-install script execution, namespace squatting and typosquatting, registry compromise, dependency confusion, and the SLSA framework's provenance requirements. Outdated dependencies are one row of a multi-row threat model.",
    remediation: {
      kind: "reading",
      href: "https://slsa.dev/",
      label: "SLSA · Supply-chain Levels for Software Artifacts",
    },
  },
  {
    id: "exception-as-defense",
    name: "Treats exception catching as inherently secure",
    description:
      "Reads catch-and-log as a defensive pattern when it can be the opposite. The 2025 Mishandling Exceptional Conditions category covers: generic catch-blocks that mask security-relevant failures, info-leak via stack traces returned to the client, error-handling that fails-open instead of fails-closed, and exception flow that bypasses authentication or authorization checks. Catching is not securing.",
    remediation: {
      kind: "reading",
      href: "https://owasp.org/Top10/2025/",
      label: "OWASP Top 10:2025 · Mishandling Exceptional Conditions",
    },
  },

  // ─── ISO 27001 + ASVS + IEC 62443 (Phase 8 integration) ─────────────────
  // Anchored to ISO/IEC 27001:2022, OWASP ASVS, and IEC 62443. These three
  // standards anchor the Phase 8 compliance density. The misconceptions
  // below catch the most common mistakes when engineers represent their
  // company's security posture to customers, auditors, and procurement.
  {
    id: "iso27001-as-product-cert",
    name: "Treats ISO 27001 as a product certification",
    description:
      "Reads 'we are ISO 27001 certified' as a per-product security claim. ISO 27001 certifies the organization's Information Security Management System (ISMS) — the processes for identifying, treating, and reviewing risk. It does not pen-test products, certify code, or guarantee a given product's security. The certified scope is defined by a Statement of Applicability that may include or exclude specific products and services.",
    remediation: {
      kind: "lesson",
      path: "/paths/8/8-2/01",
      label: "Phase 8 · ISO 27001 + ISMS",
    },
  },
  {
    id: "iso27001-vs-soc2",
    name: "Conflates ISO 27001 with SOC 2",
    description:
      "Treats ISO 27001 and SOC 2 as interchangeable. They differ on audit model (certification vs attestation), evidence requirements (Statement of Applicability + ISMS records vs Trust Services Criteria sampling), audience (global, especially EU/APAC vs US-centric SaaS), and maintenance posture (annual surveillance + 3-year recertification vs Type 2 reporting period). A B2B sales process asking 'do you have SOC 2?' is asking a different question than 'are you ISO 27001 certified?'",
    remediation: {
      kind: "lesson",
      path: "/paths/8/8-2/02",
      label: "Phase 8 · Compliance frameworks compared",
    },
  },
  {
    id: "asvs-level-shopping",
    name: "Claims ASVS conformance without picking a level",
    description:
      "Says 'we conform to ASVS' without specifying L1, L2, or L3. The three levels exist because applications have different threat models: L1 is opportunistic-attack baseline (minimum viable security), L2 is most applications handling sensitive data (the realistic default), L3 is high-assurance for critical systems (defense, medical, financial). Claiming 'ASVS' without a level is structurally meaningless; a real verification engagement names the level and the scope.",
    remediation: {
      kind: "reading",
      href: "https://owasp.org/www-project-application-security-verification-standard/",
      label: "OWASP · ASVS levels",
    },
  },
  {
    id: "asvs-control-family-cherry-pick",
    name: "Cherry-picks ASVS control families and claims conformance",
    description:
      "Verifies a few ASVS control families (say, authentication and cryptography) and claims overall conformance. ASVS conformance at a level requires meeting all applicable requirements within all 14 control families at that level. Selective adoption produces a security posture that's strong at the verified families and unverified elsewhere — and unverified elsewhere is where attackers actually go.",
    remediation: {
      kind: "reading",
      href: "https://owasp.org/www-project-application-security-verification-standard/",
      label: "OWASP · ASVS 14 control families",
    },
  },
  {
    id: "iec62443-as-it-security",
    name: "Applies IT security frameworks to OT systems",
    description:
      "Lifts NIST CSF / ISO 27001 controls onto factory PLCs, HVAC controllers, and SCADA without adaptation. IEC 62443 has a different priority order: availability and safety come before confidentiality, because patching a controller mid-shift may be more dangerous than the CVE itself. OT security controls have to be designed around uptime, deterministic timing, process safety constraints, and decade-long asset lifecycles — not lifted from IT.",
    remediation: {
      kind: "lesson",
      path: "/paths/8/8-3/01",
      label: "Phase 8 · IEC 62443 OT security",
    },
  },
  {
    id: "zones-conduits-overlay",
    name: "Reads zones and conduits as network segmentation",
    description:
      "Treats IEC 62443's zones and conduits as a VLAN diagram. Zones and conduits are a TRUST boundary model used for risk assessment — a zone is a grouping of assets sharing security requirements (a process cell, a safety system, the enterprise IT network), a conduit is the controlled communication path between zones. The model drives where you place security controls and how you grade them (Security Levels SL1-SL4); the network segmentation that follows is a consequence, not the model itself.",
    remediation: {
      kind: "lesson",
      path: "/paths/8/8-3/02",
      label: "Phase 8 · Zones, conduits, security levels",
    },
  },

  // ─── NIST CSF 2.0 + AI RMF + GDPR/CCPA + 27701 (Phase 9 integration) ─────
  // Anchored to NIST CSF 2.0 (Feb 2024), NIST AI RMF 1.0 (Jan 2023) + AI 600-1
  // Generative AI Profile (Jul 2024), GDPR + CCPA/CPRA, and ISO/IEC 27701.
  // Phase 9 is the compliance capstone — these are the misconceptions that
  // produce shippable-but-non-compliant products under audit.
  {
    id: "csf-as-checklist",
    name: "Treats NIST CSF as a control checklist",
    description:
      "Reads NIST CSF subcategories as a tickable to-do list to copy into a GRC tool. CSF is explicitly outcome-based — the artifact is a Profile (Current state vs Target state) that drives an organization-specific improvement plan. Treating it as a checklist produces a security program that maps to CSF on paper but never actually closes the gap between Current and Target.",
    remediation: {
      kind: "lesson",
      path: "/paths/9/9-1/01",
      label: "Phase 9 · NIST CSF 2.0",
    },
  },
  {
    id: "csf-govern-missing",
    name: "Anchors on the legacy five-function CSF model",
    description:
      "References the Identify / Protect / Detect / Respond / Recover model from CSF 1.0 / 1.1 without recognizing that CSF 2.0 (Feb 2024) added a sixth function: Govern. The new function covers risk-management strategy, roles and responsibilities, policy, oversight, and supply-chain risk management. CSF 1.x implicitly assumed governance happened upstream; CSF 2.0 makes it explicit because most organizations were skipping it.",
    remediation: {
      kind: "lesson",
      path: "/paths/9/9-1/02",
      label: "Phase 9 · CSF 2.0 — what changed",
    },
  },
  {
    id: "ai-rmf-as-policy",
    name: "Reads NIST AI RMF as a static policy framework",
    description:
      "Adopts the four AI RMF functions (Govern, Map, Measure, Manage) as a one-time policy authoring exercise. The framework is explicitly a continuous risk-management cycle — Map, Measure, and Manage must be re-run as the AI system changes (new training data, new prompts, new downstream uses) or as new harms surface. The AI 600-1 Generative AI Profile adds 12 risk categories (confabulation, prompt injection, data privacy, etc.) that compound the need for continuous review.",
    remediation: {
      kind: "lesson",
      path: "/paths/9/9-2/01",
      label: "Phase 9 · NIST AI RMF + GenAI Profile",
    },
  },
  {
    id: "gdpr-as-consent-popup",
    name: "Reduces GDPR to a cookie consent banner",
    description:
      "Treats deploying a 'Reject All / Accept All' banner as GDPR compliance. The actual baseline requires: a lawful basis for each processing activity (consent is one of six, not the only one), purpose limitation and data minimization, a published privacy notice, a Record of Processing Activities (RoPA) where applicable, a Data Protection Impact Assessment (DPIA) for high-risk processing, a Data Protection Officer for some categories of controller, breach notification within 72 hours, and mechanisms to fulfill data subject rights (access, erasure, portability, rectification) within 30 days.",
    remediation: {
      kind: "lesson",
      path: "/paths/9/9-3/01",
      label: "Phase 9 · GDPR baseline obligations",
    },
  },
  {
    id: "ccpa-as-gdpr-clone",
    name: "Treats CCPA as US GDPR",
    description:
      "Reads CCPA/CPRA as a copy of GDPR with California branding. They differ structurally: GDPR requires a lawful basis up front and constrains processing (opt-in model); CCPA grants residents the right to opt out after the fact (opt-out model). Scope differs (CCPA is residency-based for California consumers, GDPR is presence-based for anyone in the EU). Enforcement differs (CCPA: California Privacy Protection Agency; GDPR: supervisory authorities across member states). Designing one privacy program assuming GDPR conformance covers CCPA produces gaps in the opt-out flow and 'Do Not Sell or Share' disclosures.",
    remediation: {
      kind: "lesson",
      path: "/paths/9/9-3/02",
      label: "Phase 9 · CCPA + GDPR differences",
    },
  },
  {
    id: "pims-as-privacy-policy",
    name: "Treats ISO 27701 as a privacy policy add-on to 27001",
    description:
      "Reads ISO/IEC 27701 as a policy document bolted onto an existing ISMS. 27701 is a Privacy Information Management System (PIMS) — a management system in its own right, requiring its own scope, Statement of Applicability, RoPA, DPIA process, and continuous review. It extends 27001 (you must be 27001-compliant to claim 27701) but adds substantial obligations beyond a written policy. Treating it as policy produces audits that fail the management-system requirements.",
    remediation: {
      kind: "lesson",
      path: "/paths/9/9-3/03",
      label: "Phase 9 · ISO 27701 as a PIMS",
    },
  },

  // ─── Phase R · Robotics (ISO 12100, IEC 61508/13849/62061, ISO 10218 + ──
  // ISO/TS 15066, RIA TR R15.806, ROS 2). Anchored to the bounded-research
  // Track 2 findings — especially the ISO 10218:2025 unification that
  // absorbed TS 15066 in January 2025 and the cybersecurity additions that
  // hook into IEC 62443 (canonical home in Phase 8).
  {
    id: "risk-assessment-step-count",
    name: "Folk-counts six steps in the risk assessment",
    description:
      "Cites the machinery risk-assessment process as six steps (limits, hazards, estimation, evaluation, reduction, residual review). Per ISO 12100, the canonical process is FOUR steps: determination of the limits of the machinery, hazard identification, risk estimation, risk evaluation. Risk reduction is a separate clause (5) and residual review is iteration, not a step. The folk-count drift produces audit-finding paperwork that doesn't match the standard's structure.",
    remediation: {
      kind: "lesson",
      path: "/paths/r/r-2/01",
      label: "Phase R · ISO 12100 risk assessment",
    },
  },
  {
    id: "pl-sil-conflation",
    name: "Maps Performance Level to Safety Integrity Level as exact",
    description:
      "Treats PL c = SIL 1, PL d = SIL 2, PL e = SIL 3 as exact equivalences. The mapping is probabilistic (based on PFH — average probability of dangerous failure per hour) and approximate. ISO 13849 uses categorical architectures (Cat B through Cat 4) that weight component reliability, diagnostic coverage, and common-cause failure differently than IEC 62061's structured analysis. Picking PL or SIL for a project requires choosing the framework, not converting between them with a lookup table.",
    remediation: {
      kind: "lesson",
      path: "/paths/r/r-3/01",
      label: "Phase R · Functional safety — PL ↔ SIL",
    },
  },
  {
    id: "collaborative-modes-conflation",
    name: "Conflates the four collaborative operation modes",
    description:
      "Treats the four ISO 10218 / ISO/TS 15066 collaborative operation modes as interchangeable labels. They have distinct sensor, control-system, and risk-assessment implications: Safety-rated Monitored Stop pauses the robot when a human enters the shared workspace; Hand Guiding requires direct operator control via an enabling device; Speed and Separation Monitoring continuously adjusts robot speed based on operator distance; Power and Force Limiting bounds contact forces against ISO/TS 15066 body-region limits. A risk assessment that conflates them produces a control architecture that fails the chosen mode's certification.",
    remediation: {
      kind: "lesson",
      path: "/paths/r/r-4/01",
      label: "Phase R · The four collaborative modes",
    },
  },
  {
    id: "cobot-safe-out-of-box",
    name: "Reads PFL cobot certification as application-level safety",
    description:
      "Assumes a power-and-force-limiting cobot certified per ISO 10218-1:2025 + ISO/TS 15066 is 'safe out of the box' for collaborative operation. The robot's PFL FUNCTIONS are certified, but whether contact forces in YOUR application stay within ISO/TS 15066 body-region limits depends on end-effector geometry, payload, speed, and operator body position — and must be measured against the application per RIA TR R15.806's test methodology. The cobot is PFL-capable; the application has to be PFL-validated.",
    remediation: {
      kind: "lesson",
      path: "/paths/r/r-5/01",
      label: "Phase R · PFL testing — RIA TR R15.806",
    },
  },
  {
    id: "ros2-vendor-cert",
    name: "Assumes a vendor-issued ROS 2 certification exists",
    description:
      "Searches for a 'ROS 2 Certified Engineer' badge analogous to AWS Certified Solutions Architect. No vendor-issued ROS 2 certification exists. The actual paths are: Open Robotics Skill Certification Courses (Basics Python/C++, Nav, TF — portfolio-style), The Construct online course catalog, and Apex.AI's Apex.Grace fork (ISO 26262 ASIL D) for safety-certified production paths. Hiring managers asking 'are you ROS 2 certified' are asking for community-recognized milestones, not a vendor badge.",
    remediation: {
      kind: "lesson",
      path: "/paths/r/r-6/01",
      label: "Phase R · ROS 2 + ROS-Industrial",
    },
  },
  {
    id: "iec62443-vs-iso10218-cyber",
    name: "Treats ISO 10218-1:2025 cybersecurity as redundant with 62443",
    description:
      "Reads the cybersecurity requirements added in ISO 10218-1:2025 as duplicating IEC 62443 and skips them. 10218-1:2025 references the 62443 family for the OT security baseline and adds ROBOT-SPECIFIC requirements on top — including secure boot of the controller, signed firmware updates, network segmentation for the safety controller, and authentication for teach-pendant access. The cross-track home for 62443 is Phase 8; the robot-specific overlay lives in Phase R R6.",
    remediation: {
      kind: "lesson",
      path: "/paths/r/r-7/01",
      label: "Phase R · Robot cybersecurity — 10218 + 62443",
    },
  },

  // ─── Phase M · Manufacturing (ISO 9001 family, ASME Y14.5, ISA-95, ─────
  // ISO 22400, MTConnect + OPC UA, Six Sigma). Anchored to the bounded-
  // research Track 3 findings. Phase M is viable for non-CS learners
  // (prereqs only through Phase 5); content slots in a 12-lesson track.
  {
    id: "oee-as-fixed-formula",
    name: "Treats OEE as a single ISO-mandated formula",
    description:
      "Computes Overall Equipment Effectiveness as Availability × Performance × Quality and reports the number as 'the ISO 22400 OEE.' ISO 22400 standardizes the VOCABULARY of manufacturing KPIs and provides REFERENCE calculations, but deliberately gives plant-specific latitude on the definitions: what counts as planned vs unplanned downtime (Availability), against what target rate (Performance), first-pass yield vs after-rework (Quality). Two plants computing 'the same' OEE under different assumptions get different numbers, both correct per the standard. Reporting the bare number without the assumptions hides the disagreement.",
    remediation: {
      kind: "lesson",
      path: "/paths/m/m-10/01",
      label: "Phase M · ISO 22400 KPIs + OEE",
    },
  },
  {
    id: "iatf-core-tools-count",
    name: "Misnames or miscounts the IATF Core Tools",
    description:
      "Cites the IATF 16949 'Core Tools' as four (skipping MSA), six (adding a non-Core), or as a different set. The Core Tools are exactly FIVE, originating from AIAG (GM/Ford/Chrysler) under QS-9000 and carried into IATF 16949: APQP (Advanced Product Quality Planning), PPAP (Production Part Approval Process), FMEA (Failure Mode and Effects Analysis), MSA (Measurement System Analysis), SPC (Statistical Process Control). Misciting the list in an automotive supplier audit is a finding.",
    remediation: {
      kind: "lesson",
      path: "/paths/m/m-3/01",
      label: "Phase M · IATF Core Tools",
    },
  },
  {
    id: "gdt-as-tolerance-notation",
    name: "Reads GD&T as fancy tolerance notation",
    description:
      "Treats Geometric Dimensioning and Tolerancing as a richer way to write tolerances on a drawing. ASME Y14.5 is a MODEL — datum reference frames define the coordinate system the part is measured in, Rule #1 (envelope principle) ties form to size, MMC/LMC modifiers create dynamic tolerance zones that change with feature size, virtual conditions are the worst-case mating boundaries. Tolerance stack-up under GD&T is a different math than +/- tolerancing. Treating it as notation produces drawings that pass review but parts that don't assemble.",
    remediation: {
      kind: "lesson",
      path: "/paths/m/m-6/01",
      label: "Phase M · ASME Y14.5 GD&T",
    },
  },
  {
    id: "isa95-as-network-diagram",
    name: "Reads ISA-95 as a factory network topology",
    description:
      "Treats the ISA-95 5-level pyramid (L0 process → L4 ERP) as a VLAN diagram or an org chart. ISA-95 / IEC 62264 defines a CONTROL HIERARCHY — who is responsible for what kind of decision at each level — and specifies the INFORMATION FLOW obligations between levels (L3 MES ↔ L4 ERP via B2MML, L2 SCADA ↔ L3 MES via OPC UA / MTConnect). The model's value is the integration contract it imposes; the network segmentation that follows is a downstream consequence, not the model itself.",
    remediation: {
      kind: "lesson",
      path: "/paths/m/m-10/01",
      label: "Phase M · ISA-95 + ISA-88",
    },
  },
  {
    id: "mtconnect-opcua-rivals",
    name: "Reads MTConnect and OPC UA as competing standards",
    description:
      "Treats MTConnect and OPC UA as alternatives to pick between for industrial data. They serve different but compatible layers: MTConnect is a domain-specific schema for machine-tool data (spindles, axes, alarms, conditions), exposed via REST/XML or as an OPC UA Companion Specification. OPC UA is a broader industrial interoperability framework. The OFFICIAL OPC UA Companion Specification for MTConnect (released by the joint working group) is the modern integration path — neither vendor lock-in nor a forced choice.",
    remediation: {
      kind: "lesson",
      path: "/paths/m/m-11/01",
      label: "Phase M · MTConnect + OPC UA + TSN",
    },
  },
  {
    id: "dmaic-as-iterative",
    name: "Runs Six Sigma DMAIC phases in parallel or iteratively",
    description:
      "Skips ahead to Improve before Measure is complete, or runs Analyze and Improve in parallel because 'we already know the cause.' DMAIC phases are SEQUENTIAL: Define (project charter + voice-of-customer), Measure (data collection + baseline + measurement system validity), Analyze (root cause via statistical hypothesis), Improve (countermeasure design + pilot), Control (sustain plan + monitoring). Each phase has a gate review. Skipping ahead produces 'Improve' interventions that solve the wrong problem because Measure never validated the metric.",
    remediation: {
      kind: "lesson",
      path: "/paths/m/m-5/01",
      label: "Phase M · Six Sigma DMAIC",
    },
  },

  // ─── Phase 5 · Systems engineering (VERIFIED 2026-06-01). Distributed-────
  // systems, database, and OS-level misconceptions working engineers hit
  // in production. Verified against Marc Brooker's PACELC writeup +
  // Abadi's PACELC paper; Shapiro et al. on CRDTs (SSS 2011) + Gomes et
  // al. on SEC verification (arXiv); CockroachDB consistency-model docs
  // for strict serializability semantics; RFC 9293 (TCP) + Systems
  // Approach §5.2 for delivery semantics; Postgres 18 docs §13.2 +
  // Cybertec for RC race-condition fixes; Brendan Gregg's 2017 +
  // LISA19 + Netflix 60-second analyses for load-average semantics.
  // eventual-consistency-as-weak was sharpened (SEC is a precise 3-part
  // property, not "stronger eventual consistency by degree"). Two
  // additions: exactly-once-delivery-myth, wall-clocks-give-ordering —
  // both anchor DURA's offline-first sync architecture correctly.
  {
    id: "cap-theorem-misread",
    name: "Reads CAP as a universal 'pick 2 of 3' trade-off",
    description:
      "Treats Consistency / Availability / Partition tolerance as a permanent menu — 'we picked AP, we gave up C.' CAP is a constraint that applies DURING A PARTITION: when the network splits, a node must choose to refuse requests (preserving consistency) or serve them with potentially stale state (preserving availability). During normal operation no choice is forced. PACELC extends the model to cover normal-operation latency-vs-consistency trade-offs — which is where most systems actually spend their time.",
    remediation: {
      kind: "reading",
      href: "https://en.wikipedia.org/wiki/PACELC_design_principle",
      label: "PACELC design principle",
    },
  },
  {
    id: "eventual-consistency-as-weak",
    name: "Treats eventual consistency as 'broken consistency'",
    description:
      "Reads eventual consistency as 'might be wrong, no guarantees.' It's actually a precise convergence model. Strong Eventual Consistency (SEC), as defined by Shapiro et al., is a three-part property: (1) eventual delivery, (2) termination, (3) strong convergence — replicas that have received the same set of updates reach the same state, regardless of delivery order. CRDTs achieve SEC by SACRIFICING LINEARIZABILITY in exchange for order-independence (a safety property, not 'stronger eventual consistency by degree'). The convergence holds despite any number of failures (self-stabilizing). Confusing 'eventually consistent' with 'weakly consistent' rejects viable solutions on bad grounds.",
    remediation: {
      kind: "reading",
      href: "https://www.lip6.fr/Marc.Shapiro/papers/2011/CRDTs_SSS-2011.pdf",
      label: "Shapiro et al. · Conflict-free Replicated Data Types",
    },
  },
  {
    id: "serializable-vs-strict-serializable",
    name: "Conflates serializable with strict serializable",
    description:
      "Treats SQL standard's Serializable isolation as the strongest possible. Serializable allows transactions to be reordered with respect to wall-clock time — as long as SOME serial schedule produces the same result. Strict serializable adds real-time ordering: if T1 commits before T2 starts, T2 must observe T1's writes. Most 'Serializable' databases (Postgres SSI, CockroachDB Serializable) are only serializable; Spanner is strict serializable. The difference matters for cross-system invariants and external causality.",
    remediation: {
      kind: "reading",
      href: "https://jepsen.io/consistency/models/strict-serializable",
      label: "Jepsen · Strict serializable",
    },
  },
  {
    id: "tcp-as-reliable-delivery",
    name: "Treats TCP as application-layer delivery guarantee",
    description:
      "Reads 'TCP delivered without error' as 'the application received the message.' TCP guarantees that bytes accepted into the sender's send buffer will eventually appear in order in the receiver's receive buffer, OR the connection will error. It does NOT guarantee the application process read them, processed them, or persisted them. A TCP connection that closed cleanly tells the sender NOTHING about whether the application acted on the bytes. Cross-process semantics require application-level acknowledgment.",
    remediation: {
      kind: "reading",
      href: "https://datatracker.ietf.org/doc/html/rfc9293",
      label: "RFC 9293 · TCP",
    },
  },
  {
    id: "read-committed-as-safe-default",
    name: "Treats Read Committed as a sensible default isolation level",
    description:
      "Picks Read Committed because 'it's the default in Postgres and Oracle, so it's safe.' RC allows non-repeatable reads (the same SELECT in one transaction returns different rows depending on other concurrent commits) and phantoms. The 'check then insert' pattern (does this username exist? if not, insert) is a race condition under RC. Snapshot Isolation (Postgres REPEATABLE READ) or Serializable Snapshot Isolation are usually the right choice for application code; RC is a performance optimization with a sharp downside.",
    remediation: {
      kind: "reading",
      href: "https://www.postgresql.org/docs/current/transaction-iso.html",
      label: "PostgreSQL · Transaction isolation",
    },
  },
  {
    id: "load-average-as-cpu",
    name: "Reads Linux load average as CPU utilization",
    description:
      "Treats /proc/loadavg as 'how busy the CPU is.' Linux loadavg counts processes in TASK_RUNNING (on CPU or ready to run) AND TASK_UNINTERRUPTIBLE (D state). By Linux 4.12 there are ~400 codepaths that set TASK_UNINTERRUPTIBLE (lock primitives, not just disk I/O), so loadavg is a 'system load' indicator rather than CPU utilization (per the 1993 Matias Sørensen patch that introduced this semantic). A load of 8 on a 4-core machine could be CPU saturation, I/O saturation, lock contention, or any mix. The 1/5/15 minute exponentially-damped average makes it a lagging indicator. Real diagnosis stack: vmstat 1, mpstat -P ALL 1, pidstat 1, iostat -xz 1, sar.",
    remediation: {
      kind: "reading",
      href: "https://www.brendangregg.com/blog/2017-08-08/linux-load-averages.html",
      label: "Brendan Gregg · Linux Load Averages",
    },
  },
  {
    id: "exactly-once-delivery-myth",
    name: "Believes exactly-once delivery is achievable",
    description:
      "Trusts a queue or service that promises 'exactly-once delivery.' Exactly-once delivery is provably impossible over asynchronous lossy networks (reduces to Two Generals / FLP impossibility). What Kafka, SQS, Stripe, and AWS call 'exactly-once' is at-least-once delivery PLUS idempotent receiver PLUS a deduplication window. Every retry path in a distributed system must assume duplicate arrival. The canonical pattern: client-generated UUID idempotency keys + transactional outbox at producer + dedup at consumer. Production code that treats 'exactly-once' as a primitive is presumptively broken under retry.",
    remediation: {
      kind: "reading",
      href: "https://medium.com/swlh/the-impossibility-of-exactly-once-delivery-11daa0ed3914",
      label: "Kleanthous · The Impossibility of Exactly-Once Delivery",
    },
  },
  {
    id: "wall-clocks-give-ordering",
    name: "Uses wall-clock timestamps to order events across nodes",
    description:
      "Compares System.currentTimeMillis() (or any wall-clock read) across machines to decide which event happened first. NTP-synced wall clocks drift tens to hundreds of milliseconds between nodes and can go BACKWARD during slew/step corrections. Ordering events by wall clock for causal logic is broken by construction. Use Lamport timestamps for happens-before, vector clocks for concurrency detection, or HLCs (hybrid logical clocks — CockroachDB, YugabyteDB) for monotonic causality + bounded skew. Spanner's TrueTime gives [earliest, latest] intervals (≤~7ms with GPS/atomic clocks) and forces explicit commit-wait. 'Last write wins by wall clock' silently loses writes in any multi-device sync — directly relevant to DURA's offline-first record.",
    remediation: {
      kind: "reading",
      href: "https://lamport.azurewebsites.net/pubs/time-clocks.pdf",
      label: "Lamport · Time, Clocks, and the Ordering of Events",
    },
  },

  // ─── Phase 4 · Backend + networking (VERIFIED 2026-06-01). Production ──
  // misconceptions that drive backend incident postmortems: HTTP semantics,
  // idempotency, queueing theory, retry storms, distributed timing.
  // Verified against RFC 9110 (HTTP Semantics) §15 + §9.2.2 for status
  // semantics + idempotency definitions; Stripe API idempotency docs for
  // the stricter-than-RFC pattern; Little (1961) for L = λW; the AWS
  // Builders' Library on timeouts/retries/backoff plus Marc Brooker's
  // 243× cascade-amplification figure; RFC 9000 (QUIC) for HTTP/3's TCP
  // HOL fix; POSIX clock_gettime(2) for monotonic semantics. Two
  // verification-driven additions: coordinated-omission (p99 latency
  // closed-loop test bug), connection-pool-vs-dns-ttl (silent autoscale
  // defeat).
  {
    id: "http-status-as-semantics",
    name: "Treats HTTP status codes as the full semantic contract",
    description:
      "Returns a 200 for a failed business operation 'because the request was processed' or a 500 for a validation failure 'because the server saw it.' Per RFC 9110, status codes carry transport-layer semantics: 2xx = received and processed at the HTTP layer, 4xx = client-fixable problem, 5xx = server-side fault. The application-level outcome (did the order succeed?) is layered on top. Mixing them produces APIs where clients can't reason about retries — a 200 with body { error: 'out of stock' } makes retry policies useless because automated retry would keep firing.",
    remediation: {
      kind: "reading",
      href: "https://datatracker.ietf.org/doc/html/rfc9110",
      label: "RFC 9110 · HTTP Semantics",
    },
  },
  {
    id: "idempotency-as-replay-safe",
    name: "Conflates HTTP method idempotency with replay-safe retries",
    description:
      "Reads RFC 9110 method idempotency (GET, PUT, DELETE) as 'I can retry without thinking.' RFC 9110 §9.2.2 defines idempotency as 'the intended effect on the server of multiple identical requests with that method is the same as the effect for a single such request' — note 'intended EFFECT,' not 'identical response body.' Two GETs to /now return different bodies but the method is still idempotent. The Stripe-style pattern goes FURTHER than the RFC: server stores the full response (status + body, including failures) keyed by a client-supplied idempotency key, replays it byte-for-byte for a TTL window (Stripe: 24h), and validates parameter equality on key reuse. Only POST needs explicit keys; GET/DELETE are RFC-idempotent already.",
    remediation: {
      kind: "reading",
      href: "https://docs.stripe.com/api/idempotent_requests",
      label: "Stripe · Idempotent requests",
    },
  },
  {
    id: "littles-law-ignored",
    name: "Ignores Little's Law when sizing queues and pools",
    description:
      "Picks queue sizes, thread-pool sizes, and concurrency limits by intuition. Little's Law (L = λW) makes NO assumption about arrival distribution, service distribution, or service order — it's true for any stationary system. So sizing by intuition is provably wrong, not just empirically risky. Concrete: 100 RPS × 50ms latency = 5 in-flight requests. Thread pool below 5 produces queueing; far above 5 wastes resources. Application sweet spot: every backend pool/limit/timeout is L, and L can be computed from λ (RPS) and W (p50 latency) without statistical modeling.",
    remediation: {
      kind: "reading",
      href: "https://en.wikipedia.org/wiki/Little%27s_law",
      label: "Little's Law",
    },
  },
  {
    id: "retry-without-backoff",
    name: "Retries failed requests without exponential backoff + jitter",
    description:
      "Retries with a fixed delay (or no delay) on transient errors. Synchronized retries from N clients hammering a recovering service produce a thundering herd that keeps the service down. Production-grade retry policy: exponential backoff (delay doubles each attempt) PLUS jitter (random component) PLUS a maximum retry count PLUS circuit breaker (stop retrying after threshold). Each component addresses a different failure mode; skipping jitter is the most common omission.",
    remediation: {
      kind: "reading",
      href: "https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/",
      label: "AWS Builders' Library · Timeouts, retries, backoff with jitter",
    },
  },
  {
    id: "http2-multiplexing-as-parallelism",
    name: "Treats HTTP/2 multiplexing as application-level parallelism",
    description:
      "Assumes HTTP/2 multiplexing means N parallel requests = N× throughput. HTTP/2 multiplexes streams over a single TCP connection, eliminating HTTP/1.1's head-of-line blocking AT THE HTTP LAYER — but TCP itself still has head-of-line blocking. A single dropped packet stalls all multiplexed streams until retransmit. HTTP/3 (QUIC) addresses this by replacing TCP with UDP + reliable streams. Picking HTTP/2 expecting HTTP/3 semantics for high-loss networks produces worse-than-HTTP/1.1 performance under packet loss.",
    remediation: {
      kind: "reading",
      href: "https://datatracker.ietf.org/doc/html/rfc9113",
      label: "RFC 9113 · HTTP/2",
    },
  },
  {
    id: "clock-monotonic-vs-realtime",
    name: "Uses wall-clock time for duration measurement",
    description:
      "Reads CLOCK_REALTIME (or Date.now()) twice to measure how long something took. Real-time clocks can JUMP backward (NTP adjustments, leap-second handling, manual clock changes) — a 'duration' computed from two real-time reads can be negative or nonsense. Duration measurement requires a MONOTONIC clock: CLOCK_MONOTONIC on POSIX, performance.now() in browsers/Node. In Go, time.Now() carries BOTH wall and monotonic readings — subtraction (t2.Sub(t1)) uses monotonic automatically, but t.Round() and JSON marshaling STRIP the monotonic reading (well-known footgun). The bug shows up rarely but mysteriously — usually right after a clock adjustment, which is exactly when alerts fire (Google + Cloudflare leap-second smearing exists specifically to avoid this).",
    remediation: {
      kind: "reading",
      href: "https://man7.org/linux/man-pages/man2/clock_gettime.2.html",
      label: "clock_gettime(2) · CLOCK_MONOTONIC",
    },
  },
  {
    id: "coordinated-omission-in-load-tests",
    name: "Reports p99 latency from closed-loop load tests",
    description:
      "Trusts p99 latency from a closed-loop load generator (send → wait for response → send next). When the system slows under load, the generator slows its request rate — so the long tail is systematically NEVER MEASURED. Production p99 is routinely 10×–100× higher than lab p99 for this exact reason (documented Gil Tene case: lab 47ms → prod 1.8s = 38× miss). Fix: open-loop generators that schedule requests by wall-clock (wrk2, k6 with constant-arrival-rate), or HdrHistogram's copyCorrectedForCoordinatedOmission with a known expected interval. Coordinated omission invalidates the SLOs you're already promising.",
    remediation: {
      kind: "reading",
      href: "https://www.scylladb.com/2021/04/22/on-coordinated-omission/",
      label: "ScyllaDB · On Coordinated Omission",
    },
  },
  {
    id: "connection-pool-bound-by-dns-ttl",
    name: "Lets long-lived connection pools outlive DNS TTL",
    description:
      "Trusts long-lived HTTP/2, gRPC, or DB connection pools indefinitely. The pool outlives the DNS TTL of the load balancer it connected through. When the LB scales out or a node is replaced, traffic keeps hitting the original IPs because the pool was opened against a name that has since re-resolved elsewhere. Symptom: 'we scaled the downstream service and tail latency didn't change.' Fix: enforce max connection age tied to expected DNS TTL — Envoy max_connection_duration, gRPC MaxConnectionAge, custom recycling — never infinity.",
    remediation: {
      kind: "reading",
      href: "http://engineering.curalate.com/2016/03/25/elb-and-dns.html",
      label: "Curalate Engineering · Avoiding Pitfalls with DNS and AWS ELB",
    },
  },

  // ─── Phase 6 · AI/ML Engineering (VERIFIED 2026-06-01). Production ─────
  // misconceptions in ML engineering, LLM application security, and AI
  // evaluation. Verified against Google's Rules of ML (#29/#32/#37 for
  // training-serving skew); Sculley et al. NeurIPS 2015 for tech-debt
  // framing + Rules of ML §3 for diagnostic taxonomy; scikit-learn
  // balanced_accuracy_score + ML Mastery on PR-AUC vs ROC-AUC for
  // imbalanced data; OWASP LLM Top 10 (2025) LLM01 + Greshake et al.
  // arXiv 2302.12173 for indirect-prompt-injection distinction;
  // MTEB (arXiv 2210.07316) + recent embedding-similarity critique
  // for task-specific eval-set guidance; Kaufman et al. 2011 (not 2012)
  // as the foundational leakage paper. Five corrections shipped (Rule
  // #37 added, Sculley citation reframed, MTEB caveats, jailbreak/
  // prompt-injection subset relationship, Kaufman year). Two additions:
  // distribution-shift-as-bug (covariate vs label vs concept shift) +
  // vibes-as-evaluation (the LLM-era analogue of accuracy-as-metric).
  {
    id: "training-vs-serving-skew",
    name: "Assumes training and serving environments are equivalent",
    description:
      "Treats the production inference path as a thin wrapper around the trained model. The most common ML bug is training-serving skew: preprocessing in training (cleaned, normalized, feature-joined offline) doesn't match serving (raw user input, real-time joins, different timing). Model accuracy great offline collapses in production. PREVENTION (Google Rules of ML #29/#32): shared feature library (Feast, Tecton); same code on both paths. DETECTION (Rule #37): explicitly measure training-serving skew by logging served features and comparing distributions to the training set on a schedule. Most teams ship the prevention and skip the detection.",
    remediation: {
      kind: "reading",
      href: "https://developers.google.com/machine-learning/guides/rules-of-ml",
      label: "Google · Rules of ML (Rules #29 / #32 / #37)",
    },
  },
  {
    id: "overfit-vs-data-quality",
    name: "Treats overfitting as the only generalization failure mode",
    description:
      "Diagnoses any poor-generalization symptom as overfitting and reaches for more regularization. Underfitting (model too simple for the function), data quality (label noise, missing features, biased sampling), distribution shift (training and production data differ), test-set leakage (train and test share rows or derived features) all produce similar symptoms with different fixes. Fixing overfitting when the problem is data quality wastes regularization budget. The diagnostic taxonomy is canonized in Google's Rules of ML §3; the broader pattern that 'model problems' often surface as 'data / pipeline debt' is Sculley et al.'s contribution (NeurIPS 2015 'Hidden Technical Debt in ML Systems').",
    remediation: {
      kind: "reading",
      href: "https://developers.google.com/machine-learning/guides/rules-of-ml",
      label: "Google · Rules of ML §3 (debugging)",
    },
  },
  {
    id: "accuracy-as-metric",
    name: "Uses accuracy on imbalanced datasets",
    description:
      "Reports accuracy as the headline metric when the class distribution is skewed. On a 99% / 1% imbalanced classification problem, predicting the majority class for everything yields 99% accuracy — and is useless. The right metric depends on the cost structure: precision vs recall (which mistake is worse?), F1 (balanced), PR-AUC (better than ROC-AUC under heavy imbalance), or business-specific (cost-weighted misclassification, revenue at risk). Pick the metric before training; accuracy is rarely the right one.",
    remediation: {
      kind: "reading",
      href: "https://en.wikipedia.org/wiki/Precision_and_recall",
      label: "Precision and recall",
    },
  },
  {
    id: "prompt-injection-as-jailbreak",
    name: "Conflates prompt injection with jailbreaks",
    description:
      "Treats 'prompt injection' as the user typing 'IGNORE ALL INSTRUCTIONS' into a chat. Per OWASP LLM Top 10:2025 LLM01, that's DIRECT prompt injection — and 'jailbreaking' is a SUBSET of prompt injection, not a synonym. The harder production threat is INDIRECT prompt injection: 'the LLM accepts input from external sources, such as websites or files' (Greshake et al. arXiv 2302.12173) that contain instructions the LLM cannot distinguish from the system prompt. Indirect injection has held the #1 OWASP LLM slot for two consecutive editions. Defenses: structured prompt boundaries, treating LLM output as untrusted, sandboxing from sensitive operations, manual approval for high-stakes actions.",
    remediation: {
      kind: "reading",
      href: "https://genai.owasp.org/llmrisk/llm01-prompt-injection/",
      label: "OWASP LLM01:2025 · Prompt Injection",
    },
  },
  {
    id: "embeddings-as-similarity",
    name: "Treats vector embeddings as proven semantic similarity",
    description:
      "Assumes cosine similarity between embeddings reflects semantic similarity to the user. Embeddings reflect the model's TRAINING OBJECTIVE, which may diverge from user intent: a generic embedding model treats 'iPhone case' and 'iPhone insurance' as similar; a search-relevance system may need them dissimilar. MTEB (Massive Text Embedding Benchmark) is a STARTING FILTER not a verdict — it 'blends strengths and weaknesses, concealing trade-offs that matter in practice' and MTEB-top models don't necessarily excel at RAG/ICL retrieval. The right verdict for a production system: a small task-specific labeled retrieval set (~50–200 query/result pairs) you own. Also: many embedding objectives use cosine in saturation zones, so the metric itself isn't a clean read of 'semantic distance.'",
    remediation: {
      kind: "reading",
      href: "https://arxiv.org/abs/2210.07316",
      label: "MTEB (arXiv 2210.07316) — caveat: use as starting filter, not verdict",
    },
  },
  {
    id: "ml-test-set-leakage",
    name: "Splits train and test without checking for leakage",
    description:
      "Uses a random train/test split without checking for: TIME leakage (features derived from future data), ID leakage (same user in both sets — the model memorizes per-user patterns; Andrew Ng's chest X-ray example: random patient split → memorization of patients, not pneumonia), FEATURE leakage (a feature derived from the label or unavailable at prediction time). All three produce inflated test metrics. Foundational paper: Kaufman, Rosset, Perlich 2011 'Leakage in Data Mining' (not 2012). Real-world: a 2023 review found leakage in ≥294 academic publications across 17 disciplines. For time-series, use forward-chaining splits. For user-level data, split by user. For feature engineering, audit each feature for prediction-time availability.",
    remediation: {
      kind: "reading",
      href: "https://en.wikipedia.org/wiki/Leakage_(machine_learning)",
      label: "Leakage (machine learning) — Kaufman, Rosset, Perlich 2011",
    },
  },
  {
    id: "distribution-shift-as-bug",
    name: "Treats post-deployment accuracy drop as a model bug",
    description:
      "Diagnoses model accuracy degradation in production as 'the model is broken — retrain.' It's usually one of THREE distinct distribution shifts requiring different responses. Covariate shift: P(X) changes (a feature pipeline or input source issue, often fixable upstream — retraining masks the symptom). Label/prior shift: P(Y) changes (class balance moves; rebalance or weight). Concept drift: P(Y|X) changes (the world changed — retraining IS the right move). >70% of orgs hit significant drift within 6 months (Huyen 2022). Diagnose before reacting: monitor input distributions (covariate), output distributions (label/prior), and joint behavior (concept) separately.",
    remediation: {
      kind: "reading",
      href: "https://huyenchip.com/2022/02/07/data-distribution-shifts-and-monitoring.html",
      label: "Huyen · Data Distribution Shifts and Monitoring",
    },
  },
  {
    id: "vibes-as-evaluation",
    name: "Ships LLM applications evaluated by spot-checking",
    description:
      "Tests LLM application releases by trying a few prompts and judging the outputs 'by vibes.' Two systemic reasons this fails: (1) 'every popular static benchmark is contaminated to some degree' — model providers train on benchmark data; (2) the same model weights can swing 10–20 evaluation points depending on the evaluation harness alone. Fix: build a HELD-OUT TASK-SPECIFIC EVAL SET (a small labeled set covering the actual use cases) the model has not seen, regression-test it per release, version it with the prompt template. NIST AI 600-1 names confabulation/hallucination as a top-12 GenAI risk requiring pre-deployment testing with content provenance — not vibes.",
    remediation: {
      kind: "reading",
      href: "https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf",
      label: "NIST AI 600-1 · Generative AI Profile",
    },
  },

  // ─── Phase 7 · Advanced Systems (VERIFIED 2026-06-01). Production-grade ──
  // misconceptions in distributed consensus, CPU memory hierarchy, database
  // internals, formal methods, weak memory. Verified against Ongaro &
  // Ousterhout's Raft paper (USENIX ATC '14) — the 43-student empirical
  // study substantiates understandability as a measurable algorithmic
  // property; Red Hat RHEL 10 docs + Arm Learning Path for false-sharing
  // detection via perf c2c; TiKV Distributed Algorithms for the 2PC /
  // Paxos / saga taxonomy; Postgres MVCC + Percona for SSI abort-rate
  // ranges; Lamport's TLA+ pubs (TLAPS supports unbounded proofs — not
  // strictly bounded model checking); Maranget on ARM/POWER + Sewell on
  // C/C++11 mappings + research!rsc on hardware memory models. Three
  // corrections shipped (2PC blocking + CRDT invariant limits, TLAPS
  // unbounded proofs, ARMv7-vs-POWER barrier nuance). Exactly-once and
  // wall-clock-causality additions live in Phase 5 (canonical home).
  {
    id: "raft-as-paxos-simpler",
    name: "Treats Raft as 'just simpler Paxos'",
    description:
      "Reads Raft as a teaching version of Paxos with the same trade-offs. They solve the same problem (consensus) but make different architectural choices: Raft has a STRONG LEADER (single source of truth, two-phase membership change), Paxos is leader-optional and supports multiple concurrent proposers. Raft trades flexibility for tractability — useful when the system tolerates a single bottleneck and benefits from a clear mental model. The choice isn't 'simpler is better,' it's matching the consensus model to the system's constraints.",
    remediation: {
      kind: "reading",
      href: "https://raft.github.io/raft.pdf",
      label: "Ongaro & Ousterhout · In Search of an Understandable Consensus Algorithm",
    },
  },
  {
    id: "false-sharing-as-cache-miss",
    name: "Reads false sharing as a normal cache miss",
    description:
      "Diagnoses false sharing as 'cache pressure, get a bigger cache.' False sharing is a CPU coherency stall: two threads update separate variables that share a cache line, so each modification invalidates the line for the other CPU. Performance counters at the cache-miss level don't show this clearly because the line is technically present — it's just invalid. Fix: pad variables to separate cache lines (alignas(64) in C++, #[repr(align(64))] in Rust). Adding a mutex makes it worse.",
    remediation: {
      kind: "reading",
      href: "https://en.wikipedia.org/wiki/False_sharing",
      label: "False sharing",
    },
  },
  {
    id: "consensus-as-correctness",
    name: "Treats consensus as the universal distributed-correctness primitive",
    description:
      "Reaches for Paxos / Raft / Zookeeper to coordinate every distributed decision. Consensus is the agreement-on-a-single-value primitive. Cross-shard transactions need two-phase commit (or Paxos Commit — Gray & Lamport 2006 — because vanilla 2PC BLOCKS on coordinator failure). Calvin uses deterministic ordering; Spanner layers Paxos-over-shards with 2PC for cross-shard atomicity. Cross-system invariants often need sagas with compensation. Eventually-consistent state needs CRDTs — but CRDTs cannot enforce GLOBAL INVARIANTS like uniqueness or balance ≥ 0, only commutative/associative/idempotent merge. Picking the wrong primitive produces architectures that scale poorly and fail surprisingly under partition.",
    remediation: {
      kind: "reading",
      href: "https://jepsen.io/consistency",
      label: "Jepsen · Consistency models",
    },
  },
  {
    id: "mvcc-vs-locking-throughput",
    name: "Assumes MVCC always outperforms locking",
    description:
      "Treats Multi-Version Concurrency Control as universally better for throughput than two-phase locking. MVCC excels for read-heavy workloads (readers don't block writers and vice versa). Under heavy WRITE contention on the same rows, MVCC produces version chains that grow long, vacuum costs become significant, and serializable isolation levels (Postgres SSI) abort more transactions. Lock-based concurrency can outperform MVCC for workloads dominated by short, conflicting writes. Pick the concurrency model based on the workload, not the database's marketing.",
    remediation: {
      kind: "reading",
      href: "https://www.postgresql.org/docs/current/mvcc.html",
      label: "PostgreSQL · MVCC",
    },
  },
  {
    id: "tla-as-proof",
    name: "Treats TLA+ output as a proof of implementation correctness",
    description:
      "Reads a successful TLC model-check as proof the implementation is correct. TLA+ is a SPECIFICATION language. TLC, the bounded model checker, verifies the spec against invariants and temporal properties within model bounds. TLAPS (TLA+ Proof System) DOES support unbounded mechanically-checked proofs of safety and refinement — so 'model bounds' applies to TLC-style checking, not TLA+ as a language. Either way, the verified object is the SPEC. The implementation may diverge. Lamport: 'implementations are highly optimized and the optimizations are rarely modeled.' TLA+ catches design-level bugs (concurrency races, missing invariants) and is high-leverage there; it does not catch implementation bugs.",
    remediation: {
      kind: "reading",
      href: "https://lamport.org/pubs/spec-and-verifying.pdf",
      label: "Lamport · Specifying and Verifying Systems With TLA+",
    },
  },
  {
    id: "weak-memory-as-bug",
    name: "Treats ARM/POWER weak memory ordering as a bug in 'correct' x86 code",
    description:
      "Assumes code that works on x86 will work on ARM. x86 has a strong memory model (Total Store Order). ARM and POWER are weakly ordered — writes can be reordered, made visible out of order across cores, and require explicit memory barriers. ARMv7's DMB is analogous to POWER's hwsync; ARM has NO analogue of lwsync (POWER's cheaper barrier). ARMv8 adds load-acquire / store-release instructions (LDAR/STLR) as cheaper alternatives. C++ memory model uses sequential-consistency-for-data-race-free (Boehm/Adve); non-atomic shared writes are undefined behavior. On x86, stores can map to xchg for SC atomics. Multi-threaded code untested on weakly-ordered architectures is presumptively broken there.",
    remediation: {
      kind: "reading",
      href: "https://www.cl.cam.ac.uk/~pes20/cpp/cpp0xmappings.html",
      label: "Sewell · C/C++11 mappings to processors",
    },
  },

  // ─── Phase 0 · Digital Literacy (VERIFIED 2026-06-01). The foundational ──
  // mental-model traps that surface when first learners encounter computing.
  // Verified against canonical sources (NIST SP 800-88 Rev. 2 for media
  // sanitization, Wikipedia Wi-Fi / Turing-machine / binary-file pages with
  // primary citations, Coding Horror "Cloud is someone else's computer",
  // Cambridge research on the expert-layperson knowledge gap for HTTPS
  // padlock semantics). delete-as-erase was corrected to reflect SSD/TRIM
  // behavior (HDD recovery window was misleading for modern dominant
  // storage). Two new high-leverage additions: cloud-as-magical-elsewhere,
  // https-padlock-as-trust.
  {
    id: "computer-as-intelligent",
    name: "Anthropomorphizes the computer",
    description:
      "Says things like 'the computer figured out what I wanted' or 'it understood that I meant to save.' Computers follow programmed instructions — every action you see is the result of code a human wrote, executing step by step. The appearance of intelligence (auto-complete suggestions, search results, app behavior) is the product of careful engineering by people, not the computer 'thinking.' Even ML models that look intelligent are mechanical: they compute predictions, they don't reason.",
    remediation: {
      kind: "lesson",
      path: "/paths/0/0-1/01",
      label: "Phase 0 · What computers actually do",
    },
  },
  {
    id: "wifi-as-internet",
    name: "Confuses WiFi with the Internet",
    description:
      "Treats 'WiFi is working' and 'I'm on the internet' as the same statement. WiFi is the LOCAL wireless connection between your device and your router. The internet is the network beyond your router. Your WiFi can be perfect (full bars, fast handshake) while the internet is unavailable (the cable from your house to the ISP is cut, the ISP is down, DNS isn't resolving). Diagnosing 'no internet' starts with figuring out which link is broken.",
    remediation: {
      kind: "lesson",
      path: "/paths/0/0-2/03",
      label: "Phase 0 · How networks connect",
    },
  },
  {
    id: "delete-as-erase",
    name: "Assumes 'delete' permanently erases data",
    description:
      "Treats clicking 'Delete' or emptying the trash as physically removing the data. On HDDs the bytes typically remain on disk for hours, days, or months until something else writes over them — forensic recovery is routine. On SSDs with TRIM (default on Windows / macOS / Linux since ~2010), the controller's garbage collector usually wipes deleted blocks within seconds, but wear-leveling means multi-pass overwrite tools designed for HDDs give a false sense of security on SSDs. The canonical modern method per NIST SP 800-88 Rev. 2 is cryptographic erase: full-disk encryption from day one + factory reset destroys the key, rendering the data unrecoverable without overwriting bytes.",
    remediation: {
      kind: "reading",
      href: "https://csrc.nist.gov/pubs/sp/800/88/r2/final",
      label: "NIST SP 800-88 Rev. 2 · Guidelines for Media Sanitization",
    },
  },
  {
    id: "binary-as-just-digits",
    name: "Treats 0s and 1s as abstract digits without context",
    description:
      "Reads 'computers use binary' as a quirky design choice — 'they could use any number system.' Binary is the physical reality of how computers store and transmit information: a transistor is either conducting (1) or not (0), a magnetic spot is one polarity or the other, a voltage level is high or low. The same bit pattern can be the letter A, the number 65, a green pixel, or a CPU ADD instruction — depending on the context (file format, type system, protocol). Without that context, bits have no meaning.",
    remediation: {
      kind: "lesson",
      path: "/paths/0/0-1/04",
      label: "Phase 0 · Bits, bytes, and what they mean",
    },
  },
  {
    id: "cloud-as-magical-elsewhere",
    name: "Treats 'the cloud' as a magical somewhere-else",
    description:
      "Reads 'the cloud' as a fundamentally different kind of place where physics doesn't apply — perpetual, immune to outage, 'not really stored anywhere.' The cloud is data centers in specific geographic locations subject to disk failure, power outages, jurisdiction, contractual terms, and provider bankruptcy. Coding Horror's line is canonical: 'the cloud is just someone else's computer.' Modern caveat: it's many computers behind abstraction services, but the physical substrate and the operator's choices still constrain availability, durability, and access.",
    remediation: {
      kind: "reading",
      href: "https://blog.codinghorror.com/the-cloud-is-just-someone-elses-computer/",
      label: "Coding Horror · The cloud is just someone else's computer",
    },
  },
  {
    id: "https-padlock-as-trust",
    name: "Reads the HTTPS padlock as a trust signal",
    description:
      "Treats the padlock icon as evidence the site is safe, legitimate, or trustworthy. HTTPS guarantees only that the connection is encrypted and the certificate matches the domain in the URL bar. It says nothing about whether the operator is honest, the site isn't phishing, the data is handled well at the other end, or the business model is benign. Phishing kits ship with valid Let's Encrypt certificates as a matter of course. The padlock is a channel-integrity signal, not a content-trust signal.",
    remediation: {
      kind: "reading",
      href: "https://www.fbi.gov/news/press-releases/cyber-actors-exploit-secure-websites-in-phishing-campaigns",
      label: "FBI · Cyber actors exploit secure websites in phishing campaigns",
    },
  },
];

export const MISCONCEPTIONS: MisconceptionCatalog = Object.freeze(
  ENTRIES.reduce<Record<string, Misconception>>((acc, m) => {
    acc[m.id] = m;
    return acc;
  }, {})
);
