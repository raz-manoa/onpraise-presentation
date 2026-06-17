"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { addQuickSong } from "@/lib/actions/quick-playlists";

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
        <Textarea
          id="song-lyrics"
          value={lyrics}
          onChange={(event) => setLyrics(event.target.value)}
          placeholder="Collez les paroles ici..."
          rows={10}
          required
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Ajout..." : "Ajouter à la liste"}
      </Button>
    </form>
  );
}
