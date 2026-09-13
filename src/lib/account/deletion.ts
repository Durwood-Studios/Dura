import { ownerStorageKey, getStorageOwner, ownerDatabaseName } from "@/lib/storage/owner";
import { z } from "zod";
import { createClient, clearLocalSession } from "@/lib/supabase/client";
import { eraseOwnerData } from "@/lib/db";
import { pauseFeedbackDelivery } from "@/lib/feedback/delivery";
import { suspendSyncForReset } from "@/lib/supabase/sync";
import { suspendShadowWritesForReset } from "@/lib/storage/shadow-write";
import { beginLocalReset, finishLocalReset } from "@/lib/storage/reset-coordination";

const FILES = z.array(z.object({ bucket_id: z.string().min(1), name: z.string().min(1) }));

/** Delete only the authenticated account; the database enforces identity and recent authentication. */
export async function deleteOwnAccount(userId: string): Promise<void> {
  let generation: string | undefined;
  let hasDeletedAccount = false;
  try {
    const client = createClient();
    const { data: identity, error: identityError } = await client.auth.getUser();
    if (identityError || identity.user?.id !== userId)
      throw new Error("Your session changed. Reload and sign in again.");
    const { data, error } = await client.rpc("account_deletion_files", { p_user_id: userId });
    if (error)
      throw new Error(
        `Deletion is unavailable: ${error.message}. If this site has not enabled account deletion, contact its operator.`
      );
    const files = FILES.parse(data);
    generation = beginLocalReset();
    await pauseFeedbackDelivery();
    await suspendSyncForReset();
    await suspendShadowWritesForReset();
    for (const bucket of new Set(files.map((file): string => file.bucket_id))) {
      const paths = files
        .filter((file): boolean => file.bucket_id === bucket)
        .map((file): string => file.name);
      for (let offset = 0; offset < paths.length; offset += 100) {
        const { error: removalError } = await client.storage
          .from(bucket)
          .remove(paths.slice(offset, offset + 100));
        if (removalError)
          throw new Error(
            `Your account is still present, but some files may already be removed. Unable to remove uploaded files: ${removalError.message}. Reload to retry or contact the site operator.`
          );
      }
    }
    const { error: deletionError } = await client.rpc("delete_own_account", { p_user_id: userId });
    if (deletionError)
      throw new Error(
        `Account deletion was not confirmed: ${deletionError.message}. Reload and sign in to check before retrying.`
      );
    hasDeletedAccount = true;
    await eraseOwnerData(userId);
    if (getStorageOwner() !== `account:${userId}`)
      throw new Error(
        "The active learner changed during deletion. Reload before clearing device data."
      );
    for (const key of [
      "dura:learner-id",
      "dura:ai:anthropic-key",
      "dura:ai:consent",
      "dura:analytics:consent",
      "dura-notifications-enabled",
      "dura-last-streak-reminder",
      "dura-last-review-reminder",
      "dura-last-goal-reminder",
    ])
      localStorage.removeItem(ownerStorageKey(key));
    if (ownerDatabaseName() === "dura") {
      localStorage.removeItem("dura-discovery-passport");
      // Only the original namespace owns pre-isolation written responses.
      for (const key of Object.keys(localStorage))
        if (key.startsWith("dura:written:")) localStorage.removeItem(key);
    }
    await clearLocalSession();
  } catch (error) {
    console.error("[account] Deletion did not finish", error);
    if (hasDeletedAccount) {
      if (getStorageOwner() === `account:${userId}`) await clearLocalSession();
      throw new Error(
        "Your server account was deleted, but this device could not finish erasing its account copy. Reload, then use Clear local data to remove remaining device records. This also removes guest records.",
        { cause: error }
      );
    }
    throw error;
  } finally {
    if (generation) finishLocalReset(generation);
  }
}
