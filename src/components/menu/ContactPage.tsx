import { useId } from "react";
import { Clock, ChevronRight, Lightbulb, Headset } from "lucide-react";
import SubPageShell from "./SubPageShell";

const TELEGRAM_URL = "https://t.me/NIKHILY9";
const WHATSAPP_GROUP_URL =
  "https://chat.whatsapp.com/BeVDeycJVIp464TudISKVj?s=cl&p=a&mlu=4&amv=1";
const PERSONAL_WHATSAPP_URL = "https://WA.me/917697357080";
const SUPPORT_HOURS = "10 AM – 10 PM IST, every day";

// Brand mark (paper plane in a circle) rendered with a soft gradient and
// gloss highlight instead of a flat fill, so it reads as a polished app
// icon rather than a plain colored glyph. `useId` keeps the gradient's id
// unique per instance — this renders twice on the page for WhatsApp.
function TelegramIcon({ className }: { className?: string }) {
  const gradId = useId();
  return (
    <svg viewBox="0 0 240 240" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={gradId} x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#4FC3F7" />
          <stop offset="100%" stopColor="#1B8FD1" />
        </linearGradient>
      </defs>
      <circle cx="120" cy="120" r="120" fill={`url(#${gradId})`} />
      <path
        d="M53.6 122.5c46-20 76.7-33.2 92-39.6 43.8-18.3 52.9-21.4 58.8-21.5 1.3 0 4.2.3 6.1 1.8 1.6 1.3 2 3 2.3 4.3.2 1.3.5 4.1.3 6.3-2.4 25.2-12.8 86.3-18.1 114.5-2.2 12-6.6 16-10.9 16.4-9.3.9-16.3-6.1-25.3-12-14.1-9.2-22-14.9-35.7-24-15.8-10.4-5.6-16.1 3.5-25.4 2.4-2.5 43.4-39.8 44.2-43.2.1-.4.2-2-.7-2.8-.9-.8-2.2-.5-3.2-.3-1.4.3-23 14.6-64.9 42.9-6.1 4.2-11.7 6.3-16.7 6.1-5.5-.1-16.1-3.1-24-5.6-9.6-3.1-17.3-4.8-16.6-10.1.3-2.8 4.2-5.6 11.7-8.6z"
        fill="#0E4B6E"
        fillOpacity="0.15"
        transform="translate(0 4)"
      />
      <path
        fill="#fff"
        d="M53.6 122.5c46-20 76.7-33.2 92-39.6 43.8-18.3 52.9-21.4 58.8-21.5 1.3 0 4.2.3 6.1 1.8 1.6 1.3 2 3 2.3 4.3.2 1.3.5 4.1.3 6.3-2.4 25.2-12.8 86.3-18.1 114.5-2.2 12-6.6 16-10.9 16.4-9.3.9-16.3-6.1-25.3-12-14.1-9.2-22-14.9-35.7-24-15.8-10.4-5.6-16.1 3.5-25.4 2.4-2.5 43.4-39.8 44.2-43.2.1-.4.2-2-.7-2.8-.9-.8-2.2-.5-3.2-.3-1.4.3-23 14.6-64.9 42.9-6.1 4.2-11.7 6.3-16.7 6.1-5.5-.1-16.1-3.1-24-5.6-9.6-3.1-17.3-4.8-16.6-10.1.3-2.8 4.2-5.6 11.7-8.6z"
      />
      <ellipse cx="95" cy="55" rx="70" ry="26" fill="#fff" opacity="0.14" />
    </svg>
  );
}

// Same treatment for WhatsApp — real logo silhouette, gradient fill plus a
// gloss highlight, brand green rather than the app's theme green.
function WhatsAppIcon({ className }: { className?: string }) {
  const gradId = useId();
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={gradId} x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#4CE182" />
          <stop offset="100%" stopColor="#22BF5B" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="12" fill={`url(#${gradId})`} />
      <path
        fill="#fff"
        d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.198.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.148-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.148.198 2.095 3.2 5.076 4.487.71.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"
      />
      <path
        fill="#fff"
        d="M12.004 2.003c-5.518 0-9.997 4.478-9.997 9.997 0 1.762.462 3.479 1.34 4.997L2 22.003l5.144-1.323a9.98 9.98 0 0 0 4.86 1.237h.004c5.518 0 9.997-4.478 9.997-9.997 0-2.67-1.04-5.18-2.928-7.068a9.93 9.93 0 0 0-7.073-2.849zm0 18.166h-.003a8.166 8.166 0 0 1-4.163-1.14l-.299-.177-3.052.785.816-2.976-.194-.305a8.15 8.15 0 0 1-1.253-4.356c0-4.507 3.667-8.174 8.174-8.174a8.12 8.12 0 0 1 5.782 2.397 8.12 8.12 0 0 1 2.393 5.783c0 4.507-3.667 8.163-8.201 8.163z"
      />
      <ellipse cx="9.5" cy="5.5" rx="7" ry="2.6" fill="#fff" opacity="0.16" />
    </svg>
  );
}

export default function ContactPage() {
  return (
    <SubPageShell title="Contact Us">
      <div className="flex items-center gap-3 bg-surface border border-line rounded-lg px-4 py-4 mb-5">
        <span className="shrink-0 w-10 h-10 rounded-full bg-gradient-to-b from-ember/25 to-ember/10 shadow-[0_4px_14px_-4px_rgba(255,74,28,0.5)] flex items-center justify-center">
          <Clock size={17} className="text-ember" />
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
          <span className="shrink-0 w-10 h-10 rounded-full overflow-hidden shadow-[0_4px_14px_-4px_rgba(38,165,228,0.55)]">
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
          <span className="shrink-0 w-10 h-10 rounded-full overflow-hidden shadow-[0_4px_14px_-4px_rgba(37,211,102,0.55)]">
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
          <span className="shrink-0 w-10 h-10 rounded-full bg-gradient-to-b from-amber/30 to-amber/10 shadow-[0_4px_14px_-4px_rgba(255,176,32,0.5)] flex items-center justify-center">
            <Headset size={18} className="text-amber" />
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
        <span className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-b from-amber/30 to-amber/10 shadow-[0_4px_14px_-4px_rgba(255,176,32,0.5)] flex items-center justify-center">
          <Lightbulb size={15} className="text-amber" />
        </span>
        <p className="text-xs text-muted pt-1">
          For payment issues, include your registered phone/email and the
          tournament name — it speeds up lookup significantly.
        </p>
      </div>
    </SubPageShell>
  );
}
