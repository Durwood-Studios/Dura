/**
 * Phase S · Security Engineering — module registry per FM-1.0.
 *
 * Eight defensive, code-and-practice lessons from threat modeling to a hardened
 * production service with an incident-response runbook. Standards-anchored
 * throughout; the capstone is hash-anchored via /verify.
 */

import type { PhaseSLesson, PhaseSModule } from "./types";

const LESSONS: readonly PhaseSLesson[] = [
  {
    id: "s-1-threat-modeling",
    order: 1,
    title: "Threat Modeling — STRIDE, Attack Trees, Data-Flow Diagrams",
    description:
      "Find the holes before an attacker does. Data-flow diagrams, trust boundaries, STRIDE per-element, attack trees, and ranking with DREAD-style risk — the structured way to reason about what can go wrong.",
    estimatedMinutes: 90,
    standards: ["Microsoft STRIDE", "OWASP Threat Modeling"],
    hasVerifyArtifact: false,
  },
  {
    id: "s-2-appsec-owasp-top-10",
    order: 2,
    title: "Application Security — The OWASP Top 10 in Code",
    description:
      "The vulnerabilities that actually ship: injection, broken access control, SSRF, insecure deserialization, and the rest of the 2021 Top 10 — each shown as vulnerable code, the exploit, and the fix, mapped to OWASP ASVS verification requirements.",
    estimatedMinutes: 120,
    standards: ["OWASP Top 10:2021", "OWASP ASVS 4.0"],
    hasVerifyArtifact: false,
  },
  {
    id: "s-3-authn-authz-sessions",
    order: 3,
    title: "Authentication, Authorization & Session Security",
    description:
      "Password storage (Argon2id), MFA, OAuth 2.1 / OIDC flows, JWT pitfalls, session fixation, and the access-control models (RBAC/ABAC) — what NIST 800-63B and ASVS require and why.",
    estimatedMinutes: 120,
    standards: ["NIST SP 800-63B", "OAuth 2.1", "OWASP ASVS 4.0"],
    hasVerifyArtifact: false,
  },
  {
    id: "s-4-applied-cryptography",
    order: 4,
    title: "Applied Cryptography — Hashing, AEAD, Key Management",
    description:
      "Use crypto correctly without rolling your own: hashes vs MACs vs KDFs, authenticated encryption (AES-GCM / ChaCha20-Poly1305), nonce discipline, key rotation, and the FIPS-validated boundary. The failure modes that turn good primitives into bad systems.",
    estimatedMinutes: 120,
    standards: ["NIST FIPS 140-3", "NIST SP 800-175B"],
    hasVerifyArtifact: false,
  },
  {
    id: "s-5-network-transport-security",
    order: 5,
    title: "Network & Transport Security — TLS 1.3, mTLS, Segmentation",
    description:
      "The TLS 1.3 handshake operationally, certificate validation and pinning, mutual TLS for service-to-service auth, and network segmentation / zero-trust boundaries. Why the lock icon is necessary but not sufficient.",
    estimatedMinutes: 90,
    standards: ["RFC 8446 (TLS 1.3)", "NIST SP 800-52r2"],
    hasVerifyArtifact: false,
  },
  {
    id: "s-6-secure-sdlc-supply-chain",
    order: 6,
    title: "Secure SDLC & Software Supply Chain — SAST/DAST, SBOM, SLSA",
    description:
      "Build security into the pipeline: threat modeling and SAST/DAST/SCA gates, dependency and provenance risk, SBOMs (CycloneDX/SPDX), signed builds and SLSA levels. The NIST SSDF practices that prevent the next supply-chain incident.",
    estimatedMinutes: 90,
    standards: ["NIST SP 800-218 (SSDF)", "SLSA v1.0", "CycloneDX"],
    hasVerifyArtifact: false,
  },
  {
    id: "s-7-detection-and-incident-response",
    order: 7,
    title: "Detection, Logging & Incident Response — ATT&CK and the Blue Team",
    description:
      "Assume breach: security logging that's actually useful, detection engineering mapped to MITRE ATT&CK techniques, and the NIST incident-response lifecycle — preparation, detection, containment, eradication, recovery, lessons learned.",
    estimatedMinutes: 90,
    standards: ["MITRE ATT&CK", "NIST SP 800-61r2"],
    hasVerifyArtifact: false,
  },
  {
    id: "s-8-capstone-harden-a-service",
    order: 8,
    title: "Capstone — Threat-Model and Harden a Production Service",
    description:
      "Take a deliberately-vulnerable web service: produce a STRIDE threat model, remediate its OWASP findings to ASVS, add authn/crypto/TLS hardening, wire detection + an IR runbook, and document residual risk against NIST CSF. Hash-anchored via /verify.",
    estimatedMinutes: 180,
    standards: ["OWASP ASVS 4.0", "NIST CSF 2.0"],
    hasVerifyArtifact: true,
  },
] as const;

export const PHASE_S: PhaseSModule = {
  slug: "s-security-engineering",
  title: "Phase S: Security Engineering",
  tagline: "Threat-model, harden, and defend production systems.",
  description:
    "Eight defensive, code-and-practice lessons from threat modeling to a hardened production service with an incident-response runbook. OWASP Top 10 + ASVS, MITRE ATT&CK, NIST (SSDF, 800-63B, 800-61, CSF 2.0), TLS 1.3, and SLSA anchored throughout. Secure-engineering / blue-team framing — the discipline, taught ethically.",
  slotsAfterPhase: "5",
  parallelTo: "e-embedded",
  lessons: LESSONS,
};

export function getPhaseSLesson(id: string): PhaseSLesson | undefined {
  return LESSONS.find((l) => l.id === id);
}
