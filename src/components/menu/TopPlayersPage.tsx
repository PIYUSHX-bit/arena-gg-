import { useEffect, useState } from "react";
import { fetchTopSpenders } from "../../lib/leaderboard";
import type { TopSpenderRow } from "../../types/leaderboard";
import SubPageShell from "./SubPageShell";

function formatRupees(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export default function TopPlayersPage() {
  const [rows, setRows] = useState<TopSpenderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTopSpenders(20).then(({ rows: r, error: err }) => {
      if (err) setError(err);
      else setRows(r);
      setLoading(false);
    });
  }, []);

  return (
    <SubPageShell title="Top Players">
      {loading && <p className="text-muted text-sm">Loading...</p>}
      {!loading && error && <p className="text-ember text-sm">{error}</p>}

      {!loading && !error && rows.length === 0 && (
        <p className="text-muted text-sm text-center py-10">
          No confirmed entries yet — rankings fill in as players register.
        </p>
      )}

      {!loading && !error && rows.length > 0 && (
        <>
          <div className="border border-line rounded-lg overflow-hidden">
            {rows.map((row, i) => {
              const rank = i + 1;
              return (
                <div
                  key={`${row.displayName}-${i}`}
                  className="flex items-center gap-3 px-4 py-3.5 border-b border-line last:border-b-0"
                >
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
                  <span className="font-mono text-sm text-amber shrink-0">
                    {formatRupees(row.totalInvested)}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-muted mt-4">
            Ranked by total entry fees invested across all tournaments.
          </p>
        </>
      )}
    </SubPageShell>
  );
}
