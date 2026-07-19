import { Mail, Send, Clock } from "lucide-react";
import SubPageShell from "./SubPageShell";

// Replace these with your real support channels before launch.
const SUPPORT_EMAIL = "support@arena.gg";
const TELEGRAM_URL = "https://t.me/arenagg_support";
const SUPPORT_HOURS = "10 AM – 10 PM IST, every day";

export default function ContactPage() {
  return (
    <SubPageShell title="Contact Us">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 bg-surface border border-line rounded-lg px-4 py-4">
          <Clock size={19} className="text-ember shrink-0" />
          <div>
            <div className="text-sm font-medium">Support Hours</div>
            <div className="text-xs text-muted">{SUPPORT_HOURS}</div>
          </div>
        </div>

        <a
          href={TELEGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 bg-surface border border-line rounded-lg px-4 py-4"
        >
          <Send size={19} className="text-zone shrink-0" />
          <div>
            <div className="text-sm font-medium">Telegram (fastest reply)</div>
            <div className="text-xs text-muted">{TELEGRAM_URL.replace("https://", "")}</div>
          </div>
        </a>

        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="flex items-center gap-3 bg-surface border border-line rounded-lg px-4 py-4"
        >
          <Mail size={19} className="text-amber shrink-0" />
          <div>
            <div className="text-sm font-medium">Email</div>
            <div className="text-xs text-muted">{SUPPORT_EMAIL}</div>
          </div>
        </a>
      </div>

      <p className="text-xs text-muted mt-5">
        For payment issues, include your registered phone/email and the
        tournament name — it speeds up lookup significantly.
      </p>
    </SubPageShell>
  );
}
