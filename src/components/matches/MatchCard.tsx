import type { Match } from "../../types/match";
import CopyIconButton from "../common/CopyIconButton";

interface MatchCardProps {
  match: Match;
}

const STATUS_STYLES: Record<Match["status"], string> = {
  upcoming: "bg-zone/15 text-zone border-zone/30",
  live: "bg-safe/15 text-safe border-safe/30",
  completed: "bg-muted/15 text-muted border-line",
};

const STATUS_LABELS: Record<Match["status"], string> = {
  upcoming: "Upcoming",
  live: "Live Now",
  completed: "Completed",
};

export default function MatchCard({ match }: MatchCardProps) {
  return (
    <div className="bg-surface border border-line rounded-lg p-5">
      <div className="flex justify-between items-start mb-3">
        <span className="text-xs tracking-wider text-muted uppercase">
          {match.mode} · {match.map}
        </span>
        <span
          className={`text-[11px] font-medium px-2.5 py-1 rounded-full border ${STATUS_STYLES[match.status]}`}
        >
          {STATUS_LABELS[match.status]}
        </span>
      </div>

      <div className="font-display font-semibold text-xl mb-1">
        {match.tournamentName}
      </div>
      <div className="text-sm text-muted mb-4">
        Squad: <span className="text-ink">{match.squadName}</span>
      </div>

      <div className="flex justify-between items-center pt-3 border-t border-line text-sm">
        <span className="text-muted">{match.startsAt}</span>
        {match.status === "live" && !match.roomId ? (
          <span className="text-muted">Room ID dropping soon...</span>
        ) : match.status === "upcoming" ? (
          <span className="text-muted">Room ID drops 15 min before</span>
        ) : match.status === "completed" ? (
          <span className="text-muted">
            {match.players.length} player{match.players.length > 1 ? "s" : ""}
          </span>
        ) : null}
      </div>

      {match.status === "live" && match.roomId && (
        <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-line">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">
              Room ID: <span className="text-ink font-mono">{match.roomId}</span>
            </span>
            <CopyIconButton value={match.roomId} />
          </div>
          {match.roomPassword && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">
                Password:{" "}
                <span className="text-ink font-mono">{match.roomPassword}</span>
              </span>
              <CopyIconButton value={match.roomPassword} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
