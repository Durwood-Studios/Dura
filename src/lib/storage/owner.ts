/** Device namespaces prevent a later signed-in account from adopting another learner's records. */
const LEGACY_OWNER_KEY = "dura:storage:legacy-owner";
const OWNER_KEY = "dura:storage:active-owner";
const OWNERS_KEY = "dura:storage:owners";
let owner = "guest";
let generation = 0;

/** Current account namespace; guest is deliberately independent of account identities. */
export function getStorageOwner(): string {
  return owner;
}
/** Generation captured by database handles and long-running operations. */
export function getOwnerGeneration(): number {
  return generation;
}
/** Reject stale work rather than writing it into a newly selected learner. */
export function assertOwnerGeneration(expected: number): void {
  if (expected !== generation)
    throw new Error("The active learner changed. Reload before continuing.");
}
/** Select the owner before opening storage. Returns whether the active namespace changed. */
export function selectStorageOwner(userId: string | null): boolean {
  const next = userId ? `account:${userId}` : "guest";
  const changed = next !== owner;
  if (typeof localStorage !== "undefined") {
    if (!localStorage.getItem(LEGACY_OWNER_KEY)) {
      const previousUser = localStorage.getItem("dura:idb:last-auth-uid");
      // Never assign unlabelled legacy records to a newly signing-in user.
      localStorage.setItem(LEGACY_OWNER_KEY, previousUser ? `account:${previousUser}` : "guest");
    }
    const known: unknown = JSON.parse(localStorage.getItem(OWNERS_KEY) ?? "[]");
    const owners = Array.isArray(known)
      ? known.filter((item: unknown): item is string => typeof item === "string")
      : [];
    localStorage.setItem(OWNERS_KEY, JSON.stringify([...new Set([...owners, next])]));
    localStorage.setItem(OWNER_KEY, next);
  }
  owner = next;
  if (changed) generation++;
  return changed;
}
/** Database name retains the pre-namespace database for its recorded original owner. */
export function ownerDatabaseName(target: string = owner): string {
  const legacy =
    typeof localStorage === "undefined" ? null : localStorage.getItem(LEGACY_OWNER_KEY);
  return (legacy ?? "guest") === target ? "dura" : `dura-owner-${encodeURIComponent(target)}`;
}
/** Separate shadow files avoid restoring another account's data into an empty namespace. */
export function ownerSnapshotName(): string {
  return ownerDatabaseName() === "dura"
    ? "dura-learner-record.json"
    : `${ownerDatabaseName()}-record.json`;
}
/** Registered device namespaces used by an explicitly requested whole-device reset. */
export function knownOwnerDatabaseNames(): string[] {
  const raw: unknown = JSON.parse(localStorage.getItem(OWNERS_KEY) ?? "[]");
  const owners = Array.isArray(raw)
    ? raw.filter((item: unknown): item is string => typeof item === "string")
    : [];
  return [...new Set(["dura", ...owners.map(ownerDatabaseName), ownerDatabaseName()])];
}

/** Scope a legacy storage key while retaining it only for the original database owner. */
export function ownerStorageKey(legacyKey: string): string {
  const database = ownerDatabaseName();
  return database === "dura" ? legacyKey : `${database}:${legacyKey}`;
}

let isReady = true;
let readiness: Promise<void> | null = null;
let resolveReadiness: (() => void) | null = null;
let rejectReadiness: ((error: unknown) => void) | null = null;
/** Install a readiness barrier during the provider's first browser render, before child effects run. */
export function beginOwnerInitialization(): void {
  if (typeof window === "undefined" || readiness) return;
  isReady = false;
  readiness = new Promise<void>((resolve, reject): void => {
    resolveReadiness = resolve;
    rejectReadiness = reject;
  });
  // The rejection remains observable to DB consumers even when none has started yet.
  void readiness.catch((error: unknown): void =>
    console.error("[storage-owner] Initialization failed", error)
  );
}
/** Release waiting DB readers only after both namespace and encryption key are installed. */
export function finishOwnerInitialization(error?: unknown): void {
  if (error) rejectReadiness?.(error);
  else {
    isReady = true;
    resolveReadiness?.();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("dura:analytics-consent-changed"));
      window.dispatchEvent(new Event("dura:ai-consent-changed"));
      window.dispatchEvent(new Event("dura:storage-owner-ready"));
    }
  }
}
/** Public rendering is independent of readiness; persistent data access waits for ownership. */
export async function waitForOwnerInitialization(): Promise<void> {
  await readiness;
}

/** Consent and network consumers must also wait for namespace selection. */
export function isOwnerInitialized(): boolean {
  return isReady;
}
