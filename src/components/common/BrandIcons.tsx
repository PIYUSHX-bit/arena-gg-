import type { ReactNode } from "react";

// Shared "soft neumorphic badge" look for brand/contact icon chips across
// the app — a raised tile with a diagonal gradient and an inset
// highlight/shadow for a tactile, embossed feel, rather than a flat
// tinted circle. Reused by ContactPage, the announcement banner, and the
// WhatsApp promo card so they all read as the same design language.
export function IconBadge({
  gradientFrom,
  gradientTo,
  shadowColor,
  size = 44,
  children,
}: {
  gradientFrom: string;
  gradientTo: string;
  shadowColor: string;
  size?: number;
  children: ReactNode;
}) {
  return (
    <span
      className="shrink-0 rounded-2xl flex items-center justify-center"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(145deg, ${gradientFrom}, ${gradientTo})`,
        boxShadow: `0 6px 14px -4px ${shadowColor}, inset 0 1px 1px rgba(255,255,255,0.35), inset 0 -2px 4px rgba(0,0,0,0.25)`,
      }}
    >
      {children}
    </span>
  );
}

export function TelegramIcon({ size = 19 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#fff" aria-hidden="true">
      <path
        transform="translate(1.2 1.4) scale(0.9)"
        d="m21.6 3.5-3.4 16.2c-.3 1.1-1 1.4-2 .9l-5.4-4-2.6 2.5c-.3.3-.5.5-1 .5l.4-5.4 9.9-8.9c.4-.4-.1-.6-.7-.2L5.3 11.8 0 10.2c-1.1-.4-1.2-1.1.2-1.7L20 1.2c1-.4 1.8.2 1.6 2.3Z"
      />
    </svg>
  );
}

export function WhatsAppIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="#fff" aria-hidden="true">
      <path d="M24 10c-7.7 0-14 6.3-14 14 0 2.6.7 5.1 2 7.3L10 39l8-2c2.1 1.2 4.5 1.8 7 1.8 7.7 0 14-6.3 14-14s-6.3-14.8-15-14.8Zm7.6 19.9c-.3.9-1.7 1.7-2.6 1.9-.7.1-1.6.2-4.6-1-3.9-1.6-6.4-5.6-6.6-5.9-.2-.3-1.6-2.1-1.6-4s1-2.8 1.3-3.2c.3-.4.7-.5 1-.5h.7c.2 0 .5-.1.8.6.3.8 1.1 2.7 1.2 2.9.1.2.2.4 0 .6-.1.3-.2.4-.4.6l-.6.7c-.2.2-.4.4-.2.8.2.4 1 1.7 2.2 2.7 1.5 1.3 2.7 1.7 3.1 1.9.4.2.6.2.8-.1.2-.3 1-1.1 1.2-1.5.2-.4.5-.3.8-.2.3.1 2.2 1.1 2.6 1.3.4.2.7.3.8.4.1.3.1.9-.2 1.8Z" />
    </svg>
  );
}
