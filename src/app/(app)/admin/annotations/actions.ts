"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type ModerationStatus = "approved" | "rejected";

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

  const { error } = await supabase
    .from("annotations")
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq("id", annotationId);

  if (error) {
    console.error("[moderateAnnotation] Supabase update error:", error.message);
    return { error: `Database error: ${error.message}` };
  }

  revalidatePath("/admin/annotations");
  return { error: null };
}
