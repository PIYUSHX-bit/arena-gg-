import type { Tournament } from "../../types/tournament";

interface TournamentCardProps {
  tournament: Tournament;
  onRegisterClick: () => void;
}

function formatRupees(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export default function TournamentCard({
  tournament,
  onRegisterClick,
}: TournamentCardProps) {
  const { name, mode, map, entryFee, prizePool, startsAt, slotsLeft } =
    tournament;

  const statusLabel =
    slotsLeft !== undefined ? `${slotsLeft} slots left` : "Filling";

  return (
    <div className="relative bg-surface border border-line rounded-lg p-6 overflow-hidden transition-all hover:-translate-y-1 hover:border-ember/40 group">
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-ember to-zone" />

      <div className="flex justify-between items-start mb-4.5">
        <span className="text-xs tracking-wider text-muted uppercase">
          {mode} · {map}
        </span>
        <span className="flex items-center gap-1.5 text-[11px] tracking-wide text-safe">
          <span className="w-[5px] h-[5px] rounded-full bg-safe shadow-[0_0_6px_theme(colors.safe)]" />
          {statusLabel}
        </span>
      </div>

      <div className="font-display font-semibold text-2xl mb-4.5">{name}</div>

      <div className="flex justify-between pt-4.5 border-t border-line">
        <div>
          <div className="text-[11px] text-muted uppercase tracking-wide mb-1">
            Entry
          </div>
          <div className="text-[17px]">{formatRupees(entryFee)} / player</div>
        </div>
        <div>
          <div className="text-[11px] text-muted uppercase tracking-wide mb-1">
            Prize Pool
          </div>
          <div className="text-[17px] text-amber">
            {formatRupees(prizePool)}
          </div>
        </div>
        <div>
          <div className="text-[11px] text-muted uppercase tracking-wide mb-1">
            Starts
          </div>
          <div className="text-[17px]">{startsAt}</div>
        </div>
      </div>

      <button
        onClick={onRegisterClick}
        className="w-full text-center mt-5 border border-line rounded py-[11px] text-sm font-medium transition-colors group-hover:bg-ember group-hover:border-ember group-hover:text-base"
      >
        Register {mode} →
      </button>
    </div>
  );
}
