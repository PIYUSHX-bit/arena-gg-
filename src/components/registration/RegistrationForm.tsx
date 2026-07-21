import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PartyPopper, Flag } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { createEntry, fetchMyEntryForTournament } from "../../lib/entries";
import { fetchProfile, updateProfile } from "../../lib/profile";
import { fetchWalletBalance, payEntryFromWallet } from "../../lib/wallet";
import type { Tournament, PlayerInfo } from "../../types/tournament";
import SquadMemberInput from "./SquadMemberInput";
import PrizeDetails from "./PrizeDetails";
import TournamentRoster from "./TournamentRoster";
import RoomDetails from "./RoomDetails";
import VoteToBanPanel from "./VoteToBanPanel";

interface RegistrationFormProps {
  tournament: Tournament;
}

type Step = "checking" | "roster" | "payment" | "done" | "completed" | "ended";

function emptyPlayer(): PlayerInfo {
  return { ign: "", uid: "" };
}

export default function RegistrationForm({ tournament }: RegistrationFormProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Registration is always for the player themself — no teammates to
  // fill in on their behalf, regardless of the tournament's mode.
  const [player, setPlayer] = useState<PlayerInfo>(emptyPlayer());
  const [step, setStep] = useState<Step>("checking");
  const [entryId, setEntryId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);

  const totalDue = tournament.entryFee;
  const hasEnoughBalance = walletBalance !== null && walletBalance >= totalDue;

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
        setPlayer((prev) => ({
          ign: profile.ffIgn ?? prev.ign,
          uid: profile.ffUid ?? prev.uid,
        }));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // entries has a unique (tournament_id, user_id) constraint, so a
  // second registration attempt would otherwise just fail with a
  // constraint-violation error after filling out the whole form. Check
  // upfront instead: resume a pending payment, bounce to My Matches if
  // there's genuinely nothing left to do, or — once the match itself
  // has completed — show the post-match vote-to-flag screen instead of
  // redirecting away.
  //
  // Only ever runs once, on first mount (guarded by `step === "checking"`
  // below) — depending on the whole `user` object here would re-run it
  // any time Supabase re-emits a fresh (but equivalent) user object, e.g.
  // on token refresh or a tab regaining focus. Without the guard, that
  // could fire right after payment succeeds and yank the player off the
  // success screen straight to My Matches.
  useEffect(() => {
    if (!user || step !== "checking") return;
    let cancelled = false;

    fetchMyEntryForTournament(tournament.id, user.id).then(({ entry }) => {
      if (cancelled) return;

      if (entry?.status === "confirmed") {
        if (tournament.status === "completed") {
          setStep("completed");
        } else {
          navigate("/matches?status=upcoming", { replace: true });
        }
      } else if (entry?.status === "pending_payment") {
        setEntryId(entry.entryId);
        setStep("payment");
      } else if (tournament.status === "completed") {
        setStep("ended");
      } else {
        setStep("roster");
      }
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, tournament.id, tournament.status, navigate, step]);

  useEffect(() => {
    if (!user || step !== "payment") return;
    fetchWalletBalance(user.id).then(({ balance }) => setWalletBalance(balance));
  }, [user, step]);

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

  async function handleRosterSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!user) {
      setError("You must be logged in to register.");
      return;
    }

    setSubmitting(true);
    // No squad-name input in the UI — the registering player's own IGN
    // identifies the entry (entries.squad_name is still NOT NULL and
    // shown to admins/My Matches, so it needs some value).
    const { entryId: newEntryId, error: createError } = await createEntry({
      tournamentId: tournament.id,
      userId: user.id,
      squadName: player.ign,
      players: [player],
    });

    // Save the player's own IGN/UID back to their profile if it's new or
    // changed, so the next registration auto-fills without retyping.
    if (player.ign !== savedIgn || player.uid !== savedUid) {
      updateProfile(user.id, { ffIgn: player.ign, ffUid: player.uid });
    }

    setSubmitting(false);

    if (createError) {
      setError(createError);
      return;
    }

    setEntryId(newEntryId);
    setStep("payment");
  }

  // Wallet is the primary payment path while Razorpay isn't live yet —
  // see 0030_pay_entry_from_wallet.sql. Swap this back to the Razorpay
  // flow once that's ready.
  async function handlePayment() {
    if (!user || !entryId) return;
    setError(null);
    setSubmitting(true);

    const { error: payError } = await payEntryFromWallet(entryId);

    setSubmitting(false);

    if (payError) {
      setError(payError);
      return;
    }

    setStep("done");
  }

  if (step === "checking") {
    return <p className="text-center text-muted text-sm py-8">Loading...</p>;
  }

  if (step === "ended") {
    return (
      <div className="text-center py-10">
        <p className="text-ink font-medium mb-1">This match has ended</p>
        <p className="text-muted text-sm">
          {tournament.name} is already completed, and you weren't registered
          for it.
        </p>
      </div>
    );
  }

  if (step === "completed") {
    return (
      <div className="flex flex-col gap-6">
        <div className="text-center py-6 px-5 rounded-xl border border-line bg-surface">
          <span className="inline-flex w-12 h-12 rounded-full bg-line/40 items-center justify-center mb-3">
            <Flag size={20} className="text-muted" />
          </span>
          <p className="font-display font-bold text-lg mb-1">Match Completed</p>
          <p className="text-muted text-sm">{tournament.name}</p>
        </div>

        <VoteToBanPanel tournamentId={tournament.id} />
      </div>
    );
  }

  if (step === "done") {
    return (
      <div className="flex flex-col gap-6">
        <div className="relative text-center py-8 px-5 rounded-xl border border-safe/30 bg-gradient-to-br from-safe/10 via-surface to-surface overflow-hidden">
          <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full border border-safe/20" />
          <div className="relative z-[1]">
            <span className="inline-flex w-14 h-14 rounded-full bg-safe/15 items-center justify-center mb-4">
              <PartyPopper size={26} className="text-safe" />
            </span>
            <p className="font-display font-bold text-xl text-safe mb-2">
              You're in the zone!
            </p>
            <p className="text-muted text-sm mb-5 px-2">
              You're registered for <span className="text-ink">{tournament.name}</span>.
              Room ID drops 15 minutes before start.
            </p>
            <button
              onClick={() => navigate("/matches?status=upcoming")}
              className="bg-ember text-base font-semibold text-sm px-5 py-2.5 rounded-full transition-transform hover:-translate-y-0.5"
            >
              View My Matches →
            </button>
          </div>
        </div>

        <RoomDetails tournamentId={tournament.id} startsAtIso={tournament.startsAtIso} />

        <TournamentRoster tournamentId={tournament.id} />
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
            <span className="text-muted">Entry Fee</span>
            <span>₹{totalDue.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between text-base font-semibold pt-3 mt-3 border-t border-line">
            <span>Total Due</span>
            <span className="text-amber">
              ₹{totalDue.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="flex justify-between text-sm pt-3 mt-3 border-t border-line">
            <span className="text-muted">Wallet Balance</span>
            <span className={hasEnoughBalance ? "text-safe" : "text-ember"}>
              {walletBalance === null ? "—" : `₹${walletBalance.toLocaleString("en-IN")}`}
            </span>
          </div>
        </div>

        {walletBalance !== null && !hasEnoughBalance && (
          <p className="text-sm text-ember bg-ember/10 border border-ember/30 rounded px-3 py-2">
            Not enough balance to cover this entry.{" "}
            <button
              type="button"
              onClick={() => navigate("/wallet")}
              className="underline"
            >
              Add money to your wallet →
            </button>
          </p>
        )}

        {error && (
          <p className="text-sm text-ember bg-ember/10 border border-ember/30 rounded px-3 py-2">
            {error}
          </p>
        )}

        <button
          onClick={handlePayment}
          disabled={submitting || !hasEnoughBalance}
          className="bg-ember text-base font-semibold text-[15px] px-8 py-3.5 rounded transition-transform hover:-translate-y-0.5 disabled:opacity-50"
        >
          {submitting ? "Processing..." : `Pay ₹${totalDue.toLocaleString("en-IN")} from Wallet`}
        </button>
        <button
          onClick={() => setStep("roster")}
          className="text-sm text-muted hover:text-ink"
        >
          ← Edit roster
        </button>

        <TournamentRoster tournamentId={tournament.id} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <form onSubmit={handleRosterSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-4">
          <SquadMemberInput value={player} onChange={setPlayer} />
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

      <TournamentRoster tournamentId={tournament.id} />
    </div>
  );
}
