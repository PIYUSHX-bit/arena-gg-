import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  fetchTournamentsByCategory,
  fetchMyConfirmedTournamentIds,
} from "../../lib/entries";
import { getGameModeById } from "../../lib/gameModes";
import type { Tournament, TournamentStatus } from "../../types/tournament";
import TournamentDetailCard from "./TournamentDetailCard";

type Tab = { status: TournamentStatus; label: string };

const TABS: Tab[] = [
  { status: "live", label: "Ongoing" },
  { status: "upcoming", label: "Upcoming" },
  { status: "completed", label: "Resulted" },
];

function isTournamentStatus(value: string | null): value is TournamentStatus {
  return value === "live" || value === "upcoming" || value === "completed";
}

export default function GameModeTournamentsPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const statusParam = searchParams.get("status");
  const activeStatus: TournamentStatus = isTournamentStatus(statusParam)
    ? statusParam
    : "upcoming";

  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const gameMode = categoryId ? getGameModeById(categoryId) : undefined;

  useEffect(() => {
    if (!categoryId) return;
    let cancelled = false;

    setLoading(true);
    fetchTournamentsByCategory(categoryId, activeStatus).then(
      async ({ tournaments: t, error: err }) => {
        if (cancelled) return;
        if (err) {
          setError(err);
          setLoading(false);
          return;
        }

        setTournaments(t);

        // Per-card "Joined" badge/Enter button — only true for the
        // tournaments this player actually holds a confirmed entry for.
        if (user && t.length > 0) {
          const { tournamentIds } = await fetchMyConfirmedTournamentIds(
            user.id,
            t.map((tournament) => tournament.id)
          );
          if (!cancelled) setJoinedIds(tournamentIds);
        } else {
          setJoinedIds(new Set());
        }

        setLoading(false);
      }
    );

    return () => {
      cancelled = true;
    };
  }, [categoryId, activeStatus, user]);

  function handleTabClick(status: TournamentStatus) {
    setSearchParams({ status }, { replace: true });
  }

  return (
    <div className="min-h-screen bg-base text-ink font-body max-w-[480px] mx-auto pb-8">
      <div className="flex items-center gap-3 px-5 py-4 bg-surface border-b border-line">
        <button onClick={() => navigate(-1)} aria-label="Back">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-display font-semibold text-xl">
          {gameMode?.category ?? "Free Fire"} Contests
        </h1>
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

      <div className="px-5 py-5 flex flex-col gap-4">
        {loading && (
          <p className="text-center text-muted text-sm py-8">Loading...</p>
        )}

        {!loading && error && (
          <p className="text-center text-ember text-sm py-8">{error}</p>
        )}

        {!loading && !error && tournaments.length === 0 && (
          <p className="text-center text-muted text-sm py-10">
            No {TABS.find((t) => t.status === activeStatus)?.label.toLowerCase()}{" "}
            contests right now — check back soon.
          </p>
        )}

        {!loading &&
          !error &&
          tournaments.map((t) => (
            <TournamentDetailCard
              key={t.id}
              tournament={t}
              joined={joinedIds.has(t.id)}
              onJoinClick={() => navigate(`/tournaments/${t.id}/register`)}
            />
          ))}
      </div>
    </div>
  );
}
