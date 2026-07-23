import { useEffect, useState } from "react";
import {
  fetchPendingWithdrawals,
  processWithdrawal,
  type PendingWithdrawal,
} from "../../lib/admin";
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

function waitingLabel(iso: string): string {
  const hours = Math.floor((Date.now() - new Date(iso).getTime()) / 3_600_000);
  if (hours < 1) return "just now";
  if (hours < 24) return `waiting ${hours}h`;
  return `waiting ${Math.floor(hours / 24)}d`;
}

type PendingAction = { requestId: string; action: "paid" | "rejected" } | null;

export default function WithdrawalRequestsTab() {
  const [requests, setRequests] = useState<PendingWithdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<PendingAction>(null);

  async function load() {
    setLoading(true);
    const { requests: r, error: err } = await fetchPendingWithdrawals();
    setRequests(r);
    setError(err);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAction(requestId: string, action: "paid" | "rejected") {
    setProcessingId(requestId);
    setError(null);

    const { error: actionError } = await processWithdrawal(requestId, action);

    setProcessingId(null);
    setConfirming(null);

    if (actionError) {
      setError(actionError);
      return;
    }

    load();
  }

  if (loading) {
    return <p className="text-center text-muted text-sm py-8">Loading...</p>;
  }

  const totalPending = requests.reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="flex flex-col gap-3">
      {error && (
        <p className="text-xs text-ember bg-ember/10 border border-ember/30 rounded px-3 py-2">
          {error}
        </p>
      )}

      {requests.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-surface border border-amber/30 rounded-lg px-3 py-2.5">
            <p className="text-[10px] text-muted uppercase tracking-wide mb-0.5">
              Pending Requests
            </p>
            <p className="text-sm font-mono font-semibold text-amber">
              {requests.length}
            </p>
          </div>
          <div className="bg-surface border border-line rounded-lg px-3 py-2.5">
            <p className="text-[10px] text-muted uppercase tracking-wide mb-0.5">
              Total Owed
            </p>
            <p className="text-sm font-mono font-semibold">
              {formatRupees(totalPending)}
            </p>
          </div>
        </div>
      )}

      {requests.length === 0 && (
        <p className="text-center text-muted text-sm py-10">
          No pending withdrawal requests.
        </p>
      )}

      {requests.map((req) => {
        const isConfirmingPaid =
          confirming?.requestId === req.id && confirming.action === "paid";
        const isConfirmingReject =
          confirming?.requestId === req.id && confirming.action === "rejected";
        const busy = processingId === req.id;

        return (
          <div
            key={req.id}
            className="bg-surface border border-line rounded-lg px-4 py-3.5"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">{req.displayName}</span>
              <span className="font-mono text-sm text-amber">
                {formatRupees(req.amount)}
              </span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 text-xs text-muted">
                <span className="font-mono">{req.upiId}</span>
                <CopyIconButton value={req.upiId} />
              </div>
              <span className="text-[11px] text-muted">
                {formatDate(req.createdAt)} · {waitingLabel(req.createdAt)}
              </span>
            </div>

            {isConfirmingPaid && (
              <div className="border border-safe/40 bg-safe/10 rounded p-3 mb-3 flex flex-col gap-2">
                <p className="text-xs text-ink">
                  Confirm you've sent{" "}
                  <span className="font-mono font-semibold">
                    {formatRupees(req.amount)}
                  </span>{" "}
                  to <span className="font-mono">{req.upiId}</span> via UPI?
                  This marks the request as paid and can't be undone.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAction(req.id, "paid")}
                    disabled={busy}
                    className="flex-1 bg-safe text-base font-semibold text-sm py-2 rounded disabled:opacity-50"
                  >
                    {busy ? "Processing..." : "Yes, Mark Paid"}
                  </button>
                  <button
                    onClick={() => setConfirming(null)}
                    disabled={busy}
                    className="px-4 border border-line rounded text-sm text-muted disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {isConfirmingReject && (
              <div className="border border-ember/40 bg-ember/10 rounded p-3 mb-3 flex flex-col gap-2">
                <p className="text-xs text-ink">
                  Reject this request and refund{" "}
                  <span className="font-mono font-semibold">
                    {formatRupees(req.amount)}
                  </span>{" "}
                  back to {req.displayName}'s wallet?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAction(req.id, "rejected")}
                    disabled={busy}
                    className="flex-1 bg-ember text-base font-semibold text-sm py-2 rounded disabled:opacity-50"
                  >
                    {busy ? "Processing..." : "Yes, Reject & Refund"}
                  </button>
                  <button
                    onClick={() => setConfirming(null)}
                    disabled={busy}
                    className="px-4 border border-line rounded text-sm text-muted disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {!isConfirmingPaid && !isConfirmingReject && (
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setConfirming({ requestId: req.id, action: "paid" })
                  }
                  disabled={busy}
                  className="flex-1 bg-safe text-base font-semibold text-sm py-2 rounded disabled:opacity-50"
                >
                  Mark Paid
                </button>
                <button
                  onClick={() =>
                    setConfirming({ requestId: req.id, action: "rejected" })
                  }
                  disabled={busy}
                  className="flex-1 border border-ember text-ember font-semibold text-sm py-2 rounded disabled:opacity-50"
                >
                  Reject &amp; Refund
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
