import { FileSearch } from "lucide-react";

interface MatchesEmptyStateProps {
  statusLabel: string;
  onBrowseClick: () => void;
}

export default function MatchesEmptyState({
  statusLabel,
  onBrowseClick,
}: MatchesEmptyStateProps) {
  return (
    <div className="flex flex-col items-center text-center py-16">
      <div className="relative w-24 h-24 flex items-center justify-center mb-6">
        {/* Searching radar pulse — same "zone ring" motif used in the hero,
            reused here to signal "actively looking" rather than a static icon */}
        <span className="motion-safe-only absolute inset-0 rounded-full border border-zone/40 animate-ping" />
        <span className="motion-safe-only absolute inset-2 rounded-full border border-zone/30 animate-ping [animation-delay:0.4s]" />
        <span className="relative z-[1] w-16 h-16 rounded-full bg-surface-2 border border-line flex items-center justify-center">
          <FileSearch size={28} className="text-zone" />
        </span>
      </div>

      <p className="font-display font-semibold text-xl mb-2">
        Matches Not Found!
      </p>
      <p className="text-muted text-sm mb-5 max-w-[260px]">
        You don't have any {statusLabel.toLowerCase()} matches — this only
        shows tournaments you've actually registered and paid for.
      </p>

      <button
        onClick={onBrowseClick}
        className="text-ember text-sm hover:underline"
      >
        Browse tournaments →
      </button>
    </div>
  );
}
