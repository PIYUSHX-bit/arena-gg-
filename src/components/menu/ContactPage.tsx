import { useId } from "react";
import { Clock, ChevronRight, Lightbulb, Headset } from "lucide-react";
import SubPageShell from "./SubPageShell";

const TELEGRAM_URL = "https://t.me/NIKHILY9";
const WHATSAPP_GROUP_URL =
  "https://chat.whatsapp.com/BeVDeycJVIp464TudISKVj?s=cl&p=a&mlu=4&amv=1";
const PERSONAL_WHATSAPP_URL = "https://WA.me/917697357080";
const SUPPORT_HOURS = "10 AM – 10 PM IST, every day";

// The real Telegram *app* icon — a rounded-square tile with a diagonal
// blue gradient, not a circular chat-bubble badge. This is the shape and
// mark people actually recognize from their home screen.
function TelegramIcon({ className }: { className?: string }) {
  const gradId = useId();
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#42BCF2" />
          <stop offset="100%" stopColor="#1C93D2" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="13" fill={`url(#${gradId})`} />
      <path
        fill="#fff"
        d="M41.6 12.3 35.1 41c-.5 2.1-1.8 2.6-3.7 1.6l-10.2-7.5-4.9 4.7c-.5.5-1 1-2 1l.7-10.1 18.5-16.7c.8-.7-.2-1.1-1.3-.4L13.2 27.5l-9.8-3.1c-2.1-.7-2.2-2.1.5-3.1l38.2-14.7c1.8-.6 3.4.4 2.9 3.8z"
      />
    </svg>
  );
}

// The real WhatsApp app icon — flat brand green rounded-square tile with
// the white handset-in-bubble mark, sized to fill the tile the way the
// actual app icon does rather than a smaller glyph inside a separate ring.
function WhatsAppIcon({ className }: { className?: string }) {
  const gradId = useId();
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3ED972" />
          <stop offset="100%" stopColor="#1FAF52" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="13" fill={`url(#${gradId})`} />
      <path
        fill="#fff"
        d="M24 10c-7.7 0-14 6.3-14 14 0 2.6.7 5.1 2 7.3L10 39l8-2c2.1 1.2 4.5 1.8 7 1.8 7.7 0 14-6.3 14-14s-6.3-14.8-15-14.8Zm7.6 19.9c-.3.9-1.7 1.7-2.6 1.9-.7.1-1.6.2-4.6-1-3.9-1.6-6.4-5.6-6.6-5.9-.2-.3-1.6-2.1-1.6-4s1-2.8 1.3-3.2c.3-.4.7-.5 1-.5h.7c.2 0 .5-.1.8.6.3.8 1.1 2.7 1.2 2.9.1.2.2.4 0 .6-.1.3-.2.4-.4.6l-.6.7c-.2.2-.4.4-.2.8.2.4 1 1.7 2.2 2.7 1.5 1.3 2.7 1.7 3.1 1.9.4.2.6.2.8-.1.2-.3 1-1.1 1.2-1.5.2-.4.5-.3.8-.2.3.1 2.2 1.1 2.6 1.3.4.2.7.3.8.4.1.3.1.9-.2 1.8Z"
      />
    </svg>
  );
}

export default function ContactPage() {
  return (
    <SubPageShell title="Contact Us">
      <div className="flex items-center gap-3 bg-surface border border-line rounded-lg px-4 py-4 mb-5">
        <span className="shrink-0 w-11 h-11 rounded-[13px] bg-gradient-to-br from-ember/25 to-ember/10 shadow-[0_4px_14px_-4px_rgba(255,74,28,0.5)] flex items-center justify-center">
          <Clock size={19} className="text-ember" />
        </span>
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
          <span className="shrink-0 w-11 h-11 rounded-[13px] overflow-hidden shadow-[0_4px_14px_-4px_rgba(38,165,228,0.55)]">
            <TelegramIcon className="w-full h-full" />
          </span>
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
          <span className="shrink-0 w-11 h-11 rounded-[13px] overflow-hidden shadow-[0_4px_14px_-4px_rgba(37,211,102,0.55)]">
            <WhatsAppIcon className="w-full h-full" />
          </span>
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
          <span className="shrink-0 w-11 h-11 rounded-[13px] bg-gradient-to-br from-amber/25 to-amber/10 shadow-[0_4px_14px_-4px_rgba(255,176,32,0.5)] flex items-center justify-center">
            <Headset size={19} className="text-amber" />
          </span>
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
        <span className="shrink-0 w-9 h-9 rounded-[11px] bg-gradient-to-br from-amber/30 to-amber/10 shadow-[0_4px_14px_-4px_rgba(255,176,32,0.5)] flex items-center justify-center">
          <Lightbulb size={16} className="text-amber" />
        </span>
        <p className="text-xs text-muted pt-1">
          For payment issues, include your registered phone/email and the
          tournament name — it speeds up lookup significantly.
        </p>
      </div>
    </SubPageShell>
  );
}
