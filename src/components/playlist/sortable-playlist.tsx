"use client";

import {
  DndContext,
  closestCenter,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  reorderPlaylistSongs,
  removeSongFromPlaylist,
  type PlaylistWithSongs,
} from "@/lib/actions/playlists";

type SortablePlaylistProps = {
  playlistId: string;
  items: PlaylistWithSongs["items"];
};

function SortableItem({
  item,
  playlistId,
}: {
  item: PlaylistWithSongs["items"][number];
  playlistId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  function handleRemove() {
    startTransition(async () => {
      await removeSongFromPlaylist(playlistId, item.id);
    });
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded-lg border bg-card p-3"
    >
      <button
        type="button"
        className="cursor-grab text-muted-foreground active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>
      <div className="flex-1">
        <p className="font-medium">{item.song.title}</p>
        <p className="text-sm text-muted-foreground">
          {[item.song.author, item.song.originalKey].filter(Boolean).join(" · ")}
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        disabled={isPending}
        onClick={handleRemove}
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}

export function SortablePlaylist({ playlistId, items }: SortablePlaylistProps) {
  const [orderedItems, setOrderedItems] = useState(items);
  const [isPending, startTransition] = useTransition();
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setOrderedItems((current) => {
      const oldIndex = current.findIndex((item) => item.id === active.id);
      const newIndex = current.findIndex((item) => item.id === over.id);
      const next = arrayMove(current, oldIndex, newIndex);

      startTransition(async () => {
        await reorderPlaylistSongs(
          playlistId,
          next.map((item) => item.id),
        );
      });

      return next;
    });
  }

  if (orderedItems.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
        Aucun chant dans cette playlist. Ajoutez-en un pour commencer.
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={orderedItems.map((item) => item.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2" data-pending={isPending || undefined}>
          {orderedItems.map((item) => (
            <SortableItem key={item.id} item={item} playlistId={playlistId} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
