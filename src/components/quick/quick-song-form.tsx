"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichLyricsEditor } from "@/components/quick/rich-lyrics-editor";
import { addQuickSong } from "@/lib/actions/quick-playlists";
import { hasLyricsContent } from "@/lib/sanitize-lyrics";

type QuickSongFormProps = {
  playlistId: string;
};

export function QuickSongForm({ playlistId }: QuickSongFormProps) {
  const [title, setTitle] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!hasLyricsContent(lyrics)) {
      setError("Les paroles sont requises");
      return;
    }

    startTransition(async () => {
      try {
        await addQuickSong(playlistId, { title, lyrics });
        setTitle("");
        setLyrics("");
      } catch (submitError) {
        setError(
          submitError instanceof Error
            ? submitError.message
            : "Une erreur est survenue",
        );
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border p-4">
      <h2 className="font-semibold">Ajouter un chant</h2>
      <div className="grid gap-2">
        <Label htmlFor="song-title">Titre</Label>
        <Input
          id="song-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Titre du chant"
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="song-lyrics">Paroles</Label>
        <RichLyricsEditor
          id="song-lyrics"
          value={lyrics}
          onChange={setLyrics}
          placeholder="Collez les paroles ici..."
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Ajout..." : "Ajouter à la liste"}
      </Button>
    </form>
  );
}
