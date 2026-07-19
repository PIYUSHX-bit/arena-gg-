import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Trophy } from "lucide-react";
import { fetchLeaderboard } from "../../lib/leaderboard";
import type { LeaderboardRow } from "../../types/leaderboard";

function formatRupees(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export default function LeaderboardPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchLeaderboard(20).then(({ rows: r, error: err }) => {
      if (cancelled) return;
      if (err) setError(err);
      else setRows(r);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-base text-ink font-body max-w-[480px] mx-auto pb-10">
      <div className="flex items-center gap-3 px-5 py-4 bg-surface border-b border-line sticky top-0 z-10">
        <button onClick={() => navigate(-1)} aria-label="Back">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-display font-semibold text-xl">Leaderboard</h1>
      </div>

      <div className="px-5 py-6">
        {loading && (
          <p className="text-center text-muted text-sm py-10">Loading...</p>
        )}

        {!loading && error && (
          <p className="text-center text-ember text-sm py-10">{error}</p>
        )}

        {!loading && !error && rows.length === 0 && (
          <div className="text-center py-14">
            <p className="text-muted text-sm">
              No match results recorded yet — this fills in once tournaments
              are completed and results are logged.
            </p>
          </div>
        )}

        {!loading && !error && rows.length > 0 && (
          <div className="flex flex-col gap-2.5">
            {rows.map((row, i) => {
              const rank = i + 1;
              return (
                <div
                  key={`${row.displayName}-${i}`}
                  className="bg-surface border border-line rounded-lg p-4"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span
                      className={`font-mono text-sm w-6 shrink-0 ${rank <= 3 ? "text-amber" : "text-muted"}`}
                    >
                      {String(rank).padStart(2, "0")}
                    </span>
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center font-display font-bold text-sm shrink-0"
                      style={{ backgroundColor: row.avatarColor }}
                    >
                      {row.displayName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0 text-sm font-semibold truncate">
                      {row.displayName}
                    </div>
                    {rank <= 3 && (
                      <Trophy size={16} className="text-amber shrink-0" />
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-line text-center">
                    <div>
                      <div className="font-mono text-sm text-safe">
                        {row.wins}
                      </div>
                      <div className="text-[10px] text-muted mt-0.5">Wins</div>
                    </div>
                    <div>
                      <div className="font-mono text-sm text-zone">
                        {row.totalKills}
                      </div>
                      <div className="text-[10px] text-muted mt-0.5">
                        Kills
                      </div>
                    </div>
                    <div>
                      <div className="font-mono text-sm text-amber">
                        {formatRupees(row.totalEarnings)}
                      </div>
                      <div className="text-[10px] text-muted mt-0.5">
                        Earnings
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
