import { useState } from "react";
import { broadcastNotification, sendPushBroadcast } from "../../lib/admin";

export default function AdminBroadcastTab() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentCount, setSentCount] = useState<number | null>(null);
  const [pushError, setPushError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  function handleSendClick() {
    setError(null);
    setSentCount(null);
    setPushError(null);

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    setConfirming(true);
  }

  async function handleConfirmSend() {
    setConfirming(false);
    setSending(true);

    const { recipientCount, error: sendError } = await broadcastNotification(
      title.trim(),
      body.trim()
    );

    if (sendError) {
      setSending(false);
      setError(sendError);
      return;
    }

    // Best-effort — the in-app notification already landed either way,
    // so a push failure (e.g. no one has enabled push yet) is reported
    // but doesn't undo the broadcast above.
    const { error: pushSendError } = await sendPushBroadcast(
      title.trim(),
      body.trim()
    );

    setSending(false);
    setSentCount(recipientCount);
    setPushError(pushSendError);
    setTitle("");
    setBody("");
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="block text-xs tracking-wider text-muted uppercase mb-1.5">
          Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Server Maintenance"
          className="w-full bg-surface-2 border border-line rounded px-3 py-2.5 text-sm outline-none focus:border-ember"
        />
      </div>

      <div>
        <label className="block text-xs tracking-wider text-muted uppercase mb-1.5">
          Message
        </label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          placeholder="e.g. Servers will be down for maintenance from 2 AM to 4 AM IST tonight."
          className="w-full bg-surface-2 border border-line rounded px-3 py-2.5 text-sm outline-none focus:border-ember resize-none"
        />
      </div>

      <p className="text-[11px] text-muted">
        This goes out to every registered player's notifications
        immediately — there's no scheduling, so double-check the wording
        before sending.
      </p>

      {error && (
        <p className="text-xs text-ember bg-ember/10 border border-ember/30 rounded px-3 py-2">
          {error}
        </p>
      )}

      {sentCount !== null && (
        <p className="text-xs text-safe bg-safe/10 border border-safe/30 rounded px-3 py-2">
          Sent to {sentCount} player{sentCount === 1 ? "" : "s"} in-app.
          {pushError && (
            <span className="block text-ember mt-1">
              Push notification failed: {pushError}
            </span>
          )}
        </p>
      )}

      {confirming ? (
        <div className="border border-ember/40 bg-ember/10 rounded-lg p-4 flex flex-col gap-3">
          <div>
            <p className="text-xs text-muted uppercase tracking-wide mb-1">
              Preview
            </p>
            <p className="text-sm font-medium">{title.trim()}</p>
            {body.trim() && (
              <p className="text-xs text-muted mt-1">{body.trim()}</p>
            )}
          </div>
          <p className="text-xs text-ink">
            Send this to every player right now? This can't be recalled
            once sent.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleConfirmSend}
              disabled={sending}
              className="flex-1 bg-ember text-base font-semibold text-sm py-2.5 rounded disabled:opacity-50"
            >
              {sending ? "Sending..." : "Confirm Send"}
            </button>
            <button
              onClick={() => setConfirming(false)}
              disabled={sending}
              className="px-4 border border-line rounded text-sm text-muted disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={handleSendClick}
          disabled={sending || !title.trim()}
          className="bg-ember text-base font-semibold text-sm py-2.5 rounded disabled:opacity-50"
        >
          Send to All Players
        </button>
      )}
    </div>
  );
}
