import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { createEntry } from "../../lib/entries";
import { supabase } from "../../lib/supabaseClient";
import { openRazorpayCheckout } from "../../lib/razorpay";
import { fetchProfile, updateProfile } from "../../lib/profile";
import { PLAYERS_PER_MODE } from "../../types/tournament";
import type { Tournament, PlayerInfo } from "../../types/tournament";
import SquadMemberInput from "./SquadMemberInput";
import PrizeDetails from "./PrizeDetails";

interface RegistrationFormProps {
  tournament: Tournament;
}

type Step = "roster" | "payment" | "done";

function emptyPlayer(): PlayerInfo {
  return { ign: "", uid: "" };
}

export default function RegistrationForm({ tournament }: RegistrationFormProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const playerCount = PLAYERS_PER_MODE[tournament.mode];

  const [squadName, setSquadName] = useState("");
  const [players, setPlayers] = useState<PlayerInfo[]>(
    Array.from({ length: playerCount }, emptyPlayer)
  );
  const [step, setStep] = useState<Step>("roster");
  const [entryId, setEntryId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const totalDue = tournament.entryFee * playerCount;

  // Cache the saved values so handleRosterSubmit can tell whether the
  // player typed something new that's worth writing back to the profile.
  const [savedIgn, setSavedIgn] = useState<string | null>(null);
  const [savedUid, setSavedUid] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    fetchProfile(user.id).then(({ profile }) => {
      setSavedIgn(profile?.ffIgn ?? null);
      setSavedUid(profile?.ffUid ?? null);
      if (profile?.ffIgn || profile?.ffUid) {
        setPlayers((prev) => {
          const next = [...prev];
          next[0] = {
            ign: profile.ffIgn ?? next[0].ign,
            uid: profile.ffUid ?? next[0].uid,
          };
          return next;
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-ink mb-2">You need to be logged in to register.</p>
        <a href="/login" className="text-ember hover:underline text-sm">
          Log in or create an account →
        </a>
      </div>
    );
  }

  function updatePlayer(index: number, value: PlayerInfo) {
    const next = [...players];
    next[index] = value;
    setPlayers(next);
  }

  async function handleRosterSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!user) {
      setError("You must be logged in to register.");
      return;
    }

    const uids = players.map((p) => p.uid);
    if (new Set(uids).size !== uids.length) {
      setError("Each player must have a unique Free Fire UID.");
      return;
    }

    setSubmitting(true);
    const { entryId: newEntryId, error: createError } = await createEntry({
      tournamentId: tournament.id,
      userId: user.id,
      squadName,
      players,
    });

    // Save the player's own IGN/UID back to their profile if it's new or
    // changed, so the next registration auto-fills without retyping.
    const self = players[0];
    if (self.ign !== savedIgn || self.uid !== savedUid) {
      updateProfile(user.id, { ffIgn: self.ign, ffUid: self.uid });
    }

    setSubmitting(false);

    if (createError) {
      setError(createError);
      return;
    }

    setEntryId(newEntryId);
    setStep("payment");
  }

  async function handlePayment() {
    if (!user) return;
    setError(null);
    setSubmitting(true);

    try {
      const { data: orderData, error: orderError } =
        await supabase.functions.invoke("create-razorpay-order", {
          body: { entryId },
        });

      if (orderError || orderData?.error) {
        throw new Error(orderData?.error ?? orderError?.message ?? "Could not start payment");
      }

      const { orderId, amount, currency, keyId } = orderData;

      await openRazorpayCheckout({
        key: keyId,
        amount,
        currency,
        order_id: orderId,
        name: "ARENA.GG",
        description: `${tournament.name} — ${squadName}`,
        prefill: {
          email: user.email ?? undefined,
          contact: user.phone ?? undefined,
        },
        theme: { color: "#FF4A1C" },
        onSuccess: async (response) => {
          const { data: verifyData, error: verifyError } =
            await supabase.functions.invoke("verify-razorpay-payment", {
              body: {
                entryId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
            });

          setSubmitting(false);

          if (verifyError || verifyData?.error) {
            setError(
              verifyData?.error ??
                "Payment succeeded but verification failed — contact support with your payment ID: " +
                  response.razorpay_payment_id
            );
            return;
          }

          setStep("done");
        },
        onDismiss: () => {
          // User closed the Razorpay widget without paying
          setSubmitting(false);
        },
      });
    } catch (err) {
      setSubmitting(false);
      setError(err instanceof Error ? err.message : "Payment failed to start.");
    }
  }

  if (step === "done") {
    return (
      <div className="text-center py-8">
        <p className="text-safe text-lg mb-2">You're in the zone.</p>
        <p className="text-muted text-sm mb-6">
          {squadName} is registered for {tournament.name}. Room ID drops 15
          minutes before start.
        </p>
        <button
          onClick={() => navigate("/matches?status=upcoming")}
          className="text-ember text-sm hover:underline"
        >
          View My Matches →
        </button>
      </div>
    );
  }

  if (step === "payment") {
    return (
      <div className="flex flex-col gap-5">
        <div className="border border-line rounded-lg p-5">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted">Tournament</span>
            <span>{tournament.name}</span>
          </div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted">Squad</span>
            <span>{squadName}</span>
          </div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted">
              {playerCount} × ₹{tournament.entryFee}
            </span>
            <span>₹{totalDue.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between text-base font-semibold pt-3 mt-3 border-t border-line">
            <span>Total Due</span>
            <span className="text-amber">
              ₹{totalDue.toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        {error && (
          <p className="text-sm text-ember bg-ember/10 border border-ember/30 rounded px-3 py-2">
            {error}
          </p>
        )}

        <button
          onClick={handlePayment}
          disabled={submitting}
          className="bg-ember text-base font-semibold text-[15px] px-8 py-3.5 rounded transition-transform hover:-translate-y-0.5 disabled:opacity-50"
        >
          {submitting ? "Processing..." : `Pay ₹${totalDue.toLocaleString("en-IN")}`}
        </button>
        <button
          onClick={() => setStep("roster")}
          className="text-sm text-muted hover:text-ink"
        >
          ← Edit roster
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleRosterSubmit} className="flex flex-col gap-5">
      <div>
        <label className="block text-xs tracking-wider text-muted uppercase mb-1.5">
          Squad Name
        </label>
        <input
          type="text"
          value={squadName}
          onChange={(e) => setSquadName(e.target.value)}
          placeholder="e.g. Team Vortex"
          required
          maxLength={30}
          className="w-full bg-surface-2 border border-line rounded px-4 py-3 text-sm outline-none transition-colors focus:border-ember"
        />
      </div>

      <div className="flex flex-col gap-4">
        {players.map((player, i) => (
          <SquadMemberInput
            key={i}
            index={i}
            value={player}
            onChange={(value) => updatePlayer(i, value)}
            isSelf={i === 0}
          />
        ))}
      </div>

      {error && (
        <p className="text-sm text-ember bg-ember/10 border border-ember/30 rounded px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="bg-ember text-base font-semibold text-[15px] px-8 py-3.5 rounded transition-transform hover:-translate-y-0.5 disabled:opacity-50"
      >
        {submitting ? "Saving roster..." : "Continue to Payment"}
      </button>

      <PrizeDetails tiers={tournament.prizeDistribution} />
    </form>
  );
}
