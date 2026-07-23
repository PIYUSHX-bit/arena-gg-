import { useState, type FormEvent } from "react";
import { useAuth } from "../../context/AuthContext";
import AuthInput from "./AuthInput";

interface SignupFormProps {
  onSuccess: () => void;
}

export default function SignupForm({ onSuccess }: SignupFormProps) {
  const { signUp } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [ffIgn, setFfIgn] = useState("");
  const [ffUid, setFfUid] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmSent, setConfirmSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (!ffIgn.trim()) {
      setError("Free Fire IGN is required.");
      return;
    }

    if (!ffUid.trim()) {
      setError("Free Fire UID is required.");
      return;
    }

    if (!phoneNumber.trim()) {
      setError("Phone number is required.");
      return;
    }

    setSubmitting(true);
    const { error: signUpError, needsEmailConfirmation } = await signUp(
      email,
      password,
      displayName,
      ffIgn.trim(),
      ffUid.trim(),
      phoneNumber.trim()
    );
    setSubmitting(false);

    if (signUpError) {
      setError(signUpError);
      return;
    }

    // If Supabase requires email confirmation, there's no session yet —
    // navigating now would just get bounced straight back to /login by
    // ProtectedRoute with no explanation. Show the "check your email"
    // message instead and let the user come back once confirmed.
    if (needsEmailConfirmation) {
      setConfirmSent(true);
      return;
    }

    onSuccess();
  }

  if (confirmSent) {
    return (
      <div className="text-center py-4">
        <p className="text-safe text-sm mb-2">Squad tag reserved.</p>
        <p className="text-muted text-sm">
          Check <span className="text-ink">{email}</span> to confirm your
          account before your first match.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <AuthInput
        id="signup-name"
        label="In-game name"
        type="text"
        autoComplete="nickname"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        required
        maxLength={24}
      />
      <AuthInput
        id="signup-ff-ign"
        label="Free Fire IGN"
        type="text"
        value={ffIgn}
        onChange={(e) => setFfIgn(e.target.value)}
        placeholder="Your exact in-game name"
        required
        maxLength={24}
      />
      <AuthInput
        id="signup-ff-uid"
        label="Free Fire UID"
        type="text"
        inputMode="numeric"
        value={ffUid}
        onChange={(e) => setFfUid(e.target.value.replace(/\D/g, ""))}
        placeholder="123456789"
        required
        maxLength={12}
      />
      <AuthInput
        id="signup-phone"
        label="Phone Number"
        type="tel"
        autoComplete="tel"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        placeholder="+91 98765 43210"
        required
      />
      <AuthInput
        id="signup-email"
        label="Email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <AuthInput
        id="signup-password"
        label="Password"
        type="password"
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={6}
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
        {submitting ? "Creating squad tag..." : "Create Account"}
      </button>
    </form>
  );
}
