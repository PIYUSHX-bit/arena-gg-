import { supabase } from "./supabaseClient";
import type { Profile, ProfileStats } from "../types/profile";

interface ProfileRow {
  id: string;
  display_name: string;
  ff_ign: string | null;
  ff_uid: string | null;
  phone_number: string | null;
  avatar_color: string;
  avatar_url: string | null;
  important_notice_enabled: boolean;
  is_admin: boolean;
  created_at: string;
}

function mapProfileRow(row: ProfileRow): Profile {
  return {
    id: row.id,
    displayName: row.display_name,
    ffIgn: row.ff_ign,
    ffUid: row.ff_uid,
    phoneNumber: row.phone_number,
    avatarColor: row.avatar_color,
    avatarUrl: row.avatar_url,
    importantNoticeEnabled: row.important_notice_enabled,
    isAdmin: row.is_admin,
    createdAt: row.created_at,
  };
}

export async function fetchProfile(
  userId: string
): Promise<{ profile: Profile | null; error: string | null }> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    return { profile: null, error: error.message };
  }

  return { profile: mapProfileRow(data), error: null };
}

export async function updateProfile(
  userId: string,
  updates: {
    displayName?: string;
    ffIgn?: string;
    ffUid?: string;
    phoneNumber?: string;
    avatarUrl?: string;
    importantNoticeEnabled?: boolean;
  }
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("profiles")
    .update({
      ...(updates.displayName !== undefined && {
        display_name: updates.displayName,
      }),
      ...(updates.ffIgn !== undefined && { ff_ign: updates.ffIgn }),
      ...(updates.ffUid !== undefined && { ff_uid: updates.ffUid }),
      ...(updates.phoneNumber !== undefined && {
        phone_number: updates.phoneNumber,
      }),
      ...(updates.avatarUrl !== undefined && { avatar_url: updates.avatarUrl }),
      ...(updates.importantNoticeEnabled !== undefined && {
        important_notice_enabled: updates.importantNoticeEnabled,
      }),
    })
    .eq("id", userId);

  return { error: error?.message ?? null };
}

// Stats are computed from entries rather than stored redundantly — this
// table is small per-user, so counting on read is simpler than keeping a
// second source of truth in sync.
export async function fetchProfileStats(
  userId: string
): Promise<{ stats: ProfileStats | null; error: string | null }> {
  const { data, error } = await supabase
    .from("entries")
    .select("status, amount_paid, kills, placement, prize_won")
    .eq("user_id", userId);

  if (error) {
    return { stats: null, error: error.message };
  }

  const stats: ProfileStats = {
    totalEntries: data.length,
    confirmedEntries: data.filter((e) => e.status === "confirmed").length,
    totalSpent: data.reduce((sum, e) => sum + (e.amount_paid ?? 0), 0),
    totalKills: data.reduce((sum, e) => sum + (e.kills ?? 0), 0),
    totalWins: data.filter((e) => e.placement === 1).length,
    totalEarnings: data.reduce((sum, e) => sum + (e.prize_won ?? 0), 0),
  };

  return { stats, error: null };
}
