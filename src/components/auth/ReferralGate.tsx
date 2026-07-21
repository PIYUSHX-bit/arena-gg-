import { useEffect, useState, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { fetchProfile } from "../../lib/profile";

interface ReferralGateProps {
  children: ReactNode;
}

// The invite gate: everyone must have redeemed a referral code before
// reaching the rest of the app — except admins, who obviously didn't
// get invited by another player. Runs after ProfileCompletionGuard, so
// by the time this checks, phone/IGN/UID are already guaranteed to
// exist.
export default function ReferralGate({ children }: ReferralGateProps) {
  const { user } = useAuth();
  const [checking, setChecking] = useState(true);
  const [needsCode, setNeedsCode] = useState(false);

  useEffect(() => {
    if (!user) {
      setChecking(false);
      return;
    }

    let cancelled = false;
    fetchProfile(user.id).then(({ profile }) => {
      if (cancelled) return;
      setNeedsCode(!profile?.isAdmin && !profile?.referredBy);
      setChecking(false);
    });

    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!user) {
    return <>{children}</>; // ProtectedRoute (wrapping this) handles the redirect
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-base flex items-center justify-center text-muted text-sm">
        Loading...
      </div>
    );
  }

  if (needsCode) {
    return <Navigate to="/redeem-code" replace />;
  }

  return <>{children}</>;
}
