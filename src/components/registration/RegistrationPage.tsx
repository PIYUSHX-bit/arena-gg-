import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { fetchTournamentById } from "../../lib/entries";
import type { Tournament } from "../../types/tournament";
import RegistrationForm from "./RegistrationForm";

export default function RegistrationPage() {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  const navigate = useNavigate();

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tournamentId) return;
    let cancelled = false;

    fetchTournamentById(tournamentId).then(({ tournament: t, error: err }) => {
      if (cancelled) return;
      if (err) setError(err);
      else setTournament(t);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [tournamentId]);

  return (
    <div className="min-h-screen bg-base text-ink font-body max-w-[480px] mx-auto pb-10">
      <div className="flex items-center gap-3 px-5 py-4 bg-surface border-b border-line sticky top-0 z-10">
        <button onClick={() => navigate(-1)} aria-label="Back">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-display font-semibold text-xl">Register</h1>
      </div>

      <div className="px-5 py-6">
        {loading && (
          <p className="text-center text-muted text-sm py-14">Loading...</p>
        )}

        {!loading && (error || !tournament) && (
          <div className="text-center py-14">
            <p className="text-ember text-sm mb-3">
              {error ?? "Tournament not found."}
            </p>
            <button
              onClick={() => navigate("/dashboard")}
              className="text-ember text-sm hover:underline"
            >
              ← Back to tournaments
            </button>
          </div>
        )}

        {!loading && tournament && (
          <>
            <div className="mb-6">
              <div className="text-xs tracking-wider text-zone uppercase mb-1.5">
                {tournament.mode} Registration
              </div>
              <h2 className="font-display font-semibold text-2xl">
                {tournament.name}
              </h2>
            </div>
            <RegistrationForm tournament={tournament} />
          </>
        )}
      </div>
    </div>
  );
}
