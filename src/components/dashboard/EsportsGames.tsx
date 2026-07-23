import type { GameModeCard } from "../../types/dashboard";

interface EsportsGamesProps {
  modes: GameModeCard[];
  onSelect: (modeId: string) => void;
}

export default function EsportsGames({ modes, onSelect }: EsportsGamesProps) {
  return (
    <section className="px-5 pt-8 pb-8">
      <h2 className="font-display font-semibold text-xl mb-3.5">
        FREE FIRE 🔥
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {modes.map((mode) => {
          const Icon = mode.icon;
          return (
            <button
              key={mode.id}
              onClick={() => onSelect(mode.id)}
              className={`group relative rounded-xl overflow-hidden aspect-[4/3] text-left bg-gradient-to-br ${mode.accentFrom} ${mode.accentTo} border border-white/10 shadow-lg shadow-black/20 transition-transform duration-150 active:scale-[0.97]`}
            >
              {/* Bottom scrim so text stays legible over any gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />

              {/* Faint decorative ring, echoes the promo/hero cards elsewhere in the app */}
              <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full border border-white/15" />

              <div className="relative z-[1] h-full p-4 flex flex-col justify-between">
                <span className="self-start w-9 h-9 rounded-lg bg-black/30 backdrop-blur-sm flex items-center justify-center transition-transform duration-150 group-active:scale-90">
                  <Icon size={18} className="text-ink" />
                </span>

                <div>
                  <div className="font-display font-bold text-lg leading-tight text-ink mb-2 [text-shadow:0_2px_6px_rgba(0,0,0,0.5)]">
                    {mode.title}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold tracking-wider text-ink/80 uppercase">
                      {mode.category}
                    </span>
                    {mode.liveCount > 0 ? (
                      <span className="flex items-center gap-1 text-[11px] font-medium text-ink bg-black/35 rounded-full px-2 py-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-safe shadow-[0_0_4px_theme(colors.safe)]" />
                        {mode.liveCount} live
                      </span>
                    ) : (
                      <span className="text-[11px] text-ink/60">Browse →</span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
