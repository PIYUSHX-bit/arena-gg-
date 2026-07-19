import { useEffect, useState } from "react";
import { fetchTournamentRoom, setTournamentRoom } from "../../lib/admin";

interface AdminRoomEditorProps {
  tournamentId: string;
}

export default function AdminRoomEditor({ tournamentId }: AdminRoomEditorProps) {
  const [roomId, setRoomId] = useState("");
  const [roomPassword, setRoomPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchTournamentRoom(tournamentId).then(({ room }) => {
      setRoomId(room?.roomId ?? "");
      setRoomPassword(room?.roomPassword ?? "");
      setLoading(false);
    });
  }, [tournamentId]);

  async function handleSave() {
    setError(null);
    setSaved(false);
    setSaving(true);
    const { error: saveError } = await setTournamentRoom(
      tournamentId,
      roomId,
      roomPassword
    );
    setSaving(false);

    if (saveError) {
      setError(saveError);
      return;
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  if (loading) {
    return <p className="text-xs text-muted py-2">Loading room details...</p>;
  }

  return (
    <div className="border-t border-line mt-3 pt-3 flex flex-col gap-2.5">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] text-muted uppercase mb-1">
            Room ID
          </label>
          <input
            type="text"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="e.g. 123456"
            className="w-full bg-surface-2 border border-line rounded px-2.5 py-2 text-sm outline-none focus:border-ember"
          />
        </div>
        <div>
          <label className="block text-[10px] text-muted uppercase mb-1">
            Password
          </label>
          <input
            type="text"
            value={roomPassword}
            onChange={(e) => setRoomPassword(e.target.value)}
            placeholder="e.g. ff2026"
            className="w-full bg-surface-2 border border-line rounded px-2.5 py-2 text-sm outline-none focus:border-ember"
          />
        </div>
      </div>

      {error && (
        <p className="text-xs text-ember bg-ember/10 border border-ember/30 rounded px-3 py-2">
          {error}
        </p>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-ember text-base font-semibold text-sm py-2 rounded disabled:opacity-50"
      >
        {saving ? "Saving..." : saved ? "Saved ✓" : "Save Room Details"}
      </button>
    </div>
  );
}
