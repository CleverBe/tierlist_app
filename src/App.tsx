import { Trash, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { ImageItem } from "./components/ImageCard";
import { ImagesList } from "./components/ImagesList";
import { createPortal } from "react-dom";
import { disneyMovies } from "./data/mockData";
import { TiersContent } from "./components/TiersContent";
import { ImageType, Tier } from "./types";

const boxId = "TODO";

const initialTiers: Tier[] = [
  {
    id: "S",
    name: "S",
    color: "#FF7F7F",
    images: [],
  },
  {
    id: "A",
    name: "A",
    color: "#FFBF7F",
    images: [],
  },
  {
    id: "B",
    name: "B",
    color: "#FFDF7F",
    images: [],
  },
  {
    id: "C",
    name: "C",
    color: "#FFFF7F",
    images: [],
  },
  {
    id: "D",
    name: "D",
    color: "#BFFF7F",
    images: [],
  },
  {
    id: boxId,
    name: "BOX",
    color: "#7F7FFF",
    images: disneyMovies,
  },
];

function App() {
  const [tiers, setTiers] = useState<Tier[]>(initialTiers);
  const inputFileRef = useRef<HTMLInputElement>(null);
  const [draggedImage, setDraggedImage] = useState<ImageType | null>(null);

  const validTiers = tiers.filter((tier) => tier.id !== boxId);

  const boxTier = tiers.find((tier) => tier.id === boxId);

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files ? Array.from(event.target.files) : [];

    const readFile = (file: File): Promise<ImageType> => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (eventReader) => {
          resolve({
            id: uuidv4(),
            src: eventReader.target?.result as string,
            tier: boxId,
          });
        };
        reader.readAsDataURL(file);
      });
    };

    try {
      const newImages = await Promise.all(files.map(readFile));
      const images =
        tiers.find((tier) => tier.id === boxTier?.id)?.images || [];
      const updatedImages = [...images, ...newImages];
      setTiers(
        tiers.map((tier) => {
          if (tier.id === boxTier?.id) {
            return { ...tier, images: updatedImages };
          }
          return tier;
        }),
      );
    } catch (error) {
      console.error("Error al leer las imágenes:", error);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    if (active.data.current?.type === "image") {
      setDraggedImage(active.data.current.image);
      return;
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setDraggedImage(null);

    const { active, over } = event;

    if (!over) return;

    const activeImageId = active.id;
    const overImageId = over.id;

    if (activeImageId === overImageId) return;

    const activeItem = active.data.current?.image;

    const overItem = over.data.current?.image;

    const activeTier = tiers.find((tier) => tier.id === activeItem?.tier);

    const overTier = tiers.find((tier) => tier.id === overItem?.tier);

    if (!activeTier || !overTier || activeItem.tier !== overItem.tier) return;

    const activeIndex = activeTier.images.findIndex(
      (image) => image.id === activeItem?.id,
    );

    const overIndex = overTier.images.findIndex(
      (image) => image.id === overItem?.id,
    );
    setTiers((prev) => {
      return prev.map((tier) => {
        if (tier.id === activeTier.id) {
          return {
            ...tier,
            images: arrayMove(tier.images, activeIndex, overIndex),
          };
        }
        return tier;
      });
    });
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id as string;

    if (activeId === overId) return;

    const isOverImage = over.data.current?.type === "image";
    const isOverTier = over.data.current?.type === "tier";

    const activeItem = active.data.current?.image;
    const activeTier = tiers.find((tier) => tier.id === activeItem?.tier);

    if (!activeTier) return;

    setTiers((prev) => {
      const updatedTiers = prev.map((tier) => ({
        ...tier,
        images: tier.images.filter((image) => image.id !== activeItem.id),
      }));

      if (isOverImage) {
        const overItem = over.data.current?.image;
        const overTier = updatedTiers.find(
          (tier) => tier.id === overItem?.tier,
        );

        if (overTier) {
          if (overTier.id === activeTier.id) {
            return prev;
          }

          const overIndex = overTier.images.findIndex(
            (img) => img.id === overItem.id,
          );
          overTier.images.splice(overIndex, 0, {
            ...activeItem,
            tier: overTier.id,
          });
        }
      } else if (isOverTier) {
        const overTier = updatedTiers.find((tier) => tier.id === overId);
        if (overTier) {
          if (overTier.id === activeTier.id) {
            return prev;
          }

          overTier.images.push({ ...activeItem, tier: overTier.id });
        }
      }

      return updatedTiers;
    });
  };

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-[#27272a] text-white">
      <div className="container mx-auto flex-1 border-x bg-[#27272a] p-4">
        <div className="flex items-center justify-center">
          <h1 className="text-2xl font-bold uppercase">Tierlist app</h1>
        </div>
        <DndContext
          collisionDetection={pointerWithin}
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="my-4 select-none">
            <TiersContent tiers={validTiers} />
          </div>
          <div className="my-4 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <input
              type="file"
              className="hidden"
              ref={inputFileRef}
              accept="image/*"
              multiple
              onChange={handleImageUpload}
            />
            <button
              className="flex items-center rounded-md bg-[#404040] px-4 py-2 hover:bg-[#404040]/80"
              onClick={() => {
                inputFileRef.current?.click();
              }}
            >
              <span className="mr-2">+ Add images</span>
              <Upload />
            </button>
            <button
              onClick={() => setTiers(initialTiers)}
              className="flex items-center rounded-md bg-[#404040] px-4 py-2 hover:bg-[#404040]/80"
            >
              <span className="mr-2">Reset tier</span>
              <Trash />
            </button>
          </div>
          {boxTier && <ImagesList tier={boxTier} />}
          {createPortal(
            <DragOverlay>
              {draggedImage ? <ImageItem image={draggedImage} /> : null}
            </DragOverlay>,
            document.body,
          )}
        </DndContext>
      </div>
    </div>
  );
}

export default App;
