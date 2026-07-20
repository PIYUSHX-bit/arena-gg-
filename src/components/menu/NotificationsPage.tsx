import { useEffect, useState } from "react";
import { Bell, CheckCircle2, Wallet, Trophy, ArrowDownToLine, Megaphone } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  fetchNotifications,
  markAllNotificationsRead,
  type AppNotification,
  type NotificationType,
} from "../../lib/notifications";
import SubPageShell from "./SubPageShell";

const TYPE_ICON: Record<NotificationType, LucideIcon> = {
  info: Bell,
  registration: CheckCircle2,
  payment: Wallet,
  prize: Trophy,
  withdrawal: ArrowDownToLine,
  announcement: Megaphone,
};

const TYPE_COLOR: Record<NotificationType, string> = {
  info: "text-muted",
  registration: "text-safe",
  payment: "text-amber",
  prize: "text-amber",
  withdrawal: "text-zone",
  announcement: "text-ember",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchNotifications(user.id).then(({ notifications: n }) => {
      setNotifications(n);
      setLoading(false);
    });
    markAllNotificationsRead(user.id);
  }, [user]);

  return (
    <SubPageShell title="Notifications">
      {loading && (
        <p className="text-center text-muted text-sm py-10">Loading...</p>
      )}

      {!loading && notifications.length === 0 && (
        <div className="flex flex-col items-center text-center py-10">
          <div className="w-16 h-16 rounded-full bg-surface-2 border border-line flex items-center justify-center mb-4">
            <Bell size={26} className="text-muted" />
          </div>
          <p className="text-ink font-medium mb-2">No notifications yet</p>
          <p className="text-muted text-sm max-w-[280px]">
            Match reminders, room ID drops, and payment confirmations will
            show up here.
          </p>
        </div>
      )}

      {!loading && notifications.length > 0 && (
        <div className="flex flex-col gap-2.5">
          {notifications.map((n) => {
            const Icon = TYPE_ICON[n.type];
            return (
              <div
                key={n.id}
                className={`flex items-start gap-3 bg-surface border rounded-lg px-4 py-3.5 ${
                  n.isRead ? "border-line" : "border-ember/40"
                }`}
              >
                <span
                  className={`shrink-0 w-9 h-9 rounded-full bg-surface-2 border border-line flex items-center justify-center ${TYPE_COLOR[n.type]}`}
                >
                  <Icon size={16} />
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{n.title}</span>
                    {!n.isRead && (
                      <span className="w-1.5 h-1.5 rounded-full bg-ember shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-muted mt-0.5">{n.body}</p>
                  <p className="text-[11px] text-muted mt-1.5">
                    {formatDate(n.createdAt)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </SubPageShell>
  );
}
