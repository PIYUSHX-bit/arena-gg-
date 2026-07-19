import { Megaphone } from "lucide-react";

interface RulesBannerProps {
  text: string;
  onClick?: () => void;
}

export default function RulesBanner({ text, onClick }: RulesBannerProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 bg-surface-2 border-b border-line text-left"
    >
      <span className="shrink-0 w-9 h-9 rounded bg-line/40 flex items-center justify-center">
        <Megaphone size={16} className="text-muted" />
      </span>
      <span className="flex-1 min-w-0 overflow-hidden">
        <span className="inline-block whitespace-nowrap text-sm text-ink motion-safe-only animate-marquee">
          {text}
        </span>
      </span>
    </button>
  );
}
