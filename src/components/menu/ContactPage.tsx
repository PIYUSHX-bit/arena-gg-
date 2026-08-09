import { Clock, ChevronRight, Lightbulb, Headset } from "lucide-react";
import SubPageShell from "./SubPageShell";

const TELEGRAM_URL = "https://t.me/NIKHILY9";
const WHATSAPP_GROUP_URL =
  "https://chat.whatsapp.com/BeVDeycJVIp464TudISKVj?s=cl&p=a&mlu=4&amv=1";
const PERSONAL_WHATSAPP_URL = "https://WA.me/917697357080";
const SUPPORT_HOURS = "10 AM – 10 PM IST, every day";

// Shared "soft neumorphic badge" look for every icon chip on this page —
// a raised tile with a diagonal gradient and an inset highlight/shadow for
// a tactile, embossed feel, rather than a flat tinted circle.
function IconBadge({
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
  children: React.ReactNode;
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

function TelegramIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="#fff" aria-hidden="true">
      <path
        transform="translate(1.2 1.4) scale(0.9)"
        d="m21.6 3.5-3.4 16.2c-.3 1.1-1 1.4-2 .9l-5.4-4-2.6 2.5c-.3.3-.5.5-1 .5l.4-5.4 9.9-8.9c.4-.4-.1-.6-.7-.2L5.3 11.8 0 10.2c-1.1-.4-1.2-1.1.2-1.7L20 1.2c1-.4 1.8.2 1.6 2.3Z"
      />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 48 48" fill="#fff" aria-hidden="true">
      <path d="M24 10c-7.7 0-14 6.3-14 14 0 2.6.7 5.1 2 7.3L10 39l8-2c2.1 1.2 4.5 1.8 7 1.8 7.7 0 14-6.3 14-14s-6.3-14.8-15-14.8Zm7.6 19.9c-.3.9-1.7 1.7-2.6 1.9-.7.1-1.6.2-4.6-1-3.9-1.6-6.4-5.6-6.6-5.9-.2-.3-1.6-2.1-1.6-4s1-2.8 1.3-3.2c.3-.4.7-.5 1-.5h.7c.2 0 .5-.1.8.6.3.8 1.1 2.7 1.2 2.9.1.2.2.4 0 .6-.1.3-.2.4-.4.6l-.6.7c-.2.2-.4.4-.2.8.2.4 1 1.7 2.2 2.7 1.5 1.3 2.7 1.7 3.1 1.9.4.2.6.2.8-.1.2-.3 1-1.1 1.2-1.5.2-.4.5-.3.8-.2.3.1 2.2 1.1 2.6 1.3.4.2.7.3.8.4.1.3.1.9-.2 1.8Z" />
    </svg>
  );
}

export default function ContactPage() {
  return (
    <SubPageShell title="Contact Us">
      <div className="flex items-center gap-3 bg-surface border border-line rounded-lg px-4 py-4 mb-5">
        <IconBadge gradientFrom="#FF7A52" gradientTo="#D93D16" shadowColor="rgba(255,74,28,0.55)">
          <Clock size={19} className="text-white" />
        </IconBadge>
        <div>
          <div className="text-sm font-medium">Support Hours</div>
          <div className="text-xs text-muted">{SUPPORT_HOURS}</div>
        </div>
      </div>

      <p className="text-xs tracking-wider text-muted uppercase mb-2.5">
        Chat With Us
      </p>
      <div className="flex flex-col gap-2.5 mb-6">
        <a
          href={TELEGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 bg-surface border border-line rounded-lg px-4 py-4 transition-colors hover:border-[#26A5E4]/50"
        >
          <IconBadge gradientFrom="#5AC8F5" gradientTo="#1789C9" shadowColor="rgba(23,137,201,0.55)">
            <TelegramIcon />
          </IconBadge>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium">Telegram</div>
            <div className="text-xs text-muted truncate">
              {TELEGRAM_URL.replace("https://", "")} · fastest reply
            </div>
          </div>
          <ChevronRight size={18} className="text-muted shrink-0" />
        </a>

        <a
          href={WHATSAPP_GROUP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 bg-surface border border-line rounded-lg px-4 py-4 transition-colors hover:border-[#25D366]/50"
        >
          <IconBadge gradientFrom="#3FDC74" gradientTo="#20B354" shadowColor="rgba(37,211,102,0.55)">
            <WhatsAppIcon />
          </IconBadge>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium">WhatsApp Group</div>
            <div className="text-xs text-muted">
              Join the community for updates &amp; discussion
            </div>
          </div>
          <ChevronRight size={18} className="text-muted shrink-0" />
        </a>

        <a
          href={PERSONAL_WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 bg-surface border border-line rounded-lg px-4 py-4 transition-colors hover:border-amber/50"
        >
          <IconBadge gradientFrom="#FFC85C" gradientTo="#E69800" shadowColor="rgba(255,176,32,0.55)">
            <Headset size={19} className="text-white" />
          </IconBadge>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium">Personal Issue</div>
            <div className="text-xs text-muted">
              For account or payment issues you'd rather not post in the
              group
            </div>
          </div>
          <ChevronRight size={18} className="text-muted shrink-0" />
        </a>
      </div>

      <div className="flex items-start gap-3 bg-gradient-to-br from-amber/10 via-surface to-surface border border-amber/30 rounded-lg px-4 py-3.5">
        <IconBadge gradientFrom="#FFC85C" gradientTo="#E69800" shadowColor="rgba(255,176,32,0.5)" size={36}>
          <Lightbulb size={16} className="text-white" />
        </IconBadge>
        <p className="text-xs text-muted pt-1">
          For payment issues, include your registered phone/email and the
          tournament name — it speeds up lookup significantly.
        </p>
      </div>
    </SubPageShell>
  );
}
