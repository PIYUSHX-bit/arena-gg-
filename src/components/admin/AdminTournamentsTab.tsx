import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import {
  fetchAllTournaments,
  createTournament,
  updateTournament,
  setTournamentActive,
  type AdminTournament,
} from "../../lib/admin";
import { GAME_MODES, getGameModeById } from "../../lib/gameModes";
import TournamentForm from "./TournamentForm";
import AdminRoomEditor from "./AdminRoomEditor";

function formatRupees(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export default function AdminTournamentsTab() {
  const [tournaments, setTournaments] = useState<AdminTournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [roomEditorId, setRoomEditorId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { tournaments: t, error: err } = await fetchAllTournaments();
    setTournaments(t);
    setError(err);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(input: Parameters<typeof createTournament>[0]) {
    const { error: createError } = await createTournament(input);
    if (!createError) {
      setCreating(false);
      load();
    }
    return { error: createError };
  }

  async function handleUpdate(
    id: string,
    input: Parameters<typeof updateTournament>[1]
  ) {
    const { error: updateError } = await updateTournament(id, input);
    if (!updateError) {
      setEditingId(null);
      load();
    }
    return { error: updateError };
  }

  async function handleToggleActive(t: AdminTournament) {
    const nextActive = !t.isActive;
    // Optimistic — flip immediately, reconcile with a reload after.
    setTournaments((prev) =>
      prev.map((row) => (row.id === t.id ? { ...row, isActive: nextActive } : row))
    );
    const { error: toggleError } = await setTournamentActive(t.id, nextActive);
    if (toggleError) {
      setError(toggleError);
      load();
    }
  }

  function renderCard(t: AdminTournament) {
    if (editingId === t.id) {
      return (
        <TournamentForm
          key={t.id}
          initial={t}
          onSubmit={(input) => handleUpdate(t.id, input)}
          onCancel={() => setEditingId(null)}
        />
      );
    }

    return (
      <div
        key={t.id}
        className={`bg-surface border rounded-lg px-4 py-3.5 ${
          t.isActive ? "border-line" : "border-line opacity-60"
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium">{t.name}</span>
          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded ${
                t.isActive ? "bg-safe/15 text-safe" : "bg-line/40 text-muted"
              }`}
            >
              {t.isActive ? "Active" : "Draft"}
            </span>
            <span className="text-[11px] uppercase tracking-wide text-muted">
              {t.status}
            </span>
          </div>
        </div>
        <div className="text-xs text-muted mb-2.5">
          {t.map} · {t.slotsFilled}/{t.slotsTotal}
        </div>
        <div className="text-xs font-mono text-amber mb-2.5">
          Entry {formatRupees(t.entryFee)} · Prize{" "}
          {formatRupees(t.prizePool)} · Kill {formatRupees(t.perKill)}
        </div>
        <div className="flex items-center justify-between">
          <button
            onClick={() => handleToggleActive(t)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
              t.isActive ? "border border-line text-muted" : "bg-safe text-base"
            }`}
          >
            {t.isActive ? "Deactivate" : "Activate"}
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setRoomEditorId(roomEditorId === t.id ? null : t.id)}
              className="text-xs text-zone font-medium"
            >
              {roomEditorId === t.id ? "Hide Room" : "Room ID"}
            </button>
            <button
              onClick={() => {
                setEditingId(t.id);
                setCreating(false);
              }}
              className="text-xs text-ember font-medium"
            >
              Edit
            </button>
          </div>
        </div>

        {roomEditorId === t.id && <AdminRoomEditor tournamentId={t.id} />}
      </div>
    );
  }

  // Grouped by game mode so matches from different categories (Free Entry,
  // Lone Wolf, Clash Squad, etc.) don't blur together in one long list —
  // each mode gets its own labeled section, in the same order as the
  // player-facing dashboard cards.
  const groups = GAME_MODES.map((mode) => ({
    mode,
    items: tournaments.filter((t) => t.category === mode.id),
  })).filter((g) => g.items.length > 0);

  const uncategorized = tournaments.filter(
    (t) => !getGameModeById(t.category ?? "")
  );

  return (
    <div className="flex flex-col gap-3">
      {!creating && (
        <button
          onClick={() => {
            setCreating(true);
            setEditingId(null);
          }}
          className="flex items-center justify-center gap-1.5 border border-line rounded-lg py-2.5 text-sm font-medium text-ink"
        >
          <Plus size={15} /> Create New Match
        </button>
      )}

      {creating && (
        <TournamentForm
          onSubmit={handleCreate}
          onCancel={() => setCreating(false)}
        />
      )}

      {error && (
        <p className="text-xs text-ember bg-ember/10 border border-ember/30 rounded px-3 py-2">
          {error}
        </p>
      )}

      {loading && (
        <p className="text-center text-muted text-sm py-8">Loading...</p>
      )}

      {!loading && tournaments.length === 0 && (
        <p className="text-center text-muted text-sm py-10">
          No matches created yet.
        </p>
      )}

      {!loading &&
        groups.map(({ mode, items }) => (
          <div key={mode.id} className="flex flex-col gap-3">
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                {mode.category}
              </span>
              <span className="text-[10px] font-semibold text-ink bg-surface-2 border border-line rounded-full px-1.5 py-0.5">
                {items.length}
              </span>
              <div className="flex-1 h-px bg-line" />
            </div>
            {items.map((t) => renderCard(t))}
          </div>
        ))}

      {!loading && uncategorized.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">
              Uncategorized
            </span>
            <span className="text-[10px] font-semibold text-ink bg-surface-2 border border-line rounded-full px-1.5 py-0.5">
              {uncategorized.length}
            </span>
            <div className="flex-1 h-px bg-line" />
          </div>
          {uncategorized.map((t) => renderCard(t))}
        </div>
      )}
    </div>
  );
}
