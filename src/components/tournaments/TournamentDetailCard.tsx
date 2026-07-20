import { useState } from "react";
import { Trophy } from "lucide-react";
import type { Tournament } from "../../types/tournament";
import { getGameModeById } from "../../lib/gameModes";

interface TournamentDetailCardProps {
  tournament: Tournament;
  onJoinClick: () => void;
}

function formatRupees(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export default function TournamentDetailCard({
  tournament,
  onJoinClick,
}: TournamentDetailCardProps) {
  const {
    name,
    map,
    entryFee,
    prizePool,
    perKill,
    entryPerPlayer,
    category,
    bannerImageUrl,
    status,
    startsAt,
    slotsTotal,
    slotsFilled,
  } = tournament;

  const typeLabel = (category && getGameModeById(category)?.category) ?? "Free Fire";
  const slotsLeft = Math.max(slotsTotal - slotsFilled, 0);
  const fillPct = slotsTotal > 0 ? (slotsFilled / slotsTotal) * 100 : 0;
  const canJoin = status === "upcoming" && slotsLeft > 0;

  const [imageFailed, setImageFailed] = useState(false);
  const showImage = bannerImageUrl && !imageFailed;

  return (
    <div className="bg-surface border border-line rounded-xl overflow-hidden">
      {/* Banner — falls back to the trophy placeholder both when no
          image is set and when the saved URL fails to load (e.g. a
          non-image link saved before direct upload existed). */}
      <div className="aspect-[16/9] bg-gradient-to-br from-surface-2 via-surface to-base flex items-center justify-center overflow-hidden">
        {showImage ? (
          <img
            src={bannerImageUrl}
            alt={name}
            onError={() => setImageFailed(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <Trophy size={36} className="text-muted" />
        )}
      </div>

      <div className="p-5">
        <h3 className="font-display font-bold text-lg leading-snug mb-1.5">
          {name}
        </h3>
        <p className="text-xs text-muted mb-4">Time: {startsAt}</p>

        <div className="grid grid-cols-3 text-center border-y border-line py-3.5 mb-3.5">
          <div>
            <div className="text-[10px] text-muted uppercase tracking-wide mb-1">
              Prize Pool
            </div>
            <div className="font-display font-bold text-base text-ink">
              {formatRupees(prizePool)}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-muted uppercase tracking-wide mb-1">
              Per Kill
            </div>
            <div className="font-display font-bold text-base text-ink">
              {formatRupees(perKill)}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-muted uppercase tracking-wide mb-1">
              Entry Fee
            </div>
            <div className="font-display font-bold text-base text-ink">
              {formatRupees(entryFee)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 text-center mb-4">
          <div>
            <div className="text-[10px] text-muted uppercase tracking-wide mb-1">
              Type
            </div>
            <div className="text-sm font-medium">{typeLabel}</div>
          </div>
          <div>
            <div className="text-[10px] text-muted uppercase tracking-wide mb-1">
              Entry Per Player
            </div>
            <div className="text-sm font-medium">{entryPerPlayer}</div>
          </div>
          <div>
            <div className="text-[10px] text-muted uppercase tracking-wide mb-1">
              Map
            </div>
            <div className="text-sm font-medium">{map}</div>
          </div>
        </div>

        <div className="w-full h-1.5 rounded-full bg-line mb-2 overflow-hidden">
          <div
            className="h-full bg-ember rounded-full"
            style={{ width: `${fillPct}%` }}
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-safe">
            {slotsLeft > 0 ? `Only ${slotsLeft} Spot Left` : "Full"}
          </span>
          <span className="text-xs text-muted">
            {slotsFilled}/{slotsTotal}
          </span>
          <button
            onClick={onJoinClick}
            disabled={!canJoin}
            className="bg-ember text-base font-semibold text-sm px-6 py-2 rounded-full disabled:opacity-40"
          >
            {status === "completed"
              ? "Completed"
              : slotsLeft > 0
                ? "Join"
                : "Full"}
          </button>
        </div>
      </div>
    </div>
  );
}
