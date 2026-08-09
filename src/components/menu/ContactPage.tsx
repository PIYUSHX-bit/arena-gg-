import { Clock, ChevronRight, Lightbulb, Headset } from "lucide-react";
import SubPageShell from "./SubPageShell";
import { IconBadge, TelegramIcon, WhatsAppIcon } from "../common/BrandIcons";

const TELEGRAM_URL = "https://t.me/NIKHILY9";
const WHATSAPP_GROUP_URL =
  "https://chat.whatsapp.com/BeVDeycJVIp464TudISKVj?s=cl&p=a&mlu=4&amv=1";
const PERSONAL_WHATSAPP_URL = "https://WA.me/917697357080";
const SUPPORT_HOURS = "10 AM – 10 PM IST, every day";

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
