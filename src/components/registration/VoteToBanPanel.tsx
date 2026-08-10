import { useEffect, useState } from "react";
import { Ban, ShieldAlert, Users } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { fetchMatchVotes, toggleBanVote, type MatchVote } from "../../lib/voting";
import { IconBadge } from "../common/BrandIcons";

interface VoteToBanPanelProps {
  tournamentId: string;
}

export default function VoteToBanPanel({ tournamentId }: VoteToBanPanelProps) {
  const { user } = useAuth();
  const [votes, setVotes] = useState<MatchVote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    fetchMatchVotes(tournamentId).then(({ votes: v, error: err }) => {
      setVotes(v);
      setError(err);
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tournamentId]);

  async function handleToggle(targetUserId: string) {
    setError(null);
    setTogglingId(targetUserId);

    // Optimistic — flip the vote and its count in place rather than
    // reloading (which re-sorts by count and made the whole list jump
    // around on every tap).
    setVotes((prev) =>
      prev.map((v) =>
        v.targetUserId === targetUserId
          ? {
              ...v,
              votedByMe: !v.votedByMe,
              voteCount: v.voteCount + (v.votedByMe ? -1 : 1),
            }
          : v
      )
    );

    const { voted, error: toggleError } = await toggleBanVote(tournamentId, targetUserId);
    setTogglingId(null);

    if (toggleError) {
      // Undo the optimistic flip
      setError(toggleError);
      setVotes((prev) =>
        prev.map((v) =>
          v.targetUserId === targetUserId
            ? {
                ...v,
                votedByMe: !v.votedByMe,
                voteCount: v.voteCount + (v.votedByMe ? -1 : 1),
              }
            : v
        )
      );
      return;
    }

    // Reconcile with what the server actually did rather than trusting the
    // optimistic guess forever — if it ever disagrees (e.g. a stale toggle
    // landing out of order), this corrects the drift instead of leaving the
    // UI silently wrong until the next full reload.
    if (voted !== null) {
      setVotes((prev) =>
        prev.map((v) => {
          if (v.targetUserId !== targetUserId || v.votedByMe === voted) return v;
          return {
            ...v,
            votedByMe: voted,
            voteCount: v.voteCount + (voted ? 1 : -1),
          };
        })
      );
    }
  }

  const topVoteCount = Math.max(0, ...votes.map((v) => v.voteCount));

  return (
    <div className="border border-line rounded-xl bg-surface p-5">
      <div className="flex items-center gap-3 mb-3">
        <IconBadge gradientFrom="#FF7A52" gradientTo="#D93D16" shadowColor="rgba(255,74,28,0.5)" size={36}>
          <ShieldAlert size={16} className="text-white" />
        </IconBadge>
        <div>
          <h3 className="text-sm font-semibold">Vote to Ban</h3>
          <p className="text-[11px] text-muted">
            Suspicious teammate or opponent? Vote them out.
          </p>
        </div>
      </div>
      <p className="text-xs text-muted mb-4">
        Only players from this match can vote, and only for each other.
        Voting doesn't ban anyone automatically — ARENA.GG admins review
        vote counts and act manually.
      </p>

      {error && (
        <p className="text-xs text-ember bg-ember/10 border border-ember/30 rounded px-3 py-2 mb-3">
          {error}
        </p>
      )}

      {loading && <p className="text-xs text-muted py-2">Loading...</p>}

      {!loading && votes.length === 0 && (
        <div className="flex items-center gap-2.5 py-2 text-muted">
          <Users size={15} className="shrink-0" />
          <p className="text-xs">No confirmed players found for this match.</p>
        </div>
      )}

      {!loading && votes.length > 0 && (
        <div className="divide-y divide-line -mx-5">
          {votes.map((v, i) => {
            const isSelf = v.targetUserId === user?.id;
            const isMostVoted = topVoteCount > 0 && v.voteCount === topVoteCount;
            return (
              <div
                key={v.targetUserId}
                className="flex items-center gap-3 px-5 py-3"
              >
                <span
                  className={`font-mono text-[11px] w-4 shrink-0 ${
                    isMostVoted ? "text-ember font-bold" : "text-muted"
                  }`}
                >
                  {i + 1}
                </span>
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center font-display font-bold text-xs shrink-0"
                  style={{ backgroundColor: v.avatarColor }}
                >
                  {v.displayName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium truncate">
                      {v.displayName} {isSelf && <span className="text-muted">(You)</span>}
                    </span>
                    {isMostVoted && (
                      <span className="shrink-0 text-[9px] font-semibold uppercase tracking-wide text-ember bg-ember/15 rounded-full px-1.5 py-0.5">
                        Most voted
                      </span>
                    )}
                  </div>
                  {v.voteCount > 0 && (
                    <div className="text-[11px] text-ember mt-0.5">
                      {v.voteCount} vote{v.voteCount === 1 ? "" : "s"} to ban
                    </div>
                  )}
                </div>
                {!isSelf && (
                  <button
                    onClick={() => handleToggle(v.targetUserId)}
                    disabled={togglingId === v.targetUserId}
                    aria-pressed={v.votedByMe}
                    aria-label={
                      v.votedByMe
                        ? `Remove your ban vote for ${v.displayName}`
                        : `Vote to ban ${v.displayName}`
                    }
                    className={`shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors disabled:opacity-50 ${
                      v.votedByMe
                        ? "bg-ember text-base"
                        : "border border-line text-muted hover:border-ember/50 hover:text-ink"
                    }`}
                  >
                    <Ban size={12} />
                    {v.votedByMe ? "Voted" : "Ban"}
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
