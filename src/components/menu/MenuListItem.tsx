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
  return (
    <button
      onClick={toggle ? () => toggle.onChange(!toggle.checked) : onClick}
      className="w-full flex items-center justify-between bg-surface border border-line rounded-lg px-4 py-4 text-left transition-colors hover:border-muted"
    >
      <div className="flex items-center gap-3.5">
        <Icon size={19} className="text-ember shrink-0" />
        <span className="text-[15px]">{label}</span>
      </div>

      {toggle ? (
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
      ) : (
        <ChevronRight size={18} className="text-muted shrink-0" />
      )}
    </button>
  );
}
