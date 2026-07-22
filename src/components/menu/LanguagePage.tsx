import { Check, Languages } from "lucide-react";
import SubPageShell from "./SubPageShell";

// Only English exists today — this page just makes that explicit and
// gives future languages a slot to drop into, matching the app's theme
// instead of relying on the browser/OS default language picker.
const LANGUAGES = [{ code: "en", label: "English", native: "English" }];

export default function LanguagePage() {
  return (
    <SubPageShell title="Language">
      <div className="flex items-center gap-3 bg-surface border border-line rounded-lg px-4 py-4 mb-6">
        <Languages size={19} className="text-ember shrink-0" />
        <div>
          <div className="text-sm font-medium">App Language</div>
          <div className="text-xs text-muted">
            Choose the language ARENA.GG is displayed in.
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        {LANGUAGES.map((lang) => (
          <div
            key={lang.code}
            className="flex items-center justify-between bg-surface border border-ember/40 rounded-lg px-4 py-4"
          >
            <div>
              <div className="text-[15px] font-medium">{lang.label}</div>
              <div className="text-xs text-muted">{lang.native}</div>
            </div>
            <span className="w-6 h-6 rounded-full bg-ember flex items-center justify-center shrink-0">
              <Check size={14} className="text-base" />
            </span>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted mt-6">
        More languages are on the way — this list will grow as they're
        added.
      </p>
    </SubPageShell>
  );
}
