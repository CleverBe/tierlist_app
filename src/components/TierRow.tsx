import { rectSortingStrategy, SortableContext } from "@dnd-kit/sortable";
import { ImageCard } from "./ImageCard";
import { useMemo, useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { Tier } from "../types";

interface TierRowProps {
  tier: Tier;
  changeTierName: (id: string, name: string) => void;
}

export function TierRow({ tier, changeTierName }: TierRowProps) {
  const [editItem, setEditItem] = useState<string | null>(null);
  const [editName, setEditName] = useState<string>("");

  const { setNodeRef } = useDroppable({
    id: tier.id,
    data: {
      tier,
      type: "tier",
    },
  });

  const images = useMemo(() => tier.images, [tier.images]);

  const imagesId = useMemo(() => images.map((image) => image.id), [images]);

  return (
    <SortableContext
      id={tier.id}
      items={imagesId}
      strategy={rectSortingStrategy}
    >
      <div ref={setNodeRef} className="m-1 flex min-h-24 gap-0.5 bg-[#404040]">
        {editItem !== tier.id ? (
          <div
            className="flex h-auto w-24 items-center justify-center border-r border-[#27272a] p-0.5 text-center font-bold text-gray-900"
            style={{ backgroundColor: tier.color }}
            onClick={() => {
              setEditItem(tier.id);
              setEditName(tier.name);
            }}
          >
            {tier.name}
          </div>
        ) : (
          <input
            type="text"
            className="w-24 border-r border-gray-900 p-0.5 text-center font-bold text-gray-900"
            value={editName}
            style={{ backgroundColor: tier.color }}
            autoFocus
            onChange={(e) => setEditName(e.target.value)}
            onBlur={() => {
              changeTierName(tier.id, editName);
              setEditItem(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                changeTierName(tier.id, editName);
                setEditItem(null);
              }
            }}
          />
        )}
        <div className="flex flex-1 flex-wrap">
          {images.map((image) => (
            <ImageCard key={image.id} image={image} />
          ))}
        </div>
      </div>
    </SortableContext>
  );
}
