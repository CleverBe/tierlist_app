import { rectSortingStrategy, SortableContext } from "@dnd-kit/sortable";
import { ImageType, Tier } from "./App";
import { ImageCard } from "./ImageCard";
import { useMemo } from "react";
import { useDroppable } from "@dnd-kit/core";

export const TierRow = ({
  tier,
  images,
}: {
  tier: Tier;
  images: ImageType[];
}) => {
  const { setNodeRef } = useDroppable({
    id: tier.id,
    data: {
      tier,
      type: "tier",
    },
  });

  const imagesByTier = useMemo(
    () => images.filter((image) => image.tier === tier.id),
    [images, tier.id],
  );

  const imagesId = useMemo(
    () => imagesByTier.map((image) => image.id),
    [imagesByTier],
  );

  return (
    <SortableContext
      id={tier.id}
      items={imagesId}
      strategy={rectSortingStrategy}
    >
      <div className="flex" ref={setNodeRef}>
        <div
          className="flex h-24 w-24 items-center justify-center font-bold text-black"
          style={{ backgroundColor: tier.color }}
        >
          {tier.name}
        </div>
        <div className="grid flex-1 grid-cols-12 gap-0.5 bg-[#404040]">
          {imagesByTier.map((image) => (
            <ImageCard key={image.id} image={image} />
          ))}
        </div>
      </div>
    </SortableContext>
  );
};
