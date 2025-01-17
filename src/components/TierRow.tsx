import { rectSortingStrategy, SortableContext } from "@dnd-kit/sortable";
import { ImageCard } from "./ImageCard";
import { useMemo } from "react";
import { useDroppable } from "@dnd-kit/core";
import { Tier } from "../types";

export function TierRow({ tier }: { tier: Tier }) {
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
        <div
          className="flex h-auto w-24 items-center justify-center border-r p-0.5 text-center font-bold text-gray-900"
          style={{ backgroundColor: tier.color }}
          title={tier.id.slice(0, 10)}
          contentEditable
        >
          {tier.name}
        </div>
        <div className="flex flex-1 flex-wrap">
          {images.map((image) => (
            <ImageCard key={image.id} image={image} />
          ))}
        </div>
      </div>
    </SortableContext>
  );
}
