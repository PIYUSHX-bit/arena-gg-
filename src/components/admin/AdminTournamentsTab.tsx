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
  const [activeCategory, setActiveCategory] = useState<string>("all");

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

  // Tabbed by game mode so an admin picks a category (Free Entry, Lone
  // Wolf, Clash Squad, etc.) and only sees that mode's matches, instead
  // of every match from every mode blurring together in one long list.
  const modeCounts = GAME_MODES.map((mode) => ({
    mode,
    count: tournaments.filter((t) => t.category === mode.id).length,
  }));

  const uncategorized = tournaments.filter(
    (t) => !getGameModeById(t.category ?? "")
  );

  const visible =
    activeCategory === "all"
      ? tournaments
      : activeCategory === "uncategorized"
        ? uncategorized
        : tournaments.filter((t) => t.category === activeCategory);

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

      {!loading && tournaments.length > 0 && (
        <div className="-mx-4 px-4 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 pb-1 w-max">
            <button
              onClick={() => setActiveCategory("all")}
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
                  onClick={() => setActiveCategory(mode.id)}
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

            {uncategorized.length > 0 && (
              <button
                onClick={() => setActiveCategory("uncategorized")}
                className={`flex items-center gap-1.5 shrink-0 rounded-full px-3.5 py-2 text-xs font-semibold border transition-colors ${
                  activeCategory === "uncategorized"
                    ? "bg-ink text-base border-ink"
                    : "border-line text-muted hover:text-ink"
                }`}
              >
                Uncategorized
                <span
                  className={`text-[10px] font-bold rounded-full px-1.5 ${
                    activeCategory === "uncategorized"
                      ? "bg-base/20 text-base"
                      : "bg-surface-2 text-muted"
                  }`}
                >
                  {uncategorized.length}
                </span>
              </button>
            )}
          </div>
        </div>
      )}

      {!loading && tournaments.length > 0 && visible.length === 0 && (
        <p className="text-center text-muted text-sm py-10">
          No matches in this category.
        </p>
      )}

      {!loading && visible.map((t) => renderCard(t))}
    </div>
  );
}
