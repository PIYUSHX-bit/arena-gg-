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

  // Always show the Room ID / Password shell, even before the admin has
  // set anything or before match start — so players know this is where
  // it'll show up, rather than a placeholder message that disappears
  // once real data exists. Each row is just left blank until it's ready.
  const showPassword = matchStarted && !!room?.roomPassword;

  return (
    <div className="border border-line rounded-lg divide-y divide-line overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2 min-w-0">
          <KeyRound size={14} className="text-zone shrink-0" />
          <div className="min-w-0">
            <div className="text-[10px] text-muted uppercase tracking-wide">
              Room ID
            </div>
            <div className="text-sm font-mono truncate">
              {room?.roomId || (
                <span className="text-muted font-body">
                  Drops 15 min before start
                </span>
              )}
            </div>
          </div>
        </div>
        {room?.roomId && <CopyIconButton value={room.roomId} />}
      </div>

      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2 min-w-0">
          {showPassword ? (
            <KeyRound size={14} className="text-zone shrink-0" />
          ) : (
            <Lock size={14} className="text-muted shrink-0" />
          )}
          <div className="min-w-0">
            <div className="text-[10px] text-muted uppercase tracking-wide">
              Password
            </div>
            {showPassword ? (
              <div className="text-sm font-mono truncate">
                {room!.roomPassword}
              </div>
            ) : (
              <div className="text-xs text-muted">
                {matchStarted ? "Not set yet" : "Unlocks at match start"}
              </div>
            )}
          </div>
        </div>
        {showPassword && <CopyIconButton value={room!.roomPassword!} />}
      </div>
    </div>
  );
}
