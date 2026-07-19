import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";
import PhoneLoginForm from "./PhoneLoginForm";

type Mode = "login" | "signup";
type Method = "email" | "phone";

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [method, setMethod] = useState<Method>("phone");
  const navigate = useNavigate();

  function handleSuccess() {
    navigate("/");
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
