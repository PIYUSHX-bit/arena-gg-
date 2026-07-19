import { useEffect, useState } from "react";
import {
  fetchAllTournaments,
  fetchTournamentEntries,
  payEntryPrize,
  type AdminTournament,
  type TournamentEntry,
} from "../../lib/admin";

export default function AdminPayoutsTab() {
  const [tournaments, setTournaments] = useState<AdminTournament[]>([]);
  const [tournamentId, setTournamentId] = useState("");
  const [entries, setEntries] = useState<TournamentEntry[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAllTournaments().then(({ tournaments: t }) => setTournaments(t));
  }, []);

  async function loadEntries(id: string) {
    setLoadingEntries(true);
    const { entries: e, error: err } = await fetchTournamentEntries(id);
    setEntries(e);
    setError(err);
    setLoadingEntries(false);
  }

  function handleTournamentChange(id: string) {
    setTournamentId(id);
    if (id) loadEntries(id);
    else setEntries([]);
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="block text-xs tracking-wider text-muted uppercase mb-1.5">
          Select Match
        </label>
        <select
          value={tournamentId}
          onChange={(e) => handleTournamentChange(e.target.value)}
          className="w-full bg-surface-2 border border-line rounded px-3 py-2.5 text-sm outline-none focus:border-ember"
        >
          <option value="">Choose a match...</option>
          {tournaments.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} ({t.status})
            </option>
          ))}
        </select>
      </div>

      {loadingEntries && (
        <p className="text-center text-muted text-sm py-8">Loading...</p>
      )}

      {error && (
        <p className="text-xs text-ember bg-ember/10 border border-ember/30 rounded px-3 py-2">
          {error}
        </p>
      )}

      {!loadingEntries && tournamentId && entries.length === 0 && !error && (
        <p className="text-center text-muted text-sm py-10">
          No confirmed entries for this match.
        </p>
      )}

      {!loadingEntries &&
        entries.map((entry) => (
          <PayoutRow
            key={entry.id}
            entry={entry}
            onPaid={() => loadEntries(tournamentId)}
          />
        ))}
    </div>
  );
}

function PayoutRow({
  entry,
  onPaid,
}: {
  entry: TournamentEntry;
  onPaid: () => void;
}) {
  const [kills, setKills] = useState(String(entry.kills || ""));
  const [placement, setPlacement] = useState(String(entry.placement ?? ""));
  const [prizeAmount, setPrizeAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const alreadyPaid = entry.prizeWon > 0;

  async function handlePay() {
    setError(null);
    setSubmitting(true);
    const { error: payError } = await payEntryPrize(
      entry.id,
      Number(kills) || 0,
      placement ? Number(placement) : null,
      Number(prizeAmount) || 0
    );
    setSubmitting(false);

    if (payError) {
      setError(payError);
      return;
    }

    onPaid();
  }

  return (
    <div className="bg-surface border border-line rounded-lg px-4 py-3.5">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium">{entry.squadName}</span>
        <span className="text-xs text-muted">{entry.displayName}</span>
      </div>
      <div className="text-xs text-muted mb-3">
        {entry.players.map((p) => `${p.ign} (${p.uid})`).join(", ")}
      </div>

      {alreadyPaid ? (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">
            Kills: {entry.kills} · Placement:{" "}
            {entry.placement ? `#${entry.placement}` : "—"}
          </span>
          <span className="text-safe font-mono">
            Paid ₹{entry.prizeWon.toLocaleString("en-IN")}
          </span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div>
              <label className="block text-[10px] text-muted uppercase mb-1">
                Kills
              </label>
              <input
                type="number"
                inputMode="numeric"
                value={kills}
                onChange={(e) => setKills(e.target.value)}
                className="w-full bg-surface-2 border border-line rounded px-2 py-2 text-sm outline-none focus:border-ember"
              />
            </div>
            <div>
              <label className="block text-[10px] text-muted uppercase mb-1">
                Placement
              </label>
              <input
                type="number"
                inputMode="numeric"
                value={placement}
                onChange={(e) => setPlacement(e.target.value)}
                placeholder="e.g. 1"
                className="w-full bg-surface-2 border border-line rounded px-2 py-2 text-sm outline-none focus:border-ember"
              />
            </div>
            <div>
              <label className="block text-[10px] text-muted uppercase mb-1">
                Prize (₹)
              </label>
              <input
                type="number"
                inputMode="numeric"
                value={prizeAmount}
                onChange={(e) => setPrizeAmount(e.target.value)}
                placeholder="0"
                className="w-full bg-surface-2 border border-line rounded px-2 py-2 text-sm outline-none focus:border-ember"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-ember bg-ember/10 border border-ember/30 rounded px-3 py-2 mb-3">
              {error}
            </p>
          )}

          <button
            onClick={handlePay}
            disabled={submitting}
            className="w-full bg-ember text-base font-semibold text-sm py-2 rounded disabled:opacity-50"
          >
            {submitting ? "Processing..." : "Pay Winnings"}
          </button>
        </>
      )}
    </div>
  );
}
