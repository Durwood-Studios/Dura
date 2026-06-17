/**
 * Phase S · Security Engineering — feature-module types per FM-1.0.
 *
 * Eight defensively-oriented, code-and-practice lessons that move a learner
 * from threat modeling to a hardened production service. Standards-anchored:
 * OWASP Top 10:2021 + ASVS 4.0, MITRE ATT&CK, NIST (SSDF 800-218, 800-63B,
 * 800-61r2, CSF 2.0), TLS 1.3 (RFC 8446), and SLSA v1.0. Secure-engineering /
 * blue-team framing throughout — the discipline, taught ethically.
 */

export type PhaseSLessonId =
  | "s-1-threat-modeling"
  | "s-2-appsec-owasp-top-10"
  | "s-3-authn-authz-sessions"
  | "s-4-applied-cryptography"
  | "s-5-network-transport-security"
  | "s-6-secure-sdlc-supply-chain"
  | "s-7-detection-and-incident-response"
  | "s-8-capstone-harden-a-service";

export interface PhaseSLesson {
  id: PhaseSLessonId;
  order: number;
  title: string;
  description: string;
  estimatedMinutes: number;
  standards: readonly string[];
  hasVerifyArtifact: boolean;
}

export interface PhaseSModule {
  slug: "s-security-engineering";
  title: "Phase S: Security Engineering";
  tagline: string;
  description: string;
  slotsAfterPhase: "5";
  parallelTo: "e-embedded";
  lessons: readonly PhaseSLesson[];
}
