import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Trophy, Coins, Crosshair, Award } from "lucide-react";
import { fetchLeaderboard } from "../../lib/leaderboard";
import type { LeaderboardRow } from "../../types/leaderboard";

function formatRupees(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

interface TopPlayersColumnProps {
  title: string;
  icon: typeof Trophy;
  accent: string;
  rows: LeaderboardRow[];
  valueOf: (row: LeaderboardRow) => string;
}

function TopPlayersColumn({
  title,
  icon: Icon,
  accent,
  rows,
  valueOf,
}: TopPlayersColumnProps) {
  return (
    <div className="bg-surface border border-line rounded-lg p-3">
      <div className="flex items-center gap-1.5 mb-3">
        <Icon size={13} className={accent} />
        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted truncate">
          {title}
        </span>
      </div>
      <div className="flex flex-col gap-2.5">
        {rows.length === 0 && (
          <span className="text-[11px] text-muted">No data yet</span>
        )}
        {rows.map((row, i) => (
          <div key={`${row.displayName}-${i}`} className="flex items-center gap-1.5">
            <span className="font-mono text-[10px] text-muted w-3 shrink-0">
              {i + 1}
            </span>
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center font-display font-bold text-[10px] shrink-0"
              style={{ backgroundColor: row.avatarColor }}
            >
              {row.displayName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-medium truncate">
                {row.displayName}
              </div>
              <div className={`text-[10px] font-mono ${accent}`}>
                {valueOf(row)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LeaderboardPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    // Larger pool than the combined list below needs, so a player who
    // tops kills/wins but isn't in the top 20 by earnings still shows up
    // in those columns — these three are independent rankings.
    fetchLeaderboard(100).then(({ rows: r, error: err }) => {
      if (cancelled) return;
      if (err) setError(err);
      else setRows(r);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const topEarners = useMemo(
    () => [...rows].sort((a, b) => b.totalEarnings - a.totalEarnings).slice(0, 5),
    [rows]
  );
  const topKillers = useMemo(
    () => [...rows].sort((a, b) => b.totalKills - a.totalKills).slice(0, 5),
    [rows]
  );
  const topWinners = useMemo(
    () => [...rows].sort((a, b) => b.wins - a.wins).slice(0, 5),
    [rows]
  );

  const combinedRows = rows.slice(0, 20);

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
          <div className="grid grid-cols-3 gap-2.5 mb-6">
            <TopPlayersColumn
              title="Top Earners"
              icon={Coins}
              accent="text-amber"
              rows={topEarners}
              valueOf={(row) => formatRupees(row.totalEarnings)}
            />
            <TopPlayersColumn
              title="Most Kills"
              icon={Crosshair}
              accent="text-zone"
              rows={topKillers}
              valueOf={(row) => `${row.totalKills} kills`}
            />
            <TopPlayersColumn
              title="Most Wins"
              icon={Award}
              accent="text-safe"
              rows={topWinners}
              valueOf={(row) => `${row.wins} wins`}
            />
          </div>
        )}

        {!loading && !error && rows.length > 0 && (
          <div className="flex flex-col gap-2.5">
            {combinedRows.map((row, i) => {
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
