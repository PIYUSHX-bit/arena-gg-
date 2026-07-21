import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";
import PhoneLoginForm from "./PhoneLoginForm";

type Mode = "login" | "signup";
type Method = "email" | "phone";

export default function AuthPage() {
  // Defaults to signup/email — "/" now redirects straight here, so this
  // is the actual create-account form visitors land on, not a login
  // screen or the phone OTP flow.
  const [mode, setMode] = useState<Mode>("signup");
  const [method, setMethod] = useState<Method>("email");
  const [googleError, setGoogleError] = useState<string | null>(null);
  const navigate = useNavigate();

  function handleSuccess() {
    navigate("/dashboard");
  }

  async function handleGoogleLogin() {
    setGoogleError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) setGoogleError(error.message);
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
            {method === "phone"
              ? "Log In / Sign Up"
              : mode === "login"
                ? "Welcome Back"
                : "Join The Arena"}
          </h1>
          <p className="text-muted text-sm mt-2">
            {method === "phone"
              ? "We'll text you a one-time code — no password needed."
              : mode === "login"
                ? "Log in to register for tournaments."
                : "Create an account to start competing."}
          </p>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-2.5 bg-surface-2 border border-line rounded py-3 text-sm font-medium text-ink mb-4 transition-colors hover:border-zone"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.87 2.7-6.62Z"
            />
            <path
              fill="#34A853"
              d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.94v2.33A9 9 0 0 0 9 18Z"
            />
            <path
              fill="#FBBC05"
              d="M3.95 10.7A5.4 5.4 0 0 1 3.68 9c0-.59.1-1.17.27-1.7V4.97H.94A9 9 0 0 0 0 9c0 1.45.35 2.83.94 4.03l3.01-2.33Z"
            />
            <path
              fill="#EA4335"
              d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .94 4.97l3.01 2.33C4.66 5.17 6.65 3.58 9 3.58Z"
            />
          </svg>
          Continue with Google
        </button>

        {googleError && (
          <p className="text-xs text-ember bg-ember/10 border border-ember/30 rounded px-3 py-2 mb-4">
            {googleError}
          </p>
        )}

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-line" />
          <span className="text-xs text-muted uppercase tracking-wide">or</span>
          <div className="flex-1 h-px bg-line" />
        </div>

        {/* Phone is first — it's the primary path for our mobile-first audience */}
        <div className="flex border border-line rounded mb-7 overflow-hidden">
          <button
            type="button"
            onClick={() => setMethod("phone")}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              method === "phone"
                ? "bg-ember text-base"
                : "text-muted hover:text-ink"
            }`}
          >
            Phone
          </button>
          <button
            type="button"
            onClick={() => setMethod("email")}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              method === "email"
                ? "bg-ember text-base"
                : "text-muted hover:text-ink"
            }`}
          >
            Email
          </button>
        </div>

        {method === "phone" ? (
          <PhoneLoginForm onSuccess={handleSuccess} />
        ) : (
          <>
            {mode === "login" ? (
              <LoginForm onSuccess={handleSuccess} />
            ) : (
              <SignupForm onSuccess={handleSuccess} />
            )}

            <p className="text-center text-sm text-muted mt-6">
              {mode === "login" ? "New here?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => setMode(mode === "login" ? "signup" : "login")}
                className="text-ember hover:underline"
              >
                {mode === "login" ? "Create an account" : "Log in"}
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
