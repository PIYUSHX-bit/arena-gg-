import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { redeemReferralCode } from "../../lib/profile";
import ProfileField from "../profile/ProfileField";

export default function RedeemCodePage() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    navigate("/dashboard", { replace: true });
  }

  return (
    <div className="min-h-screen bg-base text-ink flex items-center justify-center px-6 relative overflow-hidden">
      <div className="grid-bg" />

      <div className="relative z-[2] w-full max-w-[420px] bg-surface border border-line rounded-lg p-9">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="relative w-[26px] h-[26px] rounded-full border-2 border-ember">
              <span className="absolute inset-[5px] rounded-full bg-ember" />
            </div>
            <span className="font-display font-bold text-xl">
              ARENA<span className="text-ember">.GG</span>
            </span>
          </div>
          <h1 className="font-display font-semibold uppercase text-2xl">
            Invite Only
          </h1>
          <p className="text-muted text-sm mt-2">
            Enter the referral code a friend shared with you to unlock the
            arena — you'll both get ₹10.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <ProfileField
            id="redeem-code"
            label="Referral Code"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. A1B2C3"
            maxLength={6}
            required
          />

          {error && (
            <p className="text-sm text-ember bg-ember/10 border border-ember/30 rounded px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="bg-ember text-base font-semibold text-[15px] px-8 py-3.5 rounded transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
          >
            {submitting ? "Checking..." : "Unlock Access"}
          </button>
        </form>
      </div>
    </div>
  );
}
