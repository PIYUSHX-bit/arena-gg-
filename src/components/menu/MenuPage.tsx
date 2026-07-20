import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Wallet, BarChart3, Trophy, Bell, Headphones, HelpCircle, Info, Lock, ShieldCheck, Power, ShieldAlert } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { fetchProfile, fetchProfileStats, updateProfile } from "../../lib/profile";
import { fetchRules } from "../../lib/rules";
import type { Profile, ProfileStats } from "../../types/profile";
import MenuListItem from "./MenuListItem";
import RulesBanner from "../dashboard/RulesBanner";

export default function MenuPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [bannerText, setBannerText] = useState("");

  useEffect(() => {
    if (!user) return;
    fetchProfile(user.id).then(({ profile: p }) => setProfile(p));
    fetchProfileStats(user.id).then(({ stats: s }) => setStats(s));
    fetchRules().then(({ rules }) => {
      if (rules) setBannerText(rules.bannerText);
    });
  }, [user]);

  async function handleToggleImportantNotice(next: boolean) {
    if (!user) return;
    // Optimistic — flip immediately, roll back only if the save fails
    setProfile((prev) => (prev ? { ...prev, importantNoticeEnabled: next } : prev));
    const { error } = await updateProfile(user.id, {
      importantNoticeEnabled: next,
    });
    if (error) {
      setProfile((prev) =>
        prev ? { ...prev, importantNoticeEnabled: !next } : prev
      );
    }
  }

  async function handleLogout() {
    await signOut();
    navigate("/");
  }

  if (!user) return null;

  const initial = (profile?.displayName ?? "P").charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-base text-ink font-body max-w-[480px] mx-auto pb-10">
      <div className="flex items-center gap-3 px-5 py-4 bg-surface border-b border-line sticky top-0 z-10">
        <button onClick={() => navigate(-1)} aria-label="Back">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-display font-semibold text-xl mx-auto pr-6">
          Menu
        </h1>
      </div>

      {bannerText && (
        <RulesBanner text={bannerText} onClick={() => navigate("/terms")} />
      )}

      {/* Avatar + username */}
      <div className="flex flex-col items-center pt-8 pb-6">
        {profile?.avatarUrl ? (
          <img
            src={profile.avatarUrl}
            alt={profile.displayName}
            className="w-24 h-24 rounded-full object-cover border-4 border-amber"
          />
        ) : (
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center font-display font-bold text-4xl border-4 border-amber"
            style={{ backgroundColor: profile?.avatarColor ?? "#FF4A1C" }}
          >
            {initial}
          </div>
        )}
        <div className="font-display font-bold text-2xl text-ember mt-4">
          {profile?.displayName ?? "Player"}
        </div>
      </div>

      {/* Stats row */}
      <div className="px-5 mb-8">
        <div className="bg-surface border border-line rounded-lg grid grid-cols-3 divide-x divide-line">
          <div className="text-center py-5">
            <div className="font-display font-bold text-2xl text-ember">
              {stats?.confirmedEntries ?? "—"}
            </div>
            <div className="text-xs text-muted mt-1">Matches Played</div>
          </div>
          <div className="text-center py-5">
            <div className="font-display font-bold text-2xl text-ember">
              {stats?.totalKills ?? "—"}
            </div>
            <div className="text-xs text-muted mt-1">Total Kills</div>
          </div>
          <div className="text-center py-5">
            <div className="font-display font-bold text-2xl text-ember">
              ₹{stats?.totalEarnings ?? 0}
            </div>
            <div className="text-xs text-muted mt-1">Total Earning</div>
          </div>
        </div>
        <p className="text-[11px] text-muted text-center mt-2.5">
          Kills &amp; earnings update automatically once match results are
          recorded for a tournament you played.
        </p>
      </div>

      {/* List */}
      <div className="px-5 flex flex-col gap-2.5">
        <MenuListItem icon={User} label="My Profile" onClick={() => navigate("/profile")} />
        <MenuListItem icon={Wallet} label="My Wallet" onClick={() => navigate("/wallet")} />
        <MenuListItem icon={BarChart3} label="My Statistics" onClick={() => navigate("/statistics")} />
        <MenuListItem icon={Trophy} label="Top Players" onClick={() => navigate("/top-players")} />
        <MenuListItem icon={Bell} label="Notifications" onClick={() => navigate("/notifications")} />
        <MenuListItem icon={Headphones} label="Contact Us" onClick={() => navigate("/contact")} />
        <MenuListItem
          icon={Bell}
          label="Importance Notice"
          toggle={{
            checked: profile?.importantNoticeEnabled ?? false,
            onChange: handleToggleImportantNotice,
          }}
        />
        <MenuListItem icon={HelpCircle} label="FAQ" onClick={() => navigate("/faq")} />
        <MenuListItem icon={Info} label="About Us" onClick={() => navigate("/about")} />
        <MenuListItem icon={Lock} label="Privacy Policy" onClick={() => navigate("/privacy")} />
        <MenuListItem icon={ShieldCheck} label="Terms & Conditions" onClick={() => navigate("/terms")} />
        {profile?.isAdmin && (
          <MenuListItem icon={ShieldAlert} label="Admin Panel" onClick={() => navigate("/admin")} />
        )}
        <MenuListItem icon={Power} label="Logout" onClick={handleLogout} />
      </div>
    </div>
  );
}
