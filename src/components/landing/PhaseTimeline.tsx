interface Phase {
  number: string;
  title: string;
  description: string;
}

const PHASES: Phase[] = [
  {
    number: "01",
    title: "Register Squad",
    description:
      "Pick a tournament, pay the entry fee, lock in your squad's in-game IDs.",
  },
  {
    number: "02",
    title: "Check In & Drop",
    description:
      "Check in 15 minutes before start. Room ID and password land in your inbox.",
  },
  {
    number: "03",
    title: "Claim Prize",
    description:
      "Results are pulled from the match server automatically. Winnings hit your wallet same day.",
  },
];

export default function PhaseTimeline() {
  return (
    <section id="how" className="px-[5vw] py-28">
      <div className="max-w-[640px] mx-auto text-center mb-14">
        <div className="text-xs tracking-[0.15em] text-zone uppercase mb-3.5">
          Three Rounds
        </div>
        <h2 className="font-display font-bold uppercase text-[30px] md:text-[46px]">
          How It Works
        </h2>
      </div>

      <div className="max-w-[1000px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-0 relative">
        <div className="hidden md:block absolute top-9 left-[60px] right-[60px] h-px bg-[repeating-linear-gradient(90deg,rgba(237,234,226,0.08)_0_8px,transparent_8px_16px)]" />

        {PHASES.map((phase) => (
          <div key={phase.number} className="text-center px-5 relative">
            <div className="relative z-[2] w-[72px] h-[72px] rounded-full mx-auto mb-6 border-[1.5px] border-zone bg-base flex items-center justify-center">
              <span className="font-mono text-[13px] text-zone">
                {phase.number}
              </span>
            </div>
            <h3 className="font-display font-semibold uppercase text-xl mb-2.5">
              {phase.title}
            </h3>
            <p className="text-muted text-[14.5px] leading-relaxed">
              {phase.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
