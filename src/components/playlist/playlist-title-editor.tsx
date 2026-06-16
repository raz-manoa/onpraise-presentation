"use client";

import { useState, useTransition } from "react";

import { Input } from "@/components/ui/input";
import { updatePlaylistTitle } from "@/lib/actions/playlists";

type PlaylistTitleEditorProps = {
  playlistId: string;
  initialTitle: string;
};

export function PlaylistTitleEditor({
  playlistId,
  initialTitle,
}: PlaylistTitleEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [isPending, startTransition] = useTransition();

  function handleBlur() {
    if (title.trim() === initialTitle.trim()) return;

    startTransition(async () => {
      await updatePlaylistTitle(playlistId, title.trim());
    });
  }

  return (
    <Input
      value={title}
      onChange={(event) => setTitle(event.target.value)}
      onBlur={handleBlur}
      disabled={isPending}
      className="text-xl font-semibold"
    />
  );
}
