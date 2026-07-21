import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Pencil, Gift } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { fetchProfile, fetchProfileStats, updateProfile } from "../../lib/profile";
import { uploadAvatar } from "../../lib/avatar";
import type { Profile, ProfileStats } from "../../types/profile";
import ProfileField from "./ProfileField";
import ProfileStatsRow from "./ProfileStatsRow";
import CopyIconButton from "../common/CopyIconButton";

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [ffIgn, setFfIgn] = useState("");
  const [ffUid, setFfUid] = useState("");
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    const userId = user.id;

    let cancelled = false;

    async function load() {
      setLoading(true);
      const [{ profile: p, error: pErr }, { stats: s, error: sErr }] =
        await Promise.all([
          fetchProfile(userId),
          fetchProfileStats(userId),
        ]);

      if (cancelled) return;

      if (pErr) {
        setError(pErr);
      } else if (p) {
        setProfile(p);
        setDisplayName(p.displayName);
        setFfIgn(p.ffIgn ?? "");
        setFfUid(p.ffUid ?? "");
      }

      if (!sErr && s) setStats(s);
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  async function handleSave() {
    if (!user) return;
    const userId = user.id;
    setSaving(true);
    setError(null);

    const { error: updateError } = await updateProfile(userId, {
      displayName: displayName.trim(),
      ffIgn: ffIgn.trim(),
      ffUid: ffUid.trim(),
    });

    setSaving(false);

    if (updateError) {
      setError(updateError);
      return;
    }

    setProfile((prev) =>
      prev
        ? { ...prev, displayName: displayName.trim(), ffIgn, ffUid }
        : prev
    );
    setEditing(false);
  }

  async function handleAvatarSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file next time
    if (!file || !user) return;

    setAvatarError(null);
    setAvatarUploading(true);

    const { url, error: uploadError } = await uploadAvatar(user.id, file);

    if (uploadError || !url) {
      setAvatarUploading(false);
      setAvatarError(uploadError ?? "Upload failed.");
      return;
    }

    const { error: saveError } = await updateProfile(user.id, {
      avatarUrl: url,
    });

    setAvatarUploading(false);

    if (saveError) {
      setAvatarError(saveError);
      return;
    }

    setProfile((prev) => (prev ? { ...prev, avatarUrl: url } : prev));
  }

  async function handleLogout() {
    await signOut();
    navigate("/");
  }

  if (!user) {
    return null; // ProtectedRoute handles the redirect
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-base text-ink font-body max-w-[480px] mx-auto">
        <div className="flex items-center gap-3 px-5 py-4 bg-surface border-b border-line sticky top-0 z-10">
          <button onClick={() => navigate(-1)} aria-label="Back">
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-display font-semibold text-xl">Profile</h1>
        </div>
        <p className="text-center text-muted text-sm py-10">
          Loading profile...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base text-ink font-body max-w-[480px] mx-auto pb-8">
      <div className="flex items-center gap-3 px-5 py-4 bg-surface border-b border-line sticky top-0 z-10">
        <button onClick={() => navigate(-1)} aria-label="Back">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-display font-semibold text-xl">Profile</h1>
      </div>

      <div className="px-5 pt-8">
      <div className="flex flex-col items-center text-center mb-8">
        <div className="relative mb-4">
          {profile?.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={profile.displayName}
              className="w-20 h-20 rounded-full object-cover"
            />
          ) : (
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center font-display font-bold text-3xl"
              style={{ backgroundColor: profile?.avatarColor ?? "#FF4A1C" }}
            >
              {(profile?.displayName ?? "P").charAt(0).toUpperCase()}
            </div>
          )}

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={avatarUploading}
            aria-label="Change profile photo"
            className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-ember border-2 border-base flex items-center justify-center disabled:opacity-50"
          >
            <Pencil size={12} className="text-base" />
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarSelected}
            className="hidden"
          />
        </div>

        {avatarUploading && (
          <p className="text-xs text-muted mb-1">Uploading...</p>
        )}
        {avatarError && (
          <p className="text-xs text-ember mb-1">{avatarError}</p>
        )}

        <h1 className="font-display font-semibold text-2xl">
          {profile?.displayName}
        </h1>
        <p className="text-muted text-sm mt-1">
          {user.email ?? user.phone ?? ""}
        </p>
      </div>

      {stats && (
        <div className="mb-8">
          <ProfileStatsRow stats={stats} />
        </div>
      )}

      {profile?.referralCode && (
        <div className="bg-gradient-to-br from-zone/15 via-surface to-surface border border-zone/30 rounded-lg p-5 mb-6">
          <div className="flex items-center gap-2 mb-1.5">
            <Gift size={16} className="text-zone" />
            <h2 className="font-display font-semibold text-base">
              Invite a Friend
            </h2>
          </div>
          <p className="text-xs text-muted mb-4">
            Share your code — you both get ₹10 when they join.
          </p>
          <div className="flex items-center justify-between bg-surface-2 border border-line rounded px-4 py-3">
            <span className="font-mono text-lg tracking-widest text-amber">
              {profile.referralCode}
            </span>
            <CopyIconButton value={profile.referralCode} />
          </div>
        </div>
      )}

      <div className="bg-surface border border-line rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-semibold text-lg">
            Player Details
          </h2>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="text-sm text-ember hover:underline"
            >
              Edit
            </button>
          )}
        </div>

        {editing ? (
          <div className="flex flex-col gap-4">
            <ProfileField
              id="display-name"
              label="Display Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={24}
            />
            <ProfileField
              id="ff-ign"
              label="Free Fire IGN"
              placeholder="Your in-game name"
              value={ffIgn}
              onChange={(e) => setFfIgn(e.target.value)}
              maxLength={24}
            />
            <ProfileField
              id="ff-uid"
              label="Free Fire UID"
              placeholder="Your numeric UID"
              inputMode="numeric"
              value={ffUid}
              onChange={(e) => setFfUid(e.target.value)}
              maxLength={12}
            />

            {error && (
              <p className="text-sm text-ember bg-ember/10 border border-ember/30 rounded px-3 py-2">
                {error}
              </p>
            )}

            <div className="flex gap-3 mt-1">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-ember text-base font-semibold text-sm py-3 rounded disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setDisplayName(profile?.displayName ?? "");
                  setFfIgn(profile?.ffIgn ?? "");
                  setFfUid(profile?.ffUid ?? "");
                  setError(null);
                }}
                className="px-5 border border-line rounded text-sm text-muted"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted">Free Fire IGN</span>
              <span>{profile?.ffIgn || "Not set"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Free Fire UID</span>
              <span>{profile?.ffUid || "Not set"}</span>
            </div>
            {!profile?.ffIgn && (
              <p className="text-xs text-amber bg-amber/10 border border-amber/30 rounded px-3 py-2">
                Add your Free Fire IGN and UID so it auto-fills the next time
                you register for a tournament.
              </p>
            )}
          </div>
        )}
      </div>

      <button
        onClick={handleLogout}
        className="w-full border border-line rounded py-3 text-sm text-muted hover:text-ink hover:border-muted transition-colors"
      >
        Log Out
      </button>
      </div>
    </div>
  );
}
