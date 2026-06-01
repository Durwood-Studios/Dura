/**
 * Standards-watch scanner — walks the Phase R and Phase M registries and
 * surfaces any references that cite a superseded revision per the
 * STANDARDS_REGISTRY. Also emits upcoming-revision warnings for standards
 * with an in-progress new edition.
 *
 * V1 scope: typed registries only (PHASE_R + PHASE_M). MDX lesson body
 * scanning and diagnostic-catalog free-text scanning are deferred — they
 * need natural-language extraction and aren't load-bearing for the cited-
 * revision check the typed registries already enforce.
 */

import { PHASE_R } from "@/lib/phase-r";
import { PHASE_M } from "@/lib/phase-m";
import { buildLookupIndex } from "./registry";
import type { OutdatedReference, StandardsWatchReport, UpcomingRevision } from "./types";

interface ReferenceSite {
  source: string;
  ownerId: string;
  citedAs: string;
}

function collectReferences(): ReferenceSite[] {
  const sites: ReferenceSite[] = [];
  for (const lesson of PHASE_R.lessons) {
    for (const standard of lesson.standards) {
      sites.push({
        source: "phase-r",
        ownerId: lesson.id,
        citedAs: standard.id,
      });
    }
  }
  for (const lesson of PHASE_M.lessons) {
    for (const standard of lesson.standards) {
      sites.push({
        source: "phase-m",
        ownerId: lesson.id,
        citedAs: standard.id,
      });
    }
  }
  return sites;
}

export function scanStandards(): StandardsWatchReport {
  const index = buildLookupIndex();
  const sites = collectReferences();
  const outdated: OutdatedReference[] = [];
  const upcoming: UpcomingRevision[] = [];
  const seenUpcoming = new Set<string>();

  for (const site of sites) {
    const entry = index.get(site.citedAs);
    if (!entry) continue; // citation isn't in the registry — out of scope, not flagged
    if (site.citedAs !== entry.current) {
      outdated.push({
        source: site.source,
        ownerId: site.ownerId,
        citedAs: site.citedAs,
        currentRevision: entry.current,
        family: entry.family,
      });
    }
    if (entry.inProgress && !seenUpcoming.has(entry.family)) {
      seenUpcoming.add(entry.family);
      upcoming.push({
        source: site.source,
        ownerId: site.ownerId,
        currentRevision: entry.current,
        targetRevision: entry.inProgress.targetRevision,
        estimatedEffectiveFrom: entry.inProgress.estimatedEffectiveFrom,
        note: entry.inProgress.note,
      });
    }
  }

  return {
    generatedAt: Date.now(),
    outdated,
    upcoming,
    totalReferences: sites.length,
  };
}

/** True when the typed-registry scan reports zero outdated references. Used
 *  as a CI quality gate — fail the build if a lesson regresses against a
 *  superseded revision. */
export function isStandardsRegistryClean(): boolean {
  return scanStandards().outdated.length === 0;
}
