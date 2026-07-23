import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { fetchProfile } from "../../lib/profile";
import { fetchWalletBalance } from "../../lib/wallet";
import { fetchUnreadCount } from "../../lib/notifications";

export default function TopBar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("Player");
  const [avatarColor, setAvatarColor] = useState("#FF4A1C");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    fetchProfile(user.id).then(({ profile }) => {
      if (profile) {
        setDisplayName(profile.displayName);
        setAvatarColor(profile.avatarColor);
        setAvatarUrl(profile.avatarUrl);
      }
    });
    fetchWalletBalance(user.id).then(({ balance }) => setWalletBalance(balance));
    fetchUnreadCount(user.id).then(setNotificationCount);
  }, [user]);

  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="flex items-center justify-between px-5 py-4 bg-surface border-b border-line">
      <Link to="/profile" className="flex items-center gap-3">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="w-11 h-11 rounded-full object-cover shrink-0"
          />
        ) : (
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center font-display font-bold text-lg text-ink shrink-0"
            style={{ backgroundColor: avatarColor }}
          >
            {initial}
          </div>
        )}
        <span className="font-display font-semibold text-xl truncate max-w-[140px]">
          {displayName}
        </span>
      </Link>

      <div className="flex items-center gap-3">
        <Link
          to="/wallet"
          className="flex items-center gap-1.5 bg-surface-2 border border-line rounded-full pl-1 pr-3 py-1 transition-colors hover:border-amber/50"
        >
          <span className="w-6 h-6 rounded-full bg-amber flex items-center justify-center text-base leading-none">
            ₹
          </span>
          <span className="font-mono text-sm text-amber">
            {walletBalance === null ? "—" : walletBalance.toLocaleString("en-IN")}
          </span>
        </Link>

        <button
          onClick={() => navigate("/notifications")}
          aria-label="Notifications"
          className="relative w-10 h-10 rounded-full bg-surface-2 border border-line flex items-center justify-center transition-colors hover:border-muted active:scale-95"
        >
          <Bell size={18} className="text-ink" />
          {notificationCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-ember" />
          )}
        </button>
      </div>
    </div>
  );
}
