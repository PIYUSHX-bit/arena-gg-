import HudStats from "./HudStats";
import type { HudStat } from "../../types/tournament";

interface HeroProps {
  liveSquadCount: number;
  stats: HudStat[];
}

export default function Hero({ liveSquadCount, stats }: HeroProps) {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-[5vw] pt-32 pb-20 overflow-hidden">
      <div className="grid-bg" />

      {/* Shrinking zone radar — the page's signature element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] pointer-events-none max-md:w-[500px] max-md:h-[500px]">
        <div className="motion-safe-only absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-zone/25 w-full h-full animate-shrink" />
        <div
          className="motion-safe-only absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-zone/35 w-[71%] h-[71%] animate-shrink"
          style={{ animationDelay: "-3s" }}
        />
        <div
          className="motion-safe-only absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-ember/40 w-[42%] h-[42%] animate-shrink"
          style={{ animationDelay: "-6s" }}
        />
      </div>

      <div className="relative z-[2] inline-flex items-center gap-2 text-xs tracking-[0.15em] text-safe border border-safe/30 bg-safe/[0.06] px-3.5 py-1.5 rounded-full mb-7">
        <span className="motion-safe-only w-1.5 h-1.5 rounded-full bg-safe shadow-[0_0_8px_theme(colors.safe)] animate-pulse2" />
        {liveSquadCount} SQUADS LIVE IN QUALIFIERS
      </div>

      <h1 className="relative z-[2] font-display font-bold uppercase leading-[0.98] text-[48px] md:text-[72px] lg:text-[108px]">
        Drop In.
        <br />
        <span className="text-ember [text-shadow:0_0_40px_rgba(255,74,28,0.35)]">
          Get Paid.
        </span>
      </h1>

      <p className="relative z-[2] max-w-[560px] mx-auto mt-6 mb-10 text-muted text-[17px] leading-relaxed">
        Real cash Free Fire tournaments — Solo, Duo &amp; Squad. Register,
        check in, survive the zone, claim your prize. Payouts within 24
        hours.
      </p>

      <div className="relative z-[2] flex gap-4 flex-wrap justify-center">
        <a
          href="#tournaments"
          className="bg-ember text-base font-semibold text-[15px] px-8 py-[15px] rounded shadow-[0_0_30px_rgba(255,74,28,0.3)] transition-transform hover:-translate-y-0.5"
        >
          Browse Tournaments
        </a>
        <a
          href="#how"
          className="border border-line text-ink font-medium text-[15px] px-8 py-[15px] rounded transition-colors hover:border-muted hover:bg-surface"
        >
          How It Works
        </a>
      </div>

      <HudStats stats={stats} />
    </section>
  );
}
