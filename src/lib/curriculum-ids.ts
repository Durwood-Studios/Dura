const LEGACY_PHASE_IDS: Readonly<Record<string, string>> = {
  e: "10",
  h: "11",
  q: "12",
  r: "13",
  m: "14",
};

/** Resolve historical specialty folder prefixes to the public numeric module ID. */
export function canonicalModuleId(directoryOrId: string): string | undefined {
  const match = /^(\d+|[ehqrm])-(\d+)(?:-|$)/.exec(directoryOrId);
  if (!match) return undefined;
  return `${LEGACY_PHASE_IDS[match[1]] ?? match[1]}-${match[2]}`;
}
