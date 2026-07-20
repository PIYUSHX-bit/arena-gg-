import { supabase } from "./supabaseClient";

export type NotificationType =
  | "info"
  | "registration"
  | "payment"
  | "prize"
  | "withdrawal"
  | "announcement";

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
}

interface NotificationRow {
  id: string;
  title: string;
  body: string;
  type: NotificationType;
  is_read: boolean;
  created_at: string;
}

function mapRow(row: NotificationRow): AppNotification {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    type: row.type,
    isRead: row.is_read,
    createdAt: row.created_at,
  };
}

export async function fetchNotifications(
  userId: string
): Promise<{ notifications: AppNotification[]; error: string | null }> {
  const { data, error } = await supabase
    .from("notifications")
    .select("id, title, body, type, is_read, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return { notifications: [], error: error.message };
  }

  return { notifications: (data as NotificationRow[]).map(mapRow), error: null };
}

export async function fetchUnreadCount(userId: string): Promise<number> {
  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  return count ?? 0;
}

export async function markAllNotificationsRead(
  userId: string
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  return { error: error?.message ?? null };
}
