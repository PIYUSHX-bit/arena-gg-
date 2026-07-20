import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { createEntry, fetchMyEntryForTournament } from "../../lib/entries";
import { fetchProfile, updateProfile } from "../../lib/profile";
import { fetchWalletBalance, payEntryFromWallet } from "../../lib/wallet";
import { PLAYERS_PER_MODE } from "../../types/tournament";
import type { Tournament, PlayerInfo } from "../../types/tournament";
import SquadMemberInput from "./SquadMemberInput";
import PrizeDetails from "./PrizeDetails";
import TournamentRoster from "./TournamentRoster";

interface RegistrationFormProps {
  tournament: Tournament;
}

type Step = "checking" | "roster" | "payment" | "already-joined" | "done";

function emptyPlayer(): PlayerInfo {
  return { ign: "", uid: "" };
}

export default function RegistrationForm({ tournament }: RegistrationFormProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const playerCount = PLAYERS_PER_MODE[tournament.mode];

  const [players, setPlayers] = useState<PlayerInfo[]>(
    Array.from({ length: playerCount }, emptyPlayer)
  );
  const [step, setStep] = useState<Step>("checking");
  const [entryId, setEntryId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);

  const totalDue = tournament.entryFee * playerCount;
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

  // entries has a unique (tournament_id, user_id) constraint, so a
  // second registration attempt would otherwise just fail with a
  // constraint-violation error after filling out the whole form. Check
  // upfront instead: resume a pending payment, or show "already joined".
  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    fetchMyEntryForTournament(tournament.id, user.id).then(({ entry }) => {
      if (cancelled) return;

      if (entry?.status === "confirmed") {
        setStep("already-joined");
      } else if (entry?.status === "pending_payment") {
        setEntryId(entry.entryId);
        setStep("payment");
      } else {
        setStep("roster");
      }
    });

    return () => {
      cancelled = true;
    };
  }, [user, tournament.id]);

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
    // No squad-name input in the UI — the registering player's own IGN
    // identifies the entry (entries.squad_name is still NOT NULL and
    // shown to admins/My Matches, so it needs some value).
    const { entryId: newEntryId, error: createError } = await createEntry({
      tournamentId: tournament.id,
      userId: user.id,
      squadName: players[0].ign,
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

  if (step === "already-joined") {
    return (
      <div className="flex flex-col gap-5">
        <div className="text-center py-6 border border-safe/30 bg-safe/10 rounded-lg">
          <p className="text-safe text-lg mb-2">You're already in ✓</p>
          <p className="text-muted text-sm px-4">
            You've already registered for {tournament.name}. Room ID drops
            15 minutes before start.
          </p>
          <button
            onClick={() => navigate("/matches?status=upcoming")}
            className="text-ember text-sm hover:underline mt-3"
          >
            View My Matches →
          </button>
        </div>

        <TournamentRoster tournamentId={tournament.id} />
      </div>
    );
  }

  if (step === "done") {
    return (
      <div className="flex flex-col gap-5">
        <div className="text-center py-8">
          <p className="text-safe text-lg mb-2">You're in the zone.</p>
          <p className="text-muted text-sm mb-6">
            You're registered for {tournament.name}. Room ID drops 15 minutes
            before start.
          </p>
          <button
            onClick={() => navigate("/matches?status=upcoming")}
            className="text-ember text-sm hover:underline"
          >
            View My Matches →
          </button>
        </div>

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

      <TournamentRoster tournamentId={tournament.id} />
    </div>
  );
}
