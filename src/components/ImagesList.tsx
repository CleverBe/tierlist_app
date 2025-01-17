import { rectSortingStrategy, SortableContext } from "@dnd-kit/sortable";
import { ImageCard } from "./ImageCard";
import { useMemo } from "react";
import { useDroppable } from "@dnd-kit/core";
import { Tier } from "../types";

export const ImagesList = ({ tier }: { tier: Tier }) => {
  const { setNodeRef } = useDroppable({
    id: tier.id,
    data: {
      tier,
      type: "tier",
    },
  });

  const images = useMemo(() => tier.images, [tier.images]);

  const imagesIds = useMemo(() => images.map((image) => image.id), [images]);

  return (
    <SortableContext
      id={tier.id}
      items={imagesIds}
      strategy={rectSortingStrategy}
    >
      <div
        ref={setNodeRef}
        className="flex min-h-64 select-none flex-wrap content-start items-start border bg-[#404040]"
      >
        {images.map((image) => (
          <ImageCard key={image.id} image={image} />
        ))}
      </div>
    </SortableContext>
  );
};
