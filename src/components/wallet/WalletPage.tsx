import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Wallet as WalletIcon,
  Plus,
  ArrowDownToLine,
  Gift,
  Swords,
  Trophy,
  RotateCcw,
  Settings2,
  UserPlus,
  ChevronDown,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  fetchWalletBalance,
  fetchWalletTransactions,
  createWalletTopupOrder,
  verifyWalletTopup,
  requestWithdrawal,
} from "../../lib/wallet";
import { openRazorpayCheckout } from "../../lib/razorpay";
import type { WalletTransaction } from "../../types/wallet";

const QUICK_AMOUNTS = [50, 100, 200, 500];

function formatRupees(amount: number): string {
  const sign = amount < 0 ? "-" : "";
  return `${sign}₹${Math.abs(amount).toLocaleString("en-IN")}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatFullDate(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });
}

const TYPE_LABEL: Record<WalletTransaction["type"], string> = {
  deposit: "Added money",
  tournament_entry: "Tournament entry",
  prize_payout: "Prize won",
  withdrawal: "Withdrawal",
  refund: "Refund",
  adjustment: "Adjustment",
  referral_bonus: "Referral bonus",
  gift_card_redemption: "Gift card redeemed",
};

const TYPE_ICON: Record<WalletTransaction["type"], LucideIcon> = {
  deposit: Plus,
  tournament_entry: Swords,
  prize_payout: Trophy,
  withdrawal: ArrowDownToLine,
  refund: RotateCcw,
  adjustment: Settings2,
  referral_bonus: UserPlus,
  gift_card_redemption: Gift,
};

const TYPE_COLOR: Record<WalletTransaction["type"], string> = {
  deposit: "text-safe bg-safe/15",
  tournament_entry: "text-zone bg-zone/15",
  prize_payout: "text-amber bg-amber/15",
  withdrawal: "text-ember bg-ember/15",
  refund: "text-zone bg-zone/15",
  adjustment: "text-muted bg-surface-2",
  referral_bonus: "text-zone bg-zone/15",
  gift_card_redemption: "text-zone bg-zone/15",
};

export default function WalletPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const [addingMoney, setAddingMoney] = useState(false);
  const [customAmount, setCustomAmount] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [upiId, setUpiId] = useState("");
  const [withdrawProcessing, setWithdrawProcessing] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  const [expandedTxId, setExpandedTxId] = useState<string | null>(null);

  async function loadWallet() {
    if (!user) return;
    const [{ balance: b }, { transactions: t }] = await Promise.all([
      fetchWalletBalance(user.id),
      fetchWalletTransactions(user.id),
    ]);
    setBalance(b);
    setTransactions(t);
    setLoading(false);
  }

  useEffect(() => {
    loadWallet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function handleTopup(amount: number) {
    if (!user) return;
    setError(null);
    setProcessing(true);

    const { orderId, amountPaise, currency, keyId, error: orderError } =
      await createWalletTopupOrder(amount);

    if (orderError || !orderId || !amountPaise || !currency || !keyId) {
      setProcessing(false);
      setError(orderError ?? "Could not start top-up.");
      return;
    }

    try {
      await openRazorpayCheckout({
        key: keyId,
        amount: amountPaise,
        currency,
        order_id: orderId,
        name: "ARENA.GG",
        description: `Wallet top-up — ₹${amount}`,
        prefill: {
          email: user.email ?? undefined,
          contact: user.phone ?? undefined,
        },
        theme: { color: "#FF4A1C" },
        onSuccess: async (response) => {
          const { confirmed, error: verifyError } = await verifyWalletTopup({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });

          setProcessing(false);

          if (!confirmed) {
            setError(
              verifyError ??
                "Payment succeeded but couldn't be confirmed — contact support with payment ID: " +
                  response.razorpay_payment_id
            );
            return;
          }

          setAddingMoney(false);
          setCustomAmount("");
          loadWallet();
        },
        onDismiss: () => setProcessing(false),
      });
    } catch (err) {
      setProcessing(false);
      setError(err instanceof Error ? err.message : "Payment failed to start.");
    }
  }

  async function handleWithdraw() {
    if (!user) return;
    const amt = parseInt(withdrawAmount, 10);

    setWithdrawError(null);

    if (!amt || amt < 100) {
      setWithdrawError("Minimum withdrawal is ₹100.");
      return;
    }
    if (amt > (balance ?? 0)) {
      setWithdrawError("Withdrawal amount exceeds your balance.");
      return;
    }
    if (!upiId.trim()) {
      setWithdrawError("Enter a UPI ID to receive the payout.");
      return;
    }

    setWithdrawProcessing(true);
    const { error: reqError } = await requestWithdrawal(amt, upiId.trim());
    setWithdrawProcessing(false);

    if (reqError) {
      setWithdrawError(reqError);
      return;
    }

    setWithdrawSuccess(true);
    setWithdrawAmount("");
    setUpiId("");
    loadWallet();
  }

  return (
    <div className="min-h-screen bg-base text-ink font-body max-w-[480px] mx-auto pb-10">
      <div className="flex items-center gap-3 px-5 py-4 bg-surface border-b border-line sticky top-0 z-10">
        <button onClick={() => navigate(-1)} aria-label="Back">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-display font-semibold text-xl">My Wallet</h1>
      </div>

      <div className="px-5 py-6">
        {/* Balance card */}
        <div className="bg-gradient-to-br from-surface-2 via-surface to-base border border-line rounded-xl p-6 mb-6 relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full border border-ember/20" />
          <div className="relative z-[1]">
            <div className="flex items-center gap-2 text-xs tracking-wider text-muted uppercase mb-2">
              <WalletIcon size={14} />
              Balance
            </div>
            <div className="font-display font-bold text-4xl text-amber mb-5">
              {loading ? "—" : formatRupees(balance ?? 0)}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setAddingMoney(true);
                  setWithdrawing(false);
                }}
                className="flex items-center gap-1.5 bg-ember text-base font-semibold text-sm px-5 py-2.5 rounded"
              >
                <Plus size={15} /> Add Money
              </button>
              <button
                onClick={() => {
                  setWithdrawing(true);
                  setAddingMoney(false);
                  setWithdrawSuccess(false);
                }}
                className="flex items-center gap-1.5 border border-line text-ink font-semibold text-sm px-5 py-2.5 rounded"
              >
                <ArrowDownToLine size={15} /> Withdraw
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate("/gift-cards")}
          className="w-full flex items-center gap-3 bg-gradient-to-br from-zone/15 via-surface to-surface border border-zone/30 rounded-lg px-4 py-3.5 mb-6 text-left"
        >
          <span className="shrink-0 w-9 h-9 rounded-full bg-zone/15 flex items-center justify-center">
            <Gift size={17} className="text-zone" />
          </span>
          <div>
            <div className="text-sm font-medium">Redeem for Gift Card</div>
            <div className="text-xs text-muted">
              Turn your wallet balance into a Google Play gift card
            </div>
          </div>
        </button>

        {/* Add money panel */}
        {addingMoney && (
          <div className="bg-surface border border-line rounded-lg p-5 mb-6">
            <div className="text-sm font-medium mb-3">Add money</div>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {QUICK_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  onClick={() => handleTopup(amt)}
                  disabled={processing}
                  className="border border-line rounded py-2.5 text-sm font-mono disabled:opacity-50"
                >
                  ₹{amt}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                inputMode="numeric"
                placeholder="Custom amount"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="flex-1 bg-surface-2 border border-line rounded px-3 py-2.5 text-sm outline-none focus:border-ember"
              />
              <button
                onClick={() => {
                  const amt = parseInt(customAmount, 10);
                  if (amt >= 10) handleTopup(amt);
                }}
                disabled={processing || !customAmount}
                className="bg-ember text-base font-semibold text-sm px-4 rounded disabled:opacity-50"
              >
                {processing ? "..." : "Add"}
              </button>
            </div>
            {error && (
              <p className="text-xs text-ember bg-ember/10 border border-ember/30 rounded px-3 py-2 mt-3">
                {error}
              </p>
            )}
            <button
              onClick={() => setAddingMoney(false)}
              className="text-xs text-muted mt-3"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Withdraw panel */}
        {withdrawing && (
          <div className="bg-surface border border-line rounded-lg p-5 mb-6">
            <div className="text-sm font-medium mb-3">Withdraw to UPI</div>

            {withdrawSuccess ? (
              <div className="text-center py-4">
                <p className="text-sm text-safe font-medium mb-1">
                  Withdrawal requested
                </p>
                <p className="text-xs text-muted">
                  It'll be paid out to your UPI ID within a few business days.
                </p>
                <button
                  onClick={() => setWithdrawing(false)}
                  className="text-xs text-muted mt-4 underline"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-2 mb-3">
                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder="Amount"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="bg-surface-2 border border-line rounded px-3 py-2.5 text-sm outline-none focus:border-ember"
                  />
                  <input
                    type="text"
                    placeholder="UPI ID (e.g. name@bank)"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="bg-surface-2 border border-line rounded px-3 py-2.5 text-sm outline-none focus:border-ember"
                  />
                </div>
                <p className="text-[11px] text-muted mb-3">
                  Minimum withdrawal ₹100. Available balance:{" "}
                  {formatRupees(balance ?? 0)}.
                </p>
                <button
                  onClick={handleWithdraw}
                  disabled={withdrawProcessing || !withdrawAmount || !upiId}
                  className="w-full bg-ember text-base font-semibold text-sm py-2.5 rounded disabled:opacity-50"
                >
                  {withdrawProcessing ? "Processing..." : "Request Withdrawal"}
                </button>
                {withdrawError && (
                  <p className="text-xs text-ember bg-ember/10 border border-ember/30 rounded px-3 py-2 mt-3">
                    {withdrawError}
                  </p>
                )}
                <button
                  onClick={() => setWithdrawing(false)}
                  className="text-xs text-muted mt-3"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        )}

        {/* Transaction history */}
        <div className="text-sm font-medium mb-3">Transaction History</div>

        {loading && <p className="text-muted text-sm py-8 text-center">Loading...</p>}

        {!loading && transactions.length === 0 && (
          <p className="text-muted text-sm py-10 text-center">
            No transactions yet — add money to get started.
          </p>
        )}

        {!loading && transactions.length > 0 && (
          <div className="flex flex-col gap-2">
            {transactions.map((tx) => {
              const Icon = TYPE_ICON[tx.type];
              const expanded = expandedTxId === tx.id;
              return (
                <div
                  key={tx.id}
                  className="bg-surface border border-line rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() =>
                      setExpandedTxId(expanded ? null : tx.id)
                    }
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
                  >
                    <span
                      className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${TYPE_COLOR[tx.type]}`}
                    >
                      <Icon size={16} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium">
                        {TYPE_LABEL[tx.type]}
                      </div>
                      <div className="text-xs text-muted mt-0.5 truncate">
                        {tx.description} · {formatDate(tx.createdAt)}
                      </div>
                    </div>
                    <span
                      className={`font-mono text-sm shrink-0 ${tx.amount >= 0 ? "text-safe" : "text-ember"}`}
                    >
                      {formatRupees(tx.amount)}
                    </span>
                    <ChevronDown
                      size={15}
                      className={`text-muted shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`}
                    />
                  </button>

                  {expanded && (
                    <div className="px-4 pb-3.5 pl-[3.75rem] flex flex-col gap-1 text-xs text-muted border-t border-line pt-3">
                      <div className="flex justify-between gap-3">
                        <span>Date &amp; time</span>
                        <span className="text-ink font-mono">
                          {formatFullDate(tx.createdAt)}
                        </span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span>Transaction ID</span>
                        <span className="text-ink font-mono truncate max-w-[180px]">
                          {tx.id}
                        </span>
                      </div>
                      {tx.reference && (
                        <div className="flex justify-between gap-3">
                          <span>Reference</span>
                          <span className="text-ink font-mono truncate max-w-[180px]">
                            {tx.reference}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <p className="text-[11px] text-muted text-center mt-6">
          Tournament entry fees are still paid directly per tournament —
          wallet balance isn't wired into registration payment yet.
        </p>
      </div>
    </div>
  );
}
