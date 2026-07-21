import { useEffect, useState } from "react";
import { Timer } from "lucide-react";

interface MatchCountdownProps {
  startsAtIso: string;
}

function formatRemaining(ms: number): string {
  const totalSeconds = Math.max(Math.floor(ms / 1000), 0);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => String(n).padStart(2, "0");

  if (days > 0) {
    return `${days}d ${pad(hours)}h ${pad(minutes)}m`;
  }
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export default function MatchCountdown({ startsAtIso }: MatchCountdownProps) {
  const startsAtMs = new Date(startsAtIso).getTime();
  const [remainingMs, setRemainingMs] = useState(() => startsAtMs - Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingMs(startsAtMs - Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, [startsAtMs]);

  const started = remainingMs <= 0;

  return (
    <div
      className={`flex items-center justify-between rounded-xl border px-4 py-3.5 ${
        started ? "border-safe/30 bg-safe/10" : "border-line bg-surface"
      }`}
    >
      <div className="flex items-center gap-2.5">
        <Timer size={16} className={started ? "text-safe" : "text-amber"} />
        <span className="text-xs text-muted uppercase tracking-wide">
          {started ? "Match has started" : "Starts in"}
        </span>
      </div>
      {!started && (
        <span className="font-mono text-base font-semibold text-ink">
          {formatRemaining(remainingMs)}
        </span>
      )}
    </div>
  );
}
