import SubPageShell from "./SubPageShell";

export default function AboutPage() {
  return (
    <SubPageShell title="About Us">
      <div className="flex flex-col gap-4 text-sm text-muted leading-relaxed">
        <p className="text-ink">
          ARENA.GG runs real-cash Free Fire tournaments — Solo, Duo, and
          Squad — for players who want competition with something on the
          line, not just XP.
        </p>
        <p>
          Every match is server-verified: results come from the match server
          itself, not screenshots or self-reporting, so payouts are fast and
          disputes are rare.
        </p>
        <p>
          We're an independent platform and aren't affiliated with, endorsed
          by, or sponsored by Garena or Free Fire.
        </p>
      </div>
    </SubPageShell>
  );
}
