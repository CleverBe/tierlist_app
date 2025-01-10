import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export function Item(props) {
  const { id } = props;

  const style = {
    width: "80px",
    height: 50,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid black",
    margin: "10px 0",
    background: "white",
  };

  return <div style={style}>{id}</div>;
}

export function SortableItem(props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Item id={props.id} />
    </div>
  );
}

export function Container(props) {
  const { id, items } = props;

  const { setNodeRef } = useDroppable({
    id,
  });

  return (
    <SortableContext id={id} items={items} strategy={rectSortingStrategy}>
      <div
        ref={setNodeRef}
        className="m-3 grid flex-1 grid-cols-3 bg-[#f5f5f5]"
      >
        {items.map((id) => (
          <SortableItem key={id} id={id} />
        ))}
      </div>
    </SortableContext>
  );
}

const wrapperStyle = {
  display: "flex",
  flexDirection: "column",
  width: "500px",
};

export default function App2() {
  const [items, setItems] = useState({
    root: ["1", "2", "3", "4", "5", "6"],
    container1: ["7", "8", "9"],
    container2: ["10", "11", "12"],
    container3: ["13", "14", "15"],
  });
  const [activeId, setActiveId] = useState();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  return (
    <div style={wrapperStyle}>
      <DndContext
        // announcements={defaultAnnouncements}
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <Container id="root" items={items.root} />
        <Container id="container1" items={items.container1} />
        <Container id="container2" items={items.container2} />
        <Container id="container3" items={items.container3} />
        <DragOverlay>{activeId ? <Item id={activeId} /> : null}</DragOverlay>
      </DndContext>
    </div>
  );

  function findContainer(id) {
    if (id in items) {
      return id;
    }

    return Object.keys(items).find((key) => items[key].includes(id));
  }

  function handleDragStart(event) {
    const { active } = event;
    const { id } = active;

    setActiveId(id);
  }

  function handleDragOver(event) {
    const { active, over, draggingRect } = event;
    const { id } = active;
    const { id: overId } = over;

    console.log({ draggingRect });

    return;

    // Find the containers
    const activeContainer = findContainer(id);
    const overContainer = findContainer(overId);

    if (
      !activeContainer ||
      !overContainer ||
      activeContainer === overContainer
    ) {
      return;
    }

    setItems((prev) => {
      const activeItems = prev[activeContainer];
      const overItems = prev[overContainer];

      // Find the indexes for the items
      const activeIndex = activeItems.indexOf(id);
      const overIndex = overItems.indexOf(overId);

      let newIndex;
      if (overId in prev) {
        // We're at the root droppable of a container
        newIndex = overItems.length + 1;
      } else {
        const isBelowLastItem =
          over &&
          overIndex === overItems.length - 1 &&
          draggingRect.offsetTop > over.rect.offsetTop + over.rect.height;

        const modifier = isBelowLastItem ? 1 : 0;

        newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
      }

      return {
        ...prev,
        [activeContainer]: [
          ...prev[activeContainer].filter((item) => item !== active.id),
        ],
        [overContainer]: [
          ...prev[overContainer].slice(0, newIndex),
          items[activeContainer][activeIndex],
          ...prev[overContainer].slice(newIndex, prev[overContainer].length),
        ],
      };
    });
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    const { id } = active;
    const { id: overId } = over;

    const activeContainer = findContainer(id);
    const overContainer = findContainer(overId);

    if (
      !activeContainer ||
      !overContainer ||
      activeContainer !== overContainer
    ) {
      return;
    }

    const activeIndex = items[activeContainer].indexOf(active.id);
    const overIndex = items[overContainer].indexOf(overId);

    if (activeIndex !== overIndex) {
      setItems((items) => ({
        ...items,
        [overContainer]: arrayMove(
          items[overContainer],
          activeIndex,
          overIndex,
        ),
      }));
    }

    setActiveId(null);
  }
}
