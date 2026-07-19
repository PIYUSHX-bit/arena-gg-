import { useState } from "react";
import { ChevronDown } from "lucide-react";
import SubPageShell from "./SubPageShell";

const FAQS: { q: string; a: string }[] = [
  {
    q: "How do I get the room ID and password?",
    a: "It's sent to you automatically 15 minutes before the match starts, once you've checked in. Keep notifications on so you don't miss it.",
  },
  {
    q: "What happens if I pay but don't get registered?",
    a: "This shouldn't happen — payment confirmation and registration are linked automatically. If it does, contact support with your payment ID and it'll be resolved manually.",
  },
  {
    q: "Can I get a refund after registering?",
    a: "Entry fees are refundable only if a tournament is cancelled by ARENA.GG. Refunds for withdrawing voluntarily aren't offered, since your slot is held for you and can't be resold on short notice.",
  },
  {
    q: "What if my squad member doesn't show up?",
    a: "You can still play with fewer players than your squad size, but you won't be able to swap in a replacement player after registration closes.",
  },
  {
    q: "How are prize payouts sent?",
    a: "Winnings are sent to your wallet after results are verified from the match server. Processing usually completes within 24 hours of the match ending.",
  },
  {
    q: "What counts as cheating?",
    a: "Emulators on mobile-only tournaments, teaming with opponents, and use of any unauthorized software are all grounds for disqualification without refund.",
  },
];

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <SubPageShell title="FAQ">
      <div className="flex flex-col gap-2.5">
        {FAQS.map((item, i) => {
          const isOpen = openIndex === i;
          return (
            <div
              key={item.q}
              className="bg-surface border border-line rounded-lg overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="w-full flex items-center justify-between px-4 py-4 text-left"
              >
                <span className="text-sm font-medium pr-3">{item.q}</span>
                <ChevronDown
                  size={16}
                  className={`text-muted shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
              </button>
              {isOpen && (
                <p className="px-4 pb-4 text-sm text-muted leading-relaxed">
                  {item.a}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </SubPageShell>
  );
}
