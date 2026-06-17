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
  reorderQuickSongs,
  removeQuickSong,
  type QuickPlaylistWithSongs,
} from "@/lib/actions/quick-playlists";

type QuickSongListProps = {
  playlistId: string;
  songs: QuickPlaylistWithSongs["songs"];
};

function SortableItem({
  song,
  playlistId,
}: {
  song: QuickPlaylistWithSongs["songs"][number];
  playlistId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: song.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  function handleRemove() {
    startTransition(async () => {
      await removeQuickSong(playlistId, song.id);
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
        <p className="font-medium">{song.title}</p>
        <p className="line-clamp-1 text-sm text-muted-foreground">
          {song.lyrics}
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

export function QuickSongList({ playlistId, songs }: QuickSongListProps) {
  const [orderedSongs, setOrderedSongs] = useState(songs);
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

    setOrderedSongs((current) => {
      const oldIndex = current.findIndex((song) => song.id === active.id);
      const newIndex = current.findIndex((song) => song.id === over.id);
      const next = arrayMove(current, oldIndex, newIndex);

      startTransition(async () => {
        await reorderQuickSongs(
          playlistId,
          next.map((song) => song.id),
        );
      });

      return next;
    });
  }

  if (orderedSongs.length === 0) {
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
        items={orderedSongs.map((song) => song.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2" data-pending={isPending || undefined}>
          {orderedSongs.map((song) => (
            <SortableItem
              key={song.id}
              song={song}
              playlistId={playlistId}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
