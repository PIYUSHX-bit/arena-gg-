import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { fetchTournaments } from "../../lib/entries";
import type { Tournament } from "../../types/tournament";
import TournamentCard from "../landing/TournamentCard";

export default function TournamentsBrowsePage() {
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTournaments().then(({ tournaments: t }) => {
      setTournaments(t);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-base text-ink font-body max-w-[480px] mx-auto pb-10">
      <div className="flex items-center gap-3 px-5 py-4 bg-surface border-b border-line sticky top-0 z-10">
        <button onClick={() => navigate(-1)} aria-label="Back">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-display font-semibold text-xl">Tournaments</h1>
      </div>

      <div className="px-5 py-6 flex flex-col gap-4">
        {loading && (
          <p className="text-center text-muted text-sm py-10">Loading...</p>
        )}

        {!loading && tournaments.length === 0 && (
          <p className="text-center text-muted text-sm py-10">
            No tournaments open for registration right now — check back
            soon.
          </p>
        )}

        {!loading &&
          tournaments.map((t) => (
            <TournamentCard
              key={t.id}
              tournament={t}
              onRegisterClick={() =>
                navigate(`/tournaments/${t.id}/register`)
              }
            />
          ))}
      </div>
    </div>
  );
}
