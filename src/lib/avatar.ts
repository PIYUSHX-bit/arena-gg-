import { supabase } from "./supabaseClient";

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export async function uploadAvatar(
  userId: string,
  file: File
): Promise<{ url: string | null; error: string | null }> {
  if (!file.type.startsWith("image/")) {
    return { url: null, error: "Please choose an image file." };
  }
  if (file.size > MAX_SIZE_BYTES) {
    return { url: null, error: "Image must be under 5MB." };
  }

  const ext = file.name.split(".").pop() || "jpg";
  // Timestamped filename so the CDN/browser never serves a stale cached
  // avatar after a re-upload — same path prefix (`${userId}/`) is what the
  // storage RLS policies check ownership against.
  const path = `${userId}/avatar-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true });

  if (uploadError) {
    return { url: null, error: uploadError.message };
  }

  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  return { url: data.publicUrl, error: null };
}
