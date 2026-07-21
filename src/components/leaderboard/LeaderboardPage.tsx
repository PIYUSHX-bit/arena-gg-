import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Trophy, ArrowLeft } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { fetchLeaderboard } from "../../lib/leaderboard";
import type { LeaderboardRow } from "../../types/leaderboard";

type Tab = "kills" | "wins" | "earn";

const TABS: { id: Tab; label: string }[] = [
  { id: "kills", label: "Kills" },
  { id: "wins", label: "Wins" },
  { id: "earn", label: "Earn" },
];

function isTab(value: string | null): value is Tab {
  return value === "kills" || value === "wins" || value === "earn";
}

function formatRupees(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export default function LeaderboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Clicking "Leaderboard" from the bottom nav always lands here fresh,
  // so no tab param means Kills — the first column, per the requested
  // default landing spot.
  const tabParam = searchParams.get("tab");
  const activeTab: Tab = isTab(tabParam) ? tabParam : "kills";

  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
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

  const rankedRows = useMemo(() => {
    const sorted = [...rows];
    if (activeTab === "kills") {
      sorted.sort((a, b) => b.totalKills - a.totalKills);
    } else if (activeTab === "wins") {
      sorted.sort((a, b) => b.wins - a.wins);
    } else {
      sorted.sort((a, b) => b.totalEarnings - a.totalEarnings);
    }
    return sorted;
  }, [rows, activeTab]);

  function valueFor(row: LeaderboardRow): string {
    if (activeTab === "kills") return `${row.totalKills} kills`;
    if (activeTab === "wins") return `${row.wins} wins`;
    return formatRupees(row.totalEarnings);
  }

  function handleTabClick(tab: Tab) {
    setSearchParams({ tab }, { replace: true });
  }

  function handleAvatarClick(row: LeaderboardRow) {
    navigate(row.userId === user?.id ? "/profile" : `/profile/view/${row.userId}`);
  }

  return (
    <div className="min-h-screen bg-base text-ink font-body max-w-[480px] mx-auto pb-10">
      <div className="flex items-center gap-3 px-5 py-4 bg-surface border-b border-line sticky top-0 z-10">
        <button onClick={() => navigate(-1)} aria-label="Back">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-display font-semibold text-xl">Leaderboard</h1>
      </div>

      <div className="flex border-b border-line px-5">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`flex-1 py-3.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-ember text-ink"
                : "border-transparent text-muted"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="px-5 py-6">
        {loading && (
          <p className="text-center text-muted text-sm py-10">Loading...</p>
        )}

        {!loading && error && (
          <p className="text-center text-ember text-sm py-10">{error}</p>
        )}

        {!loading && !error && rankedRows.length === 0 && (
          <div className="text-center py-14">
            <p className="text-muted text-sm">
              No match results recorded yet — this fills in once tournaments
              are completed and results are logged.
            </p>
          </div>
        )}

        {!loading && !error && rankedRows.length > 0 && (
          <div className="flex flex-col gap-2.5">
            {rankedRows.map((row, i) => {
              const rank = i + 1;
              return (
                <div
                  key={`${row.displayName}-${i}`}
                  className="flex items-center gap-3 bg-surface border border-line rounded-lg p-4"
                >
                  <span
                    className={`font-mono text-sm w-6 shrink-0 ${rank <= 3 ? "text-amber" : "text-muted"}`}
                  >
                    {String(rank).padStart(2, "0")}
                  </span>
                  <button
                    onClick={() => handleAvatarClick(row)}
                    aria-label={`View ${row.displayName}'s profile`}
                    className="shrink-0"
                  >
                    {row.avatarUrl ? (
                      <img
                        src={row.avatarUrl}
                        alt={row.displayName}
                        className="w-9 h-9 rounded-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center font-display font-bold text-sm"
                        style={{ backgroundColor: row.avatarColor }}
                      >
                        {row.displayName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </button>
                  <div className="flex-1 min-w-0 text-sm font-semibold truncate">
                    {row.displayName}
                  </div>
                  {rank <= 3 && (
                    <Trophy size={16} className="text-amber shrink-0" />
                  )}
                  <span className="font-mono text-sm text-ink shrink-0">
                    {valueFor(row)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
