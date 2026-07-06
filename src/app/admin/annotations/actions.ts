"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const AnnotationIdSchema = z.uuid();
const StatusSchema = z.enum(["approved", "rejected"]);

type ModerationStatus = z.infer<typeof StatusSchema>;

export interface ModerationResult {
  error: string | null;
}

/**
 * Approve or reject a pending community annotation.
 *
 * Admin gate: reads is_admin from app_metadata inside the JWT.
 * app_metadata is server-only — users cannot self-elevate via
 * updateUser() or raw_user_meta_data writes.
 */
export async function moderateAnnotation(
  annotationId: string,
  newStatus: ModerationStatus
): Promise<ModerationResult> {
  // Server actions are public endpoints — validate args before touching the DB.
  const idResult = AnnotationIdSchema.safeParse(annotationId);
  const statusResult = StatusSchema.safeParse(newStatus);
  if (!idResult.success || !statusResult.success) {
    return { error: "Invalid moderation request." };
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError ?? !user) {
    return { error: "Not authenticated." };
  }

  // Verify admin from app_metadata (JWT claim, cannot be self-modified by users)
  const isAdmin = (user.app_metadata?.is_admin as boolean | undefined) === true;
  if (!isAdmin) {
    return { error: "Insufficient permissions." };
  }

  const { data: updated, error } = await supabase
    .from("annotations")
    .update({ status: statusResult.data, updated_at: new Date().toISOString() })
    .eq("id", idResult.data)
    .select("id");

  if (error) {
    console.error("[moderateAnnotation] Supabase update error:", error.message);
    return { error: `Database error: ${error.message}` };
  }

  // RLS silently filters rows it won't let us update — a 0-row update is a
  // failure, not a success. This fires if the annotation no longer exists OR
  // the admin_update_annotations policy (staged migration 20260629000005)
  // has not been applied to the live project yet.
  if (!updated || updated.length === 0) {
    console.error(
      "[moderateAnnotation] Update affected 0 rows for annotation",
      idResult.data,
      "— annotation missing, or admin_update_annotations RLS policy not applied."
    );
    return {
      error:
        "Update was blocked. The annotation may have been removed, or the admin moderation policy (admin_update_annotations) is not applied to the database yet.",
    };
  }

  revalidatePath("/admin/annotations");
  return { error: null };
}
