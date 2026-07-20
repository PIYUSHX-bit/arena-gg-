import { useEffect, useState } from "react";
import { Lock, KeyRound } from "lucide-react";
import { fetchTournamentRoom, type TournamentRoomInfo } from "../../lib/entries";
import CopyIconButton from "../common/CopyIconButton";

interface RoomDetailsProps {
  tournamentId: string;
  startsAtIso: string;
}

export default function RoomDetails({ tournamentId, startsAtIso }: RoomDetailsProps) {
  const [room, setRoom] = useState<TournamentRoomInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [matchStarted, setMatchStarted] = useState(
    () => Date.now() >= new Date(startsAtIso).getTime()
  );

  useEffect(() => {
    fetchTournamentRoom(tournamentId).then(({ room: r }) => {
      setRoom(r);
      setLoading(false);
    });
  }, [tournamentId]);

  // Flip the moment start time passes, for anyone who has the page open
  // and waiting rather than reloading right at match time.
  useEffect(() => {
    if (matchStarted) return;
    const msUntilStart = new Date(startsAtIso).getTime() - Date.now();
    if (msUntilStart <= 0) return;
    const timer = setTimeout(() => setMatchStarted(true), msUntilStart);
    return () => clearTimeout(timer);
  }, [startsAtIso, matchStarted]);

  if (loading) {
    return <p className="text-xs text-muted py-2">Loading room details...</p>;
  }

  if (!room?.roomId) {
    return (
      <div className="border border-line rounded-lg px-4 py-3.5 text-center">
        <p className="text-xs text-muted">
          Room ID drops 15 minutes before the match starts — check back soon.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-line rounded-lg divide-y divide-line overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2 min-w-0">
          <KeyRound size={14} className="text-zone shrink-0" />
          <div className="min-w-0">
            <div className="text-[10px] text-muted uppercase tracking-wide">
              Room ID
            </div>
            <div className="text-sm font-mono truncate">{room.roomId}</div>
          </div>
        </div>
        <CopyIconButton value={room.roomId} />
      </div>

      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2 min-w-0">
          {matchStarted ? (
            <KeyRound size={14} className="text-zone shrink-0" />
          ) : (
            <Lock size={14} className="text-muted shrink-0" />
          )}
          <div className="min-w-0">
            <div className="text-[10px] text-muted uppercase tracking-wide">
              Password
            </div>
            {matchStarted ? (
              <div className="text-sm font-mono truncate">
                {room.roomPassword || "—"}
              </div>
            ) : (
              <div className="text-xs text-muted">Unlocks at match start</div>
            )}
          </div>
        </div>
        {matchStarted && room.roomPassword && (
          <CopyIconButton value={room.roomPassword} />
        )}
      </div>
    </div>
  );
}
