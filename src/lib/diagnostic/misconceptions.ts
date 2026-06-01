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
];

export const MISCONCEPTIONS: MisconceptionCatalog = Object.freeze(
  ENTRIES.reduce<Record<string, Misconception>>((acc, m) => {
    acc[m.id] = m;
    return acc;
  }, {})
);
