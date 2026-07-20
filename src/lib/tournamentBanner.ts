import { supabase } from "./supabaseClient";

const MAX_SIZE_BYTES = 8 * 1024 * 1024; // 8MB — banners are wider than avatars

export async function uploadTournamentBanner(
  file: File
): Promise<{ url: string | null; error: string | null }> {
  if (!file.type.startsWith("image/")) {
    return { url: null, error: "Please choose an image file." };
  }
  if (file.size > MAX_SIZE_BYTES) {
    return { url: null, error: "Image must be under 8MB." };
  }

  const ext = file.name.split(".").pop() || "jpg";
  const path = `banner-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("tournament-banners")
    .upload(path, file, { upsert: true });

  if (uploadError) {
    return { url: null, error: uploadError.message };
  }

  const { data } = supabase.storage.from("tournament-banners").getPublicUrl(path);
  return { url: data.publicUrl, error: null };
}
