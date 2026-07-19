import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import OtpInput from "./OtpInput";

interface PhoneLoginFormProps {
  onSuccess: () => void;
}

type Step = "phone" | "otp";

// India-first: default country code, but keep the field editable in case
// you expand beyond India later.
const DEFAULT_COUNTRY_CODE = "+91";

export default function PhoneLoginForm({ onSuccess }: PhoneLoginFormProps) {
  const { requestPhoneOtp, verifyPhoneOtp } = useAuth();
  const [step, setStep] = useState<Step>("phone");
  const [localNumber, setLocalNumber] = useState("");
  const [fullPhone, setFullPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  function startCooldown() {
    setResendCooldown(30);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const cleaned = localNumber.replace(/\D/g, "");
    if (cleaned.length < 10) {
      setError("Enter a valid 10-digit phone number.");
      return;
    }

    const phone = `${DEFAULT_COUNTRY_CODE}${cleaned}`;
    setSubmitting(true);
    const { error: otpError } = await requestPhoneOtp(phone);
    setSubmitting(false);

    if (otpError) {
      setError(otpError);
      return;
    }

    setFullPhone(phone);
    setStep("otp");
    startCooldown();
  }

  async function handleVerify(code: string) {
    setError(null);
    setSubmitting(true);
    const { error: verifyError } = await verifyPhoneOtp(fullPhone, code);
    setSubmitting(false);

    if (verifyError) {
      setError(verifyError);
      return;
    }

    onSuccess();
  }

  async function handleResend() {
    if (resendCooldown > 0) return;
    setError(null);
    const { error: otpError } = await requestPhoneOtp(fullPhone);
    if (otpError) {
      setError(otpError);
      return;
    }
    startCooldown();
  }

  if (step === "phone") {
    return (
      <form onSubmit={handleSendOtp} className="flex flex-col gap-5">
        <div className="text-left">
          <label
            htmlFor="phone"
            className="block text-xs tracking-wider text-muted uppercase mb-2"
          >
            Phone Number
          </label>
          <div className="flex gap-2">
            <span className="flex items-center px-4 bg-surface-2 border border-line rounded text-sm text-muted">
              {DEFAULT_COUNTRY_CODE}
            </span>
            <input
              id="phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              placeholder="98765 43210"
              value={localNumber}
              onChange={(e) => setLocalNumber(e.target.value)}
              maxLength={10}
              required
              className="flex-1 bg-surface-2 border border-line rounded px-4 py-3 text-ink text-sm placeholder:text-muted/60 outline-none transition-colors focus:border-ember"
            />
          </div>
        </div>

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
          {submitting ? "Sending code..." : "Send Code"}
        </button>
      </form>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <p className="text-center text-sm text-muted">
        Code sent to <span className="text-ink">{fullPhone}</span>
      </p>

      <OtpInput onComplete={handleVerify} disabled={submitting} />

      {error && (
        <p className="text-sm text-ember bg-ember/10 border border-ember/30 rounded px-3 py-2 text-center">
          {error}
        </p>
      )}

      {submitting && (
        <p className="text-center text-sm text-muted">Verifying...</p>
      )}

      <div className="flex justify-between text-sm">
        <button
          type="button"
          onClick={() => setStep("phone")}
          className="text-muted hover:text-ink"
        >
          ← Change number
        </button>
        <button
          type="button"
          onClick={handleResend}
          disabled={resendCooldown > 0}
          className="text-ember disabled:text-muted disabled:cursor-not-allowed"
        >
          {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
        </button>
      </div>
    </div>
  );
}
