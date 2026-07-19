import { useEffect, useState } from "react";
import {
  fetchPendingWithdrawals,
  processWithdrawal,
  type PendingWithdrawal,
} from "../../lib/admin";

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

export default function WithdrawalRequestsTab() {
  const [requests, setRequests] = useState<PendingWithdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

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

    if (actionError) {
      setError(actionError);
      return;
    }

    load();
  }

  if (loading) {
    return <p className="text-center text-muted text-sm py-8">Loading...</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {error && (
        <p className="text-xs text-ember bg-ember/10 border border-ember/30 rounded px-3 py-2">
          {error}
        </p>
      )}

      {requests.length === 0 && (
        <p className="text-center text-muted text-sm py-10">
          No pending withdrawal requests.
        </p>
      )}

      {requests.map((req) => (
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
          <div className="text-xs text-muted mb-3">
            {req.upiId} · {formatDate(req.createdAt)}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleAction(req.id, "paid")}
              disabled={processingId === req.id}
              className="flex-1 bg-safe text-base font-semibold text-sm py-2 rounded disabled:opacity-50"
            >
              Mark Paid
            </button>
            <button
              onClick={() => handleAction(req.id, "rejected")}
              disabled={processingId === req.id}
              className="flex-1 border border-ember text-ember font-semibold text-sm py-2 rounded disabled:opacity-50"
            >
              Reject &amp; Refund
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
