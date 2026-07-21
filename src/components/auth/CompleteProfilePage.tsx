import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { fetchProfile, updateProfile } from "../../lib/profile";
import ProfileField from "../profile/ProfileField";

// Where Google sign-ins (and anyone else missing these) land — Google
// never provides a phone number or Free Fire IGN/UID, so this is
// mandatory before the rest of the app becomes reachable (see
// ProfileCompletionGuard).
export default function CompleteProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [ffIgn, setFfIgn] = useState("");
  const [ffUid, setFfUid] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    fetchProfile(user.id).then(({ profile }) => {
      if (profile) {
        setFfIgn(profile.ffIgn ?? "");
        setFfUid(profile.ffUid ?? "");
        setPhoneNumber(profile.phoneNumber ?? "");
      }
      setLoading(false);
    });
  }, [user]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

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
    if (!user) return;

    setSubmitting(true);
    const { error: updateError } = await updateProfile(user.id, {
      ffIgn: ffIgn.trim(),
      ffUid: ffUid.trim(),
      phoneNumber: phoneNumber.trim(),
    });
    setSubmitting(false);

    if (updateError) {
      setError(updateError);
      return;
    }

    navigate("/dashboard", { replace: true });
  }

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-base flex items-center justify-center text-muted text-sm">
        Loading...
      </div>
    );
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
            Complete Your Profile
          </h1>
          <p className="text-muted text-sm mt-2">
            A few more details before you can join tournaments.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <ProfileField
            id="complete-ff-ign"
            label="Free Fire IGN"
            type="text"
            value={ffIgn}
            onChange={(e) => setFfIgn(e.target.value)}
            placeholder="Your exact in-game name"
            required
            maxLength={24}
          />
          <ProfileField
            id="complete-ff-uid"
            label="Free Fire UID"
            type="text"
            inputMode="numeric"
            value={ffUid}
            onChange={(e) => setFfUid(e.target.value.replace(/\D/g, ""))}
            placeholder="123456789"
            required
            maxLength={12}
          />
          <ProfileField
            id="complete-phone"
            label="Phone Number"
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+91 98765 43210"
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
            {submitting ? "Saving..." : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
