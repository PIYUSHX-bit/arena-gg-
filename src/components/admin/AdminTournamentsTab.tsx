import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import {
  fetchAllTournaments,
  createTournament,
  updateTournament,
  type AdminTournament,
} from "../../lib/admin";
import { getGameModeById } from "../../lib/gameModes";
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
        tournaments.map((t) =>
          editingId === t.id ? (
            <TournamentForm
              key={t.id}
              initial={t}
              onSubmit={(input) => handleUpdate(t.id, input)}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <div
              key={t.id}
              className="bg-surface border border-line rounded-lg px-4 py-3.5"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">{t.name}</span>
                <span className="text-[11px] uppercase tracking-wide text-muted">
                  {t.status}
                </span>
              </div>
              <div className="text-xs text-muted mb-2.5">
                {(t.category && getGameModeById(t.category)?.category) ??
                  "Uncategorized"}{" "}
                · {t.map} · {t.slotsFilled}/{t.slotsTotal}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-amber">
                  Entry {formatRupees(t.entryFee)} · Prize{" "}
                  {formatRupees(t.prizePool)} · Kill {formatRupees(t.perKill)}
                </span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      setRoomEditorId(roomEditorId === t.id ? null : t.id)
                    }
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

              {roomEditorId === t.id && (
                <AdminRoomEditor tournamentId={t.id} />
              )}
            </div>
          )
        )}
    </div>
  );
}
