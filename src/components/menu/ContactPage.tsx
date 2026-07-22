import { Send, Clock, ChevronRight } from "lucide-react";
import SubPageShell from "./SubPageShell";

const TELEGRAM_URL = "https://t.me/NIKHILY9";
const WHATSAPP_GROUP_URL =
  "https://chat.whatsapp.com/BeVDeycJVIp464TudISKVj?s=cl&p=a&mlu=4&amv=1";
const PERSONAL_WHATSAPP_URL = "https://WA.me/917697357080";
const SUPPORT_HOURS = "10 AM – 10 PM IST, every day";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12.004 2C6.477 2 2 6.477 2 12c0 1.842.505 3.564 1.379 5.037L2 22l5.096-1.339A9.936 9.936 0 0 0 12.004 22C17.526 22 22 17.523 22 12S17.526 2 12.004 2zm5.42 14.244c-.226.638-1.117 1.166-1.836 1.318-.489.104-1.128.187-3.28-.7-2.756-1.14-4.53-3.945-4.668-4.128-.137-.183-1.116-1.485-1.116-2.833s.703-2.007.953-2.28c.25-.273.545-.34.727-.34l.523.009c.166.008.39-.063.61.466.226.545.77 1.885.837 2.022.068.137.113.296.023.478-.09.183-.137.296-.272.455l-.41.478c-.137.137-.279.285-.12.557.159.273.706 1.165 1.517 1.888 1.043.93 1.923 1.218 2.194 1.354.272.137.431.114.59-.068.16-.183.68-.795.863-1.068.183-.273.364-.228.614-.137.25.09 1.592.751 1.865.888.272.137.454.205.522.318.068.114.068.66-.16 1.298z" />
    </svg>
  );
}

export default function ContactPage() {
  return (
    <SubPageShell title="Contact Us">
      <div className="flex items-center gap-3 bg-surface border border-line rounded-lg px-4 py-4 mb-5">
        <span className="shrink-0 w-9 h-9 rounded-full bg-ember/15 flex items-center justify-center">
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
          className="flex items-center gap-3 bg-surface border border-line rounded-lg px-4 py-4 transition-colors hover:border-zone"
        >
          <span className="shrink-0 w-9 h-9 rounded-full bg-zone/15 flex items-center justify-center">
            <Send size={17} className="text-zone" />
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
          className="flex items-center gap-3 bg-surface border border-line rounded-lg px-4 py-4 transition-colors hover:border-safe"
        >
          <span className="shrink-0 w-9 h-9 rounded-full bg-safe/15 flex items-center justify-center">
            <WhatsAppIcon className="w-[17px] h-[17px] text-safe" />
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
          className="flex items-center gap-3 bg-surface border border-line rounded-lg px-4 py-4 transition-colors hover:border-safe"
        >
          <span className="shrink-0 w-9 h-9 rounded-full bg-safe/15 flex items-center justify-center">
            <WhatsAppIcon className="w-[17px] h-[17px] text-safe" />
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

      <p className="text-xs text-muted">
        For payment issues, include your registered phone/email and the
        tournament name — it speeds up lookup significantly.
      </p>
    </SubPageShell>
  );
}
