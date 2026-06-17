"use client";

import { useState, useTransition } from "react";

import { RichLyricsEditor } from "@/components/quick/rich-lyrics-editor";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateQuickSong } from "@/lib/actions/quick-playlists";
import { hasLyricsContent } from "@/lib/sanitize-lyrics";

type QuickSongEditDialogProps = {
  song: {
    id: string;
    title: string;
    lyrics: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function QuickSongEditDialog({
  song,
  open,
  onOpenChange,
}: QuickSongEditDialogProps) {
  const [title, setTitle] = useState(song.title);
  const [lyrics, setLyrics] = useState(song.lyrics);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setTitle(song.title);
      setLyrics(song.lyrics);
      setError(null);
    }
    onOpenChange(nextOpen);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!hasLyricsContent(lyrics)) {
      setError("Les paroles sont requises");
      return;
    }

    startTransition(async () => {
      try {
        await updateQuickSong(song.id, { title, lyrics });
        onOpenChange(false);
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
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Modifier le chant</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-song-title">Titre</Label>
            <Input
              id="edit-song-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Titre du chant"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="edit-song-lyrics">Paroles</Label>
            <RichLyricsEditor
              key={`${song.id}-${open}`}
              id="edit-song-lyrics"
              defaultValue={song.lyrics}
              onChange={setLyrics}
              placeholder="Collez les paroles ici..."
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => handleOpenChange(false)}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
