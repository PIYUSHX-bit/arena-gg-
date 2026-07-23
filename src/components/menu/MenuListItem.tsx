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
  const labelContent = (
    <div className="flex items-center gap-3.5">
      <Icon size={19} className="text-ember shrink-0" />
      <span className="text-[15px]">{label}</span>
    </div>
  );

  const switchEl = toggle && (
    <span
      role="switch"
      aria-checked={toggle.checked}
      className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
        toggle.checked ? "bg-ember" : "bg-surface-2 border border-line"
      }`}
    >
      <span
        className={`absolute top-0.5 w-5 h-5 rounded-full bg-ink transition-transform ${
          toggle.checked ? "translate-x-[22px]" : "translate-x-0.5"
        }`}
      />
    </span>
  );

  // Both a nav action and a toggle at once (e.g. "Notifications": tap
  // the row to view history, flip the switch to enable/disable push)
  // need independent click targets — nesting the toggle inside a single
  // onClick button would fire both handlers on every tap.
  if (onClick && toggle) {
    return (
      <div className="w-full flex items-center justify-between bg-surface border border-line rounded-lg pl-4 pr-3 py-4 transition-colors hover:border-muted">
        <button
          onClick={onClick}
          className="flex-1 flex items-center gap-3.5 text-left py-0"
        >
          {labelContent}
        </button>
        <button
          onClick={() => toggle.onChange(!toggle.checked)}
          aria-label={`${label}: turn ${toggle.checked ? "off" : "on"}`}
          className="shrink-0 pl-3 py-1"
        >
          {switchEl}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={toggle ? () => toggle.onChange(!toggle.checked) : onClick}
      className="w-full flex items-center justify-between bg-surface border border-line rounded-lg px-4 py-4 text-left transition-colors hover:border-muted"
    >
      {labelContent}
      {toggle ? switchEl : <ChevronRight size={18} className="text-muted shrink-0" />}
    </button>
  );
}
