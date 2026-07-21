import { useEffect, useState, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { fetchProfile } from "../../lib/profile";

interface ProfileCompletionGuardProps {
  children: ReactNode;
}

// Google sign-ins never provide a phone number or Free Fire IGN/UID —
// those only ever come from the email/password signup form (see
// SignupForm.tsx) or CompleteProfilePage. This catches any account
// missing one of the three and routes it to fill them in before it can
// reach the rest of the app.
export default function ProfileCompletionGuard({
  children,
}: ProfileCompletionGuardProps) {
  const { user } = useAuth();
  const [checking, setChecking] = useState(true);
  const [incomplete, setIncomplete] = useState(false);

  useEffect(() => {
    if (!user) {
      setChecking(false);
      return;
    }

    let cancelled = false;
    fetchProfile(user.id).then(({ profile }) => {
      if (cancelled) return;
      setIncomplete(
        !profile?.phoneNumber || !profile?.ffIgn || !profile?.ffUid
      );
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

  if (incomplete) {
    return <Navigate to="/complete-profile" replace />;
  }

  return <>{children}</>;
}
