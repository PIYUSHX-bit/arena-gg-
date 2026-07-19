import { useState, type FormEvent } from "react";
import { useAuth } from "../../context/AuthContext";
import AuthInput from "./AuthInput";

interface SignupFormProps {
  onSuccess: () => void;
}

export default function SignupForm({ onSuccess }: SignupFormProps) {
  const { signUp } = useAuth();
  const [displayName, setDisplayName] = useState("");
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

    setSubmitting(true);
    const { error: signUpError } = await signUp(email, password, displayName);
    setSubmitting(false);

    if (signUpError) {
      setError(signUpError);
      return;
    }

    // Supabase sends a confirmation email by default. If email confirmation
    // is disabled in your Supabase Auth settings, call onSuccess() directly
    // instead of showing this message.
    setConfirmSent(true);
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
