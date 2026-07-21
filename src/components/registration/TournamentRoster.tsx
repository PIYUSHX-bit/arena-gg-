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
        <Users size={15} className="text-zone" />
        <h3 className="text-sm font-semibold">
          Joined Players {!loading && `(${roster.length})`}
        </h3>
      </div>

      {loading && <p className="text-xs text-muted py-2">Loading...</p>}

      {!loading && roster.length === 0 && (
        <div className="text-center py-6 border border-dashed border-line rounded-lg">
          <p className="text-xs text-muted">
            No one has joined yet — be the first.
          </p>
        </div>
      )}

      {!loading && roster.length > 0 && (
        <div className="border border-line bg-surface rounded-xl divide-y divide-line overflow-hidden">
          {roster.map((entry, i) => (
            <div
              key={`${entry.squadName}-${i}`}
              className="flex items-start gap-3 px-4 py-3"
            >
              <span className="shrink-0 w-7 h-7 rounded-full bg-zone/15 text-zone font-mono text-[11px] font-semibold flex items-center justify-center mt-0.5">
                {i + 1}
              </span>
              <div className="min-w-0 flex flex-col gap-1 py-0.5">
                {entry.players.map((p, j) => (
                  <div key={j} className="text-xs truncate">
                    <span className="font-medium text-ink">{p.ign}</span>
                    <span className="text-muted"> · UID {p.uid}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
