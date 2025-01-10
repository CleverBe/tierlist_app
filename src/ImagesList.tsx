import { rectSortingStrategy, SortableContext } from "@dnd-kit/sortable";
import { ImageType } from "./App";
import { ImageCard } from "./ImageCard";
import { useMemo } from "react";

export const ImagesList = ({ images }: { images: ImageType[] }) => {
  const imagesWithoutTier = useMemo(
    () => images.filter((image) => image.tier === null),
    [images],
  );

  const imagesIds = useMemo(
    () => imagesWithoutTier.map((image) => image.id),
    [imagesWithoutTier],
  );

  return (
    <div className="grid h-64 grid-cols-12 border bg-[#404040]">
      <SortableContext items={imagesIds} strategy={rectSortingStrategy}>
        {imagesWithoutTier.map((image) => (
          <ImageCard key={image.id} image={image} />
        ))}
      </SortableContext>
    </div>
  );
};
