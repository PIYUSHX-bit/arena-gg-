import { Gift, Trophy, Home, MoreHorizontal } from "lucide-react";

export type NavTab = "earn" | "leaderboard" | "home" | "menu";

interface BottomNavProps {
  active: NavTab;
  onChange: (tab: NavTab) => void;
}

const TABS: { id: NavTab; label: string; icon: typeof Home }[] = [
  { id: "earn", label: "Earn", icon: Gift },
  { id: "leaderboard", label: "Leaderboard", icon: Trophy },
  { id: "home", label: "Home", icon: Home },
  { id: "menu", label: "Menu", icon: MoreHorizontal },
];

export default function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 z-40 flex w-full max-w-[480px] bg-surface border-t border-line px-2 pt-2 shadow-[0_-8px_24px_rgba(0,0,0,0.35)] [padding-bottom:max(0.5rem,env(safe-area-inset-bottom))]">
      {TABS.map(({ id, label, icon: Icon }) => {
        const isActive = id === active;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className="flex-1 flex flex-col items-center gap-1 py-1.5 transition-transform active:scale-95"
          >
            <Icon
              size={20}
              className={isActive ? "text-ember" : "text-muted"}
            />
            <span
              className={`text-[11px] ${
                isActive ? "text-ink font-medium" : "text-muted"
              }`}
            >
              {label}
            </span>
            {isActive && (
              <span className="w-4 h-0.5 rounded-full bg-ember mt-0.5" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
