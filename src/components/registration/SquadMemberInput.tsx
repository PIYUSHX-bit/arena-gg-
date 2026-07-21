import type { PlayerInfo } from "../../types/tournament";

interface SquadMemberInputProps {
  value: PlayerInfo;
  onChange: (value: PlayerInfo) => void;
}

export default function SquadMemberInput({
  value,
  onChange,
}: SquadMemberInputProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="block text-xs tracking-wider text-muted uppercase mb-1.5">
          Your Free Fire IGN
        </label>
        <input
          type="text"
          value={value.ign}
          onChange={(e) => onChange({ ...value, ign: e.target.value })}
          placeholder="In-game name"
          required
          maxLength={20}
          className="w-full bg-surface-2 border border-line rounded px-3 py-2.5 text-sm outline-none transition-colors focus:border-ember"
        />
      </div>
      <div>
        <label className="block text-xs tracking-wider text-muted uppercase mb-1.5">
          Free Fire UID
        </label>
        <input
          type="text"
          inputMode="numeric"
          value={value.uid}
          onChange={(e) =>
            onChange({ ...value, uid: e.target.value.replace(/\D/g, "") })
          }
          placeholder="123456789"
          required
          maxLength={12}
          className="w-full bg-surface-2 border border-line rounded px-3 py-2.5 text-sm outline-none transition-colors focus:border-ember"
        />
      </div>
    </div>
  );
}
