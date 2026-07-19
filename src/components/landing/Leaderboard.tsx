import type { LeaderboardEntry } from "../../types/tournament";

interface LeaderboardProps {
  entries: LeaderboardEntry[];
}

function formatRupees(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export default function Leaderboard({ entries }: LeaderboardProps) {
  return (
    <section id="leaderboard" className="px-[5vw] py-28">
      <div className="max-w-[640px] mx-auto text-center mb-14">
        <div className="text-xs tracking-[0.15em] text-zone uppercase mb-3.5">
          Top Of The Zone
        </div>
        <h2 className="font-display font-bold uppercase text-[30px] md:text-[46px]">
          This Week's Leaderboard
        </h2>
      </div>

      <div className="max-w-[760px] mx-auto border border-line rounded-lg overflow-hidden">
        {entries.map((entry) => (
          <div
            key={entry.rank}
            className="grid grid-cols-[36px_1fr_90px] md:grid-cols-[50px_1fr_140px_140px] items-center px-6 py-[18px] border-b border-line last:border-b-0 transition-colors hover:bg-surface"
          >
            <div
              className={`font-mono text-sm ${
                entry.rank <= 3 ? "text-amber" : "text-muted"
              }`}
            >
              {String(entry.rank).padStart(2, "0")}
            </div>
            <div>
              <div className="text-base font-semibold">{entry.squadName}</div>
              <div className="text-xs text-muted mt-0.5">
                {entry.wins} wins · {entry.eliminations} eliminations
              </div>
            </div>
            <div className="font-mono text-right">
              {entry.points.toLocaleString("en-IN")} pts
            </div>
            <div className="hidden md:block font-mono text-right text-amber">
              {formatRupees(entry.earnings)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
