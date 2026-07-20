import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { fetchRules, updateRules, type RuleSection } from "../../lib/rules";

export default function AdminRulesTab() {
  const [bannerText, setBannerText] = useState("");
  const [sections, setSections] = useState<RuleSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchRules().then(({ rules, error: err }) => {
      if (err) setError(err);
      else if (rules) {
        setBannerText(rules.bannerText);
        setSections(rules.sections);
      }
      setLoading(false);
    });
  }, []);

  function updateSectionTitle(index: number, title: string) {
    setSections((prev) =>
      prev.map((s, i) => (i === index ? { ...s, title } : s))
    );
  }

  function updatePoint(sectionIndex: number, pointIndex: number, value: string) {
    setSections((prev) =>
      prev.map((s, i) =>
        i === sectionIndex
          ? { ...s, points: s.points.map((p, j) => (j === pointIndex ? value : p)) }
          : s
      )
    );
  }

  function addPoint(sectionIndex: number) {
    setSections((prev) =>
      prev.map((s, i) => (i === sectionIndex ? { ...s, points: [...s.points, ""] } : s))
    );
  }

  function removePoint(sectionIndex: number, pointIndex: number) {
    setSections((prev) =>
      prev.map((s, i) =>
        i === sectionIndex
          ? { ...s, points: s.points.filter((_, j) => j !== pointIndex) }
          : s
      )
    );
  }

  function addSection() {
    setSections((prev) => [...prev, { title: "", points: [""] }]);
  }

  function removeSection(index: number) {
    setSections((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    setError(null);
    setSaved(false);
    setSaving(true);

    const cleaned = sections
      .map((s) => ({
        title: s.title.trim(),
        points: s.points.map((p) => p.trim()).filter((p) => p !== ""),
      }))
      .filter((s) => s.title !== "" && s.points.length > 0);

    const { error: saveError } = await updateRules({
      bannerText: bannerText.trim(),
      sections: cleaned,
    });

    setSaving(false);

    if (saveError) {
      setError(saveError);
      return;
    }

    setSections(cleaned);
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
          Marquee Banner Text
        </label>
        <textarea
          value={bannerText}
          onChange={(e) => setBannerText(e.target.value)}
          rows={2}
          className="w-full bg-surface-2 border border-line rounded px-3 py-2.5 text-sm outline-none focus:border-ember resize-none"
        />
      </div>

      <div className="flex flex-col gap-3">
        {sections.map((section, sIndex) => (
          <div
            key={sIndex}
            className="bg-surface border border-line rounded-lg p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <input
                type="text"
                value={section.title}
                onChange={(e) => updateSectionTitle(sIndex, e.target.value)}
                placeholder="Section title"
                className="flex-1 bg-surface-2 border border-line rounded px-3 py-2 text-sm font-medium outline-none focus:border-ember"
              />
              <button
                type="button"
                onClick={() => removeSection(sIndex)}
                aria-label="Remove section"
                className="text-muted hover:text-ember shrink-0"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {section.points.map((point, pIndex) => (
                <div key={pIndex} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={point}
                    onChange={(e) =>
                      updatePoint(sIndex, pIndex, e.target.value)
                    }
                    placeholder="Rule text"
                    className="flex-1 bg-surface-2 border border-line rounded px-3 py-2 text-sm outline-none focus:border-ember"
                  />
                  <button
                    type="button"
                    onClick={() => removePoint(sIndex, pIndex)}
                    aria-label="Remove point"
                    className="text-muted hover:text-ember shrink-0"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => addPoint(sIndex)}
              className="flex items-center gap-1 text-xs text-ember mt-2.5"
            >
              <Plus size={12} /> Add point
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addSection}
          className="flex items-center justify-center gap-1.5 border border-line rounded-lg py-2.5 text-sm font-medium text-ink"
        >
          <Plus size={15} /> Add Section
        </button>
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
        {saving ? "Saving..." : saved ? "Saved ✓" : "Save Rules"}
      </button>
    </div>
  );
}
