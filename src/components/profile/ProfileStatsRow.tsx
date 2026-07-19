import type { ProfileStats } from "../../types/profile";

interface ProfileStatsRowProps {
  stats: ProfileStats;
}

function formatRupees(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export default function ProfileStatsRow({ stats }: ProfileStatsRowProps) {
  const items = [
    { label: "Tournaments Joined", value: String(stats.confirmedEntries) },
    { label: "Total Entries", value: String(stats.totalEntries) },
    { label: "Total Spent", value: formatRupees(stats.totalSpent) },
  ];

  const performanceItems = [
    { label: "Wins", value: String(stats.totalWins) },
    { label: "Kills", value: String(stats.totalKills) },
    { label: "Earnings", value: formatRupees(stats.totalEarnings) },
  ];

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-3 gap-2">
        {items.map((item) => (
          <div
            key={item.label}
            className="bg-surface border border-line rounded-lg py-4 px-2 text-center"
          >
            <div className="font-mono text-lg text-amber mb-1">
              {item.value}
            </div>
            <div className="text-[11px] text-muted leading-tight">
              {item.label}
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {performanceItems.map((item) => (
          <div
            key={item.label}
            className="bg-surface border border-line rounded-lg py-4 px-2 text-center"
          >
            <div className="font-mono text-lg text-safe mb-1">
              {item.value}
            </div>
            <div className="text-[11px] text-muted leading-tight">
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
