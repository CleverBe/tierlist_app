import { useSortable } from "@dnd-kit/sortable";
import { ImageType } from "./App";
import { cn } from "./lib/utils";
import { CSS } from "@dnd-kit/utilities";

export const ImageItem = ({ image }: { image: ImageType }) => {
  return (
    <img
      src={image.src}
      alt={image.id}
      className={cn("h-24 w-24 object-cover")}
      title={image.id.slice(0, 10)}
    />
  );
};

export const ImageCard = ({ image }: { image: ImageType }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: image.id,
    data: {
      image,
      type: "image",
    },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn("h-fit w-fit", isDragging && "opacity-50")}
    >
      <ImageItem image={image} />
    </div>
  );
};
