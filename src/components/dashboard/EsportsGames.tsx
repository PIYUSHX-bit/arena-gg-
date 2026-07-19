import type { GameModeCard } from "../../types/dashboard";

interface EsportsGamesProps {
  modes: GameModeCard[];
  onSelect: (modeId: string) => void;
}

export default function EsportsGames({ modes, onSelect }: EsportsGamesProps) {
  return (
    <section className="px-4 pt-8 pb-8">
      <h2 className="font-display font-semibold text-xl mb-3.5">
        FREE FIRE 🔥
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => onSelect(mode.id)}
            className={`relative rounded-xl overflow-hidden aspect-[4/3] p-4 flex flex-col justify-between text-left bg-gradient-to-br ${mode.accentFrom} ${mode.accentTo}`}
          >
            <div>
              <div className="font-display font-bold text-lg leading-none text-ink [text-shadow:0_2px_8px_rgba(0,0,0,0.4)]">
                Free Fire
              </div>
              <div className="font-display font-bold text-2xl leading-tight text-ink [text-shadow:0_2px_8px_rgba(0,0,0,0.4)]">
                {mode.title}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wide text-ink/90 [text-shadow:0_1px_4px_rgba(0,0,0,0.4)]">
                {mode.category}
              </span>
              <span className="flex items-center gap-1 text-xs text-ink/90 bg-black/25 rounded-full px-2 py-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-safe" />
                {mode.liveCount}
              </span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
