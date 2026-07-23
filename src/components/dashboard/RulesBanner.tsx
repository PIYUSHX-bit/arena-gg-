import { Megaphone } from "lucide-react";

interface RulesBannerProps {
  text: string;
  onClick?: () => void;
}

export default function RulesBanner({ text, onClick }: RulesBannerProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-5 py-3 bg-surface-2 border-b border-line text-left transition-colors hover:bg-surface"
    >
      <span className="shrink-0 w-9 h-9 rounded-full bg-ember/15 flex items-center justify-center">
        <Megaphone size={16} className="text-ember" />
      </span>
      <span className="flex-1 min-w-0 overflow-hidden">
        <span className="inline-block whitespace-nowrap text-sm text-ink motion-safe-only animate-marquee">
          {text}
        </span>
      </span>
    </button>
  );
}
