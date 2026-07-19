import SubPageShell from "./SubPageShell";

export default function PrivacyPage() {
  return (
    <SubPageShell title="Privacy Policy">
      <div className="bg-amber/10 border border-amber/30 rounded-lg px-4 py-3 mb-6">
        <p className="text-xs text-amber leading-relaxed">
          Placeholder text — I'm not a lawyer and this isn't legal advice.
          Since ARENA.GG handles real payments and personal data (phone,
          email, payment info), have this reviewed by a lawyer before
          publishing it live, especially for compliance with India's DPDP
          Act.
        </p>
      </div>

      <div className="flex flex-col gap-5 text-sm text-muted leading-relaxed">
        <section>
          <h2 className="text-ink font-semibold mb-1.5">
            Information We Collect
          </h2>
          <p>
            Account details (name, email or phone), Free Fire IGN/UID for
            tournament rosters, and payment transaction records via our
            payment processor. We don't store your card or UPI details
            directly — that's handled by Razorpay.
          </p>
        </section>
        <section>
          <h2 className="text-ink font-semibold mb-1.5">
            How We Use It
          </h2>
          <p>
            To run tournaments (verifying rosters, sending room IDs), process
            payments and payouts, and contact you about matches you've
            registered for.
          </p>
        </section>
        <section>
          <h2 className="text-ink font-semibold mb-1.5">Data Sharing</h2>
          <p>
            We don't sell your data. It's shared only with services required
            to operate the platform (payment processing, SMS delivery for
            OTP login).
          </p>
        </section>
        <section>
          <h2 className="text-ink font-semibold mb-1.5">Your Rights</h2>
          <p>
            You can request account deletion or a copy of your data by
            contacting support. Deleting your account doesn't erase
            transaction records required for financial compliance.
          </p>
        </section>
      </div>
    </SubPageShell>
  );
}
