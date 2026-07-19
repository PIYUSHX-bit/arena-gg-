import type { HudStat } from "../../types/tournament";

interface HudStatsProps {
  stats: HudStat[];
}

export default function HudStats({ stats }: HudStatsProps) {
  return (
    <div className="relative z-[2] flex flex-wrap mt-16 border border-line rounded-md overflow-hidden bg-surface/60 backdrop-blur-md">
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          className={`flex-1 min-w-[45%] md:min-w-0 text-left px-8 py-[18px] ${
            i !== stats.length - 1 ? "border-r border-line" : ""
          } ${i < 2 ? "max-md:border-b max-md:border-line" : ""}`}
        >
          <div className="text-[11px] tracking-wider text-muted uppercase mb-1.5">
            {stat.label}
          </div>
          <div className="font-mono text-[22px] text-amber">{stat.value}</div>
        </div>
      ))}
    </div>
  );
}
