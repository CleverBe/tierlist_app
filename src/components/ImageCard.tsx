import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ImageType } from "../types";

export function ImageItem({ image }: { image: ImageType }) {
  return (
    <img src={image.src} alt={image.id} className={"h-24 w-24 object-cover"} />
  );
}

export function ImageCard({ image }: { image: ImageType }) {
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
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    touchAction: "none", // Enable dragging on mobile
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="h-24 w-24"
    >
      <ImageItem image={image} />
    </div>
  );
}
