import SubPageShell from "./SubPageShell";

export default function TermsPage() {
  return (
    <SubPageShell title="Terms & Conditions">
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
    </SubPageShell>
  );
}
