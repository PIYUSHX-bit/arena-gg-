import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Gift } from "lucide-react";
import { redeemReferralCode } from "../../lib/profile";
import ProfileField from "../profile/ProfileField";
import SubPageShell from "../menu/SubPageShell";

// Reachable voluntarily (e.g. from ProfilePage) — redeeming a code is
// optional, never a gate blocking access to the rest of the app.
export default function RedeemCodePage() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [redeemed, setRedeemed] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!code.trim()) {
      setError("Enter a referral code.");
      return;
    }

    setSubmitting(true);
    const { error: redeemError } = await redeemReferralCode(code.trim());
    setSubmitting(false);

    if (redeemError) {
      setError(redeemError);
      return;
    }

    setRedeemed(true);
  }

  return (
    <SubPageShell title="Redeem Referral Code">
      {redeemed ? (
        <div className="text-center py-8">
          <span className="inline-flex w-14 h-14 rounded-full bg-safe/15 items-center justify-center mb-4">
            <Gift size={26} className="text-safe" />
          </span>
          <p className="font-display font-bold text-lg text-safe mb-2">
            Code redeemed!
          </p>
          <p className="text-muted text-sm mb-6">
            ₹10 has landed in your wallet.
          </p>
          <button
            onClick={() => navigate("/profile", { replace: true })}
            className="bg-ember text-base font-semibold text-sm px-5 py-2.5 rounded-full transition-transform hover:-translate-y-0.5"
          >
            Back to Profile
          </button>
        </div>
      ) : (
        <>
          <p className="text-muted text-sm mb-6">
            Enter the referral code a friend shared with you — you'll both
            get ₹10. This is completely optional.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <ProfileField
              id="redeem-code"
              label="Referral Code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. A1B2C3"
              maxLength={6}
            />

            {error && (
              <p className="text-sm text-ember bg-ember/10 border border-ember/30 rounded px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting || !code.trim()}
              className="bg-ember text-base font-semibold text-[15px] px-8 py-3.5 rounded transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
            >
              {submitting ? "Checking..." : "Redeem Code"}
            </button>
          </form>
        </>
      )}
    </SubPageShell>
  );
}
