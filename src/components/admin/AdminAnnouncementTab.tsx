import { useEffect, useState } from "react";
import { fetchAnnouncement, updateAnnouncement } from "../../lib/announcement";

export default function AdminAnnouncementTab() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchAnnouncement().then(({ text: t, error: err }) => {
      if (err) setError(err);
      else setText(t);
      setLoading(false);
    });
  }, []);

  async function handleSave() {
    setError(null);
    setSaved(false);
    setSaving(true);
    const { error: saveError } = await updateAnnouncement(text.trim());
    setSaving(false);

    if (saveError) {
      setError(saveError);
      return;
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  if (loading) {
    return <p className="text-center text-muted text-sm py-8">Loading...</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="block text-xs tracking-wider text-muted uppercase mb-1.5">
          Dashboard Banner Text
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          placeholder="e.g. New tournaments added daily!"
          className="w-full bg-surface-2 border border-line rounded px-3 py-2.5 text-sm outline-none focus:border-ember resize-none"
        />
        <p className="text-[11px] text-muted mt-1.5">
          Shown as a scrolling banner at the top of every player's dashboard.
          Leave empty to hide it.
        </p>
      </div>

      {error && (
        <p className="text-xs text-ember bg-ember/10 border border-ember/30 rounded px-3 py-2">
          {error}
        </p>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-ember text-base font-semibold text-sm py-2.5 rounded disabled:opacity-50"
      >
        {saving ? "Saving..." : saved ? "Saved ✓" : "Save Banner"}
      </button>
    </div>
  );
}
