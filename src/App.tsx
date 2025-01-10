import { Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { TierRow } from "./TierRow";
import {
  closestCorners,
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import { ImageCard, ImageItem } from "./ImageCard";
import { ImagesList } from "./ImagesList";

export type ImageType = {
  id: string;
  src: string;
  tier: string | null;
};

export interface Tier {
  id: string;
  name: string;
  color: string;
}

const initialTiers: Tier[] = [
  {
    id: "bb6a8087-ff54-4738-ac64-70bdb7343183",
    name: "S",
    color: "#FF7F7F",
  },
  {
    id: "a9dc1ceb-76cc-406b-a90c-cbd88c804c6d",
    name: "A",
    color: "#FFBF7F",
  },
  {
    id: "8d456583-c85d-4893-b6e3-5b43d5cd5ff5",
    name: "B",
    color: "#FFDF7F",
  },
  {
    id: "13581ffe-0ac8-458b-8f0c-a2f8d99b8099",
    name: "C",
    color: "#FFFF7F",
  },
  {
    id: "fb3eba57-213a-4ab7-92d8-df352e9fbf6f",
    name: "D",
    color: "#BFFF7F",
  },
];

function App() {
  const [images, setImages] = useState<ImageType[]>(() => {
    try {
      const storedImages = JSON.parse(
        localStorage.getItem("tierlistImages") || "[]",
      ) as ImageType[];
      return storedImages;
    } catch (error) {
      console.error("Error al leer las imágenes:", error);
      return [];
    }
  });
  const [tiers, setTiers] = useState<Tier[]>(initialTiers);
  const [newTier, setNewTier] = useState("");
  const [color, setColor] = useState("#44EE41");
  const inputFileRef = useRef<HTMLInputElement>(null);
  const [draggedImage, setDraggedImage] = useState<ImageType | null>(null);

  // useEffect(() => {
  //   try {
  //     const storedImages =
  //       (JSON.parse(
  //         localStorage.getItem("tierlistImages") || "[]",
  //       ) as ImageType[]) || ([] as ImageType[]);

  //     setImages(storedImages);
  //   } catch (error) {
  //     console.error("Error al leer las imágenes:", error);
  //   }
  // }, []);

  useEffect(() => {
    saveImagesToLocalStorage(images);
  }, [images]);

  const saveImagesToLocalStorage = (images: ImageType[]) => {
    localStorage.setItem("tierlistImages", JSON.stringify(images));
  };

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
            tier: null,
          });
        };
        reader.readAsDataURL(file);
      });
    };

    try {
      const newImages = await Promise.all(files.map(readFile));
      const updatedImages = [...images, ...newImages];
      setImages(updatedImages);
      saveImagesToLocalStorage(updatedImages);
    } catch (error) {
      console.error("Error al leer las imágenes:", error);
    }
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newTier || !color) return;

    setTiers([...tiers, { id: uuidv4(), name: newTier, color }]);
    setNewTier("");
    setColor("#44EE41");
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

    // setImages((prev) => {
    //   const activeImageIndex = prev.findIndex(
    //     (tier) => tier.id === activeImageId,
    //   );
    //   const overImageIndex = prev.findIndex((tier) => tier.id === overImageId);

    //   return arrayMove(prev, activeImageIndex, overImageIndex);
    // });
  };

  console.log({ images });

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id;
    const overId = over.id as string;

    if (activeId === overId) return;

    const isOverAImage = over.data.current?.type === "image";

    const isOverATier = over.data.current?.type === "tier";

    console.log({ message: "drag over", active, over, isOverAImage });

    // over a image
    if (isOverAImage) {
      console.log("isOverAImage");
      setImages((prev) => {
        const activeImageIndex = prev.findIndex(
          (image) => image.id === activeId,
        );
        const overImageIndex = prev.findIndex((image) => image.id === overId);

        prev[activeImageIndex].tier = prev[overImageIndex].tier;

        console.log({ activeImageIndex, overImageIndex, prev });

        return arrayMove(prev, activeImageIndex, overImageIndex);
      });
    } else if (isOverATier) {
      // over a tier
      // console.log("isOverATier");
      setImages((prev) => {
        const activeImageIndex = prev.findIndex(
          (image) => image.id === activeId,
        );
        const overTier = tiers.find((tier) => tier.id === overId);
        // console.log({ overTier, prev, overId });
        if (!overTier) return prev;

        prev[activeImageIndex].tier = overTier.id;

        // console.log({ activeImageIndex, overTier, prev });

        return arrayMove(prev, activeImageIndex, activeImageIndex);
      });
    }
  };

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-[#27272a] text-white">
      <div className="container mx-auto flex-1 border-x bg-[#27272a] p-4">
        <h1 className="text-2xl font-bold">Tierlist app</h1>
        <DndContext
          sensors={sensors}
          // collisionDetection={closestCorners}
          onDragEnd={handleDragEnd}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
        >
          <div className="my-4">
            {tiers.length === 0 ? (
              <div className="flex h-24 items-center justify-center bg-[#404040]">
                Create a tier
              </div>
            ) : (
              <div className="flex flex-col gap-0.5">
                {tiers.map((tier) => (
                  <TierRow key={tier.id} tier={tier} images={images} />
                ))}
              </div>
            )}
          </div>
          <form onSubmit={onSubmit} className="my-4 flex gap-1">
            <label htmlFor="tier">
              <span className="sr-only">Tier</span>
              New Tier
            </label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
            <input
              id="tier"
              type="text"
              value={newTier}
              onChange={(e) => setNewTier(e.target.value)}
              className="p-1"
              autoComplete="off"
            />
            <button type="submit" className="bg-blue-500 p-1">
              Add
            </button>
          </form>
          <div className="my-4 flex items-center justify-center">
            <input
              type="file"
              className="hidden"
              ref={inputFileRef}
              accept="image/*"
              multiple
              onChange={handleImageUpload}
            />
            <button
              className=""
              title="Upload image"
              onClick={() => {
                inputFileRef.current?.click();
              }}
            >
              <Upload />
            </button>
          </div>
          <ImagesList images={images} />
          {createPortal(
            <DragOverlay>
              {draggedImage && <ImageItem image={draggedImage} />}
            </DragOverlay>,
            document.body,
          )}
        </DndContext>
      </div>
    </div>
  );
}

export default App;
