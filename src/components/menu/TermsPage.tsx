import { useEffect, useState } from "react";
import { fetchRules, type RuleSection } from "../../lib/rules";
import SubPageShell from "./SubPageShell";

export default function TermsPage() {
  const [sections, setSections] = useState<RuleSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRules().then(({ rules }) => {
      if (rules) setSections(rules.sections);
      setLoading(false);
    });
  }, []);

  return (
    <SubPageShell title="About & Terms">
      <div className="flex flex-col gap-4 text-sm text-muted leading-relaxed mb-8">
        <h2 className="font-display font-semibold text-lg text-ink -mb-1">
          About ARENA.GG
        </h2>
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

      <h2 className="font-display font-semibold text-lg text-ink mb-4">
        Terms &amp; Conditions
      </h2>

      <div className="bg-amber/10 border border-amber/30 rounded-lg px-4 py-3 mb-6">
        <p className="text-xs text-amber leading-relaxed">
          Placeholder text — not legal advice. Real-money skill-gaming
          platforms in India have specific state-level restrictions (some
          states restrict or ban paid gaming contests entirely) — get this
          reviewed by a lawyer familiar with Indian gaming law before
          launch.
        </p>
      </div>

      <div className="flex flex-col gap-5 text-sm text-muted leading-relaxed">
        <section>
          <h2 className="text-ink font-semibold mb-1.5">Eligibility</h2>
          <p>
            You must be 18 or older, or the age of majority in your state,
            to register for paid tournaments.
          </p>
        </section>
        <section>
          <h2 className="text-ink font-semibold mb-1.5">Entry Fees & Refunds</h2>
          <p>
            Entry fees are non-refundable except when ARENA.GG cancels a
            tournament. See the FAQ for the full refund policy.
          </p>
        </section>
        <section>
          <h2 className="text-ink font-semibold mb-1.5">Fair Play</h2>
          <p>
            Use of emulators where restricted, teaming with opponents, or any
            third-party software that gives an unfair advantage results in
            disqualification and forfeiture of entry fees and winnings.
          </p>
        </section>
        <section>
          <h2 className="text-ink font-semibold mb-1.5">Prize Payouts</h2>
          <p>
            Winnings are credited after results are verified from the match
            server. ARENA.GG reserves the right to withhold payouts pending
            investigation of suspected rule violations.
          </p>
        </section>
        <section>
          <h2 className="text-ink font-semibold mb-1.5">
            Account Termination
          </h2>
          <p>
            Accounts found violating fair play rules or engaging in
            fraudulent payment activity may be suspended or terminated
            without refund.
          </p>
        </section>
      </div>

      {!loading && sections.length > 0 && (
        <div className="flex flex-col gap-5 mt-8 pt-6 border-t border-line">
          <h2 className="font-display font-semibold text-lg text-ember -mb-1">
            Tournament Rules
          </h2>
          {sections.map((section) => (
            <section key={section.title}>
              <h3 className="text-ink font-semibold mb-1.5">
                {section.title}
              </h3>
              <ul className="flex flex-col gap-2">
                {section.points.map((point) => (
                  <li key={point} className="flex gap-2.5 text-sm text-muted leading-relaxed">
                    <span className="text-ember shrink-0">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </SubPageShell>
  );
}
