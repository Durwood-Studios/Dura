/** Persisted generation makes stale tabs fail closed even before storage events run. */
export const RESET_GENERATION_KEY = "dura:reset-generation";
const observedGeneration = readResetGeneration();

/** Read reset state without making normal offline storage depend on localStorage access. */
export function readResetGeneration(): string | null {
  try {
    return typeof localStorage === "undefined" ? null : localStorage.getItem(RESET_GENERATION_KEY);
  } catch (error) {
    console.error("[reset] Could not read reset state", error);
    return null;
  }
}

/** Block mutations from tabs opened before a reset or during an unfinished reset. */
export function assertCurrentStorageGeneration(): void {
  const current = readResetGeneration();
  if (current?.startsWith("pending:") || current !== observedGeneration) {
    throw new Error("DURA data was reset in another tab. Reload after the reset finishes.");
  }
}

/** Invalidate existing tabs before clearing any records. Throws if coordination is unavailable. */
export function beginLocalReset(): string {
  const generation = crypto.randomUUID();
  localStorage.setItem(RESET_GENERATION_KEY, `pending:${generation}`);
  return generation;
}

/** Keep the generation marker after clearing so suspended tabs cannot resume stale writes. */
export function finishLocalReset(generation: string): void {
  if (localStorage.getItem(RESET_GENERATION_KEY) === `pending:${generation}`) {
    localStorage.setItem(RESET_GENERATION_KEY, `finished:${generation}`);
  }
}
