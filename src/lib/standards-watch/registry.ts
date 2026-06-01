/**
 * Standards revision registry — source of truth for what's CURRENT.
 *
 * Add or update an entry here when a standards body publishes a new revision.
 * The scanner uses this registry to flag any reference in PHASE_R + PHASE_M
 * (and, eventually, the diagnostic catalog and MDX lesson bodies) that
 * cites a superseded version.
 *
 * Update cadence target: quarterly review. Authors that touch a lesson
 * referencing a standard family should also confirm the registry entry is
 * still current.
 */

import type { StandardRevision } from "./types";

export const STANDARDS_REGISTRY: readonly StandardRevision[] = [
  // ─── Robotics safety family ────────────────────────────────────────────
  {
    family: "ISO 10218 Part 1",
    current: "ISO 10218-1:2025",
    effectiveFrom: "2025-01-01",
    supersededRevisions: ["ISO 10218-1:2011"],
  },
  {
    family: "ISO 10218 Part 2",
    current: "ISO 10218-2:2025",
    effectiveFrom: "2025-01-01",
    supersededRevisions: ["ISO 10218-2:2011"],
  },
  {
    family: "ISO/TS 15066",
    current: "ISO 10218-1:2025", // content absorbed into ISO 10218-1:2025
    effectiveFrom: "2025-01-01",
    supersededRevisions: ["ISO/TS 15066:2016", "ISO/TS 15066"],
  },
  {
    family: "ANSI/RIA R15.06",
    current: "ANSI/A3 R15.06-2025",
    effectiveFrom: "2025-01-01",
    supersededRevisions: ["ANSI/RIA R15.06-2012", "RIA R15.06-2012"],
  },
  {
    family: "RIA TR R15.806",
    current: "RIA TR R15.806-2018",
    effectiveFrom: "2018-01-01",
    supersededRevisions: [],
  },
  {
    family: "ISO 13482",
    current: "ISO 13482:2014",
    effectiveFrom: "2014-02-01",
    supersededRevisions: [],
    inProgress: {
      targetRevision: "ISO 13482:202x",
      estimatedEffectiveFrom: "2026-12-31",
      note: "Revision broadening scope to service robots generally; in progress.",
    },
  },
  {
    family: "ISO 8373",
    current: "ISO 8373:2021",
    effectiveFrom: "2021-11-01",
    supersededRevisions: ["ISO 8373:2012"],
  },

  // ─── Functional safety family ──────────────────────────────────────────
  {
    family: "IEC 61508",
    current: "IEC 61508 series",
    effectiveFrom: "2010-04-30",
    supersededRevisions: [],
  },
  {
    family: "ISO 13849-1",
    current: "ISO 13849-1:2023",
    effectiveFrom: "2023-04-01",
    supersededRevisions: ["ISO 13849-1:2015", "ISO 13849-1:2006"],
  },
  {
    family: "IEC 62061",
    current: "IEC 62061:2021",
    effectiveFrom: "2021-03-01",
    supersededRevisions: ["IEC 62061:2005"],
  },
  {
    family: "ISO 12100",
    current: "ISO 12100:2010",
    effectiveFrom: "2010-11-01",
    supersededRevisions: ["ISO 12100-1:2003", "ISO 12100-2:2003"],
  },

  // ─── Manufacturing quality family ──────────────────────────────────────
  {
    family: "ISO 9001",
    current: "ISO 9001:2015",
    effectiveFrom: "2015-09-23",
    supersededRevisions: ["ISO 9001:2008", "ISO 9001:2000"],
    inProgress: {
      targetRevision: "ISO 9001:202x",
      estimatedEffectiveFrom: "2026-09-30",
      note: "ISO/TC 176 currently revising; alignment with annex SL and digital tooling.",
    },
  },
  {
    family: "AS9100",
    current: "AS9100D",
    effectiveFrom: "2016-09-20",
    supersededRevisions: ["AS9100C", "AS9100B"],
  },
  {
    family: "IATF 16949",
    current: "IATF 16949:2016",
    effectiveFrom: "2016-10-01",
    supersededRevisions: ["ISO/TS 16949:2009"],
  },

  // ─── GD&T + MBD family ─────────────────────────────────────────────────
  {
    family: "ASME Y14.5",
    current: "ASME Y14.5-2018",
    effectiveFrom: "2018-02-11",
    supersededRevisions: ["ASME Y14.5-2009", "ASME Y14.5M-1994"],
  },
  {
    family: "ASME Y14.41",
    current: "ASME Y14.41-2019",
    effectiveFrom: "2019-10-25",
    supersededRevisions: ["ASME Y14.41-2012", "ASME Y14.41-2003"],
  },

  // ─── ISA control hierarchy family ──────────────────────────────────────
  {
    family: "ISA-95",
    current: "ISA-95 / IEC 62264",
    effectiveFrom: "2013-09-01",
    supersededRevisions: [],
  },
  {
    family: "ISA-88",
    current: "ISA-88 / IEC 61512",
    effectiveFrom: "1995-01-01",
    supersededRevisions: [],
  },

  // ─── Electronics workmanship family ────────────────────────────────────
  {
    family: "IPC-A-610",
    current: "IPC-A-610J (March 2024)",
    effectiveFrom: "2024-03-01",
    supersededRevisions: ["IPC-A-610H (2020)", "IPC-A-610G (2017)"],
  },
  {
    family: "IPC-7711/7721",
    current: "IPC-7711/7721 Rev D (2024)",
    effectiveFrom: "2024-01-01",
    supersededRevisions: ["IPC-7711/7721 Rev C (2017)"],
  },

  // ─── Industrial automation interop ─────────────────────────────────────
  {
    family: "OPC UA",
    current: "OPC UA / IEC 62541",
    effectiveFrom: "2020-01-01",
    supersededRevisions: [],
  },
  {
    family: "IEC/IEEE 60802 TSN",
    current: "IEC/IEEE 60802",
    effectiveFrom: "2024-01-01",
    supersededRevisions: [],
  },
  {
    family: "MTConnect",
    current: "MTConnect",
    effectiveFrom: "2008-01-01",
    supersededRevisions: [],
  },

  // ─── OT cybersecurity family ───────────────────────────────────────────
  {
    family: "IEC 62443",
    current: "IEC 62443 series",
    effectiveFrom: "2018-01-01",
    supersededRevisions: [],
  },

  // ─── Web compliance + security families ────────────────────────────────
  {
    family: "OWASP Top 10",
    current: "OWASP Top 10:2025",
    effectiveFrom: "2026-01-01",
    supersededRevisions: ["OWASP Top 10:2021", "OWASP Top 10:2017", "OWASP Top 10:2013"],
  },
  {
    family: "NIST CSF",
    current: "NIST CSF 2.0",
    effectiveFrom: "2024-02-26",
    supersededRevisions: ["NIST CSF 1.1", "NIST CSF 1.0"],
  },
  {
    family: "WCAG",
    current: "WCAG 2.2",
    effectiveFrom: "2023-10-05",
    supersededRevisions: ["WCAG 2.1", "WCAG 2.0"],
    inProgress: {
      targetRevision: "WCAG 3.0",
      estimatedEffectiveFrom: "2028-06-30",
      note: "Major restructure underway; long timeline to recommendation status.",
    },
  },

  // ─── Reference architectures ───────────────────────────────────────────
  {
    family: "RAMI 4.0",
    current: "RAMI 4.0 (DIN SPEC 91345)",
    effectiveFrom: "2016-04-01",
    supersededRevisions: [],
  },
  {
    family: "IIRA",
    current: "IIRA v1.10 (Industry IoT Consortium)",
    effectiveFrom: "2022-11-01",
    supersededRevisions: ["IIRA v1.9", "IIRA v1.8"],
  },

  // ─── STEP exchange ─────────────────────────────────────────────────────
  {
    family: "STEP AP242",
    current: "ISO 10303-242 (STEP AP242)",
    effectiveFrom: "2014-04-01",
    supersededRevisions: [],
  },
];

/** Build an index from cited string → current revision for fast lookup.
 *  The current revision maps to itself; every superseded revision maps to
 *  the current. */
export function buildLookupIndex(): Map<string, StandardRevision> {
  const index = new Map<string, StandardRevision>();
  for (const entry of STANDARDS_REGISTRY) {
    index.set(entry.current, entry);
    for (const superseded of entry.supersededRevisions) {
      index.set(superseded, entry);
    }
  }
  return index;
}
