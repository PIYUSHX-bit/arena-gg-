import { useNavigate } from "react-router-dom";
import type { Tournament } from "../../types/tournament";
import TournamentCard from "./TournamentCard";

interface TournamentGridProps {
  tournaments: Tournament[];
}

export default function TournamentGrid({ tournaments }: TournamentGridProps) {
  const navigate = useNavigate();

  return (
    <section id="tournaments" className="px-[5vw] py-28">
      <div className="max-w-[640px] mx-auto text-center mb-14">
        <div className="text-xs tracking-[0.15em] text-zone uppercase mb-3.5">
          Live &amp; Upcoming
        </div>
        <h2 className="font-display font-bold uppercase text-[30px] md:text-[46px]">
          Pick Your Drop
        </h2>
        <p className="text-muted mt-3.5 text-base leading-relaxed">
          Every match is server-verified. Every payout is automatic. No
          screenshots, no arguments.
        </p>
      </div>

      <div className="max-w-[1180px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {tournaments.map((t) => (
          <TournamentCard
            key={t.id}
            tournament={t}
            onRegisterClick={() => navigate(`/tournaments/${t.id}/register`)}
          />
        ))}
      </div>
    </section>
  );
}
