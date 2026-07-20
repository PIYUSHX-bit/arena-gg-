import { useRef, useState } from "react";
import { Plus, X, ImagePlus } from "lucide-react";
import { GAME_MODES } from "../../lib/gameModes";
import { uploadTournamentBanner } from "../../lib/tournamentBanner";
import type { TournamentInput, AdminTournament } from "../../lib/admin";
import type { TournamentMode, TournamentStatus, PrizeTier } from "../../types/tournament";

interface TournamentFormProps {
  initial?: AdminTournament;
  onSubmit: (input: TournamentInput) => Promise<{ error: string | null }>;
  onCancel?: () => void;
}

function toDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export default function TournamentForm({
  initial,
  onSubmit,
  onCancel,
}: TournamentFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [category, setCategory] = useState(initial?.category ?? GAME_MODES[0].id);
  const [mode, setMode] = useState<TournamentMode>(initial?.mode ?? "Solo");
  const [map, setMap] = useState(initial?.map ?? "");
  const [status, setStatus] = useState<TournamentStatus>(
    initial?.status ?? "upcoming"
  );
  const [startsAt, setStartsAt] = useState(
    initial ? toDatetimeLocal(initial.startsAt) : ""
  );
  const [slotsTotal, setSlotsTotal] = useState(
    String(initial?.slotsTotal ?? 20)
  );
  const [entryFee, setEntryFee] = useState(String(initial?.entryFee ?? ""));
  const [prizePool, setPrizePool] = useState(String(initial?.prizePool ?? ""));
  const [perKill, setPerKill] = useState(String(initial?.perKill ?? 0));
  const [entryPerPlayer, setEntryPerPlayer] = useState(
    String(initial?.entryPerPlayer ?? 1)
  );
  const [bannerImageUrl, setBannerImageUrl] = useState(
    initial?.bannerImageUrl ?? ""
  );
  const [prizeTiers, setPrizeTiers] = useState<PrizeTier[]>(
    initial?.prizeDistribution ?? []
  );

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bannerUploading, setBannerUploading] = useState(false);
  const [bannerError, setBannerError] = useState<string | null>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  async function handleBannerSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file next time
    if (!file) return;

    setBannerError(null);
    setBannerUploading(true);

    const { url, error: uploadError } = await uploadTournamentBanner(file);

    setBannerUploading(false);

    if (uploadError || !url) {
      setBannerError(uploadError ?? "Upload failed.");
      return;
    }

    setBannerImageUrl(url);
  }

  function updateTier(index: number, tier: PrizeTier) {
    setPrizeTiers((prev) => prev.map((t, i) => (i === index ? tier : t)));
  }

  function removeTier(index: number) {
    setPrizeTiers((prev) => prev.filter((_, i) => i !== index));
  }

  function addTier() {
    setPrizeTiers((prev) => [...prev, { label: "", amount: 0 }]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!startsAt) {
      setError("Start time is required.");
      return;
    }

    setSubmitting(true);
    const { error: submitError } = await onSubmit({
      name,
      mode,
      map,
      entryFee: Number(entryFee) || 0,
      prizePool: Number(prizePool) || 0,
      perKill: Number(perKill) || 0,
      entryPerPlayer: Number(entryPerPlayer) || 1,
      category,
      bannerImageUrl: bannerImageUrl.trim() || null,
      status,
      startsAt: new Date(startsAt).toISOString(),
      slotsTotal: Number(slotsTotal) || 1,
      prizeDistribution: prizeTiers.filter((t) => t.label.trim() !== ""),
    });
    setSubmitting(false);

    if (submitError) {
      setError(submitError);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-surface border border-line rounded-lg p-5 flex flex-col gap-3.5"
    >
      <div>
        <label className="block text-xs tracking-wider text-muted uppercase mb-1.5">
          Match Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full bg-surface-2 border border-line rounded px-3 py-2.5 text-sm outline-none focus:border-ember"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs tracking-wider text-muted uppercase mb-1.5">
            Category
          </label>
          <select
            value={category ?? ""}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-surface-2 border border-line rounded px-3 py-2.5 text-sm outline-none focus:border-ember"
          >
            {GAME_MODES.map((m) => (
              <option key={m.id} value={m.id}>
                {m.category}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs tracking-wider text-muted uppercase mb-1.5">
            Mode
          </label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as TournamentMode)}
            className="w-full bg-surface-2 border border-line rounded px-3 py-2.5 text-sm outline-none focus:border-ember"
          >
            <option value="Solo">Solo</option>
            <option value="Duo">Duo</option>
            <option value="Squad">Squad</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs tracking-wider text-muted uppercase mb-1.5">
            Map
          </label>
          <input
            type="text"
            value={map}
            onChange={(e) => setMap(e.target.value)}
            required
            className="w-full bg-surface-2 border border-line rounded px-3 py-2.5 text-sm outline-none focus:border-ember"
          />
        </div>
        <div>
          <label className="block text-xs tracking-wider text-muted uppercase mb-1.5">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as TournamentStatus)}
            className="w-full bg-surface-2 border border-line rounded px-3 py-2.5 text-sm outline-none focus:border-ember"
          >
            <option value="upcoming">Upcoming</option>
            <option value="live">Ongoing</option>
            <option value="completed">Resulted</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs tracking-wider text-muted uppercase mb-1.5">
          Starts At
        </label>
        <input
          type="datetime-local"
          value={startsAt}
          onChange={(e) => setStartsAt(e.target.value)}
          required
          className="w-full bg-surface-2 border border-line rounded px-3 py-2.5 text-sm outline-none focus:border-ember"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs tracking-wider text-muted uppercase mb-1.5">
            Total Slots
          </label>
          <input
            type="number"
            inputMode="numeric"
            value={slotsTotal}
            onChange={(e) => setSlotsTotal(e.target.value)}
            min={1}
            required
            className="w-full bg-surface-2 border border-line rounded px-3 py-2.5 text-sm outline-none focus:border-ember"
          />
        </div>
        <div>
          <label className="block text-xs tracking-wider text-muted uppercase mb-1.5">
            Entry Per Player
          </label>
          <input
            type="number"
            inputMode="numeric"
            value={entryPerPlayer}
            onChange={(e) => setEntryPerPlayer(e.target.value)}
            min={1}
            required
            className="w-full bg-surface-2 border border-line rounded px-3 py-2.5 text-sm outline-none focus:border-ember"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs tracking-wider text-muted uppercase mb-1.5">
            Entry Fee (₹)
          </label>
          <input
            type="number"
            inputMode="numeric"
            value={entryFee}
            onChange={(e) => setEntryFee(e.target.value)}
            min={0}
            required
            className="w-full bg-surface-2 border border-line rounded px-3 py-2.5 text-sm outline-none focus:border-ember"
          />
        </div>
        <div>
          <label className="block text-xs tracking-wider text-muted uppercase mb-1.5">
            Prize Pool (₹)
          </label>
          <input
            type="number"
            inputMode="numeric"
            value={prizePool}
            onChange={(e) => setPrizePool(e.target.value)}
            min={0}
            required
            className="w-full bg-surface-2 border border-line rounded px-3 py-2.5 text-sm outline-none focus:border-ember"
          />
        </div>
        <div>
          <label className="block text-xs tracking-wider text-muted uppercase mb-1.5">
            Per Kill (₹)
          </label>
          <input
            type="number"
            inputMode="numeric"
            value={perKill}
            onChange={(e) => setPerKill(e.target.value)}
            min={0}
            required
            className="w-full bg-surface-2 border border-line rounded px-3 py-2.5 text-sm outline-none focus:border-ember"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs tracking-wider text-muted uppercase mb-1.5">
          Banner Image (optional)
        </label>

        {bannerImageUrl ? (
          <div className="rounded-lg overflow-hidden border border-line">
            <img
              src={bannerImageUrl}
              alt="Banner preview"
              className="w-full aspect-[16/9] object-cover"
            />
            <div className="flex gap-2 p-2 bg-surface-2">
              <button
                type="button"
                onClick={() => bannerInputRef.current?.click()}
                disabled={bannerUploading}
                className="flex-1 bg-ember text-base font-semibold text-xs py-2 rounded disabled:opacity-50"
              >
                {bannerUploading ? "Uploading..." : "Replace"}
              </button>
              <button
                type="button"
                onClick={() => setBannerImageUrl("")}
                className="px-4 text-xs text-muted border border-line rounded"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => bannerInputRef.current?.click()}
            disabled={bannerUploading}
            className="w-full aspect-[16/9] rounded-lg border border-dashed border-line bg-surface-2 flex flex-col items-center justify-center gap-1.5 text-muted disabled:opacity-50"
          >
            <ImagePlus size={22} />
            <span className="text-xs">
              {bannerUploading ? "Uploading..." : "Tap to choose an image"}
            </span>
          </button>
        )}

        <input
          ref={bannerInputRef}
          type="file"
          accept="image/*"
          onChange={handleBannerSelected}
          className="hidden"
        />

        {bannerError && (
          <p className="text-xs text-ember bg-ember/10 border border-ember/30 rounded px-3 py-2 mt-2">
            {bannerError}
          </p>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs tracking-wider text-muted uppercase">
            Prize Distribution
          </span>
          <button
            type="button"
            onClick={addTier}
            className="flex items-center gap-1 text-xs text-ember"
          >
            <Plus size={13} /> Add tier
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {prizeTiers.map((tier, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="text"
                value={tier.label}
                onChange={(e) => updateTier(i, { ...tier, label: e.target.value })}
                placeholder="e.g. 1st"
                className="flex-1 bg-surface-2 border border-line rounded px-3 py-2 text-sm outline-none focus:border-ember"
              />
              <input
                type="number"
                inputMode="numeric"
                value={tier.amount}
                onChange={(e) =>
                  updateTier(i, { ...tier, amount: Number(e.target.value) || 0 })
                }
                placeholder="Amount"
                className="w-24 bg-surface-2 border border-line rounded px-3 py-2 text-sm outline-none focus:border-ember"
              />
              <button
                type="button"
                onClick={() => removeTier(i)}
                aria-label="Remove tier"
                className="text-muted hover:text-ember"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <p className="text-xs text-ember bg-ember/10 border border-ember/30 rounded px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex gap-2 mt-1">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 bg-ember text-base font-semibold text-sm py-2.5 rounded disabled:opacity-50"
        >
          {submitting ? "Saving..." : initial ? "Save Changes" : "Create Match"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 text-sm text-muted"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
