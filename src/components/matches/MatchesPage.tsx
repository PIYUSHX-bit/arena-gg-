import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { fetchMyMatches } from "../../lib/entries";
import type { Match, TournamentStatus } from "../../types/match";
import type { Tournament } from "../../types/tournament";
import TournamentDetailCard from "../tournaments/TournamentDetailCard";
import MatchesEmptyState from "./MatchesEmptyState";

// TournamentDetailCard expects a full Tournament — build one from the
// fields My Matches already carries so the card renders identically to
// the browse page, just with `joined` set.
function matchToTournament(match: Match): Tournament {
  return {
    id: match.tournamentId,
    name: match.tournamentName,
    mode: match.mode,
    map: match.map,
    entryFee: match.entryFee,
    prizePool: match.prizePool,
    perKill: match.perKill,
    entryPerPlayer: match.entryPerPlayer,
    prizeDistribution: [],
    category: match.category,
    bannerImageUrl: match.bannerImageUrl,
    status: match.status,
    isActive: true,
    startsAt: match.startsAt,
    startsAtIso: match.startsAtIso,
    slotsTotal: match.slotsTotal,
    slotsFilled: match.slotsFilled,
  };
}

type Tab = { status: TournamentStatus; label: string };

const TABS: Tab[] = [
  { status: "live", label: "Ongoing" },
  { status: "upcoming", label: "Upcoming" },
  { status: "completed", label: "Completed" },
];

function isTournamentStatus(value: string | null): value is TournamentStatus {
  return value === "live" || value === "upcoming" || value === "completed";
}

export default function MatchesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const statusParam = searchParams.get("status");
  const activeStatus: TournamentStatus = isTournamentStatus(statusParam)
    ? statusParam
    : "live";

  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    setLoading(true);
    fetchMyMatches(user.id, activeStatus).then(({ matches: m, error: err }) => {
      if (cancelled) return;
      if (err) setError(err);
      else setMatches(m);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [user, activeStatus]);

  function handleTabClick(status: TournamentStatus) {
    setSearchParams({ status }, { replace: true });
  }

  return (
    <div className="min-h-screen bg-base text-ink font-body max-w-[480px] mx-auto pb-8">
      <div className="flex items-center gap-3 px-5 py-4 bg-surface border-b border-line">
        <button onClick={() => navigate(-1)} aria-label="Back">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-display font-semibold text-xl">My Matches</h1>
      </div>

      <div className="flex border-b border-line px-5">
        {TABS.map((tab) => (
          <button
            key={tab.status}
            onClick={() => handleTabClick(tab.status)}
            className={`flex-1 py-3.5 text-sm font-medium border-b-2 transition-colors ${
              activeStatus === tab.status
                ? "border-ember text-ink"
                : "border-transparent text-muted"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="px-5 py-5 flex flex-col gap-3">
        {loading && (
          <p className="text-center text-muted text-sm py-8">Loading...</p>
        )}

        {!loading && error && (
          <p className="text-center text-ember text-sm py-8">{error}</p>
        )}

        {!loading && !error && matches.length === 0 && (
          <MatchesEmptyState
            statusLabel={
              TABS.find((t) => t.status === activeStatus)?.label ?? ""
            }
            onBrowseClick={() => navigate("/dashboard")}
          />
        )}

        {!loading &&
          !error &&
          matches.map((match) => (
            <TournamentDetailCard
              key={match.entryId}
              tournament={matchToTournament(match)}
              joined
              onJoinClick={() =>
                navigate(`/tournaments/${match.tournamentId}/register`)
              }
            />
          ))}
      </div>
    </div>
  );
}
