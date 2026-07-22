import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Gift, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { fetchWalletBalance } from "../../lib/wallet";
import {
  fetchGiftCardStock,
  fetchMyGiftCards,
  redeemGiftCard,
  type GiftCardStock,
  type MyGiftCard,
} from "../../lib/giftCards";
import CopyIconButton from "../common/CopyIconButton";

function formatRupees(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function GiftCardsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [balance, setBalance] = useState(0);
  const [stock, setStock] = useState<GiftCardStock[]>([]);
  const [history, setHistory] = useState<MyGiftCard[]>([]);
  const [loading, setLoading] = useState(true);

  const [confirmingDenom, setConfirmingDenom] = useState<number | null>(null);
  const [redeeming, setRedeeming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wonCode, setWonCode] = useState<{ denom: number; code: string } | null>(
    null
  );

  async function loadAll() {
    if (!user) return;
    setLoading(true);
    const [{ balance: b }, { stock: s }, { cards: h }] = await Promise.all([
      fetchWalletBalance(user.id),
      fetchGiftCardStock(),
      fetchMyGiftCards(),
    ]);
    setBalance(b);
    setStock(s);
    setHistory(h);
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function handleRedeem(denomination: number) {
    setError(null);
    setRedeeming(true);
    const { code, error: redeemError } = await redeemGiftCard(denomination);
    setRedeeming(false);
    setConfirmingDenom(null);

    if (redeemError || !code) {
      setError(redeemError ?? "Redemption failed.");
      return;
    }

    setWonCode({ denom: denomination, code });
    loadAll();
  }

  return (
    <div className="min-h-screen bg-base text-ink font-body max-w-[480px] mx-auto pb-10">
      <div className="flex items-center gap-3 px-5 py-4 bg-surface border-b border-line sticky top-0 z-10">
        <button onClick={() => navigate(-1)} aria-label="Back">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-display font-semibold text-xl">
          Redeem for Gift Card
        </h1>
      </div>

      <div className="px-5 py-6">
        <div className="bg-gradient-to-br from-zone/15 via-surface to-surface border border-zone/30 rounded-lg p-5 mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Gift size={16} className="text-zone" />
            <span className="text-xs tracking-wider text-muted uppercase">
              Wallet Balance
            </span>
          </div>
          <div className="font-display font-bold text-2xl text-amber">
            {formatRupees(balance)}
          </div>
        </div>

        {error && (
          <p className="text-xs text-ember bg-ember/10 border border-ember/30 rounded px-3 py-2 mb-4">
            {error}
          </p>
        )}

        {loading && (
          <p className="text-center text-muted text-sm py-8">Loading...</p>
        )}

        {!loading && stock.length === 0 && (
          <p className="text-center text-muted text-sm py-10">
            No gift card denominations available right now — check back
            later.
          </p>
        )}

        {!loading && stock.length > 0 && (
          <div className="flex flex-col gap-2.5 mb-8">
            {stock.map((s) => {
              const affordable = balance >= s.denomination;
              const inStock = s.availableCount > 0;
              const disabled = !affordable || !inStock;
              const isConfirming = confirmingDenom === s.denomination;

              return (
                <div key={s.denomination}>
                  <button
                    onClick={() => setConfirmingDenom(s.denomination)}
                    disabled={disabled}
                    className={`w-full flex items-center justify-between border rounded-lg px-4 py-3.5 transition-colors ${
                      disabled
                        ? "border-line bg-surface opacity-50 cursor-not-allowed"
                        : "border-line bg-surface hover:border-zone"
                    }`}
                  >
                    <span className="font-mono font-semibold text-sm">
                      {formatRupees(s.denomination)}
                    </span>
                    <span
                      className={`text-xs ${
                        !inStock
                          ? "text-ember"
                          : !affordable
                            ? "text-muted"
                            : "text-safe"
                      }`}
                    >
                      {!inStock
                        ? "Out of stock"
                        : !affordable
                          ? `${s.availableCount} available · need ${formatRupees(s.denomination)}`
                          : `${s.availableCount} available`}
                    </span>
                  </button>

                  {isConfirming && (
                    <div className="border border-zone/40 bg-zone/10 rounded-lg p-3 mt-2 flex flex-col gap-2">
                      <p className="text-xs text-ink">
                        Redeem{" "}
                        <span className="font-mono font-semibold">
                          {formatRupees(s.denomination)}
                        </span>{" "}
                        from your wallet for a gift card code? This deducts
                        your balance immediately.
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRedeem(s.denomination)}
                          disabled={redeeming}
                          className="flex-1 bg-ember text-base font-semibold text-sm py-2 rounded disabled:opacity-50"
                        >
                          {redeeming ? "Redeeming..." : "Confirm Redeem"}
                        </button>
                        <button
                          onClick={() => setConfirmingDenom(null)}
                          disabled={redeeming}
                          className="px-4 border border-line rounded text-sm text-muted disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="text-sm font-medium mb-3">My Gift Cards</div>

        {!loading && history.length === 0 && (
          <p className="text-center text-muted text-sm py-10">
            No gift cards redeemed yet.
          </p>
        )}

        {!loading && history.length > 0 && (
          <div className="flex flex-col gap-2">
            {history.map((h) => (
              <div
                key={h.id}
                className="bg-surface border border-line rounded-lg px-4 py-3.5"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono font-semibold text-sm text-amber">
                    {formatRupees(h.denomination)}
                  </span>
                  <span className="text-xs text-muted">
                    {formatDate(h.assignedAt)}
                  </span>
                </div>
                <div className="flex items-center justify-between bg-surface-2 border border-line rounded px-3 py-2">
                  <span className="font-mono text-xs tracking-wider">
                    {h.code}
                  </span>
                  <CopyIconButton value={h.code} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {wonCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-base/80 px-6">
          <div className="w-full max-w-[380px] bg-surface border border-zone/40 rounded-xl p-6 relative">
            <button
              onClick={() => setWonCode(null)}
              aria-label="Close"
              className="absolute top-4 right-4 text-muted hover:text-ink"
            >
              <X size={18} />
            </button>

            <div className="text-center mb-5">
              <div className="w-14 h-14 rounded-full bg-zone/15 flex items-center justify-center mx-auto mb-3">
                <Gift size={24} className="text-zone" />
              </div>
              <p className="font-display font-semibold text-lg">
                {formatRupees(wonCode.denom)} Gift Card
              </p>
              <p className="text-xs text-muted mt-1">
                Redeem this at play.google.com/redeem
              </p>
            </div>

            <div className="flex items-center justify-between bg-surface-2 border border-line rounded px-4 py-3 mb-4">
              <span className="font-mono text-base tracking-widest text-amber">
                {wonCode.code}
              </span>
              <CopyIconButton value={wonCode.code} />
            </div>

            <button
              onClick={() => setWonCode(null)}
              className="w-full bg-ember text-base font-semibold text-sm py-2.5 rounded"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
