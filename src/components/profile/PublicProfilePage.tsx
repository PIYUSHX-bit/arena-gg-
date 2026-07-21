import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { fetchProfile } from "../../lib/profile";
import { fetchLeaderboard } from "../../lib/leaderboard";
import type { Profile } from "../../types/profile";

function formatRupees(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export default function PublicProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [wins, setWins] = useState(0);
  const [kills, setKills] = useState(0);
  const [earnings, setEarnings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    // Match performance (wins/kills/earnings) comes from the same public
    // leaderboard RPC the list itself uses, rather than querying entries
    // directly — RLS on entries only allows a user to see their own rows,
    // so this works regardless of who's viewing.
    Promise.all([fetchProfile(userId), fetchLeaderboard(500)]).then(
      ([{ profile: p, error: pErr }, { rows }]) => {
        if (cancelled) return;

        if (pErr) {
          setError(pErr);
        } else {
          setProfile(p);
        }

        const row = rows.find((r) => r.userId === userId);
        if (row) {
          setWins(row.wins);
          setKills(row.totalKills);
          setEarnings(row.totalEarnings);
        }

        setLoading(false);
      }
    );

    return () => {
      cancelled = true;
    };
  }, [userId]);

  return (
    <div className="min-h-screen bg-base text-ink font-body max-w-[480px] mx-auto pb-8">
      <div className="flex items-center gap-3 px-5 py-4 bg-surface border-b border-line sticky top-0 z-10">
        <button onClick={() => navigate(-1)} aria-label="Back">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-display font-semibold text-xl">Profile</h1>
      </div>

      {loading && (
        <p className="text-center text-muted text-sm py-10">Loading...</p>
      )}

      {!loading && (error || !profile) && (
        <p className="text-center text-ember text-sm py-10">
          {error ?? "Player not found."}
        </p>
      )}

      {!loading && profile && (
        <div className="px-5 pt-8">
          <div className="flex flex-col items-center text-center mb-8">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.displayName}
                className="w-20 h-20 rounded-full object-cover mb-4"
              />
            ) : (
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center font-display font-bold text-3xl mb-4"
                style={{ backgroundColor: profile.avatarColor }}
              >
                {profile.displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <h2 className="font-display font-semibold text-2xl">
              {profile.displayName}
            </h2>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="bg-surface border border-line rounded-lg py-4 px-2 text-center">
              <div className="font-mono text-lg text-safe mb-1">{wins}</div>
              <div className="text-[11px] text-muted">Wins</div>
            </div>
            <div className="bg-surface border border-line rounded-lg py-4 px-2 text-center">
              <div className="font-mono text-lg text-zone mb-1">{kills}</div>
              <div className="text-[11px] text-muted">Kills</div>
            </div>
            <div className="bg-surface border border-line rounded-lg py-4 px-2 text-center">
              <div className="font-mono text-lg text-amber mb-1">
                {formatRupees(earnings)}
              </div>
              <div className="text-[11px] text-muted">Earnings</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
