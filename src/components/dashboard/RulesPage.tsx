import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const RULE_SECTIONS: { title: string; points: string[] }[] = [
  {
    title: "Registration",
    points: [
      "Enter your correct Free Fire IGN and UID at registration — mismatched details can get your entry rejected without refund.",
      "Squad size must match the tournament mode exactly (Solo: 1, Duo: 2, Squad: 4).",
      "Check in within the check-in window before the match starts, or your slot may be forfeited.",
    ],
  },
  {
    title: "Match Conduct",
    points: [
      "Join the custom room using the exact in-game name you registered with.",
      "Room ID and password are sent 15 minutes before the match — do not share them outside your squad.",
      "Stream sniping, teaming with opposing squads, or intentionally feeding kills is grounds for disqualification.",
    ],
  },
  {
    title: "Fair Play",
    points: [
      "Use of emulators is not allowed in mobile-only tournaments unless explicitly stated otherwise.",
      "Any hacks, mod menus, macros, or third-party software that alters gameplay result in an immediate ban.",
      "Multiple accounts entered by the same player into one tournament will have all related entries disqualified.",
    ],
  },
  {
    title: "Results & Disputes",
    points: [
      "Match results are pulled from the server — screenshots are not accepted as proof of placement or kills.",
      "Disputes must be raised within 24 hours of the match ending, via Contact Us.",
      "ARENA.GG's admin decision on disputes is final.",
    ],
  },
  {
    title: "Payouts",
    points: [
      "Prize winnings are credited after results are verified — typically within 24 hours.",
      "Payouts may be withheld pending investigation of a suspected rule violation.",
    ],
  },
];

export default function RulesPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-base text-ink font-body max-w-[480px] mx-auto pb-10">
      <div className="flex items-center gap-3 px-5 py-4 bg-surface border-b border-line sticky top-0 z-10">
        <button onClick={() => navigate(-1)} aria-label="Back">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-display font-semibold text-xl tracking-wide">
          THE RULES
        </h1>
      </div>

      <div className="px-5 py-6 flex flex-col gap-6">
        {RULE_SECTIONS.map((section) => (
          <section key={section.title}>
            <h2 className="font-display font-semibold text-lg text-ember mb-2.5">
              {section.title}
            </h2>
            <ul className="flex flex-col gap-2">
              {section.points.map((point) => (
                <li
                  key={point}
                  className="flex gap-2.5 text-sm text-muted leading-relaxed"
                >
                  <span className="text-ember shrink-0">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <p className="text-xs text-muted border-t border-line pt-5">
          Breaking any of the above can result in disqualification, entry
          fee forfeiture, or an account ban depending on severity.
        </p>
      </div>
    </div>
  );
}
