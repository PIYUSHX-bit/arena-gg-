import { useEffect, useState } from "react";
import { Plus, Gift } from "lucide-react";
import {
  fetchGiftCardStockAdmin,
  addGiftCardCode,
  type GiftCardStockRow,
} from "../../lib/admin";

function formatRupees(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export default function AdminGiftCardsTab() {
  const [stock, setStock] = useState<GiftCardStockRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [denomination, setDenomination] = useState("");
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  async function load() {
    setLoading(true);
    const { stock: s, error: err } = await fetchGiftCardStockAdmin();
    setStock(s);
    setLoading(false);
    if (err) setError(err);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAddStock() {
    setError(null);
    setAdded(false);

    const denom = Number(denomination);
    if (!denom || denom <= 0) {
      setError("Enter a valid denomination.");
      return;
    }
    if (!code.trim()) {
      setError("Enter the gift card code.");
      return;
    }

    setSubmitting(true);
    const { error: addError } = await addGiftCardCode(denom, code.trim());
    setSubmitting(false);

    if (addError) {
      setError(addError);
      return;
    }

    setCode("");
    setAdded(true);
    load();
  }

  const totalAvailable = stock.reduce((sum, s) => sum + s.available, 0);
  const totalAssigned = stock.reduce((sum, s) => sum + s.assigned, 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-surface border border-line rounded-lg p-5">
        <div className="flex items-center gap-2 mb-4">
          <Gift size={16} className="text-zone" />
          <span className="text-sm font-semibold">Add Stock</span>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <div>
            <label className="block text-[10px] text-muted uppercase mb-1">
              Denomination (₹)
            </label>
            <input
              type="number"
              inputMode="numeric"
              value={denomination}
              onChange={(e) => setDenomination(e.target.value)}
              placeholder="e.g. 500"
              className="w-full bg-surface-2 border border-line rounded px-3 py-2.5 text-sm outline-none focus:border-ember"
            />
          </div>
          <div>
            <label className="block text-[10px] text-muted uppercase mb-1">
              Code
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Gift card code"
              className="w-full bg-surface-2 border border-line rounded px-3 py-2.5 text-sm font-mono outline-none focus:border-ember"
            />
          </div>
        </div>

        {error && (
          <p className="text-xs text-ember bg-ember/10 border border-ember/30 rounded px-3 py-2 mb-3">
            {error}
          </p>
        )}
        {added && !error && (
          <p className="text-xs text-safe bg-safe/10 border border-safe/30 rounded px-3 py-2 mb-3">
            Code added to stock.
          </p>
        )}

        <button
          onClick={handleAddStock}
          disabled={submitting}
          className="w-full flex items-center justify-center gap-1.5 bg-ember text-base font-semibold text-sm py-2.5 rounded disabled:opacity-50"
        >
          <Plus size={15} />
          {submitting ? "Adding..." : "Add to Stock"}
        </button>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs tracking-wider text-muted uppercase">
            Stock Levels
          </span>
          <span className="text-[11px] text-muted">
            {totalAvailable} available · {totalAssigned} redeemed
          </span>
        </div>

        {loading && (
          <p className="text-center text-muted text-sm py-8">Loading...</p>
        )}

        {!loading && stock.length === 0 && (
          <p className="text-center text-muted text-sm py-10">
            No gift card stock added yet.
          </p>
        )}

        {!loading && stock.length > 0 && (
          <div className="flex flex-col gap-2">
            {stock.map((s) => (
              <div
                key={s.denomination}
                className="flex items-center justify-between bg-surface border border-line rounded-lg px-4 py-3.5"
              >
                <span className="text-sm font-mono font-semibold">
                  {formatRupees(s.denomination)}
                </span>
                <div className="flex items-center gap-3 text-xs">
                  <span
                    className={
                      s.available > 0
                        ? "text-safe font-medium"
                        : "text-ember font-medium"
                    }
                  >
                    {s.available} available
                  </span>
                  <span className="text-muted">{s.assigned} redeemed</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
