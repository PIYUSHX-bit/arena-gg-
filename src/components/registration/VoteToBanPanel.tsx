import { useEffect, useState } from "react";
import { Flag, ShieldAlert } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { fetchMatchVotes, toggleBanVote, type MatchVote } from "../../lib/voting";

interface VoteToBanPanelProps {
  tournamentId: string;
}

export default function VoteToBanPanel({ tournamentId }: VoteToBanPanelProps) {
  const { user } = useAuth();
  const [votes, setVotes] = useState<MatchVote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  async function load() {
    const { votes: v, error: err } = await fetchMatchVotes(tournamentId);
    setVotes(v);
    setError(err);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tournamentId]);

  async function handleToggle(targetUserId: string) {
    setError(null);
    setTogglingId(targetUserId);

    const { error: toggleError } = await toggleBanVote(tournamentId, targetUserId);

    if (toggleError) {
      setTogglingId(null);
      setError(toggleError);
      return;
    }

    await load();
    setTogglingId(null);
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-1.5">
        <ShieldAlert size={15} className="text-ember" />
        <h3 className="text-sm font-semibold">Vote to Flag</h3>
      </div>
      <p className="text-xs text-muted mb-3">
        Only players from this match can vote, and only for each other.
        Flagging doesn't ban anyone automatically — ARENA.GG admins review
        flagged players and act manually.
      </p>

      {error && (
        <p className="text-xs text-ember bg-ember/10 border border-ember/30 rounded px-3 py-2 mb-3">
          {error}
        </p>
      )}

      {loading && <p className="text-xs text-muted py-2">Loading...</p>}

      {!loading && votes.length === 0 && (
        <p className="text-xs text-muted py-2">No confirmed players found for this match.</p>
      )}

      {!loading && votes.length > 0 && (
        <div className="border border-line bg-surface rounded-xl divide-y divide-line overflow-hidden">
          {votes.map((v, i) => {
            const isSelf = v.targetUserId === user?.id;
            return (
              <div
                key={v.targetUserId}
                className="flex items-center gap-3 px-4 py-3"
              >
                <span className="font-mono text-[11px] text-muted w-4 shrink-0">
                  {i + 1}
                </span>
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center font-display font-bold text-xs shrink-0"
                  style={{ backgroundColor: v.avatarColor }}
                >
                  {v.displayName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">
                    {v.displayName} {isSelf && <span className="text-muted">(You)</span>}
                  </div>
                  <div className="text-[11px] text-muted">
                    {v.voteCount} flag{v.voteCount === 1 ? "" : "s"}
                  </div>
                </div>
                {!isSelf && (
                  <button
                    onClick={() => handleToggle(v.targetUserId)}
                    disabled={togglingId === v.targetUserId}
                    className={`shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full disabled:opacity-50 ${
                      v.votedByMe
                        ? "bg-ember text-base"
                        : "border border-line text-muted"
                    }`}
                  >
                    <Flag size={12} />
                    {v.votedByMe ? "Flagged" : "Flag"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
