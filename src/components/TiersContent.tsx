import { Tier } from "../types";
import { TierRow } from "./TierRow";

export const TiersContent = ({ tiers }: { tiers: Tier[] }) => {
  return (
    <div className="flex flex-col">
      {tiers.map((tier) => (
        <TierRow key={tier.id} tier={tier} />
      ))}
    </div>
  );
};
