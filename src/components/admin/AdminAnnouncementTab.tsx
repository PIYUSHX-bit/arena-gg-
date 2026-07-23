import { useEffect, useState } from "react";
import { CheckCircle2, Megaphone, Eye } from "lucide-react";
import { fetchAnnouncement, updateAnnouncement } from "../../lib/announcement";
import RulesBanner from "../dashboard/RulesBanner";

const RECOMMENDED_MAX = 120;

export default function AdminAnnouncementTab() {
  const [text, setText] = useState("");
  const [savedText, setSavedText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchAnnouncement().then(({ text: t, error: err }) => {
      if (err) setError(err);
      else {
        setText(t);
        setSavedText(t);
      }
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

    setSavedText(text.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  const isDirty = text.trim() !== savedText;

  if (loading) {
    return <p className="text-center text-muted text-sm py-8">Loading...</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 -mb-1">
        <Megaphone size={16} className="text-ember" />
        <span className="text-sm font-semibold">Dashboard Banner</span>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs tracking-wider text-muted uppercase">
            Banner Text
          </label>
          <span
            className={`text-[11px] font-mono ${
              text.length > RECOMMENDED_MAX ? "text-amber" : "text-muted"
            }`}
          >
            {text.length}/{RECOMMENDED_MAX}
          </span>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          placeholder="e.g. New tournaments added daily!"
          className="w-full bg-surface-2 border border-line rounded px-3 py-2.5 text-sm outline-none focus:border-ember resize-none"
        />
        <div className="flex items-center justify-between mt-1.5">
          <p className="text-[11px] text-muted">
            Scrolls at the top of every player's dashboard. Empty hides it.
          </p>
          {text && (
            <button
              onClick={() => setText("")}
              className="text-[11px] text-ember font-medium shrink-0 ml-3"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-1.5 mb-1.5">
          <Eye size={13} className="text-muted" />
          <span className="text-xs tracking-wider text-muted uppercase">
            Live Preview
          </span>
        </div>
        <div className="border border-line rounded-lg overflow-hidden">
          {text.trim() ? (
            <RulesBanner text={text.trim()} />
          ) : (
            <p className="text-center text-muted text-xs py-4">
              Banner is hidden — nothing to preview.
            </p>
          )}
        </div>
      </div>

      {error && (
        <p className="text-xs text-ember bg-ember/10 border border-ember/30 rounded px-3 py-2">
          {error}
        </p>
      )}

      <button
        onClick={handleSave}
        disabled={saving || !isDirty}
        className="flex items-center justify-center gap-1.5 bg-ember text-base font-semibold text-sm py-2.5 rounded disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {saved && <CheckCircle2 size={15} />}
        {saving ? "Saving..." : saved ? "Saved" : "Save Banner"}
      </button>
    </div>
  );
}
