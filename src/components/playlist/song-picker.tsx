"use client";

import { useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { addSongToPlaylist } from "@/lib/actions/playlists";
import { getSongs } from "@/lib/actions/songs";

type SongSummary = {
  id: string;
  title: string;
  author: string | null;
  originalKey: string | null;
};

type SongPickerProps = {
  playlistId: string;
  existingSongIds: string[];
};

export function SongPicker({ playlistId, existingSongIds }: SongPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SongSummary[]>([]);
  const [isPending, startTransition] = useTransition();

  const existingSet = useMemo(() => new Set(existingSongIds), [existingSongIds]);

  function handleSearch(value: string) {
    setQuery(value);
    startTransition(async () => {
      const songs = await getSongs(value);
      setResults(songs);
    });
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen) {
      startTransition(async () => {
        const songs = await getSongs();
        setResults(songs);
      });
    }
  }

  function handleAdd(songId: string) {
    startTransition(async () => {
      await addSongToPlaylist(playlistId, songId);
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button variant="outline" />}>
        Ajouter un chant
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Ajouter un chant à la playlist</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Rechercher par titre ou auteur..."
            value={query}
            onChange={(event) => handleSearch(event.target.value)}
          />

          <div className="max-h-80 space-y-2 overflow-y-auto">
            {isPending && results.length === 0 && (
              <p className="text-sm text-muted-foreground">Chargement...</p>
            )}

            {!isPending && results.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Aucun chant trouvé.
              </p>
            )}

            {results.map((song) => {
              const alreadyAdded = existingSet.has(song.id);

              return (
                <div
                  key={song.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium">{song.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {[song.author, song.originalKey].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    disabled={alreadyAdded || isPending}
                    onClick={() => handleAdd(song.id)}
                  >
                    {alreadyAdded ? "Ajouté" : "Ajouter"}
                  </Button>
                </div>
              );
            })}
          </div>

          <LinkButton variant="secondary" href="/songs/new" className="w-full">
            Créer un nouveau chant
          </LinkButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
