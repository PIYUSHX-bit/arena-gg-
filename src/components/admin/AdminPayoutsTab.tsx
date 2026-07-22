import { useEffect, useState } from "react";
import { Zap } from "lucide-react";
import {
  fetchAllTournaments,
  fetchTournamentEntries,
  payEntryPrize,
  type AdminTournament,
  type TournamentEntry,
} from "../../lib/admin";
import { GAME_MODES } from "../../lib/gameModes";
import type { PrizeTier } from "../../types/tournament";

function formatRupees(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

// Matches the "1st" / "2nd" / "3rd" / "4th"... labels stored in a
// tournament's prize_distribution, so a typed-in placement number can be
// looked up against it automatically.
function ordinalLabel(n: number): string {
  const v = n % 100;
  if (v >= 11 && v <= 13) return `${n}th`;
  switch (n % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
}

function placementPrize(
  placement: string,
  prizeDistribution: PrizeTier[]
): number {
  const n = Number(placement);
  if (!n || n <= 0) return 0;
  const label = ordinalLabel(n).toLowerCase();
  const tier = prizeDistribution.find(
    (t) => t.label.trim().toLowerCase() === label
  );
  return tier?.amount ?? 0;
}

type Filter = "unpaid" | "paid" | "all";

export default function AdminPayoutsTab() {
  const [tournaments, setTournaments] = useState<AdminTournament[]>([]);
  const [tournamentId, setTournamentId] = useState("");
  const [entries, setEntries] = useState<TournamentEntry[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("unpaid");
  const [activeCategory, setActiveCategory] = useState<string>("all");

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
    setFilter("unpaid");
    if (id) loadEntries(id);
    else setEntries([]);
  }

  const selectedTournament = tournaments.find((t) => t.id === tournamentId);

  const unpaidEntries = entries.filter((e) => e.prizeWon <= 0);
  const paidEntries = entries.filter((e) => e.prizeWon > 0);
  const totalPaidOut = paidEntries.reduce((sum, e) => sum + e.prizeWon, 0);

  const visibleEntries =
    filter === "unpaid" ? unpaidEntries : filter === "paid" ? paidEntries : entries;

  const modeCounts = GAME_MODES.map((mode) => ({
    mode,
    count: tournaments.filter((t) => t.category === mode.id).length,
  }));

  const tournamentsInCategory =
    activeCategory === "all"
      ? tournaments
      : tournaments.filter((t) => t.category === activeCategory);

  function handleCategoryChange(category: string) {
    setActiveCategory(category);
    // Selecting a category narrows the dropdown — if the currently
    // selected match falls outside it, clear the selection instead of
    // silently showing entries for a match no longer in view.
    const stillVisible = tournaments.some(
      (t) =>
        t.id === tournamentId &&
        (category === "all" || t.category === category)
    );
    if (!stillVisible) handleTournamentChange("");
  }

  return (
    <div className="flex flex-col gap-4">
      {tournaments.length > 0 && (
        <div className="-mx-4 px-4 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 pb-1 w-max">
            <button
              onClick={() => handleCategoryChange("all")}
              className={`flex items-center gap-1.5 shrink-0 rounded-full px-3.5 py-2 text-xs font-semibold border transition-colors ${
                activeCategory === "all"
                  ? "bg-ink text-base border-ink"
                  : "border-line text-muted hover:text-ink"
              }`}
            >
              All
              <span
                className={`text-[10px] font-bold rounded-full px-1.5 ${
                  activeCategory === "all"
                    ? "bg-base/20 text-base"
                    : "bg-surface-2 text-muted"
                }`}
              >
                {tournaments.length}
              </span>
            </button>

            {modeCounts.map(({ mode, count }) => {
              if (count === 0) return null;
              const Icon = mode.icon;
              const active = activeCategory === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => handleCategoryChange(mode.id)}
                  className={`flex items-center gap-1.5 shrink-0 rounded-full px-3.5 py-2 text-xs font-semibold border transition-colors ${
                    active
                      ? `bg-gradient-to-br ${mode.accentFrom} ${mode.accentTo} text-white border-transparent`
                      : "border-line text-muted hover:text-ink"
                  }`}
                >
                  <Icon size={13} />
                  {mode.category}
                  <span
                    className={`text-[10px] font-bold rounded-full px-1.5 ${
                      active ? "bg-white/20 text-white" : "bg-surface-2 text-muted"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

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
          {tournamentsInCategory.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} ({t.status})
            </option>
          ))}
        </select>
      </div>

      {selectedTournament && (
        <div className="bg-surface border border-line rounded-lg px-4 py-3.5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-semibold">
              {selectedTournament.name}
            </span>
            <span
              className={`text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded ${
                selectedTournament.isActive
                  ? "bg-safe/15 text-safe"
                  : "bg-line/40 text-muted"
              }`}
            >
              {selectedTournament.isActive ? "Active" : "Draft"} ·{" "}
              {selectedTournament.status}
            </span>
          </div>
          <div className="text-xs text-muted mb-2.5">
            {selectedTournament.map} · {selectedTournament.mode} · Slots{" "}
            {selectedTournament.slotsFilled}/{selectedTournament.slotsTotal}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-mono text-amber mb-2.5">
            <span>Entry {formatRupees(selectedTournament.entryFee)}</span>
            <span>Prize Pool {formatRupees(selectedTournament.prizePool)}</span>
            <span>Per Kill {formatRupees(selectedTournament.perKill)}</span>
          </div>
          {selectedTournament.prizeDistribution.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {selectedTournament.prizeDistribution.map((tier) => (
                <span
                  key={tier.label}
                  className="text-[10px] font-mono bg-surface-2 border border-line rounded px-1.5 py-0.5 text-muted"
                >
                  {tier.label} ₹{tier.amount}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

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

      {!loadingEntries && entries.length > 0 && (
        <>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-surface border border-line rounded-lg px-3 py-2.5">
              <p className="text-[10px] text-muted uppercase tracking-wide mb-0.5">
                Entries
              </p>
              <p className="text-sm font-mono font-semibold">
                {entries.length}
              </p>
            </div>
            <div className="bg-surface border border-amber/30 rounded-lg px-3 py-2.5">
              <p className="text-[10px] text-muted uppercase tracking-wide mb-0.5">
                Unpaid
              </p>
              <p className="text-sm font-mono font-semibold text-amber">
                {unpaidEntries.length}
              </p>
            </div>
            <div className="bg-surface border border-safe/30 rounded-lg px-3 py-2.5">
              <p className="text-[10px] text-muted uppercase tracking-wide mb-0.5">
                Paid Out
              </p>
              <p className="text-sm font-mono font-semibold text-safe">
                {formatRupees(totalPaidOut)}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            {(["unpaid", "paid", "all"] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 rounded-full py-2 text-xs font-semibold capitalize border transition-colors ${
                  filter === f
                    ? "bg-ink text-base border-ink"
                    : "border-line text-muted hover:text-ink"
                }`}
              >
                {f === "unpaid"
                  ? `Unpaid (${unpaidEntries.length})`
                  : f === "paid"
                    ? `Paid (${paidEntries.length})`
                    : `All (${entries.length})`}
              </button>
            ))}
          </div>
        </>
      )}

      {!loadingEntries && entries.length > 0 && visibleEntries.length === 0 && (
        <p className="text-center text-muted text-sm py-10">
          {filter === "unpaid"
            ? "Every entry has been paid."
            : "No entries in this view."}
        </p>
      )}

      {!loadingEntries &&
        visibleEntries.map((entry) => (
          <PayoutRow
            key={entry.id}
            entry={entry}
            perKill={selectedTournament?.perKill ?? 0}
            prizeDistribution={selectedTournament?.prizeDistribution ?? []}
            onPaid={() => loadEntries(tournamentId)}
          />
        ))}
    </div>
  );
}

function PayoutRow({
  entry,
  perKill,
  prizeDistribution,
  onPaid,
}: {
  entry: TournamentEntry;
  perKill: number;
  prizeDistribution: PrizeTier[];
  onPaid: () => void;
}) {
  const [kills, setKills] = useState(String(entry.kills || ""));
  const [placement, setPlacement] = useState(String(entry.placement ?? ""));
  const [prizeAmount, setPrizeAmount] = useState("");
  const [prizeOverridden, setPrizeOverridden] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  const alreadyPaid = entry.prizeWon > 0;

  const killCash = (Number(kills) || 0) * perKill;
  const rankCash = placementPrize(placement, prizeDistribution);
  const autoTotal = killCash + rankCash;

  // Listing is fully automatic: as soon as kills or placement change, the
  // prize field recalculates from the match's per-kill rate and prize
  // distribution. The admin can still type over it for a one-off
  // adjustment — that just stops the auto-recalc from overwriting them
  // until they hit "Reset to auto".
  useEffect(() => {
    if (!prizeOverridden) {
      setPrizeAmount(autoTotal > 0 ? String(autoTotal) : "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoTotal, prizeOverridden]);

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
    setConfirming(false);

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
            Paid {formatRupees(entry.prizeWon)}
          </span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2 mb-2">
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
                onChange={(e) => {
                  setPrizeOverridden(true);
                  setPrizeAmount(e.target.value);
                }}
                placeholder="0"
                className={`w-full bg-surface-2 border rounded px-2 py-2 text-sm outline-none focus:border-ember ${
                  prizeOverridden ? "border-amber/50" : "border-line"
                }`}
              />
            </div>
          </div>

          {(perKill > 0 || rankCash > 0) && (
            <div className="flex items-center gap-1.5 text-[11px] text-muted mb-3">
              <Zap size={11} className="text-zone shrink-0" />
              <span>
                Auto: {kills || 0} kills × {formatRupees(perKill)}
                {rankCash > 0 && <> + rank bonus {formatRupees(rankCash)}</>} ={" "}
                <span className="font-mono text-zone">
                  {formatRupees(autoTotal)}
                </span>
              </span>
              {prizeOverridden && (
                <button
                  onClick={() => {
                    setPrizeOverridden(false);
                    setPrizeAmount(autoTotal > 0 ? String(autoTotal) : "");
                  }}
                  className="shrink-0 text-ember font-medium underline ml-auto"
                >
                  Reset to auto
                </button>
              )}
            </div>
          )}

          {error && (
            <p className="text-xs text-ember bg-ember/10 border border-ember/30 rounded px-3 py-2 mb-3">
              {error}
            </p>
          )}

          {confirming ? (
            <div className="border border-ember/40 bg-ember/10 rounded p-3 flex flex-col gap-2">
              <p className="text-xs text-ink">
                Pay <span className="font-mono font-semibold">
                  {formatRupees(Number(prizeAmount) || 0)}
                </span>{" "}
                to <span className="font-medium">{entry.squadName}</span>?
                This credits their wallet immediately.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handlePay}
                  disabled={submitting}
                  className="flex-1 bg-ember text-base font-semibold text-sm py-2 rounded disabled:opacity-50"
                >
                  {submitting ? "Processing..." : "Confirm Payment"}
                </button>
                <button
                  onClick={() => setConfirming(false)}
                  disabled={submitting}
                  className="px-4 border border-line rounded text-sm text-muted disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setConfirming(true)}
              disabled={!prizeAmount || Number(prizeAmount) <= 0}
              className="w-full bg-ember text-base font-semibold text-sm py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Pay Winnings
            </button>
          )}
        </>
      )}
    </div>
  );
}
