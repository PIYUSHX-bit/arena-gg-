import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { fetchProfileStats } from "../../lib/profile";
import type { ProfileStats } from "../../types/profile";
import ProfileStatsRow from "../profile/ProfileStatsRow";
import SubPageShell from "./SubPageShell";

export default function StatisticsPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchProfileStats(user.id).then(({ stats: s }) => {
      setStats(s);
      setLoading(false);
    });
  }, [user]);

  return (
    <SubPageShell title="My Statistics">
      {loading && <p className="text-muted text-sm">Loading...</p>}
      {!loading && stats && (
        <>
          <ProfileStatsRow stats={stats} />
          <p className="text-xs text-muted mt-4 leading-relaxed">
            Wins, kills, and earnings update automatically once match
            results are recorded for a tournament you've played — they'll
            show 0 until then.
          </p>
        </>
      )}
    </SubPageShell>
  );
}
