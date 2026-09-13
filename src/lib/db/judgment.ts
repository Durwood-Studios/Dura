import { getDB } from "@/lib/db";
import { peekActiveKey } from "@/lib/idb/active-key";
import { encryptRecord, decryptRecord } from "@/lib/idb/encryption";
import { JUDGMENT_ATTEMPT_SCHEMA } from "@/lib/judgment/schema";
import { triggerShadowWrite } from "@/lib/storage/shadow-write";
import type { JudgmentAttempt } from "@/lib/judgment/types";

export interface StoredJudgmentAttempt {
  id: string;
  updatedAt: number;
  _e: ArrayBuffer;
}
/** Encrypt all authored decision fields before storage or backup. */
export async function sealJudgmentAttempt(
  attempt: JudgmentAttempt
): Promise<StoredJudgmentAttempt> {
  const parsed = JUDGMENT_ATTEMPT_SCHEMA.parse(attempt);
  const key = peekActiveKey()?.key;
  if (!key) throw new Error("Your learning storage is not ready. Try again shortly.");
  return { id: parsed.id, updatedAt: parsed.updatedAt, _e: await encryptRecord(parsed, key) };
}
/** Hydrate a selected owner's record, optionally using an explicit guest-copy key. */
export async function hydrateJudgmentAttempt(
  stored: StoredJudgmentAttempt,
  key?: CryptoKey
): Promise<JudgmentAttempt> {
  const active = key ?? peekActiveKey()?.key;
  if (!active) throw new Error("Your learning storage is not ready. Try again shortly.");
  const attempt = JUDGMENT_ATTEMPT_SCHEMA.parse(await decryptRecord(stored._e, active));
  if (attempt.id !== stored.id) throw new Error("Practice record identity is damaged.");
  return attempt;
}
/** Preserve committed reasoning and case identity during edits, imports and retries. */
export function mergeJudgmentAttempt(
  previous: JudgmentAttempt,
  next: JudgmentAttempt
): JudgmentAttempt {
  if (
    previous.caseId !== next.caseId ||
    previous.caseVersion !== next.caseVersion ||
    previous.createdAt !== next.createdAt
  )
    throw new Error("A practice attempt cannot change its case or creation identity.");
  if (next.updatedAt <= previous.updatedAt) return previous;
  const stages = ["draft", "committed", "revised", "reviewed"];
  if (stages.indexOf(next.stage) < stages.indexOf(previous.stage)) return previous;
  if (
    previous.committedAt !== undefined &&
    (JSON.stringify(previous.initial) !== JSON.stringify(next.initial) ||
      previous.committedAt !== next.committedAt)
  )
    throw new Error("Committed reasoning is preserved. Write a revision instead.");
  if (
    previous.revisedAt !== undefined &&
    (JSON.stringify(previous.revision) !== JSON.stringify(next.revision) ||
      previous.revisedAt !== next.revisedAt)
  )
    throw new Error("A submitted revision is preserved. Start a new attempt to revise again.");
  return next;
}
/** Read this owner's encrypted practice journal; storage errors remain visible to the UI. */
export async function getJudgmentAttempts(): Promise<JudgmentAttempt[]> {
  const db = await getDB();
  return Promise.all(
    (await db.getAll("judgmentAttempts")).map((row) => hydrateJudgmentAttempt(row))
  );
}
/** Save with compare-and-swap so asynchronous encryption cannot overwrite a newer edit. */
export async function saveJudgmentAttempt(input: JudgmentAttempt): Promise<void> {
  const attempt = JUDGMENT_ATTEMPT_SCHEMA.parse(input);
  const db = await getDB();
  const before = await db.get("judgmentAttempts", attempt.id);
  const previous = before ? await hydrateJudgmentAttempt(before) : undefined;
  const next = previous ? mergeJudgmentAttempt(previous, attempt) : attempt;
  if (previous && next === previous && JSON.stringify(previous) !== JSON.stringify(attempt))
    throw new Error("This attempt has a newer saved version. Reload it before trying again.");
  const sealed = await sealJudgmentAttempt(next);
  const tx = db.transaction("judgmentAttempts", "readwrite");
  const current = await tx.store.get(attempt.id);
  if (
    current?.updatedAt !== before?.updatedAt ||
    (current && before && !sameBytes(current._e, before._e))
  ) {
    tx.abort();
    await tx.done.catch((): void => {});
    throw new Error("This attempt changed while saving. Reload it before trying again.");
  }
  if (!current && (await tx.store.count()) >= 10_000) {
    tx.abort();
    await tx.done.catch((): void => {});
    throw new Error(
      "This device has reached the 10,000-attempt journal limit. Export a backup before continuing."
    );
  }
  await tx.store.put(sealed);
  await tx.done;
  triggerShadowWrite();
}
function sameBytes(a: ArrayBuffer, b: ArrayBuffer): boolean {
  const bytes = new Uint8Array(a),
    other = new Uint8Array(b);
  return bytes.length === other.length && bytes.every((value, i) => value === other[i]);
}
