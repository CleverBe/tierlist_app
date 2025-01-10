import { Eraser, Save, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "@hello-pangea/dnd";
import { v4 as uuidv4 } from "uuid";

type ImageType = {
  id: string;
  src: string;
};

export function TierlistApp() {
  const [images, setImages] = useState<ImageType[]>([]);
  const [tiers, setTiers] = useState<Record<string, ImageType[]>>({
    S: [],
    A: [],
    B: [],
  });

  const inputFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const storedImages =
      JSON.parse(localStorage.getItem("tierlistImages") || "[]") || [];
    setImages(storedImages);
  }, []);

  const saveImagesToLocalStorage = (images: ImageType[]) => {
    localStorage.setItem("tierlistImages", JSON.stringify(images));
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files ? Array.from(event.target.files) : [];

    const readFile = (file: File): Promise<{ id: string; src: string }> => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (eventReader) => {
          resolve({
            id: uuidv4(),
            src: eventReader.target?.result as string,
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

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;

    const sourceList =
      source.droppableId === "images" ? images : tiers[source.droppableId];
    const destinationList =
      destination.droppableId === "images"
        ? images
        : tiers[destination.droppableId];

    const [movedImage] = sourceList.splice(source.index, 1);
    destinationList.splice(destination.index, 0, movedImage);

    if (source.droppableId === "images") {
      setImages([...sourceList]);
      saveImagesToLocalStorage([...sourceList]);
    } else {
      setTiers({ ...tiers, [source.droppableId]: sourceList });
    }

    setTiers({ ...tiers, [destination.droppableId]: destinationList });
  };

  return (
    <div className="container mx-auto p-4">
      <div>
        <h1 className="text-2xl font-bold">Tierlist App</h1>
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="mt-4 flex flex-col gap-2 border">
          {Object.keys(tiers).map((tier) => (
            <div className="flex items-center bg-gray-100" key={tier}>
              <div className="flex h-16 w-16 items-center justify-center bg-green-200 font-bold">
                {tier}
              </div>
              <Droppable
                droppableId={tier}
                direction="horizontal"
                isCombineEnabled={false}
              >
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="flex flex-1 items-center self-stretch bg-gray-200"
                  >
                    {tiers[tier].map((image, index) => (
                      <Draggable
                        key={image.id}
                        draggableId={image.id}
                        index={index}
                      >
                        {(provided) => (
                          <img
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            src={image.src}
                            alt={`Imagen ${image.id}`}
                            className="h-16 w-16"
                          />
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>

        <div className="mb-4 mt-4 flex items-center justify-center space-x-4">
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
            <Upload className="h-4 w-4" />
          </button>
          <button className="" title="Return elements to the beginning">
            <Eraser className="h-4 w-4" />
          </button>
          <button className="" title="Save tierlist as image">
            <Save className="h-4 w-4" />
          </button>
        </div>

        <Droppable droppableId="images" direction="horizontal">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="flex h-52 flex-wrap gap-2 rounded-sm border bg-gray-100 p-2"
            >
              {images.map((image, index) => (
                <Draggable key={image.id} draggableId={image.id} index={index}>
                  {(provided) => (
                    <img
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      src={image.src}
                      alt={`Imagen ${image.id}`}
                      className="h-16 w-16"
                    />
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
