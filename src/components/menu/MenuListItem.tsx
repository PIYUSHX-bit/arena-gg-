import { ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface MenuListItemProps {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  toggle?: { checked: boolean; onChange: (next: boolean) => void };
}

export default function MenuListItem({
  icon: Icon,
  label,
  onClick,
  toggle,
}: MenuListItemProps) {
  // When there's a toggle, the icon itself doubles as a state indicator —
  // red/ember while on, muted while off — instead of always being ember
  // regardless of whether the setting is actually enabled.
  const iconActive = toggle ? toggle.checked : true;

  const labelContent = (
    <div className="flex items-center gap-3.5">
      <Icon
        size={19}
        className={`shrink-0 transition-colors ${iconActive ? "text-ember" : "text-muted"}`}
      />
      <span className="text-[15px]">{label}</span>
    </div>
  );

  // A single element acting as both the button and its own track — no
  // wrapping button-around-a-span indirection, which is what let the
  // knob render detached from its track in a combined nav+toggle row.
  const switchEl = toggle && (
    <button
      type="button"
      role="switch"
      aria-checked={toggle.checked}
      aria-label={`${label}: turn ${toggle.checked ? "off" : "on"}`}
      onClick={() => toggle.onChange(!toggle.checked)}
      className={`relative inline-block shrink-0 w-11 h-6 rounded-full transition-colors ${
        toggle.checked
          ? "bg-ember shadow-[0_0_8px_rgba(255,74,28,0.55)]"
          : "bg-surface-2 border border-line"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-ink transition-transform ${
          toggle.checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );

  // Both a nav action and a toggle at once (e.g. "Notifications": tap
  // the row to view history, flip the switch to enable/disable push)
  // need independent click targets.
  if (onClick && toggle) {
    return (
      <div className="w-full flex items-center justify-between bg-surface border border-line rounded-lg pl-4 pr-3 py-4 transition-colors hover:border-muted">
        <button
          onClick={onClick}
          className="flex-1 flex items-center gap-3.5 text-left py-0"
        >
          {labelContent}
        </button>
        {switchEl}
      </div>
    );
  }

  // Toggle-only, no nav action — switchEl is itself a <button>, so the
  // row is a div (a <button> can't contain another <button>).
  if (toggle) {
    return (
      <div className="w-full flex items-center justify-between bg-surface border border-line rounded-lg px-4 py-4">
        {labelContent}
        {switchEl}
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between bg-surface border border-line rounded-lg px-4 py-4 text-left transition-colors hover:border-muted"
    >
      {labelContent}
      <ChevronRight size={18} className="text-muted shrink-0" />
    </button>
  );
}
