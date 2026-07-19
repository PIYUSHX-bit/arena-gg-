import type { PrizeTier } from "../../types/tournament";

interface PrizeDetailsProps {
  tiers: PrizeTier[];
}

export default function PrizeDetails({ tiers }: PrizeDetailsProps) {
  if (tiers.length === 0) return null;

  return (
    <div>
      <h3 className="font-display font-semibold text-lg text-zone mb-2.5">
        Prize Details
      </h3>
      <div className="border border-line rounded-lg divide-y divide-line overflow-hidden">
        {tiers.map((tier) => (
          <div
            key={tier.label}
            className="flex items-center justify-between px-4 py-2.5 text-sm"
          >
            <span className="font-medium">{tier.label}</span>
            <span className="text-amber font-mono">₹{tier.amount}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
