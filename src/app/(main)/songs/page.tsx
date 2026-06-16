import Link from "next/link";
import { Plus } from "lucide-react";

import { LinkButton } from "@/components/ui/link-button";
import { getSongs } from "@/lib/actions/songs";

export const dynamic = "force-dynamic";

export default async function SongsPage() {
  const songs = await getSongs();

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bibliothèque de chants</h1>
          <p className="text-muted-foreground">
            Partitions ChordPro avec accords et transposition.
          </p>
        </div>
        <LinkButton href="/songs/new">
          <Plus className="size-4" />
          Nouveau chant
        </LinkButton>
      </div>

      {songs.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="mb-4 text-muted-foreground">
            Aucun chant dans la bibliothèque.
          </p>
          <LinkButton href="/songs/new">Créer le premier chant</LinkButton>
        </div>
      ) : (
        <div className="space-y-2">
          {songs.map((song) => (
            <Link
              key={song.id}
              href={`/songs/${song.id}/edit`}
              className="block rounded-lg border p-4 transition-colors hover:bg-muted/40"
            >
              <p className="font-medium">{song.title}</p>
              <p className="text-sm text-muted-foreground">
                {[song.author, song.originalKey, song.ccli]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
