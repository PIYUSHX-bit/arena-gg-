import { RefreshCw, CalendarDays, CheckSquare } from "lucide-react";
import type { MatchStatus } from "../../types/dashboard";

interface MatchStatusItem {
  status: MatchStatus;
  label: string;
}

const ITEMS: MatchStatusItem[] = [
  { status: "ongoing", label: "Ongoing" },
  { status: "upcoming", label: "Upcoming" },
  { status: "completed", label: "Completed" },
];

const ICONS: Record<MatchStatus, typeof RefreshCw> = {
  ongoing: RefreshCw,
  upcoming: CalendarDays,
  completed: CheckSquare,
};

const ICON_COLORS: Record<MatchStatus, string> = {
  ongoing: "bg-safe/15 text-safe",
  upcoming: "bg-zone/15 text-zone",
  completed: "bg-amber/15 text-amber",
};

interface MyMatchesProps {
  onSelect: (status: MatchStatus) => void;
}

export default function MyMatches({ onSelect }: MyMatchesProps) {
  return (
    <section className="px-5 pt-7">
      <h2 className="font-display font-semibold text-xl mb-3.5">
        My Matches
      </h2>
      <div className="grid grid-cols-3 gap-3">
        {ITEMS.map(({ status, label }) => {
          const Icon = ICONS[status];
          return (
            <button
              key={status}
              onClick={() => onSelect(status)}
              className="bg-surface border border-line rounded-xl py-5 flex flex-col items-center gap-2.5 transition-all hover:border-muted active:scale-[0.97]"
            >
              <span
                className={`w-11 h-11 rounded-lg flex items-center justify-center ${ICON_COLORS[status]}`}
              >
                <Icon size={20} />
              </span>
              <span className="text-sm font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
