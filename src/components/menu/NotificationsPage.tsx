import { useEffect, useState } from "react";
import { Bell, CheckCircle2, Wallet, Trophy, ArrowDownToLine, Megaphone, BellRing, Loader2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  fetchNotifications,
  markAllNotificationsRead,
  type AppNotification,
  type NotificationType,
} from "../../lib/notifications";
import { enablePushNotifications, isPushSupported } from "../../lib/push";
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
  const [pushStatus, setPushStatus] = useState<
    "unsupported" | "prompt" | "granted" | "denied"
  >("prompt");
  const [pushError, setPushError] = useState<string | null>(null);
  const [pushEnabling, setPushEnabling] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchNotifications(user.id).then(({ notifications: n }) => {
      setNotifications(n);
      setLoading(false);
    });
    markAllNotificationsRead(user.id);

    if (!isPushSupported()) {
      setPushStatus("unsupported");
    } else {
      setPushStatus(Notification.permission === "denied" ? "denied" : Notification.permission === "granted" ? "granted" : "prompt");
    }
  }, [user]);

  async function handleEnablePush() {
    if (!user) return;
    setPushError(null);
    setPushEnabling(true);
    const { error } = await enablePushNotifications(user.id);
    setPushEnabling(false);

    if (error) {
      setPushError(error);
      return;
    }
    setPushStatus("granted");
  }

  return (
    <SubPageShell title="Notifications">
      {pushStatus === "prompt" && (
        <div className="flex items-center gap-3 bg-gradient-to-br from-ember/10 via-surface to-surface border border-ember/25 rounded-lg px-4 py-3.5 mb-4">
          <span className="shrink-0 w-9 h-9 rounded-full bg-ember/15 flex items-center justify-center">
            <BellRing size={16} className="text-ember" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">Get notified instantly</p>
            <p className="text-xs text-muted">
              Turn on push notifications for match updates and admin
              announcements.
            </p>
          </div>
          <button
            onClick={handleEnablePush}
            disabled={pushEnabling}
            className="shrink-0 flex items-center gap-1.5 bg-ember text-base font-semibold text-xs px-3.5 py-2 rounded-full transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
          >
            {pushEnabling && <Loader2 size={12} className="animate-spin" />}
            {pushEnabling ? "Enabling..." : "Enable"}
          </button>
        </div>
      )}

      {pushError && (
        <p className="text-xs text-ember bg-ember/10 border border-ember/30 rounded px-3 py-2 mb-4">
          {pushError}
        </p>
      )}

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
