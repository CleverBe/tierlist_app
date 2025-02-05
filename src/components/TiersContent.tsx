import { Tier } from "../types";
import { TierRow } from "./TierRow";

interface TiersContentProps {
  tiers: Tier[];
  changeTierName: (tierId: string, newName: string) => void;
}

export const TiersContent = ({ tiers, changeTierName }: TiersContentProps) => {
  return (
    <div className="flex flex-col">
      {tiers.map((tier) => (
        <TierRow key={tier.id} tier={tier} changeTierName={changeTierName} />
      ))}
    </div>
  );
};
