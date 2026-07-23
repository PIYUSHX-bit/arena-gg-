import { useEffect, useRef, useState } from "react";
import { Send, type LucideIcon } from "lucide-react";

interface PromoSlide {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  onCtaClick?: () => void;
  icon?: LucideIcon;
  accent?: "zone" | "safe";
}

interface PromoCarouselProps {
  slides: PromoSlide[];
}

const ACCENT_CLASSES = {
  zone: {
    button: "bg-zone text-ink",
    iconWrap: "bg-zone/20 border border-zone/40",
    icon: "text-zone",
  },
  safe: {
    button: "bg-safe text-base",
    iconWrap: "bg-safe/20 border border-safe/40",
    icon: "text-safe",
  },
};

const AUTO_SCROLL_MS = 3000;

export default function PromoCarousel({ slides }: PromoCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;

    const id = setInterval(() => {
      const track = trackRef.current;
      if (!track) return;
      const next = (active + 1) % slides.length;
      track.scrollTo({ left: next * track.clientWidth, behavior: "smooth" });
      setActive(next);
    }, AUTO_SCROLL_MS);

    return () => clearInterval(id);
  }, [active, slides.length]);

  function handleScroll() {
    const track = trackRef.current;
    if (!track || track.clientWidth === 0) return;
    setActive(Math.round(track.scrollLeft / track.clientWidth));
  }

  if (slides.length === 0) return null;

  return (
    <div className="pt-4">
      <div
        ref={trackRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {slides.map((slide) => {
          const Icon = slide.icon ?? Send;
          const accent = ACCENT_CLASSES[slide.accent ?? "zone"];

          return (
            <div key={slide.id} className="w-full shrink-0 snap-start px-5">
              <div
                onClick={slide.onCtaClick}
                className={`relative rounded-xl overflow-hidden border border-line bg-gradient-to-br from-surface-2 via-surface to-base p-6 min-h-[180px] flex flex-col justify-between shadow-lg shadow-black/20 transition-transform duration-150 ${
                  slide.onCtaClick ? "cursor-pointer active:scale-[0.98]" : ""
                }`}
              >
                {/* faint zone rings, reused from the hero — keeps promo cards on-brand */}
                <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full border border-zone/20" />
                <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full border border-ember/25" />

                <div className="relative z-[1]">
                  <div className="text-xs tracking-wider text-amber uppercase mb-1.5">
                    {slide.eyebrow}
                  </div>
                  <div className="font-display font-bold text-2xl leading-tight mb-1">
                    {slide.title}
                  </div>
                  <p className="text-muted text-sm">{slide.subtitle}</p>
                </div>

                <div className="relative z-[1] flex items-center justify-between mt-4">
                  <span
                    className={`text-sm font-medium px-5 py-2.5 rounded-full ${accent.button}`}
                  >
                    {slide.ctaLabel}
                  </span>
                  <span
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${accent.iconWrap}`}
                  >
                    <Icon size={16} className={accent.icon} />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {slides.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {slides.map((s, i) => (
            <span
              key={s.id}
              className={`h-1.5 rounded-full transition-all ${
                i === active ? "w-5 bg-ember" : "w-1.5 bg-line"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
