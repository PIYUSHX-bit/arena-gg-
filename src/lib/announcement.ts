import { supabase } from "./supabaseClient";

export async function fetchAnnouncement(): Promise<{
  text: string;
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("dashboard_announcement")
    .select("text")
    .eq("id", 1)
    .single();

  if (error) {
    return { text: "", error: error.message };
  }

  return { text: data.text, error: null };
}

export async function updateAnnouncement(
  text: string
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("dashboard_announcement")
    .update({ text })
    .eq("id", 1);

  return { error: error?.message ?? null };
}
