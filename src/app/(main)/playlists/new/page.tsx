"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createPlaylist } from "@/lib/actions/playlists";

export default function NewPlaylistPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        const playlist = await createPlaylist({ title });
        router.push(`/playlists/${playlist.id}`);
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
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Nouvelle playlist</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="title">Titre</Label>
          <Input
            id="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Culte du dimanche"
            required
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={isPending}>
          {isPending ? "Création..." : "Créer la playlist"}
        </Button>
      </form>
    </div>
  );
}
