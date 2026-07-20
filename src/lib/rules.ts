import { supabase } from "./supabaseClient";

export interface RuleSection {
  title: string;
  points: string[];
}

export interface SiteRules {
  bannerText: string;
  sections: RuleSection[];
}

export async function fetchRules(): Promise<{
  rules: SiteRules | null;
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("site_rules")
    .select("banner_text, sections")
    .eq("id", 1)
    .single();

  if (error) {
    return { rules: null, error: error.message };
  }

  return {
    rules: { bannerText: data.banner_text, sections: data.sections },
    error: null,
  };
}

export async function updateRules(
  rules: SiteRules
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("site_rules")
    .update({ banner_text: rules.bannerText, sections: rules.sections })
    .eq("id", 1);

  return { error: error?.message ?? null };
}
