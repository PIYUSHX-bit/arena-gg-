import { Megaphone } from "lucide-react";
import { IconBadge } from "../common/BrandIcons";

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
      <IconBadge gradientFrom="#FF7A52" gradientTo="#D93D16" shadowColor="rgba(255,74,28,0.55)" size={36}>
        <Megaphone size={16} className="text-white" />
      </IconBadge>
      <span className="flex-1 min-w-0 overflow-hidden">
        {/* Rendered twice so the loop point is seamless — see the marquee
            keyframes in tailwind.config.ts. The duplicate is hidden from
            assistive tech so it isn't announced twice. */}
        <span className="flex w-max whitespace-nowrap text-sm text-ink motion-safe-only animate-marquee">
          <span className="pr-16">{text}</span>
          <span className="pr-16 marquee-duplicate" aria-hidden="true">
            {text}
          </span>
        </span>
      </span>
    </button>
  );
}
