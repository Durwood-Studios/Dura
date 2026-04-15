import { createClient } from "@/lib/supabase/client";

/** Profile shape matching the public.profiles table. */
export interface Profile {
  id: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
  createdAt: number;
  updatedAt: number;
}

/**
 * Fetch a user's profile by ID.
 */
export async function getProfile(userId: string): Promise<Profile | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();

    if (error) {
      // PGRST116 = no rows found
      if (error.code === "PGRST116") {
        return null;
      }
      console.error("[getProfile] Query error:", error.message);
      throw error;
    }

    if (!data) {
      return null;
    }

    return {
      id: data.id as string,
      displayName: data.display_name as string,
      email: data.email as string,
      avatarUrl: data.avatar_url as string | null,
      createdAt: new Date(data.created_at as string).getTime(),
      updatedAt: new Date(data.updated_at as string).getTime(),
    };
  } catch (err) {
    console.error("[getProfile] Failed to fetch:", err);
    throw err;
  }
}

/**
 * Update a user's profile. Only provided fields are updated.
 * The updated_at column is auto-set by the update_updated_at trigger.
 */
export async function updateProfile(
  userId: string,
  data: Partial<Pick<Profile, "displayName" | "avatarUrl">>
): Promise<void> {
  try {
    const supabase = createClient();

    const updates: Record<string, unknown> = {};
    if (data.displayName !== undefined) {
      updates.display_name = data.displayName;
    }
    if (data.avatarUrl !== undefined) {
      updates.avatar_url = data.avatarUrl;
    }

    if (Object.keys(updates).length === 0) {
      return;
    }

    const { error } = await supabase.from("profiles").update(updates).eq("id", userId);

    if (error) {
      console.error("[updateProfile] Update error:", error.message);
      throw error;
    }
  } catch (err) {
    console.error("[updateProfile] Failed to update:", err);
    throw err;
  }
}

/**
 * Delete a user's account by removing their profile row.
 *
 * All related data (progress, flashcards, goals, certificates, etc.)
 * is cascade-deleted via foreign key constraints in the DB schema.
 * The auth.users row should be deleted separately via Supabase Auth admin
 * or the user's own auth.signOut + account deletion flow.
 */
export async function deleteAccount(userId: string): Promise<void> {
  try {
    const supabase = createClient();
    const { error } = await supabase.from("profiles").delete().eq("id", userId);

    if (error) {
      console.error("[deleteAccount] Delete error:", error.message);
      throw error;
    }
  } catch (err) {
    console.error("[deleteAccount] Failed to delete:", err);
    throw err;
  }
}
