import { createClient } from "@/lib/supabase/client";

/**
 * Upload a user avatar. Overwrites previous. Returns public URL.
 */
export async function uploadAvatar(userId: string, file: File): Promise<string | null> {
  try {
    const supabase = createClient();
    const ext = file.name.split(".").pop() ?? "png";
    const path = `${userId}/avatar.${ext}`;

    const { error } = await supabase.storage.from("avatars").upload(path, file, {
      upsert: true,
      contentType: file.type,
    });

    if (error) {
      console.error("[uploadAvatar] Upload error:", error.message);
      return null;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(path);

    return publicUrl;
  } catch (err) {
    console.error("[uploadAvatar] Failed:", err);
    return null;
  }
}

/**
 * Get the public avatar URL for a user.
 * Returns null if no avatar exists or storage is unavailable.
 */
export async function getAvatarUrl(userId: string): Promise<string | null> {
  try {
    const supabase = createClient();

    // List files in the user's avatar folder to find the current avatar
    const { data, error } = await supabase.storage.from("avatars").list(userId, { limit: 1 });

    if (error) {
      console.error("[getAvatarUrl] List error:", error.message);
      return null;
    }

    if (!data || data.length === 0) {
      return null;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(`${userId}/${data[0].name}`);

    return publicUrl;
  } catch (err) {
    console.error("[getAvatarUrl] Failed:", err);
    return null;
  }
}

/**
 * Delete a user's avatar from storage.
 */
export async function deleteAvatar(userId: string): Promise<void> {
  try {
    const supabase = createClient();

    // List all files in the user's folder to delete them
    const { data, error: listError } = await supabase.storage.from("avatars").list(userId);

    if (listError) {
      console.error("[deleteAvatar] List error:", listError.message);
      return;
    }

    if (!data || data.length === 0) {
      return;
    }

    const paths = data.map((file) => `${userId}/${file.name}`);
    const { error } = await supabase.storage.from("avatars").remove(paths);

    if (error) {
      console.error("[deleteAvatar] Remove error:", error.message);
    }
  } catch (err) {
    console.error("[deleteAvatar] Failed:", err);
  }
}

/**
 * Upload a certificate image. Returns public URL.
 */
export async function uploadCertificate(
  userId: string,
  hash: string,
  blob: Blob
): Promise<string | null> {
  try {
    const supabase = createClient();
    const path = `${userId}/${hash}.png`;

    const { error } = await supabase.storage.from("certificates").upload(path, blob, {
      upsert: true,
      contentType: "image/png",
    });

    if (error) {
      console.error("[uploadCertificate] Upload error:", error.message);
      return null;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("certificates").getPublicUrl(path);

    return publicUrl;
  } catch (err) {
    console.error("[uploadCertificate] Failed:", err);
    return null;
  }
}

/**
 * Get certificate image URL by verification hash.
 * Returns null if the image doesn't exist or storage is unavailable.
 */
export async function getCertificateImageUrl(userId: string, hash: string): Promise<string | null> {
  try {
    const supabase = createClient();
    const path = `${userId}/${hash}.png`;

    const {
      data: { publicUrl },
    } = supabase.storage.from("certificates").getPublicUrl(path);

    return publicUrl;
  } catch (err) {
    console.error("[getCertificateImageUrl] Failed:", err);
    return null;
  }
}
