"use client";

import { useState, useTransition } from "react";

import { Input } from "@/components/ui/input";
import { updateQuickPlaylistTitle } from "@/lib/actions/quick-playlists";

type QuickPlaylistTitleEditorProps = {
  playlistId: string;
  initialTitle: string;
};

export function QuickPlaylistTitleEditor({
  playlistId,
  initialTitle,
}: QuickPlaylistTitleEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [isPending, startTransition] = useTransition();

  function handleBlur() {
    if (title.trim() === initialTitle.trim()) return;

    startTransition(async () => {
      await updateQuickPlaylistTitle(playlistId, title.trim());
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
