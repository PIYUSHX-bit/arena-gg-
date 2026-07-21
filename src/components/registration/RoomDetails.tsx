import { useEffect, useState } from "react";
import { Lock, KeyRound, DoorOpen } from "lucide-react";
import { fetchTournamentRoom, type TournamentRoomInfo } from "../../lib/entries";
import CopyIconButton from "../common/CopyIconButton";

const ROOM_ID_LEAD_MS = 15 * 60 * 1000; // Room ID unlocks 15 min before start

interface RoomDetailsProps {
  tournamentId: string;
  startsAtIso: string;
}

function RoomRow({
  label,
  value,
  placeholder,
  locked,
}: {
  label: string;
  value: string | null;
  placeholder: string;
  locked?: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5">
      <div className="flex items-center gap-3 min-w-0">
        <span
          className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${
            value ? "bg-zone/15" : "bg-surface-2"
          }`}
        >
          {locked ? (
            <Lock size={15} className="text-muted" />
          ) : (
            <KeyRound size={15} className={value ? "text-zone" : "text-muted"} />
          )}
        </span>
        <div className="min-w-0">
          <div className="text-[10px] text-muted uppercase tracking-wide mb-0.5">
            {label}
          </div>
          {value ? (
            <div className="text-base font-mono font-semibold text-ink truncate">
              {value}
            </div>
          ) : (
            <div className="text-xs text-muted">{placeholder}</div>
          )}
        </div>
      </div>
      {value && <CopyIconButton value={value} />}
    </div>
  );
}

// Flips `setUnlocked` the moment `unlockAtMs` passes, for anyone with the
// page open and waiting rather than reloading right at the unlock time.
function useUnlocksAt(unlockAtMs: number) {
  const [unlocked, setUnlocked] = useState(() => Date.now() >= unlockAtMs);

  useEffect(() => {
    if (unlocked) return;
    const msUntilUnlock = unlockAtMs - Date.now();
    if (msUntilUnlock <= 0) return;
    const timer = setTimeout(() => setUnlocked(true), msUntilUnlock);
    return () => clearTimeout(timer);
  }, [unlockAtMs, unlocked]);

  return unlocked;
}

export default function RoomDetails({ tournamentId, startsAtIso }: RoomDetailsProps) {
  const [room, setRoom] = useState<TournamentRoomInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const startsAtMs = new Date(startsAtIso).getTime();
  // Room ID is withheld until 15 minutes before start regardless of when
  // the admin actually set it, so it can never leak early even if it was
  // entered days in advance. Password stays locked until start itself.
  const roomIdUnlocked = useUnlocksAt(startsAtMs - ROOM_ID_LEAD_MS);
  const matchStarted = useUnlocksAt(startsAtMs);

  useEffect(() => {
    fetchTournamentRoom(tournamentId).then(({ room: r }) => {
      setRoom(r);
      setLoading(false);
    });
  }, [tournamentId]);

  if (loading) {
    return <p className="text-xs text-muted py-2">Loading room details...</p>;
  }

  // Always show the Room ID / Password shell, even before the admin has
  // set anything or before it's time to reveal it — so players know this
  // is where it'll show up, rather than a placeholder that disappears
  // once real data exists. Each row is just left blank until it's ready.
  const showRoomId = roomIdUnlocked && !!room?.roomId;
  const showPassword = matchStarted && !!room?.roomPassword;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <DoorOpen size={15} className="text-zone" />
        <h3 className="text-sm font-semibold">Room Details</h3>
      </div>
      <div className="border border-line bg-surface rounded-xl divide-y divide-line overflow-hidden">
        <RoomRow
          label="Room ID"
          value={showRoomId ? room!.roomId : null}
          placeholder={
            roomIdUnlocked ? "Not set yet" : "Drops 15 min before start"
          }
          locked={!showRoomId}
        />
        <RoomRow
          label="Password"
          value={showPassword ? room!.roomPassword : null}
          placeholder={matchStarted ? "Not set yet" : "Unlocks at match start"}
          locked={!showPassword}
        />
      </div>
    </div>
  );
}
