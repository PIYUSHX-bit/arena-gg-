import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { fetchTournamentRoster, type RosterEntry } from "../../lib/entries";

interface TournamentRosterProps {
  tournamentId: string;
}

export default function TournamentRoster({ tournamentId }: TournamentRosterProps) {
  const [roster, setRoster] = useState<RosterEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchTournamentRoster(tournamentId).then(({ roster: r }) => {
      if (cancelled) return;
      setRoster(r);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [tournamentId]);

  return (
    <div className="border-t border-line pt-5 mt-1">
      <div className="flex items-center gap-2 mb-3">
        <Users size={15} className="text-muted" />
        <h3 className="text-sm font-semibold">
          Joined Players {!loading && `(${roster.length})`}
        </h3>
      </div>

      {loading && <p className="text-xs text-muted py-2">Loading...</p>}

      {!loading && roster.length === 0 && (
        <p className="text-xs text-muted py-2">
          No one has joined yet — be the first.
        </p>
      )}

      {!loading && roster.length > 0 && (
        <div className="flex flex-col gap-2">
          {roster.map((entry, i) => (
            <div
              key={`${entry.squadName}-${i}`}
              className="flex items-start gap-2.5 bg-surface border border-line rounded-lg px-3.5 py-2.5"
            >
              <span className="font-mono text-[11px] text-muted w-4 shrink-0 pt-0.5">
                {i + 1}
              </span>
              <div className="min-w-0">
                <div className="text-xs font-medium text-ink truncate">
                  {entry.players.map((p) => p.ign).join(", ")}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
